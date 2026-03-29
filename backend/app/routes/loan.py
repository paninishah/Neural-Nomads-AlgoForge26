import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import LoanEligibilityRequest, success
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
      "interest": 4,
      "max_amount": 300000,
      "tenure_months": 60,
      "requirements": [
        "Verified land document",
        "Aadhaar card",
        "Crop plan"
      ]
    },
    {
      "provider": "SBI Agri Loan",
      "interest": 6.5,
      "max_amount": 500000,
      "tenure_months": 84,
      "requirements": [
        "Verified Aadhaar",
        "2 years farming record"
      ]
    },
    {
      "provider": "NBFC AgriFinance",
      "interest": 9.5,
      "max_amount": 100000,
      "tenure_months": 36,
      "requirements": [
        "Phone verified",
        "Basic profile"
      ]
    },
    {
      "provider": "PM Kisan Samman Fund",
      "interest": 0,
      "max_amount": 6000,
      "tenure_months": 12,
      "requirements": [
        "Registered farmer",
        "Land record"
      ]
    }
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
    profile = profile_repo.get_by_user_id(payload.user_id, user.role)

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


@router.post("/check-credibility")
def check_credibility(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Advanced Credibility Check: OCR Name Match + Trust Score Breakdown.
    Predicts amounts based on the final point-based trust level.
    """
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can check loan credibility")

    user_id = current_user.id
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    
    doc_repo = DocumentRepository(db)
    docs = doc_repo.get_by_user_id(user_id)
    
    profile_repo = ProfileRepository(db)
    profile = profile_repo.get_by_user_id(user_id, user.role)

    # 1. OCR Name Match Verification
    # Find latest identity document (aadhaar or ration_card)
    latest_id_doc = None
    for d in sorted(docs, key=lambda x: x.uploaded_at, reverse=True):
        if d.doc_type in ["aadhaar", "ration_card"] and d.status != "rejected":
            latest_id_doc = d
            break

    name_match = False
    ocr_name = "Not Found"
    profile_name = user.name
    
    if latest_id_doc:
        try:
            import json
            # Ensure we are parsing a string, not accidentally a dict if SQLAlchemy already converted it
            fields = latest_id_doc.extracted_fields
            if isinstance(fields, str):
                fields = json.loads(fields)
            
            logger.info(f"Checking OCR name match for user {user_id}. Extracted: {fields}")

            # Aadhaar uses 'name', Ration Card uses 'head_of_family'
            extracted_name = fields.get("name") or fields.get("head_of_family")
            if extracted_name:
                ocr_name = extracted_name
                # Robust fuzzy match: ignore case, extra spaces, and "Extracted Name" placeholder
                clean_extracted = extracted_name.lower().strip()
                clean_profile = profile_name.lower().strip()
                
                if clean_extracted != "extracted name" and (clean_extracted in clean_profile or clean_profile in clean_extracted):
                    name_match = True
                    logger.info(f"OCR Name Match SUCCESS for user {user_id}: '{clean_extracted}' matched '{clean_profile}'")
                else:
                    logger.warning(f"OCR Name Match FAILED for user {user_id}: '{clean_extracted}' vs '{clean_profile}'")
        except Exception as e:
            logger.error(f"Error parsing extracted fields for doc {latest_id_doc.id}: {e}")
    else:
        logger.warning(f"No identity document found for credibility check for user {user_id}")

    # 2. Calculate Trust Score using the point breakdown logic
    avg_confidence = doc_repo.get_avg_confidence(user_id)
    if name_match:
        # Boost confidence to max if names match (helps fulfill the 'AI Confidence' boost)
        avg_confidence = max(avg_confidence, 0.85)

    trust = ai_service.calculate_trust_score(
        user_id=user_id,
        phone_verified=user.phone_verified,
        has_documents=len(docs) > 0,
        document_count=len(docs),
        avg_ai_confidence=avg_confidence,
        ngo_verified=user.ngo_verified,
        profile_complete=profile is not None and bool(profile.village and profile.crop),
    )

    score = trust["score"]
    
    # 3. Predict amounts based on score
    # Scales linearly with trust score above a threshold
    base_max = 500000
    base_recommended = 200000
    
    if score >= 40:
        multiplier = score / 100
        max_amount = round(base_max * multiplier, -3)
        recommended_amount = round(base_recommended * multiplier, -3)
        eligible = True
    else:
        max_amount = 0
        recommended_amount = 0
        eligible = False

    return success(
        "Credibility check complete",
        {
            "user_name": profile_name,
            "ocr_name": ocr_name,
            "name_match": name_match,
            "trust_score": score,
            "trust_factors": trust["factors"],
            "eligible": eligible,
            "max_amount": max_amount,
            "recommended_amount": recommended_amount,
            "loan_options": LOAN_OPTIONS
        }
    )


@router.get("/options")
def get_loan_options(current_user=Depends(get_current_user)):
    """Return available loan providers and their terms."""
    return success("Loan options fetched", LOAN_OPTIONS)
