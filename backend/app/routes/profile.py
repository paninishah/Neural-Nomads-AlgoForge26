import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import ProfileCreate, success, error
from app.core.dependencies import get_current_user
from app.repositories.profile_repo import ProfileRepository
from app.repositories.user_repo import UserRepository
from app.models.models import UserRole

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
        role=current_user.role,
        data=payload.model_dump(exclude_none=True),
    )
    logger.info(f"Profile upserted for user {current_user.id}")
    return success("Profile saved successfully", _profile_out(profile, current_user.role))


@router.get("/{user_id}")
def get_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get farmer profile by user ID."""
    # Farmers can only see their own; NGO/Admin can see any
    # Identify target user role (required for repo)
    user_repo = UserRepository(db)
    target_user = user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    repo = ProfileRepository(db)
    profile = repo.get_by_user_id(user_id, target_user.role)
    if not profile:
        # Return default structure if not found instead of 404 to allow first-time UI
        return success("No profile found", {"user_id": user_id, "role": target_user.role})

    return success("Profile fetched", _profile_out(profile, target_user.role))


def _profile_out(profile, role) -> dict:
    base = {
        "id": profile.id,
        "user_id": profile.user_id,
        "role": role,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }
    
    if role == UserRole.farmer:
        base.update({
            "name": profile.name,
            "village": profile.village,
            "district": profile.district,
            "state": profile.state,
            "crop": profile.crop,
            "land_acres": profile.land_acres,
        })
    elif role == UserRole.ngo:
        def safe_json(val):
            if not val: return []
            if isinstance(val, list): return val
            try: return json.loads(val)
            except: return []

        base.update({
            "organization_name": profile.organization_name,
            "registration_number": profile.registration_number,
            "website": profile.website,
            "states_covered": safe_json(profile.states_covered),
            "districts_covered": safe_json(profile.districts_covered),
            "focus_areas": safe_json(profile.focus_areas),
        })
    elif role == UserRole.admin:
        base.update({
            "admin_id": profile.admin_id,
        })
    
    return base
