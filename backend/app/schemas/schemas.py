from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum


# ─── Shared Response ──────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    status: str
    message_text: str
    data: Any = None


def success(message: str, data: Any = None) -> dict:
    return {"status": "success", "message_text": message, "data": data}


def error(message: str, data: Any = None) -> dict:
    return {"status": "error", "message_text": message, "data": data}


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, pattern=r"^\d{10,15}$")
    role: Optional[str] = Field(default="farmer")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("farmer", "ngo", "admin"):
            raise ValueError("Role must be farmer, ngo, or admin")
        return v


class LoginResponse(BaseModel):
    user_id: str
    role: str
    token: str
    verification_status: str


class UserOut(BaseModel):
    id: str
    phone: str
    role: str
    verification_status: str
    phone_verified: bool
    ngo_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Profile ──────────────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    village: Optional[str] = None
    state: Optional[str] = None
    crop: Optional[str] = None
    land_acres: Optional[float] = Field(default=0.0, ge=0)


class ProfileOut(BaseModel):
    id: str
    user_id: str
    name: str
    village: Optional[str]
    state: Optional[str]
    crop: Optional[str]
    land_acres: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Document ─────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    user_id: str
    doc_type: str
    file_path: str
    original_filename: str
    status: str
    ai_confidence: float
    extracted_fields: str
    ai_notes: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ─── Trust Score ──────────────────────────────────────────────────────────────

class TrustFactors(BaseModel):
    phone_verified: bool
    document_uploaded: bool
    ai_confidence: str  # low / medium / high
    ngo_verified: bool
    profile_complete: bool


class TrustScoreOut(BaseModel):
    score: int
    level: str  # low / medium / high
    factors: TrustFactors


# ─── Price ────────────────────────────────────────────────────────────────────

class PriceCheckRequest(BaseModel):
    crop: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    user_price: float = Field(..., gt=0)


class MandiInfo(BaseModel):
    name: str
    price: float
    state: Optional[str] = None


class PriceCheckResponse(BaseModel):
    status: str  # underpaid / fair / overpaid
    average_price: float
    user_price: float
    difference: float
    best_mandi: MandiInfo
    decision: str
    message_text: str
    all_mandis: list[MandiInfo]


# ─── Heatmap ──────────────────────────────────────────────────────────────────

class HeatmapPoint(BaseModel):
    location: str
    district: Optional[str] = None
    state: Optional[str] = None
    price: float
    lat: Optional[float] = None
    lng: Optional[float] = None


# ─── Input Verify ─────────────────────────────────────────────────────────────

class InputVerifyRequest(BaseModel):
    image: str  # base64 or URL
    batch_number: Optional[str] = None
    brand: Optional[str] = None
    expiry_date: Optional[str] = None


class InputVerifyResponse(BaseModel):
    status: str  # genuine / suspicious / fake
    confidence: float
    issues: list[str]
    message: str
    extracted: dict


# ─── Loan ─────────────────────────────────────────────────────────────────────

class LoanEligibilityRequest(BaseModel):
    user_id: str


class LoanEligibilityResponse(BaseModel):
    eligible: bool
    score: int
    recommended_amount: float
    reason: str
    max_amount: float


class LoanOption(BaseModel):
    provider: str
    interest: float
    max_amount: float
    tenure_months: int
    requirements: list[str]


# ─── Help Request ─────────────────────────────────────────────────────────────

class HelpRequestCreate(BaseModel):
    user_id: str
    type: str = Field(..., pattern=r"^(fraud|legal|agriculture)$")
    description: str = Field(..., min_length=10)


class HelpRequestOut(BaseModel):
    id: str
    user_id: str
    request_type: str
    description: str
    status: str
    ngo_notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── NGO ──────────────────────────────────────────────────────────────────────

class NGOVerifyRequest(BaseModel):
    farmer_id: str
    action: str = Field(..., pattern=r"^(approve|reject)$")
    notes: Optional[str] = ""


class NGOHelpUpdateRequest(BaseModel):
    request_id: str
    status: str = Field(..., pattern=r"^(in_progress|resolved)$")
    notes: Optional[str] = ""


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminVerifyNGORequest(BaseModel):
    user_id: str
    approve: bool


class AdminOverrideRequest(BaseModel):
    user_id: str
    status: str
    reason: str
