import json
from sqlalchemy.orm import Session
from app.models.models import UnifiedRequest, RequestType, RequestStatus
from datetime import datetime

class UnifiedRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, request_type: str, payload: dict = None) -> UnifiedRequest:
        # payload is expected to be a dict, we'll store it as a JSON string
        req = UnifiedRequest(
            user_id=user_id,
            request_type=request_type,
            payload=json.dumps(payload or {}),
            status=RequestStatus.pending
        )
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get_by_id(self, request_id: str) -> UnifiedRequest | None:
        return self.db.query(UnifiedRequest).filter(UnifiedRequest.id == request_id).first()

    def get_by_user(self, user_id: str) -> list[UnifiedRequest]:
        return (
            self.db.query(UnifiedRequest)
            .filter(UnifiedRequest.user_id == user_id)
            .order_by(UnifiedRequest.created_at.desc())
            .all()
        )

    def get_all(self) -> list[UnifiedRequest]:
        return (
            self.db.query(UnifiedRequest)
            .order_by(UnifiedRequest.created_at.desc())
            .all()
        )

    def update_status(
        self, request_id: str, status: str, ngo_notes: str = None, ngo_id: str = None
    ) -> UnifiedRequest | None:
        req = self.get_by_id(request_id)
        if not req:
            return None
        req.status = status
        if ngo_notes is not None:
            req.ngo_notes = ngo_notes
        if ngo_id:
            req.assigned_ngo_id = ngo_id
        req.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(req)
        return req
