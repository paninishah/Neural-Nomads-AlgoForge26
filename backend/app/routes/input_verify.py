import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import InputVerifyRequest, success
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
    db.refresh(scan)

    # Sync to Unified Requests for global persistence & Farmer's Voice tracking
    from app.models.models import UnifiedRequest, RequestType
    import json
    
    # Pack simplified scan info into payload
    payload_data = {
        "pesticide_name": scan.pesticide_name,
        "status": scan.status,
        "ai_findings": scan.ai_findings,
        "scan_id": scan.id
    }
    
    unified_req = UnifiedRequest(
        user_id=current_user.id,
        request_type=RequestType.pesticide_check,
        payload=json.dumps(payload_data)
    )
    db.add(unified_req)
    db.commit()

    logger.info(
        f"Pesticide verification: user={current_user.id}, "
        f"mode={payload.mode}, status={result['status']}"
    )

    return success(result["message"], result)


@router.get("/history")
def get_pesticide_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all past scans for the current farmer."""
    items = db.query(PesticideScan).filter(PesticideScan.user_id == current_user.id).all()
    
    history = [
        {
            "id": i.id,
            "pesticide_name": i.pesticide_name,
            "status": i.status,
            "ai_findings": i.ai_findings,
            "created_at": i.created_at.isoformat(),
        }
        for i in items
    ]
    
    return success(f"Found {len(history)} scan(s)", {"history": history})
