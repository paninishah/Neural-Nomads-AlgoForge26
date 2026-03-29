import os
import logging
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import success, error
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.repositories.document_repo import DocumentRepository
from app.repositories.user_repo import UserRepository
from app.ai import service as ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {"aadhaar", "land", "bill", "ration_card"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}


@router.post("/upload")
async def upload_document(
    doc_type: str = Form(...),
    user_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upload a document and run AI verification."""
    # Validation
    if doc_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid doc_type. Choose from: {list(ALLOWED_TYPES)}",
        )

    # Farmers can only upload for themselves
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Check target user exists
    user_repo = UserRepository(db)
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # File extension check
    suffix = Path(file.filename or "file.jpg").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {list(ALLOWED_EXTENSIONS)}",
        )

    # File size check
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413, detail=f"File too large. Max: {settings.MAX_FILE_SIZE_MB}MB"
        )

    # Save file
    upload_dir = Path(settings.UPLOAD_DIR) / user_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{doc_type}_{file.filename}"
    file_path = upload_dir / safe_name

    with open(file_path, "wb") as f:
        f.write(content)

    # Create doc record
    doc_repo = DocumentRepository(db)
    doc = doc_repo.create(
        user_id=user_id,
        doc_type=doc_type,
        file_path=str(file_path),
        original_filename=file.filename or safe_name,
    )

    # Run AI verification
    try:
        ai_result = ai_service.verify_document(
            user_id=user_id, doc_type=doc_type, file_path=str(file_path)
        )

        # Update doc with AI result
        doc = doc_repo.update_ai_result(
            doc_id=doc.id,
            status=ai_result["status"],
            confidence=ai_result["confidence"],
            extracted_fields=ai_result["extracted_fields"],
            notes=ai_result["notes"],
        )

        # Update user verification status
        user_repo.update_verification_status(user_id, ai_result["status"])
    except Exception as e:
        logger.error(f"AI Verification Error for {user_id}: {e}", exc_info=True)
        return success("Document uploaded but AI verification failed (System error)", {
                "document_id": doc.id,
                "doc_type": doc.doc_type,
                "status": "needs_manual_review",
                "ai_confidence": 0.0,
                "extracted_fields": "{}",
                "ai_notes": f"Backend Error: {str(e)}",
            })

    logger.info(
        f"Document uploaded for {user_id}: type={doc_type}, "
        f"confidence={ai_result['confidence']}, status={ai_result['status']}"
    )

    return success(
        "Document uploaded and AI verification complete",
        {
            "document_id": doc.id,
            "doc_type": doc.doc_type,
            "status": doc.status,
            "ai_confidence": doc.ai_confidence,
            "extracted_fields": ai_result["extracted_fields"],
            "ai_notes": ai_result["notes"],
        },
    )


@router.get("/{user_id}")
def get_documents(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all documents for a user."""
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    doc_repo = DocumentRepository(db)
    docs = doc_repo.get_by_user_id(user_id)

    return success(
        f"Found {len(docs)} document(s)",
        [
            {
                "id": d.id,
                "doc_type": d.doc_type,
                "original_filename": d.original_filename,
                "status": d.status,
                "ai_confidence": d.ai_confidence,
                "extracted_fields": d.extracted_fields,
                "ai_notes": d.ai_notes,
                "uploaded_at": d.uploaded_at.isoformat(),
            }
            for d in docs
        ],
    )
