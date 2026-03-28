import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AdminVerifyNGORequest, AdminOverrideRequest, success
from app.core.dependencies import require_role
from app.repositories.user_repo import UserRepository
from app.models.models import UserRole, VerificationStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin Controls"])

admin_required = require_role("admin")


@router.get("/users")
def get_all_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    role: str = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(admin_required),
):
    """Get all users with optional role filter."""
    repo = UserRepository(db)
    users = repo.get_all(skip=skip, limit=limit)

    if role:
        users = [u for u in users if u.role == role]

    return success(
        f"Found {len(users)} user(s)",
        [
            {
                "id": u.id,
                "phone": u.phone,
                "role": u.role,
                "verification_status": u.verification_status,
                "phone_verified": u.phone_verified,
                "ngo_verified": u.ngo_verified,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
    )


@router.post("/verify-ngo")
def verify_ngo(
    payload: AdminVerifyNGORequest,
    db: Session = Depends(get_db),
    current_user=Depends(admin_required),
):
    """Admin approves or rejects an NGO account."""
    repo = UserRepository(db)
    user = repo.get_by_id(payload.user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "ngo":
        raise HTTPException(status_code=400, detail="User is not an NGO")

    new_status = "verified" if payload.approve else "rejected"
    repo.update_verification_status(payload.user_id, new_status)
    if payload.approve:
        repo.update_ngo_verified(payload.user_id, True)

    logger.info(f"Admin {current_user.id} {'approved' if payload.approve else 'rejected'} NGO {payload.user_id}")
    return success(
        f"NGO {'approved' if payload.approve else 'rejected'}",
        {"user_id": payload.user_id, "new_status": new_status},
    )


@router.post("/override-verification")
def override_verification(
    payload: AdminOverrideRequest,
    db: Session = Depends(get_db),
    current_user=Depends(admin_required),
):
    """Admin overrides any user's verification status."""
    valid_statuses = [s.value for s in VerificationStatus]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Choose from: {valid_statuses}",
        )

    repo = UserRepository(db)
    user = repo.update_verification_status(payload.user_id, payload.status)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    logger.warning(
        f"Admin {current_user.id} overrode verification for {payload.user_id} "
        f"to '{payload.status}'. Reason: {payload.reason}"
    )
    return success(
        "Verification status overridden",
        {
            "user_id": payload.user_id,
            "new_status": payload.status,
            "reason": payload.reason,
            "overridden_by": current_user.id,
        },
    )
