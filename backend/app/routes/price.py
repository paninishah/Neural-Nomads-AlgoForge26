import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import PriceCheckRequest, success, error
from app.core.dependencies import get_current_user
from app.repositories.help_repo import HelpRequestRepository
from app.ml.price_model import get_price_stats, get_model

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

    # --- Auto Fraud Reporting ---
    fraud_complaint = None
    if payload.report_fraud and status_str == "underpaid":
        if not payload.user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id is required to report fraud automatically."
            )
        
        help_repo = HelpRequestRepository(db)
        description = (
            f"Mandi Price Fraud Reported: {payload.crop} in {payload.location}. "
            f"Expected Average: ₹{avg_price}, User Offered: ₹{user_price}. "
            f"Difference: ₹{abs(difference):.0f} ({pct_diff}%)."
        )
        ticket = help_repo.create(
            user_id=payload.user_id,
            request_type="fraud",
            description=description
        )
        fraud_complaint = {
            "complaint_id": ticket.id,
            "status": ticket.status
        }
        logger.info(f"Auto-fraud ticket created for {payload.user_id}: {ticket.id}")

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
            "fraud_complaint": fraud_complaint
        },
    )


@router.get("/crops")
def list_crops(current_user=Depends(get_current_user)):
    """
    Return all unique crop names available in the dataset.
    Used to populate the crop selector on the frontend.
    """
    try:
        _, _, df = get_model()
        crops = sorted(df["crop"].dropna().unique().tolist())
        # Title-case for display
        crops_titled = [c.title() for c in crops]
        return success("Crops loaded", {"crops": crops_titled})
    except Exception as e:
        logger.error(f"Failed to load crops: {e}")
        raise HTTPException(status_code=500, detail="Could not load crop data")


@router.get("/recommend")
def recommend_crops(
    location: str = "",
    current_user=Depends(get_current_user)
):
    """
    Return top 5 crops with the highest average market price for a given location.
    Used for the AI recommendation panel on the frontend.
    """
    try:
        _, _, df = get_model()
        location_lower = location.strip().lower()

        if location_lower:
            loc_df = df[
                df["market"].str.contains(location_lower, na=False)
                | df["district"].str.contains(location_lower, na=False)
                | df["state"].str.contains(location_lower, na=False)
            ]
            if loc_df.empty:
                loc_df = df  # fall back to national data
        else:
            loc_df = df

        agg = (
            loc_df.groupby("crop")["price_modal"]
            .agg(["mean", "count"])
            .reset_index()
        )
        agg.columns = ["crop", "avg_price", "count"]
        # Only include crops with enough data points
        agg = agg[agg["count"] >= 5].sort_values("avg_price", ascending=False)

        top_crops = [
            {
                "crop": row["crop"].title(),
                "avg_price": round(row["avg_price"], 2),
                "data_points": int(row["count"]),
            }
            for _, row in agg.head(5).iterrows()
        ]

        scope = location.title() if location else "National"
        return success(f"Top crops by price for {scope}", {"recommendations": top_crops, "scope": scope})
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail="Could not generate recommendations")


@router.get("/ticker")
def get_price_ticker(current_user=Depends(get_current_user)):
    """
    Return a stream of real market entries from the dataset for the dashboard ticker.
    """
    from app.ml.price_model import get_market_hotspots
    try:
        data = get_market_hotspots()
        return success("Ticker data loaded", {"tickers": data})
    except Exception as e:
        logger.error(f"Ticker error: {e}")
        return error("Failed to load ticker", str(e))
