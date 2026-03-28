import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import PriceCheckRequest, success, error
from app.core.dependencies import get_current_user
from app.ml.price_model import get_price_stats

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/check-price", tags=["Price Check"])


@router.post("")
def check_price(
    payload: PriceCheckRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Check if a farmer's offered price is fair based on real mandi data.
    Uses trained ML model on market_data.csv.
    """
    stats = get_price_stats(crop=payload.crop, location=payload.location)

    if not stats:
        raise HTTPException(
            status_code=404,
            detail=f"No market data found for crop '{payload.crop}' near '{payload.location}'",
        )

    avg_price = stats["average_price"]
    user_price = payload.user_price
    difference = round(avg_price - user_price, 2)
    pct_diff = round((difference / avg_price) * 100, 1) if avg_price else 0

    # Decision logic
    if user_price < avg_price * 0.95:
        status_str = "underpaid"
        decision = "GO_TO_OTHER_MANDI"
        message = f"₹{abs(difference):.0f} kam mila. Doosre mandi mein behtar daam milega."
    elif user_price > avg_price * 1.05:
        status_str = "overpaid"
        decision = "GOOD_PRICE"
        message = f"Aapko ₹{abs(difference):.0f} zyada mila. Yeh ek acha deal hai!"
    else:
        status_str = "fair"
        decision = "FAIR_PRICE"
        message = f"Aapko fair market rate mila hai. Farq sirf ₹{abs(difference):.0f} ka hai."

    logger.info(
        f"Price check: crop={payload.crop}, loc={payload.location}, "
        f"user={user_price}, avg={avg_price}, status={status_str}"
    )

    return success(
        message,
        {
            "status": status_str,
            "average_price": avg_price,
            "user_price": user_price,
            "difference": difference,
            "difference_pct": pct_diff,
            "best_mandi": stats["best_mandi"],
            "decision": decision,
            "message_text": message,
            "all_mandis": stats["all_mandis"],
            "data_points": stats["record_count"],
        },
    )
