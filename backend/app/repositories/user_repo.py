from sqlalchemy.orm import Session
from app.models.models import User, UserRole, VerificationStatus
from datetime import datetime


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_phone(self, phone: str) -> User | None:
        return self.db.query(User).filter(User.phone == phone).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, name: str, phone: str, hashed_password: str, role: str = "farmer") -> User:
        user = User(
            name=name, 
            phone=phone, 
            hashed_password=hashed_password, 
            role=role, 
            phone_verified=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_ngo_user(self, email: str, hashed_password: str, full_name: str, organization_name: str) -> User:
        user = User(
            name=full_name,  # name acts as display/operator name
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            organization_name=organization_name,
            role=UserRole.ngo,
            phone_verified=False,
            ngo_verified=False, # NGO starts as unverified
            verification_status=VerificationStatus.unverified
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_verification_status(self, user_id: str, status: str) -> User | None:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.verification_status = status
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_ngo_verified(self, user_id: str, verified: bool) -> User | None:
        user = self.get_by_id(user_id)
        if not user:
            return None
        user.ngo_verified = verified
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_farmers_by_status(self, status: str) -> list[User]:
        return (
            self.db.query(User)
            .filter(User.role == UserRole.farmer, User.verification_status == status)
            .all()
        )
