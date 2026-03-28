import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import UnifiedRequestCreate, UnifiedRequestOut, UnifiedRequestUpdate, success
from app.core.dependencies import get_current_user
from app.repositories.request_repo import UnifiedRequestRepository
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/requests", tags=["Unified Requests"])


@router.post("")
def create_unified_request(
    payload: UnifiedRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Submit a new unified request (Loan, Pesticide, etc.)."""
    if current_user.role == "farmer" and current_user.id != payload.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user_repo = UserRepository(db)
    if not user_repo.get_by_id(payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")

    repo = UnifiedRequestRepository(db)
    # Convert payload dict to JSON-compatible data
    req = repo.create(
        user_id=payload.user_id,
        request_type=payload.type,
        payload=payload.payload
    )

    logger.info(f"Unified request created: id={req.id}, type={payload.type}, user={payload.user_id}")
    return success("Request submitted successfully", _req_out(req))


@router.get("/user/{user_id}")
def get_user_requests(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all requests for a user."""
    if current_user.role == "farmer" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    repo = UnifiedRequestRepository(db)
    items = repo.get_by_user(user_id)

    return success(f"Found {len(items)} request(s)", [_req_out(h) for h in items])


@router.get("/ngo/all")
def get_all_requests_for_ngo(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all platform requests (for NGOs/Admins)."""
    if current_user.role not in ["ngo", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    repo = UnifiedRequestRepository(db)
    items = repo.get_all()

    return success(f"Found {len(items)} total request(s)", [_req_out(h) for h in items])


@router.patch("/{request_id}")
def update_request_status(
    request_id: str,
    payload: UnifiedRequestUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update status of a request (NGO action)."""
    if current_user.role not in ["ngo", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    repo = UnifiedRequestRepository(db)
    req = repo.update_status(
        request_id=request_id,
        status=payload.status,
        ngo_notes=payload.ngo_notes,
        ngo_id=current_user.id
    )

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    return success("Request status updated", _req_out(req))


def _req_out(req) -> dict:
    try:
        p = json.loads(req.payload) if isinstance(req.payload, str) else req.payload
    except:
        p = {}
    return {
        "id": req.id,
        "user_id": req.user_id,
        "request_type": req.request_type,
        "status": req.status,
        "payload": p,
        "ngo_notes": req.ngo_notes,
        "assigned_ngo_id": req.assigned_ngo_id,
        "created_at": req.created_at.isoformat(),
        "updated_at": req.updated_at.isoformat(),
    }
