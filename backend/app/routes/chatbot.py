import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.base import success, error
from app.core.dependencies import get_current_user
from app.repositories.request_repo import UnifiedRequestRepository
from app.models.models import RequestType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# Simple intent mapper
INTENTS = {
    "loan": RequestType.loan,
    "pesticide": RequestType.pesticide_check,
    "check": RequestType.pesticide_check,
    "help": RequestType.help_ngo,
    "support": RequestType.help_ngo,
    "ngo": RequestType.help_ngo,
    "sell": RequestType.crop_listing,
    "listing": RequestType.crop_listing,
    "crop": RequestType.crop_listing,
    "fraud": RequestType.fraud_report,
    "fake": RequestType.fraud_report,
    "legal": RequestType.legal_aid,
    "lawyer": RequestType.legal_aid,
}

@router.post("/query")
def process_chatbot_query(
    query: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Process a natural language query from the farmer.
    Supports Hindi (lang='hi') and English (lang='en').
    """
    text = query.get("text", "").lower()
    lang = query.get("lang", "en")
    
    # Intent Detection (Basic Keyword matching for now)
    detected_intent = None
    for keyword, intent in INTENTS.items():
        if keyword in text:
            detected_intent = intent
            break

    if not detected_intent:
        if lang == "hi":
            reply = "नमस्ते! मैं आपका अन्नदाता सहायक हूँ। मैं ऋण, कीटनाशक, फसल बेचने या कानूनी मदद के बारे में जानकारी दे सकता हूँ।"
        else:
            reply = "I'm your Annadata Assistant. I can help with loans, pesticides, selling crops, or legal help."
            
        return success(reply, {
            "intent": None,
            "reply": reply,
            "action_required": False
        })

    # Logic for translated replies
    if not detected_intent:
         return success("I identify as a farmer assistant.", {"intent": None})

    intent_val = detected_intent.value.replace('_', ' ')
    if lang == "hi":
        intent_map_hi = {
            "loan": "ऋण",
            "pesticide_check": "कीटनाशक जाँच",
            "crop_listing": "फसल बिक्री",
            "fraud_report": "धोखाधड़ी रिपोर्ट",
            "legal_aid": "कानूनी सहायता",
            "help_ngo": "सहायता"
        }
        hi_name = intent_map_hi.get(detected_intent.value, intent_val)
        reply = f"मैं समझता हूँ कि आपको {hi_name} में मदद चाहिए। क्या मुझे आपके लिए एक नया अनुरोध शुरू करना चाहिए?"
    else:
        reply = f"I understand you need help with {intent_val}. Should I start a new request for you?"
    
    return success(reply, {
        "intent": detected_intent,
        "reply": reply,
        "action_required": True,
        "target_flow": detected_intent
    })

@router.post("/confirm")
def confirm_request(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Confirm and create the request after chatbot suggestion."""
    intent = data.get("intent")
    lang = data.get("lang", "en")
    payload = data.get("payload", {})
    
    if not intent:
        raise HTTPException(status_code=400, detail="Intent required")
        
    repo = UnifiedRequestRepository(db)
    req = repo.create(
        user_id=current_user.id,
        request_type=intent,
        payload=payload
    )
    
    if lang == "hi":
        msg = f"आपका {intent.replace('_', ' ')} अनुरोध सफलतापूर्वक बना लिया गया है। एनजीओ जल्द ही इसकी समीक्षा करेगा।"
    else:
        msg = f"Your {intent.replace('_', ' ')} request has been created. An NGO will review it shortly."
        
    return success(msg, {
        "request_id": req.id,
        "status": req.status,
        "message": msg
      })
