"""
ANNADATA AI Service – Deterministic mock AI logic.
All functions use rule-based / hash-based scoring, never random.
"""
import hashlib
import json
from typing import Optional


def _stable_score(seed: str, low: int, high: int) -> float:
    """Produce a deterministic float score based on a string seed."""
    digest = int(hashlib.md5(seed.encode()).hexdigest(), 16)
    return low + (digest % (high - low + 1))


# ─── Document Verification ───────────────────────────────────────────────────

def verify_document(
    user_id: str,
    doc_type: str,
    file_path: str,
) -> dict:
    """
    Simulate OCR + document verification.
    Returns confidence, extracted_fields, status, notes.
    """
    seed = f"{user_id}{doc_type}{file_path}"
    confidence = round(_stable_score(seed, 55, 99) / 100, 2)

    extracted_fields: dict = {}
    notes = ""

    if doc_type == "aadhaar":
        extracted_fields = {
            "aadhaar_number": f"XXXX-XXXX-{_stable_score(seed+'aadhaar', 1000, 9999):.0f}",
            "name": "Extracted Name",
            "dob": "01/01/1985",
            "gender": "Male" if int(_stable_score(seed, 0, 1)) == 0 else "Female",
            "address": "Village Extracted, District, State",
        }
        notes = "Aadhaar card detected. Name and number extracted successfully."
    elif doc_type == "land":
        extracted_fields = {
            "survey_number": f"SRV/{_stable_score(seed+'land', 100, 9999):.0f}",
            "area_acres": round(_stable_score(seed + "area", 1, 20), 2),
            "owner_name": "Extracted Owner",
            "district": "Extracted District",
        }
        notes = "Land record document extracted with survey number and area details."
    elif doc_type == "bill":
        extracted_fields = {
            "bill_number": f"BILL/{_stable_score(seed+'bill', 1000, 99999):.0f}",
            "amount": float(_stable_score(seed + "amount", 500, 50000)),
            "date": "15/03/2024",
            "vendor": "Agro Inputs Pvt Ltd",
        }
        notes = "Agricultural bill/invoice extracted with amount and vendor details."

    # Assign verification status based on confidence
    if confidence >= 0.85:
        status = "auto_verified"
    elif confidence >= 0.65:
        status = "pending_ai_review"
    else:
        status = "needs_manual_review"

    return {
        "confidence": confidence,
        "extracted_fields": json.dumps(extracted_fields),
        "status": status,
        "notes": notes,
    }


# ─── Fraud Detection ─────────────────────────────────────────────────────────

KNOWN_FRAUD_BATCH_PATTERNS = ["FRAUD", "FAKE", "TEST", "000", "XXX"]
KNOWN_FRAUD_BRANDS = ["FakePest", "CheatChem", "DupliPest"]


def detect_fraud_input(
    image: str,
    batch_number: Optional[str] = None,
    brand: Optional[str] = None,
    expiry_date: Optional[str] = None,
) -> dict:
    """
    Simulate OCR + fraud detection on pesticide/input images.
    Returns status, confidence, issues, extracted fields.
    """
    issues = []
    seed = f"{image}{batch_number}{brand}{expiry_date}"
    base_confidence = round(_stable_score(seed, 60, 95) / 100, 2)

    # Check for known fraud patterns
    if batch_number:
        for pattern in KNOWN_FRAUD_BATCH_PATTERNS:
            if pattern.lower() in batch_number.lower():
                issues.append(f"Batch number matches known fraud pattern: '{pattern}'")
                base_confidence = min(base_confidence, 0.30)

    if brand:
        for fb in KNOWN_FRAUD_BRANDS:
            if fb.lower() in brand.lower():
                issues.append(f"Brand '{brand}' flagged in fraud database")
                base_confidence = min(base_confidence, 0.25)

    # OCR extraction simulation
    extracted = {
        "brand": brand or "Auto-Detected Brand",
        "batch_number": batch_number or f"BATCH{_stable_score(seed, 1000, 9999):.0f}",
        "expiry_date": expiry_date or "12/2025",
        "registration_number": f"CIB/{_stable_score(seed+'reg', 10000, 99999):.0f}",
        "manufacturer": "AgriChem Industries",
    }

    # Deterministic duplicate batch detection (hash-based)
    batch_hash = int(hashlib.md5((batch_number or "").encode()).hexdigest(), 16) % 10
    if batch_hash < 2:
        issues.append("Batch number has been reported multiple times in the system")

    # Expiry check simulation
    if expiry_date and len(expiry_date) > 0:
        parts = expiry_date.split("/")
        if len(parts) == 2:
            try:
                month, year = int(parts[0]), int(parts[1])
                if year < 2024 or (year == 2024 and month < 3):
                    issues.append("Product appears to be expired")
            except ValueError:
                issues.append("Expiry date format is invalid")

    # Determine final status
    if len(issues) >= 2 or base_confidence < 0.40:
        status = "fake"
        confidence = round(min(base_confidence, 0.35), 2)
        message = "Yeh product fake ho sakta hai. Multiple fraud indicators detected."
    elif len(issues) == 1 or base_confidence < 0.65:
        status = "suspicious"
        confidence = round(min(base_confidence, 0.70), 2)
        message = "Product ke baare mein kuch issues hain. Carefully verify karo."
    else:
        status = "genuine"
        confidence = base_confidence
        message = "Product genuine lagta hai. Sab details match karti hain."

    return {
        "status": status,
        "confidence": confidence,
        "issues": issues,
        "message": message,
        "extracted": extracted,
    }


# ─── Trust Score ─────────────────────────────────────────────────────────────

def calculate_trust_score(
    user_id: str,
    phone_verified: bool,
    has_documents: bool,
    document_count: int,
    avg_ai_confidence: float,
    ngo_verified: bool,
    profile_complete: bool,
) -> dict:
    """
    Deterministic trust score engine based on multiple factors.
    Score: 0–100
    """
    score = 0

    # Phone verification (20 points)
    if phone_verified:
        score += 20

    # Profile completeness (10 points)
    if profile_complete:
        score += 10

    # Document presence (20 points)
    if has_documents:
        score += 10
        score += min(10, document_count * 3)  # up to 3 docs max

    # AI confidence score (25 points)
    if avg_ai_confidence >= 0.85:
        score += 25
        ai_confidence_label = "high"
    elif avg_ai_confidence >= 0.65:
        score += 15
        ai_confidence_label = "medium"
    elif avg_ai_confidence > 0:
        score += 5
        ai_confidence_label = "low"
    else:
        ai_confidence_label = "none"

    # NGO verification (25 points)
    if ngo_verified:
        score += 25

    score = min(100, max(0, score))

    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"

    return {
        "score": score,
        "level": level,
        "factors": {
            "phone_verified": phone_verified,
            "document_uploaded": has_documents,
            "ai_confidence": ai_confidence_label,
            "ngo_verified": ngo_verified,
            "profile_complete": profile_complete,
        },
    }
