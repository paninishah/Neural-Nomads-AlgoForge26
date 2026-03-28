import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import LoanEligibilityRequest, success
from app.core.dependencies import get_current_user
from app.repositories.user_repo import UserRepository
from app.repositories.document_repo import DocumentRepository
from app.repositories.profile_repo import ProfileRepository
from app.ai import service as ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/loan", tags=["Loan / Credit"])

# Mock loan providers
LOAN_OPTIONS = [
    {
        "provider": "NABARD Kisan Credit",
        "interest": 4.0,
        "max_amount": 300000,
        "tenure_months": 60,
        "requirements": ["Verified land document", "Aadhaar card", "Crop plan"],
    },
    {
        "provider": "SBI Agri Loan",
        "interest": 6.5,
        "max_amount": 500000,
        "tenure_months": 84,
        "requirements": ["Verified Aadhaar", "2 years farming record"],
    },
    {
        "provider": "NBFC AgriFinance",
        "interest": 9.5,
        "max_amount": 100000,
        "tenure_months": 36,
        "requirements": ["Phone verified", "Basic profile"],
    },
    {
        "provider": "PM Kisan Samman Fund",
        "interest": 0.0,
        "max_amount": 6000,
        "tenure_months": 12,
        "requirements": ["Registered farmer", "Land record"],
    },
]


@router.post("/check-eligibility")
def check_loan_eligibility(
    payload: LoanEligibilityRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Determine loan eligibility based on trust score and verification status."""
    if current_user.role == "farmer" and current_user.id != payload.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    doc_repo = DocumentRepository(db)
    docs = doc_repo.get_by_user_id(payload.user_id)
    avg_confidence = doc_repo.get_avg_confidence(payload.user_id)

    profile_repo = ProfileRepository(db)
    profile = profile_repo.get_by_user_id(payload.user_id)

    trust = ai_service.calculate_trust_score(
        user_id=payload.user_id,
        phone_verified=user.phone_verified,
        has_documents=len(docs) > 0,
        document_count=len(docs),
        avg_ai_confidence=avg_confidence,
        ngo_verified=user.ngo_verified,
        profile_complete=profile is not None and bool(profile.name and profile.crop),
    )

    score = trust["score"]

    # Eligibility and amount logic
    if score >= 70:
        eligible = True
        recommended_amount = 200000.0
        max_amount = 500000.0
        reason = f"High trust score ({score}/100). Verified farmer with strong profile."
    elif score >= 40:
        eligible = True
        recommended_amount = 50000.0
        max_amount = 100000.0
        reason = f"Medium trust score ({score}/100). Basic verification complete."
    else:
        eligible = False
        recommended_amount = 0.0
        max_amount = 0.0
        reason = (
            f"Low trust score ({score}/100). Please complete your profile and upload documents "
            "to improve eligibility."
        )

    logger.info(f"Loan eligibility: user={payload.user_id}, score={score}, eligible={eligible}")

    return success(
        "Loan eligibility check complete",
        {
            "eligible": eligible,
            "score": score,
            "trust_level": trust["level"],
            "recommended_amount": recommended_amount,
            "max_amount": max_amount,
            "reason": reason,
            "factors": trust["factors"],
        },
    )


@router.get("/options")
def get_loan_options(current_user=Depends(get_current_user)):
    """Return available loan providers and their terms."""
    return success("Loan options fetched", LOAN_OPTIONS)
