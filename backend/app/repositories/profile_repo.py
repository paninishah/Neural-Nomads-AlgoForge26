from sqlalchemy.orm import Session
from app.models.models import FarmerProfile
from datetime import datetime


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str) -> FarmerProfile | None:
        return self.db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()

    def create_or_update(self, user_id: str, data: dict) -> FarmerProfile:
        profile = self.get_by_user_id(user_id)
        if profile:
            for key, value in data.items():
                if value is not None:
                    setattr(profile, key, value)
            profile.updated_at = datetime.utcnow()
        else:
            profile = FarmerProfile(user_id=user_id, **data)
            self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
