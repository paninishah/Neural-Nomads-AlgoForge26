from app.database import SessionLocal
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash
import sys
import os

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def reset_admin():
    db = SessionLocal()
    try:
        repo = UserRepository(db)
        admin_phone = "9999999001"
        user = repo.get_by_phone(admin_phone)
        if user:
            print(f"Found admin {admin_phone}. Resetting password to 'admin123'...")
            user.hashed_password = get_password_hash("admin123")
            db.commit()
            print("Password reset successful!")
        else:
            print(f"Admin {admin_phone} not found in DB.")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
