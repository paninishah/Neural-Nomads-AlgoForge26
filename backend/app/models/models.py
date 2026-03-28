import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, Boolean, Text, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database import Base
import enum


def gen_uuid():
    return str(uuid.uuid4())


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    farmer = "farmer"
    ngo = "ngo"
    admin = "admin"


class VerificationStatus(str, enum.Enum):
    unverified = "unverified"
    pending_ai_review = "pending_ai_review"
    auto_verified = "auto_verified"
    needs_manual_review = "needs_manual_review"
    verified = "verified"
    rejected = "rejected"


class DocumentType(str, enum.Enum):
    aadhaar = "aadhaar"
    land = "land"
    bill = "bill"


class HelpRequestType(str, enum.Enum):
    fraud = "fraud"
    legal = "legal"
    agriculture = "agriculture"


class HelpRequestStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"


# ─── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    phone = Column(String(15), unique=True, nullable=True, index=True)
    email = Column(String(100), unique=True, nullable=True, index=True)
    name = Column(String(200), nullable=False)  # Display name for login users
    full_name = Column(String(200), nullable=True)  # For NGO Operators
    organization_name = Column(String(200), nullable=True)  # For NGO Org details
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.farmer, nullable=False)
    verification_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.unverified, nullable=False
    )
    phone_verified = Column(Boolean, default=False)
    ngo_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete")
    ngo_profile = relationship("NGOProfile", back_populates="user", uselist=False, cascade="all, delete")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete")
    documents = relationship("Document", back_populates="user", cascade="all, delete")
    help_requests = relationship("HelpRequest", back_populates="user", cascade="all, delete", foreign_keys="[HelpRequest.user_id]")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    village = Column(String(200))
    district = Column(String(200))
    state = Column(String(200))
    crop = Column(String(200))
    land_acres = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")


class NGOProfile(Base):
    __tablename__ = "ngo_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    organization_name = Column(String(200)) # Local copy for profile
    registration_number = Column(String(100))
    website = Column(String(200))
    states_covered = Column(Text, default="[]")  # JSON string
    districts_covered = Column(Text, default="[]")  # JSON string
    focus_areas = Column(Text, default="[]")  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ngo_profile")


class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    admin_id = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="admin_profile")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    doc_type = Column(Enum(DocumentType), nullable=False)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.pending_ai_review)
    ai_confidence = Column(Float, default=0.0)
    extracted_fields = Column(Text, default="{}")  # JSON string
    ai_notes = Column(Text, default="")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")


class HelpRequest(Base):
    __tablename__ = "help_requests"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    request_type = Column(Enum(HelpRequestType), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(HelpRequestStatus), default=HelpRequestStatus.open)
    ngo_notes = Column(Text, default="")
    assigned_ngo_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="help_requests", foreign_keys=[user_id])


class NGOVerification(Base):
    __tablename__ = "ngo_verifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    farmer_id = Column(String, ForeignKey("users.id"), nullable=False)
    ngo_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String(20), nullable=False)  # approve | reject
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class PesticideScan(Base):
    __tablename__ = "pesticide_scans"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    pesticide_name = Column(String(200))
    extracted_mrp = Column(Float, default=0.0)
    bill_price = Column(Float, default=0.0)
    status = Column(String(50), default="genuine") # genuine | suspicious | fraud
    ai_findings = Column(Text, default="") # Detailed reason for flag
    ngo_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
