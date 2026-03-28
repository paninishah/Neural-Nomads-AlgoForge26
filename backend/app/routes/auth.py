import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import LoginRequest, success, error
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Mock OTP login – auto-creates user if not exists."""
    repo = UserRepository(db)
    user, created = repo.get_or_create(phone=payload.phone, role=payload.role or "farmer")

    token = create_access_token(data={"sub": user.id, "role": user.role})

    action = "registered" if created else "logged in"
    logger.info(f"User {user.phone} {action} as {user.role}")

    return success(
        f"Successfully {action}",
        {
            "user_id": user.id,
            "role": user.role,
            "token": token,
            "verification_status": user.verification_status,
            "is_new_user": created,
        },
    )


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    """Return currently authenticated user details."""
    return success(
        "User details fetched",
        {
            "id": current_user.id,
            "phone": current_user.phone,
            "role": current_user.role,
            "verification_status": current_user.verification_status,
            "phone_verified": current_user.phone_verified,
            "ngo_verified": current_user.ngo_verified,
            "created_at": current_user.created_at.isoformat(),
        },
    )
