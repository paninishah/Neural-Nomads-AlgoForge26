from sqlalchemy.orm import Session
from app.models.models import FarmerProfile, NGOProfile, AdminProfile, UserRole
from datetime import datetime
import json


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str, role: str):
        if role == UserRole.farmer:
            return self.db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        elif role == UserRole.ngo:
            return self.db.query(NGOProfile).filter(NGOProfile.user_id == user_id).first()
        elif role == UserRole.admin:
            return self.db.query(AdminProfile).filter(AdminProfile.user_id == user_id).first()
        return None

    def create_or_update(self, user_id: str, role: str, data: dict):
        profile = self.get_by_user_id(user_id, role)
        
        # Prepare data for DB
        processed_data = {}
        for k, v in data.items():
            if v is None:
                continue
            if isinstance(v, list):
                processed_data[k] = json.dumps(v)
            else:
                processed_data[k] = v

        if profile:
            for key, value in processed_data.items():
                setattr(profile, key, value)
            profile.updated_at = datetime.utcnow()
        else:
            if role == UserRole.farmer:
                profile = FarmerProfile(user_id=user_id, **processed_data)
            elif role == UserRole.ngo:
                profile = NGOProfile(user_id=user_id, **processed_data)
            elif role == UserRole.admin:
                profile = AdminProfile(user_id=user_id, **processed_data)
            
            if profile:
                self.db.add(profile)
        
        self.db.commit()
        if profile:
            self.db.refresh(profile)
        return profile
