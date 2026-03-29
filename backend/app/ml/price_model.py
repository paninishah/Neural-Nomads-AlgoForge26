"""
ML Price Model – Trained on real market_data.csv.
Uses scikit-learn to predict mandi prices for crop + location.
"""
import os
import pickle
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

logger = logging.getLogger(__name__)

_BASE = Path(__file__).parent.parent
DATA_PATH = _BASE / "data" / "market_data.csv"
MODEL_PATH = _BASE / "data" / "price_model.pkl"
ENCODERS_PATH = _BASE / "data" / "encoders.pkl"


def _load_and_clean_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    # Rename to consistent names
    rename_map = {
        "state_name": "state",
        "district_name": "district",
        "market_center_name": "market",
        "variety": "crop",
        "group_name": "group",
        "arrival": "arrival",
        "min": "price_min",
        "max": "price_max",
        "modal": "price_modal",
        "date_arrival": "date",
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    # Drop #### values (corrupted cells)
    for col in ["price_min", "price_max", "price_modal"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df.dropna(subset=["price_modal", "crop", "market", "state"], inplace=True)
    df["crop"] = df["crop"].str.strip().str.lower()
    df["market"] = df["market"].str.strip().str.lower()
    df["state"] = df["state"].str.strip().str.lower()
    df["district"] = df["district"].str.strip().str.lower() if "district" in df.columns else ""

    return df


def train_price_model() -> tuple:
    """Train a GBM price prediction model. Returns (model, encoders, df)."""
    logger.info("Training price prediction model...")
    df = _load_and_clean_data()

    le_crop = LabelEncoder()
    le_market = LabelEncoder()
    le_state = LabelEncoder()

    df["crop_enc"] = le_crop.fit_transform(df["crop"])
    df["market_enc"] = le_market.fit_transform(df["market"])
    df["state_enc"] = le_state.fit_transform(df["state"])

    if "arrival" in df.columns:
        df["arrival"] = pd.to_numeric(df["arrival"], errors="coerce").fillna(0)
        features = ["crop_enc", "market_enc", "state_enc", "arrival"]
    else:
        features = ["crop_enc", "market_enc", "state_enc"]

    X = df[features].values
    y = df["price_modal"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=200, learning_rate=0.1, max_depth=5, random_state=42
    )
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    logger.info(f"Price model trained. MAE: ₹{mae:.2f}")

    encoders = {"crop": le_crop, "market": le_market, "state": le_state}

    # Save
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump(encoders, f)

    return model, encoders, df


def _load_model() -> tuple:
    if MODEL_PATH.exists() and ENCODERS_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(ENCODERS_PATH, "rb") as f:
            encoders = pickle.load(f)
        df = _load_and_clean_data()
        return model, encoders, df
    return train_price_model()


# ─── Public API ─────────────────────────────────────────────────────────────

_model = None
_encoders = None
_df: pd.DataFrame = None


def get_model():
    global _model, _encoders, _df
    if _model is None:
        _model, _encoders, _df = _load_model()
    return _model, _encoders, _df


def get_price_stats(crop: str, location: str) -> dict:
    """
    Query real data for crop + location.
    Returns avg, min, max, best_mandi, all_mandis.
    """
    _, _, df = get_model()

    crop_lower = crop.strip().lower()
    location_lower = location.strip().lower()

    # Filter by crop first
    crop_df = df[df["crop"] == crop_lower]

    if crop_df.empty:
        # Fuzzy match: contain
        crop_df = df[df["crop"].str.contains(crop_lower, na=False)]

    if crop_df.empty:
        return None

    # Filter by location (market or district or state)
    loc_df = crop_df[
        crop_df["market"].str.contains(location_lower, na=False)
        | crop_df["district"].str.contains(location_lower, na=False)
        | crop_df["state"].str.contains(location_lower, na=False)
    ]

    if loc_df.empty:
        # Fall back to all records for the crop
        loc_df = crop_df

    # Aggregate by market
    agg = (
        loc_df.groupby(["market", "state"])["price_modal"]
        .agg(["mean", "min", "max", "count"])
        .reset_index()
    )
    agg.columns = ["market", "state", "avg_price", "min_price", "max_price", "count"]
    agg = agg[agg["count"] >= 1].sort_values("avg_price", ascending=False)

    if agg.empty:
        return None

    all_mandis = [
        {
            "name": row["market"].title(),
            "price": round(row["avg_price"], 2),
            "state": row["state"].title(),
        }
        for _, row in agg.iterrows()
    ]

    best = agg.iloc[0]
    avg_price = round(loc_df["price_modal"].mean(), 2)

    return {
        "average_price": avg_price,
        "min_price": round(loc_df["price_modal"].min(), 2),
        "max_price": round(loc_df["price_modal"].max(), 2),
        "best_mandi": {
            "name": best["market"].title(),
            "price": round(best["avg_price"], 2),
            "state": best["state"].title(),
        },
        "all_mandis": all_mandis[:20],  # top 20
        "record_count": int(len(loc_df)),
    }


def get_heatmap_data(crop: str) -> list:
    """
    Return price data aggregated by market for map rendering.
    """
    _, _, df = get_model()
    crop_lower = crop.strip().lower()

    crop_df = df[df["crop"] == crop_lower]
    if crop_df.empty:
        crop_df = df[df["crop"].str.contains(crop_lower, na=False)]

    if crop_df.empty:
        return []

    agg = (
        crop_df.groupby(["market", "district", "state"])["price_modal"]
        .mean()
        .reset_index()
    )
    agg.columns = ["market", "district", "state", "avg_price"]

    # Approximate coordinates based on state (deterministic)
    STATE_COORDS = {
        "chattisgarh": (21.2787, 81.8661),
        "maharashtra": (19.7515, 75.7139),
        "punjab": (31.1471, 75.3412),
        "gujarat": (22.2587, 71.1924),
        "uttar pradesh": (26.8467, 80.9462),
        "rajasthan": (27.0238, 74.2179),
        "madhya pradesh": (22.9734, 78.6569),
        "karnataka": (15.3173, 75.7139),
        "andhra pradesh": (15.9129, 79.7400),
        "telangana": (18.1124, 79.0193),
        "haryana": (29.0588, 76.0856),
        "bihar": (25.0961, 85.3131),
        "west bengal": (22.9868, 87.8550),
        "odisha": (20.9517, 85.0985),
    }

    result = []
    for _, row in agg.iterrows():
        state_key = row["state"].lower() if row["state"] else ""
        base_lat, base_lng = STATE_COORDS.get(state_key, (20.5937, 78.9629))
        # Add small deterministic offset per market
        import hashlib
        h = int(hashlib.md5(row["market"].encode()).hexdigest(), 16)
        lat = round(base_lat + (h % 100 - 50) / 500, 4)
        lng = round(base_lng + (h % 70 - 35) / 500, 4)

        result.append({
            "location": row["market"].title(),
            "district": row["district"].title() if row["district"] else "",
            "state": row["state"].title() if row["state"] else "",
            "price": round(row["avg_price"], 2),
            "lat": lat,
            "lng": lng,
        })

def get_market_hotspots() -> list:
    """
    Returns a list of geographical points with price intensity for market pulse.
    Robustly handles CSV column names using positional indexing.
    """
    import pandas as pd
    import numpy as np
    import hashlib

    # Load data directly to ensure we have the most recent buffer
    df = pd.read_csv(DATA_PATH)
    if df.empty: return []

    # Map state names to coordinates for projection
    STATE_COORDS = {
        "chattisgarh": (21.2787, 81.8661), "maharashtra": (19.7515, 75.7139),
        "punjab": (31.1471, 75.3412), "gujarat": (22.2587, 71.1924),
        "uttar pradesh": (26.8467, 80.9462), "rajasthan": (27.0238, 74.2179),
        "madhya pradesh": (22.9734, 78.6569), "karnataka": (15.3173, 75.7139),
        "andhra pradesh": (15.9129, 79.7400), "telangana": (18.1124, 79.0193),
        "haryana": (29.0588, 76.0856), "bihar": (25.0961, 85.3131),
        "west bengal": (22.9868, 87.8550), "odisha": (20.9517, 85.0985),
    }

    # Extract top 100 entries for the 'pulse' visual
    # Positional mapping: State=0, Market=2, Commodity=3, Modal_Price=8
    data = []
    # Drop rows with corrupted price data
    df.iloc[:, 8] = pd.to_numeric(df.iloc[:, 8], errors="coerce")
    df = df.dropna(subset=[df.columns[8]])
    
    # Get diverse entries for the 'pulse' visual
    # Group by commodity to ensure diversity, then take top n
    unique_crops = df.drop_duplicates(subset=[df.columns[3]]).tail(40)
    
    for _, row in unique_crops.iterrows():
        state = str(row.iloc[0]).strip().lower()
        market = str(row.iloc[2]).strip()
        commodity = str(row.iloc[3]).strip()
        price = float(row.iloc[8])

        base_lat, base_lng = STATE_COORDS.get(state, (20.5937, 78.9629))
        h = int(hashlib.md5((market+commodity).encode()).hexdigest(), 16)
        # Small offset
        lat = base_lat + (h % 100 - 50) / 100
        lng = base_lng + (h % 100 - 50) / 100

        data.append({
            "id": h % 100000,
            "name": f"{market} ({commodity})",
            "price": price,
            "lat": lat,
            "lng": lng,
            "intensity": min(1.0, max(0.1, price / 4000))
        })

    return data


def get_summary_by_location(crop: str = "wheat", state: str = None) -> str:
    """Returns a simple text summary for the voice assistant."""
    df = _load_and_clean_data()
    if df is None: return "Price data unavailable."
    
    # Simple search
    commodity_col = df.columns[3]
    state_col = df.columns[0]
    price_col = df.columns[8]
    
    # Filter by crop (case insensitive)
    mask = df[commodity_col].str.contains(crop, case=False, na=False)
    if state:
        mask &= df[state_col].str.contains(state, case=False, na=False)
        
    match = df[mask].tail(3)
    if match.empty:
        return f"I couldn't find recent prices for {crop}."
        
    summaries = []
    return f"The latest prices for {crop} are: " + ". ".join(summaries)


def get_dynamic_market_narrative(crop: str = "wheat", location: str = "Lucknow") -> str:
    """Generates a contextual narrative instead of a static string with fuzzy matching."""
    
    # Deep Phonetic Mapping for Indian languages and accents
    fuzzy_map = {
        "wheat": ["wheat", "gehun", "geun", "gehu", "गेहूं", "गहू", "गेहू"],
        "rice": ["rice", "paddy", "chawal", "dhan", "tandul", "jawal", "chaul", "चावल", "धान", "तांदूळ", "जावल", "चावल"],
        "cotton": ["cotton", "kapas", "rui", "kapus", "kaapus", "कपास", "कापूस", "रुई"],
        "soyabean": ["soyabean", "soya", "soybin", "सोयाबीन", "सोया", "सोयाबिन"],
        "maize": ["maize", "corn", "makka", "makai", "maka", "मक्का", "मका"],
        "bajra": ["bajra", "pearl millet", "millet", "bajara", "बाजरा", "बाजरी"],
        "jowar": ["jowar", "sorghum", "jowari", "jawar", "ज्वार", "ज्वारी"],
        "onion": ["onion", "kanda", "pyaz", "कांदा", "प्याज"],
        "potato": ["potato", "batata", "aaloo", "बटाटा", "आलू"],
        "tur": ["tur", "arhar", "तूर"],
        "moong": ["moong", "मूंग"]
    }
    
    # Resolve the standard crop name
    std_crop = crop.lower()
    for std, variants in fuzzy_map.items():
        if any(v in std_crop for v in variants):
            std_crop = std
            break

    df = _load_and_clean_data()
    if df is None: return "Market data is currently being updated. Please try in a moment."

    commodity_col = "crop" # Using normalized col names from _load_and_clean_data
    price_col = "price_modal"
    
    # Filter for the resolved standard crop name
    crop_df = df[df[commodity_col].str.contains(std_crop, case=False, na=False)]
    
    # Second-chance: direct match if contains fails
    if crop_df.empty:
        crop_df = df[df[commodity_col] == crop.lower().strip()]

    if crop_df.empty:
        return f"I see you're asking about '{crop}'. While I don't see exact prices for this specific crop today, the overall market is active. Try asking for 'Wheat', 'Rice', or 'Cotton' for real-time rates."

    avg_price = crop_df[price_col].mean()
    max_row = crop_df.sort_values(by=price_col, ascending=False).iloc[0]
    
    best_mandi = max_row["market"]
    best_price = max_row["price_modal"]
    
    narrative = (
        f"For {std_crop}, the average market rate is around {int(avg_price)} rupees per quintal. "
        f"The best price found today is at {best_mandi.title()} Mandi, where it's selling for {int(best_price)}. "
        f"We've tracked {len(crop_df)} recent records for this crop across the region."
    )
    return narrative

def get_general_market_pulse() -> str:
    """Returns a high-level summary of all market trends for the AI Brain."""
    _, _, df = get_model()
    if df is None: return "Market trends are currently stabilizing. No significant fluctuations detected."
    
    price_col = df.columns[8]
    commodity_col = df.columns[3]
    
    avg_all = df[price_col].mean()
    top_crops = df.groupby(commodity_col)[price_col].mean().sort_values(ascending=False).head(3)
    
    crops_str = ", ".join([f"{c} (₹{int(p)})" for c, p in top_crops.items()])
    return f"The overall market is active with an average price of ₹{int(avg_all)}. Leading commodities are {crops_str}."
