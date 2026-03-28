import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import NGOVerifyRequest, NGOHelpUpdateRequest, success
from app.core.dependencies import get_current_user, require_role
from app.repositories.user_repo import UserRepository
from app.repositories.help_repo import HelpRequestRepository
from app.repositories.document_repo import DocumentRepository
from app.models.models import NGOVerification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ngo", tags=["NGO Module"])

ngo_required = require_role("ngo", "admin")


@router.get("/farmers")
def get_farmers_for_review(
    filter_status: str = Query(
        default="needs_manual_review",
        description="Filter by verification status",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Get farmers filtered by verification status for NGO review."""
    user_repo = UserRepository(db)
    doc_repo = DocumentRepository(db)

    farmers = user_repo.get_farmers_by_status(filter_status)

    result = []
    for farmer in farmers:
        docs = doc_repo.get_by_user_id(farmer.id)
        result.append(
            {
                "user_id": farmer.id,
                "phone": farmer.phone,
                "verification_status": farmer.verification_status,
                "document_count": len(docs),
                "created_at": farmer.created_at.isoformat(),
            }
        )

    return success(f"Found {len(result)} farmer(s) with status '{filter_status}'", result)


@router.post("/verify")
def verify_farmer(
    payload: NGOVerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """NGO approves or rejects a farmer's verification."""
    user_repo = UserRepository(db)
    farmer = user_repo.get_by_id(payload.farmer_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    new_status = "verified" if payload.action == "approve" else "rejected"
    farmer = user_repo.update_verification_status(payload.farmer_id, new_status)

    if payload.action == "approve":
        user_repo.update_ngo_verified(payload.farmer_id, True)

    # Record verification
    record = NGOVerification(
        farmer_id=payload.farmer_id,
        ngo_id=current_user.id,
        action=payload.action,
        notes=payload.notes or "",
    )
    db.add(record)
    db.commit()

    logger.info(
        f"NGO {current_user.id} {payload.action}d farmer {payload.farmer_id}"
    )

    return success(
        f"Farmer {payload.action}d successfully",
        {
            "farmer_id": payload.farmer_id,
            "new_status": new_status,
            "ngo_id": current_user.id,
            "action": payload.action,
            "notes": payload.notes,
        },
    )


@router.get("/help-requests")
def get_help_requests(
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Get all open help requests for NGO to handle."""
    repo = HelpRequestRepository(db)
    items = repo.get_all_open()

    return success(
        f"Found {len(items)} open help request(s)",
        [
            {
                "id": h.id,
                "user_id": h.user_id,
                "request_type": h.request_type,
                "description": h.description,
                "status": h.status,
                "created_at": h.created_at.isoformat(),
            }
            for h in items
        ],
    )


@router.post("/help-update")
def update_help_request(
    payload: NGOHelpUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(ngo_required),
):
    """Update a help request status."""
    repo = HelpRequestRepository(db)
    hr = repo.update_status(
        request_id=payload.request_id,
        status=payload.status,
        notes=payload.notes or "",
    )

    if not hr:
        raise HTTPException(status_code=404, detail="Help request not found")

    logger.info(f"Help request {payload.request_id} updated to {payload.status}")
    return success(
        f"Help request updated to '{payload.status}'",
        {
            "request_id": hr.id,
            "status": hr.status,
            "ngo_notes": hr.ngo_notes,
            "updated_at": hr.updated_at.isoformat(),
        },
    )
