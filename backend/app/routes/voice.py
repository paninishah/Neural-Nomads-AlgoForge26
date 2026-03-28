import logging
from fastapi import APIRouter
from app.schemas.schemas import VoiceRequest, success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

INTENT_MAP = {
  "bhaav": "mandi",
  "mandi": "mandi",
  "price": "mandi",
  "asli": "fraud",
  "fraud": "fraud",
  "pesticide": "fraud",
  "duplicate": "fraud",
  "karz": "loan",
  "loan": "loan",
  "bank": "loan",
  "paisaa": "wallet",
  "wallet": "wallet",
  "profit": "wallet",
  "munafa": "wallet",
  "nuksan": "wallet",
  "law": "legal",
  "legal": "legal",
  "court": "legal",
  "police": "legal",
  "complaint": "legal",
  "shikayat": "legal",
}

@router.post("/intent")
def get_voice_intent(payload: VoiceRequest):
    """Detect intent from voice transcript."""
    lower_text = payload.transcript.lower()
    intent = None
    
    for key, value in INTENT_MAP.items():
        if key in lower_text:
            intent = value
            break
            
    res_text = "I see you're asking about something else. How can I help?"
    res_sub = "You can ask about prices, loans, or product safety."
    res_screen = None

    if intent == "mandi":
        res_text = "Yes, wheat prices are up by 15% today!"
        res_sub = "Nashik Mandi is reporting ₹2,450/qtl. It's a great time to sell."
        res_screen = "mandi"
    elif intent == "fraud":
        res_text = "I can help you check that product."
        res_sub = "Please scan the bottle label clearly so I can verify the batch."
        res_screen = "fraud"
    elif intent == "wallet":
        res_text = "Your seasonal profit is looks healthy."
        res_sub = "You've earned ₹1.2L so far. Want to see the detailed breakdown?"
        res_screen = "wallet"

    return success("Intent processed", {
        "intent": intent,
        "text": res_text,
        "sub": res_sub,
        "screen": res_screen
    })
