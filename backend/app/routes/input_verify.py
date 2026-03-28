import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import InputVerifyRequest, success
from app.core.dependencies import get_current_user
from app.ai import service as ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verify-input", tags=["Input / Pesticide Verification"])


@router.post("")
def verify_input(
    payload: InputVerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Verify a pesticide/input product via OCR simulation and fraud detection.
    Returns status, confidence, issues, and extracted product details.
    """
    result = ai_service.detect_fraud_input(
        image_path=payload.image,
        batch_number=payload.batch_number,
        brand=payload.brand,
        expiry_date=payload.expiry_date,
    )

    logger.info(
        f"Input verification: user={current_user.id}, "
        f"brand={payload.brand}, status={result['status']}, "
        f"confidence={result['confidence']}"
    )

    return success(result["message"], result)
