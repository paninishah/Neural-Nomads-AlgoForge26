import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to sys.path to import from 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine
from app.models.models import Base, User, UserRole, VerificationStatus, AdminProfile
from app.core.security import get_password_hash

def seed_admin():
    db: Session = SessionLocal()
    try:
        # Check if admin already exists
        admin_phone = "9999999001"
        existing = db.query(User).filter(User.phone == admin_phone).first()
        if existing:
            print(f"Admin with phone {admin_phone} already exists.")
            return

        print(f"Creating superuser with phone {admin_phone}...")
        
        # Create User record
        admin_user = User(
            name="System Admin",
            phone=admin_phone,
            hashed_password=get_password_hash("admin123"),
            role=UserRole.admin,
            verification_status=VerificationStatus.verified,
            phone_verified=True,
            ngo_verified=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        # Create Admin Profile
        admin_profile = AdminProfile(
            user_id=admin_user.id,
            admin_id="SA-001"
        )
        db.add(admin_profile)
        db.commit()
        
        print("Superuser created successfully!")
        print(f"ID: {admin_user.id}")
        print("Phone: 9999999001")
        print("Password: admin123")

    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
