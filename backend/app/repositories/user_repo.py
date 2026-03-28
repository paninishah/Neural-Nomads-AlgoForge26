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

    def create(self, phone: str, role: str = "farmer") -> User:
        user = User(phone=phone, role=role, phone_verified=True)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_or_create(self, phone: str, role: str = "farmer") -> tuple[User, bool]:
        user = self.get_by_phone(phone)
        if user:
            return user, False
        return self.create(phone, role), True

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
