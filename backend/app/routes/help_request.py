import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import HelpRequestCreate, success
from app.core.dependencies import get_current_user
from app.repositories.help_repo import HelpRequestRepository
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/help-request", tags=["Help Requests"])


@router.post("")
def create_help_request(
    payload: HelpRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Submit a new help request."""
    if current_user.role == "farmer" and current_user.id != payload.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user_repo = UserRepository(db)
    if not user_repo.get_by_id(payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")

    repo = HelpRequestRepository(db)
    hr = repo.create(
        user_id=payload.user_id,
        request_type=payload.type,
        description=payload.description,
    )

    logger.info(f"Help request created: id={hr.id}, type={payload.type}, user={payload.user_id}")
    return success("Help request submitted successfully", _hr_out(hr))


@router.get("/{user_id}")
def get_help_requests(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all help requests for a user."""
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    repo = HelpRequestRepository(db)
    items = repo.get_by_user_id(user_id)

    return success(f"Found {len(items)} help request(s)", [_hr_out(h) for h in items])


def _hr_out(hr) -> dict:
    return {
        "id": hr.id,
        "user_id": hr.user_id,
        "request_type": hr.request_type,
        "description": hr.description,
        "status": hr.status,
        "ngo_notes": hr.ngo_notes,
        "created_at": hr.created_at.isoformat(),
        "updated_at": hr.updated_at.isoformat(),
    }
