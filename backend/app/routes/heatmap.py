import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import success
from app.core.dependencies import get_current_user
from app.ml.price_model import get_heatmap_data

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/heatmap", tags=["Heatmap"])


@router.get("/prices")
def get_price_heatmap(
    crop: str = Query(..., min_length=2, description="Crop name e.g. tomato, wheat, rice"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Return price heatmap data for a crop across all mandis.
    Optimized for frontend map rendering with lat/lng coordinates.
    """
    data = get_heatmap_data(crop=crop)

    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"No heatmap data found for crop '{crop}'",
        )

    logger.info(f"Heatmap data returned for crop={crop}: {len(data)} points")
    return success(
        f"Heatmap data for '{crop}' – {len(data)} market locations",
        {
            "crop": crop,
            "total_markets": len(data),
            "locations": data,
        },
    )
