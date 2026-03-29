import logging
import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form
from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.schemas.base import success
from app.ai.voice_service import get_voice_service
from app.ml.price_model import get_dynamic_market_narrative, get_general_market_pulse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

@router.post("/process")
async def process_voice_audio(
    audio: UploadFile = File(...),
    location: str = Form("Lucknow"),
    lang: str = Form("en"),
    voice_service = Depends(get_voice_service)
):
    """
    V4 - FULL WHISPER INTEGRATION (LOCAL INFERENCE)
    Processes raw audio, transcribes via local Whisper model (base), 
    and handles multilingual intent extraction.
    """
    file_path = f"audio_{audio.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # 1. Transcribe via local Whisper
        logger.info(f"Processing audio: {audio.filename} ({audio.size} bytes)")
        transcription_result = voice_service.transcribe_audio(file_path)
        heard_text = transcription_result["text"]
        detected_lang = transcription_result["language"]
        
        logger.info(f"Whisper Transcript: '{heard_text}' [Lang: {detected_lang}]")

        # 2. Get Real-time Market Context for the Brain
        # Use an expanded list of 3-language keywords for detection
        text_lower = heard_text.lower()
        active_crop = None
        
        # Phonetic scanning list
        scan_list = [
            "wheat", "gehun", "gehun", "गेहूं", "गहू",
            "rice", "chawal", "tandul", "jawal", "chaul", "जावल", "चावल", "तांदूळ",
            "cotton", "kapas", "kapus", "कपास", "कापूस",
            "maize", "makai", "makka", "मका", "मक्का",
            "bajra", "bajarat", "bajarya", "बाजरा", "बाजारी", "बाज्या",
            "jowar", "jawar", "jowari", "जवार", "ज्वारी"
        ]
        
        for crop in scan_list:
            if crop in text_lower:
                active_crop = crop
                break
        
        if active_crop:
            market_context = get_dynamic_market_narrative(active_crop, location)
        else:
            market_context = get_general_market_pulse()
        
        # 3. Extract Intent & Generate AI Brain Response
        ai_payload = voice_service.get_ai_response(heard_text, context_data=market_context, location=location, lang=detected_lang)

        return success("Voice Brain Processed", {
            "intent": ai_payload["intent"],
            "text": ai_payload["text"],
            "sub": ai_payload["sub"],
            "screen": ai_payload["screen"],
            "heard": f"'{heard_text}' (Detected via local Whisper)",
            "lang": ai_payload["lang"] # Use the BRAIN'S corrected language
        })

    except Exception as e:
        logger.error(f"Voice Processing Error: {str(e)}")
        # Graceful fallback for demo
        return success("Voice Brain (Simulator Fallback)", {
            "intent": "general",
            "text": "I heard you, but my brain is still initializing. Try again in a moment.",
            "sub": "Whisper local model is loading or encountered an error.",
            "heard": "Processing Audio...",
            "lang": lang
        })
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
