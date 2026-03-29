import os
import requests
import logging
from typing import Optional
from fastapi import APIRouter, Request, Form, Response
from twilio.twiml.messaging_response import MessagingResponse
import assemblyai as aai

# App Imports
from app.ai.brain_service import get_brain_service
from app.ml.price_model import get_dynamic_market_narrative, get_general_market_pulse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Chatbot"])

# API Keys (Should be in .env)
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY", "")
if ASSEMBLYAI_API_KEY:
    aai.settings.api_key = ASSEMBLYAI_API_KEY

from app.whatsapp.session_manager import get_session_manager

@router.post("/webhook")
async def whatsapp_webhook(
    Body: Optional[str] = Form(None),
    MediaUrl0: Optional[str] = Form(None),
    MediaContentType0: Optional[str] = Form(None),
    From: str = Form(...)
):
    """
    Stateful WhatsApp Annadata Bot.
    Coordinates between MENU, CONFIRMATION, and FEATURE FLOWS.
    """
    twiml = MessagingResponse()
    manager = get_session_manager()
    session = manager.get_session(From)
    
    raw_text = Body or ""
    
    # 1. Handle Voice Transcription
    if MediaUrl0 and "audio" in MediaContentType0:
        if ASSEMBLYAI_API_KEY:
            try:
                transcriber = aai.Transcriber()
                transcript = transcriber.transcribe(MediaUrl0, config=aai.TranscriptionConfig(language_detection=True))
                if transcript.status != aai.TranscriptStatus.error:
                    raw_text = transcript.text
                    session.detected_lang = transcript.json_response.get("language_code", "hi")[:2]
            except Exception as e:
                logger.error(f"STT Error: {e}")

    text = raw_text.strip().lower()
    brain = get_brain_service()

    # 2. State Machine Routing
    response_text = ""
    
    # --- STATE: LANG_SELECT ---
    if session.state == "LANG_SELECT":
        lang_menu = "नमस्ते! अपनी भाषा चुनें: \n\n1. हिंदी \n2. English \n3. मराठी"
        if text.strip() in ["1", "2", "3"]:
            lang_map = {"1": "hi", "2": "en", "3": "mr"}
            session.detected_lang = lang_map[text.strip()]
            session.state = "MENU"
            # Get the menu in the NEW language and send it immediately
            ai_res = brain.process_query("namaste", "", session.detected_lang)
            reply = ai_res["sub"]
            logger.info(f"📤 LANG SELECTED: {reply}")
            twiml.message(reply)
            return Response(content=twiml.to_xml(), media_type="application/xml")
        else:
            logger.info(f"📤 LANG MENU SENT")
            twiml.message(lang_menu)
            return Response(content=twiml.to_xml(), media_type="application/xml")

    # --- STATE: MENU ---
    elif session.state == "MENU":
        # Check for direct menu selects
        menu_options = {
            "1": ("mandi_price", "आप किस फसल का भाव जानना चाहते हैं?", "Which crop are you asking about?", "तुम्हाला कोणत्या पिकाचे भाव पाहायचे आहेत?"),
            "2": ("input_verification", "कृपया उत्पाद का नाम बताएं या फोटो भेजें।", "Please provide product name or photo.", "कृपया उत्पादनाचे नाव सांगा किंवा फोटो स्कॅन करा."),
            "3": ("loan_decoder", "कृपया लोन की जानकारी दें।", "Please provide your loan details.", "कृपया तुमच्या कर्जाची माहिती द्या."),
            "4": ("legal_aid", "अपनी समस्या थोड़ी विस्तार से बताएं।", "Describe your issue briefly.", "तुमची शेती किंवा वादाची समस्या थोडक्यात सांगा.")
        }
        
        if text.strip() in menu_options:
            state, hi, en, mr = menu_options[text.strip()]
            session.state = state
            # Send the initial question and RETURN (Wait for farmer response)
            if session.detected_lang == "hi": response_text = hi
            elif session.detected_lang == "mr": response_text = mr
            else: response_text = en
            
            logger.info(f"📤 MENU CHOICE {text}: {response_text}")
            twiml.message(response_text)
            return Response(content=twiml.to_xml(), media_type="application/xml")
            
        else:
            # Smart Entry Detection
            ai_res = brain.process_query(raw_text, "", session.detected_lang)
            if ai_res["intent"] != "clarification":
                session.state = "CONFIRMATION"
                session.last_intent = ai_res["intent"]
                
                # Extract crop
                for c in ["wheat", "rice", "cotton", "maize", "bajra", "jowar", "gehun", "chawal", "भा"]:
                    if c in text: session.context["crop"] = c; break
                
                conf_msg = brain._simulate_intelligence("confirmation", "", session.detected_lang)
                response_text = conf_msg["sub"].replace("{context}", session.context.get("crop", "this feature"))
            else:
                response_text = ai_res["sub"]

    # --- STATE: CONFIRMATION ---
    elif session.state == "CONFIRMATION":
        if text in ["1", "yes", "हाँ", "हो"]:
            session.state = session.last_intent
            # Proceed to the flow logic in the same request? No, better ask for crop if mandi and crop is missing
        else:
            session.state = "MENU"
            ai_res = brain.process_query("namaste", "", session.detected_lang)
            response_text = ai_res["sub"]

    # --- STATE: FEATURE FLOWS ---
    if session.state in ["mandi_price", "input_verification", "loan_decoder", "legal_aid"]:
        intent = session.state
        
        # Mandi logic needs context
        if intent == "mandi_price":
            # Check context for crop, or look at current message
            crop = session.context.get("crop")
            # Expanded crop sync for Indian regional names
            crop_sync = [
                "wheat", "gehun", "gehu", "geun", "गेहूं", "गहू", 
                "rice", "paddy", "chawal", "dhan", "tandul", "jawal", "चावल", "धान", "तांदूळ",
                "cotton", "kapas", "rui", "kaapus", "कपास", "कापूस",
                "soyabean", "soya", "soybin", "सोयाबीन", "सोया",
                "maize", "makka", "corn", "maka", "मक्का", "मका",
                "bajra", "millet", "bajara", "बाजरा", "बाजरी",
                "jowar", "jawar", "ज्वार", "ज्वारी",
                "onion", "kanda", "pyaz", "कांदा", "प्याज",
                "potato", "batata", "aaloo", "बटाटा", "आलू",
                "tur", "arhar", "moong", "udid", "तूर", "मूंग", "उडीद"
            ]
            for c in crop_sync:
                if c in text: crop = c; break
            
            if not crop:
                response_text = "कृपया फसल का नाम बताएं (जैसे: गेहूँ, चावल, कपास)।" if session.detected_lang == "hi" else "Please name the crop (e.g., Wheat, Cotton)."
                logger.info(f"📤 ASKING FOR CROP")
                twiml.message(response_text)
                return Response(content=twiml.to_xml(), media_type="application/xml")
            
            session.context["crop"] = crop
            market_context = get_dynamic_market_narrative(crop, "Lucknow")
            ai_res = brain._simulate_intelligence(intent, market_context, session.detected_lang)
        else:
            # Generic logic for other flows
            ai_res = brain._simulate_intelligence(intent, "", session.detected_lang)

        response_text = f"*{ai_res['text']}*\n{ai_res['sub']}"
        session.state = "CONTINUE_CHECK"
        cont_res = brain._simulate_intelligence("continue", "", session.detected_lang)
        response_text += f"\n\n{cont_res['sub']}"

    # --- STATE: CONTINUE_CHECK ---
    elif session.state == "CONTINUE_CHECK":
        if text in ["1", "yes", "हाँ", "ho"]:
            session.state = "MENU"
            ai_res = brain.process_query("namaste", "", session.detected_lang)
            response_text = ai_res["sub"]
        else:
            response_text = "धन्यवाद! हम आपकी मदद के लिए हमेशा यहाँ हैं।"
            manager.clear_session(From)

    # 3. Fallback / Response Send
    if not response_text:
        ai_res = brain.process_query("namaste", "", session.detected_lang)
        response_text = ai_res["sub"]
        session.state = "MENU"

    logger.info(f"📤 FINAL REPLY to {From}: {response_text}")
    twiml.message(response_text)
    return Response(content=twiml.to_xml(), media_type="application/xml")
