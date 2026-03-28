import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ProfileCreate, success, error
from app.core.dependencies import get_current_user
from app.repositories.profile_repo import ProfileRepository
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["Farmer Profile"])


@router.post("")
def create_or_update_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create or update farmer profile for the authenticated user."""
    repo = ProfileRepository(db)
    profile = repo.create_or_update(
        user_id=current_user.id,
        data=payload.model_dump(exclude_none=True),
    )
    logger.info(f"Profile upserted for user {current_user.id}")
    return success("Profile saved successfully", _profile_out(profile))


@router.get("/{user_id}")
def get_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get farmer profile by user ID."""
    # Farmers can only see their own; NGO/Admin can see any
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    repo = ProfileRepository(db)
    profile = repo.get_by_user_id(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return success("Profile fetched", _profile_out(profile))


def _profile_out(profile) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": profile.name,
        "village": profile.village,
        "state": profile.state,
        "crop": profile.crop,
        "land_acres": profile.land_acres,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }
