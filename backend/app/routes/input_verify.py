import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import InputVerifyRequest, success
from app.core.dependencies import get_current_user
from app.ai import service as ai_service
from app.models.models import PesticideScan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/verify-input", tags=["Input / Pesticide Verification"])


@router.post("")
def verify_input(
    payload: InputVerifyRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Sequential Pesticide verification:
    Mode 'bottle': Extract name and ingredients.
    Mode 'bill': Extract price and compare with industry standard.
    """
    result = ai_service.detect_fraud_input(
        image_path=payload.image,
        mode=payload.mode,
        pesticide_name=payload.pesticide_name,
        batch_number=payload.batch_number,
        brand=payload.brand,
    )

    # Persist the scan for NGO review if suspicious or for recording
    extracted = result.get("extracted", {})
    scan = PesticideScan(
        user_id=current_user.id,
        pesticide_name=extracted.get("pesticide_name") or payload.pesticide_name,
        extracted_mrp=extracted.get("bottle_mrp", 0.0),
        bill_price=extracted.get("bill_price", 0.0),
        status=result["status"],
        ai_findings=", ".join(result.get("issues", []))
    )
    db.add(scan)
    db.commit()

    logger.info(
        f"Pesticide verification: user={current_user.id}, "
        f"mode={payload.mode}, status={result['status']}"
    )

    return success(result["message"], result)
