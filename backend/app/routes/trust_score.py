import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import success
from app.core.dependencies import get_current_user
from app.repositories.user_repo import UserRepository
from app.repositories.document_repo import DocumentRepository
from app.repositories.profile_repo import ProfileRepository
from app.ai import service as ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/trust-score", tags=["Trust Score"])


@router.get("/{user_id}")
def get_trust_score(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Calculate and return trust score for a user."""
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    doc_repo = DocumentRepository(db)
    docs = doc_repo.get_by_user_id(user_id)
    avg_confidence = doc_repo.get_avg_confidence(user_id)

    profile_repo = ProfileRepository(db)
    profile = profile_repo.get_by_user_id(user_id)

    result = ai_service.calculate_trust_score(
        user_id=user_id,
        phone_verified=user.phone_verified,
        has_documents=len(docs) > 0,
        document_count=len(docs),
        avg_ai_confidence=avg_confidence,
        ngo_verified=user.ngo_verified,
        profile_complete=profile is not None and bool(profile.name and profile.crop),
    )

    logger.info(f"Trust score calculated for {user_id}: {result['score']}")
    return success("Trust score calculated", result)
