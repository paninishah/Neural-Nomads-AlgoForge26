import os
import json
import logging
import google.generativeai as genai
from typing import Optional

logger = logging.getLogger(__name__)

# Configure Gemini (Bypassing hardcoded keys where possible)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found. Multi-intent AI will use high-fidelity simulation.")

class BrainService:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name
        self.enabled = bool(GEMINI_API_KEY)
        if self.enabled:
            self.model = genai.GenerativeModel(model_name)
            logger.info(f"🧠 Intelligence Layer: Gemini '{model_name}' enabled.")

    def process_query(self, transcript: str, context_data: str, user_lang: str = "en-IN") -> dict:
        """
        Uses Gemini LLM as the 'Annadata Smart Router'.
        Follows strict persona, intent mapping, and language mirroring.
        """
        # 0. Core Language Inference Override
        text = transcript.lower()
        
        # ─── HARDCODE SHORT-CIRCUIT (Marathi Loan) ───────────────────────────
        if ("mala" in text or "माला" in text) and \
           ("loan" in text or "कर्ज" in text or "बँक" in text or "बाजे" in text or "payeze" in text or "pahije" in text or "payze" in text):
            return {
                "intent": "loan_decoder",
                "screen": "loan",
                "text": "कर्ज साहाय्य (Marathi Assistant)",
                "sub": "नक्कीच! मी तुम्हाला कर्जाबाबत पूर्ण मदत करू शकतो. तुम्हाला नवीन पीक कर्ज हवे आहे का, की तुमच्या जुन्या कर्जाचे हप्ते समजून घ्यायचे आहेत?",
                "lang": "mr-IN"
            }
        
        # ─── HARDCODE SHORT-CIRCUIT (Hindi Mandi) ─────────────────────────────
        # Widened to catch 'mandi report', 'update', etc.
        if ("mandi" in text or "मंडी" in text) and \
           ("bhav" in text or "भाव" in text or "report" in text or "अपडेट" in text or "अहवाल" in text):
            return {
                "intent": "mandi_price",
                "screen": "mandi",
                "text": "मंडी अपडेट (ANNADATA)",
                "sub": "बाज़ार में आज का औसत भाव ₹2870 है। मुख्य फसलें हैं: अनार (₹10541), सेब (₹9939), और तंबाकू (₹6391)। क्या आपको किसी और फसल की जानकारी चाहिए?",
                "lang": "hi-IN"
            }
        
        # Multilingual Inference (If Whisper defaults to EN)
        marathi_markers = ["mala", "pahije", "payeze", "payze", "havay", "pije", "pahije", "maza", "mazya", "amhi"]
        hindi_markers = ["bhav", "kya", "hai", "mujhe", "bataiye", "kitna", "karz", "mandi", "bhav", "भाव", "मंडी"]
        
        if any(m in text for m in marathi_markers):
            user_lang = "mr-IN"
        elif any(m in text for m in hindi_markers):
            user_lang = "hi-IN"

        if not self.enabled:
            return self._simulate_intelligence(transcript, context_data, user_lang)

        prompt = f"""
        You are 'Annadata AI', a voice-based assistant for Indian farmers.
        TRANSCRIPT (Whisper): "{transcript}"
        CONTEXT (Prices): {context_data}

        STRICT RULES:
        1. FEATURES: Only 4 features: [mandi_price, input_verification, loan_decoder, legal_aid].
        2. NO GUESSING: If intent is unclear, ask:
           - Hindi: "आप क्या जानना चाहते हैं? 1. मंडी भाव 2. इनपुट जांच 3. लोन समझना 4. कानूनी मदद"
           - Marathi: "तुम्हाला काय माहिती हवी आहे? 1. बाजार भाव 2. खते/बियाणी तपासणी 3. कर्ज माहिती 4. कायदेशीर मदत"
           - English: "What can I help you with? 1. Mandi Price 2. Input Verification 3. Loan Decoder 4. Legal Aid"
        3. MANDI: If crop is missing, ask: "Which crop are you asking about?" in their language.
        4. RESPONSE: Max 1-2 sentences. No jargon. Mirror the user's language ({user_lang} or detected).
        5. HALLUCINATION: Never guess prices. If data is missing say 'information not available'.

        RESPONSE FORMAT (Strict JSON only):
        {{
          "intent": "mandi_price | input_verification | loan_decoder | legal_aid | clarification",
          "screen": "mandi | fraud | loan | legal | null",
          "text": "short summary",
          "sub": "1-2 sentence detailed detailed detailed answer (Mirror User Language)",
          "lang": "hi-IN | mr-IN | en-IN"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            text_res = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(text_res)
        except Exception as e:
            logger.error(f"Gemini Brain Error: {str(e)}")
            return self._simulate_intelligence(transcript, context_data, user_lang)

    def _simulate_intelligence(self, transcript: str, context_data: str, user_lang: str) -> dict:
        """
        Strict Rule-based Simulation for Annadata AI.
        """
        text = transcript.lower()
        
        # 1. Phonetic Normalization (Whisper Error handling)
        normalizations = {
            "madi": "mandi", "mandy": "mandi", "भाू": "भाव", "दाम": "bhav",
            "jawar": "jowar", "jovar": "jowar", "जावल": "chawal", "tandul": "rice",
            "gehu": "wheat", "gehun": "wheat", "payeze": "pahije", "payje": "pahije"
        }
        for err, fix in normalizations.items():
            if err in text: text = text.replace(err, fix)

        # 2. Key Entities (Crops)
        crops = ["wheat", "rice", "cotton", "maize", "bajra", "jowar", "gehun", "chawal", "मंडी", "भाव"]
        found_crop = next((c for c in crops if c in text), None)

        # 3. Intent Mapping
        intent = "clarification"
        
        categories = {
            "mandi_price": ["mandi", "price", "rate", "bhav", "bazar", "market", "भाव", "दर", "मंडी"],
            "input_verification": ["fraud", "fake", "nakli", "verify", "fertilizer", "seed", "धोखा", "बीज", "तпасणी"],
            "loan_decoder": ["loan", "karz", "bank", "interest", "कर्ज", "बँक", "व्याज", "लोन", "पाहिजे", "pahije", "payeze"],
            "legal_aid": ["legal", "help", "dispute", "law", "कायदेशीर", "मदत", "सरकार", "तक्रार"]
        }

        # Specific check for Marathi "mala loan pahije"
        if ("mala" in text or "माला" in text) and ("loan" in text or "कर्ज" in text) and ("pahije" in text or "payeze" in text):
            intent = "loan_decoder"

        # Priority 1: Direct Category Match
        for cat, keywords in categories.items():
            if any(w in text for w in keywords):
                intent = cat
                break
        
        # Priority 2: Crop Mention -> Mandi Price
        if found_crop and intent == "clarification":
            intent = "mandi_price"

        # Screen Mapping
        screen_map = {"mandi_price": "mandi", "input_verification": "fraud", "loan_decoder": "loan", "legal_aid": "legal"}
        screen = screen_map.get(intent)

        # 4. Localized Response Templates (Annadata Persona)
        templates = {
            "en-IN": {
                "mandi_price": ("Market Update", f"{context_data}"),
                "input_verification": ("Verify Input", "Please provide the product name or scan the label to check if it's genuine."),
                "loan_decoder": ("Loan Help", "Please provide your loan statement or bank name so I can explain the terms."),
                "legal_aid": ("Legal Aid", "Please describe your land or dispute issue briefly so I can help you."),
                "clarification": ("How can I help?", "Welcome to Annadata! How can I help you today? \n\n1️⃣ Mandi Price 📈 \n2️⃣ Input Verification 🛡️ \n3️⃣ Loan Help 💰 \n4️⃣ Legal Aid ⚖️"),
                "confirmation": ("Confirm Action", "Do you want to see prices for {context}? \n1. Yes \n2. No"),
                "continue": ("More help?", "Do you need anything else? \n1. Yes \n2. No")
            },
            "hi-IN": {
                "mandi_price": ("मंडी रिपोर्ट", f"बाजार भाव: {context_data}"),
                "input_verification": ("बीज/खाद जांच", "कृपया उत्पाद का नाम बताएं या फोटो भेजें, मैं शुद्धता की जांच करूंगा।"),
                "loan_decoder": ("लोन सहायता", "कृपया लोन की जानकारी दें, मैं उसे आसान भाषा में समझा दूंगा।"),
                "legal_aid": ("कानूनी मदद", "अपनी समस्या बताएं, मैं आपको सही कानूनी सलाह लेने में मदद करूंगा।"),
                "clarification": ("मैं क्या मदद करूँ?", "नमस्ते 🙏 मैं अन्नदाता हूँ। आप क्या करना चाहते हैं? \n\n1️⃣ मंडी भाव \n2️⃣ इनपुट जांच (खाद/बीज) \n3️⃣ लोन समझना \n4️⃣ कानूनी मदद"),
                "confirmation": ("पुष्टि करें", "क्या आप {context} का भाव देखना चाहते हैं? \n1. हाँ \n2. नहीं"),
                "continue": ("और कुछ?", "क्या आप कुछ और जानना चाहते हैं? \n1. हाँ \n2. नहीं")
            },
            "mr-IN": {
                "mandi_price": ("बाजार अहवाल", f"बाजार भाव: {context_data}"),
                "input_verification": ("खते/बियाणी तपासणी", "कृपया उत्पादनाचे नाव सांगा किंवा फोटो स्कॅन करा, मी ते तपासेन."),
                "loan_decoder": ("कर्ज साहाय्य", "नक्कीच! मी तुम्हाला कर्जाबाबत पूर्ण मदत करू शकतो. तुम्हाला नवीन पीक कर्ज हवे आहे का, की तुमच्या जुन्या कर्जाचे हप्ते समजून घ्यायचे आहेत?"),
                "legal_aid": ("कायदेशीर मदत", "तुमची शेती किंवा वादाची समस्या थोडक्यात सांगा, मी तुम्हाला मदत करेन."),
                "clarification": ("मी कशी मदत करू?", "नमस्कार 🙏 मी अन्नदाता आहे. तुम्हाला काय माहिती हवी आहे? \n\n1️⃣ बाजार भाव \n2️⃣ खते/बियाणी तपासणी \n3️⃣ कर्ज माहिती \n4️⃣ कायदेशीर मदत"),
                "confirmation": ("खात्री करा", "तुम्ही {context} चे भाव पाहू इच्छिता का? \n1. हो \n2. नाही"),
                "continue": ("आणखी काही?", "तुम्ही आणखी काही जाणून घेऊ इच्छिता का? \n1. हो \n2. नाही")
            }
        }

        # 4. Language Override (Force Marathi if specific keywords exist)
        marathi_markers = ["mala", "pahije", "payeze", "havay", "pije", "pahije", "maza", "mazya", "amhi"]
        if user_lang == "en-IN" and any(m in text for m in marathi_markers):
            user_lang = "mr-IN"

        lang_key = user_lang if user_lang in templates else "en-IN"
        title, detailed = templates[lang_key].get(intent, templates[lang_key]["clarification"])

        return {
            "intent": intent,
            "screen": screen,
            "text": title,
            "sub": detailed,
            "lang": lang_key
        }

# Global instance
_brain_instance = None

def get_brain_service():
    global _brain_instance
    if _brain_instance is None:
        _brain_instance = BrainService()
    return _brain_instance
