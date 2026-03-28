from sqlalchemy.orm import Session
from app.models.models import HelpRequest, HelpRequestStatus
from datetime import datetime


class HelpRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, request_type: str, description: str) -> HelpRequest:
        hr = HelpRequest(user_id=user_id, request_type=request_type, description=description)
        self.db.add(hr)
        self.db.commit()
        self.db.refresh(hr)
        return hr

    def get_by_user_id(self, user_id: str) -> list[HelpRequest]:
        return self.db.query(HelpRequest).filter(HelpRequest.user_id == user_id).all()

    def get_all_open(self) -> list[HelpRequest]:
        return (
            self.db.query(HelpRequest)
            .filter(HelpRequest.status.in_([HelpRequestStatus.open, HelpRequestStatus.in_progress]))
            .all()
        )

    def get_by_id(self, request_id: str) -> HelpRequest | None:
        return self.db.query(HelpRequest).filter(HelpRequest.id == request_id).first()

    def update_status(
        self, request_id: str, status: str, notes: str = ""
    ) -> HelpRequest | None:
        hr = self.get_by_id(request_id)
        if not hr:
            return None
        hr.status = status
        hr.ngo_notes = notes
        hr.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(hr)
        return hr
