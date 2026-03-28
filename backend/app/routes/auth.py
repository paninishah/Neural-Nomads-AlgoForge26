import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    LoginRequest, 
    NGOLoginRequest, 
    RegisterRequest, 
    NGORegisterRequest, 
    LoginResponse, 
    success, 
    error
)
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.dependencies import get_current_user
from app.repositories.user_repo import UserRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/ngo/register")
def register_ngo(payload: NGORegisterRequest, db: Session = Depends(get_db)):
    """Register a new NGO with email and password."""
    repo = UserRepository(db)
    
    # Check if email already registered
    if repo.get_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(payload.password)
    user = repo.create_ngo_user(
        email=payload.email,
        hashed_password=hashed_pwd,
        full_name=payload.operator_full_name,
        organization_name=payload.organization_name
    )
    
    token = create_access_token(data={"sub": user.id, "role": user.role})
    
    logger.info(f"NGO {user.email} registered")
    return success(
        "NGO Successfully registered",
        {
            "user_id": user.id,
            "role": user.role,
            "token": token,
            "verification_status": user.verification_status,
        },
    )

@router.post("/ngo/login")
def login_ngo(payload: NGOLoginRequest, db: Session = Depends(get_db)):
    """Login for NGOs with email and password."""
    repo = UserRepository(db)
    user = repo.get_by_email(email=payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(data={"sub": user.id, "role": user.role})
    
    logger.info(f"NGO {user.email} logged in")

    return success(
        "Successfully logged in",
        {
            "user_id": user.id,
            "role": user.role,
            "token": token,
            "verification_status": user.verification_status,
        },
    )

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with phone and password."""
    repo = UserRepository(db)
    
    # Check if phone already registered
    existing_user = repo.get_by_phone(payload.phone)
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    hashed_pwd = get_password_hash(payload.password)
    user = repo.create_user(
        name=payload.name,
        phone=payload.phone,
        hashed_password=hashed_pwd,
        role=payload.role
    )
    
    # Create empty FarmerProfile if role is farmer
    if user.role == "farmer":
        from app.models.models import FarmerProfile
        profile = FarmerProfile(
            user_id=user.id, 
            name=user.name,
            state=payload.state,
            district=payload.district
        )
        db.add(profile)
        db.commit()

    logger.info(f"User {user.phone} registered as {user.role}")
    return success(
        "Successfully registered",
        {
            "user_id": user.id,
            "role": user.role,
            "verification_status": user.verification_status,
        },
    )

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login with phone and password."""
    repo = UserRepository(db)
    user = repo.get_by_phone(phone=payload.phone)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password",
        )

    token = create_access_token(data={"sub": user.id, "role": user.role})

    logger.info(f"User {user.phone} logged in as {user.role}")

    return success(
        "Successfully logged in",
        {
            "user_id": user.id,
            "role": user.role,
            "token": token,
            "verification_status": user.verification_status,
        },
    )


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    """Return currently authenticated user details."""
    return success(
        "User details fetched",
        {
            "id": current_user.id,
            "phone": current_user.phone,
            "email": current_user.email,
            "role": current_user.role,
            "full_name": current_user.full_name,
            "organization_name": current_user.organization_name,
            "verification_status": current_user.verification_status,
            "phone_verified": current_user.phone_verified,
            "ngo_verified": current_user.ngo_verified,
            "created_at": current_user.created_at.isoformat(),
        },
    )
