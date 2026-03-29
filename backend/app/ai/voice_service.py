import logging
import whisper
import ssl
import os
import torch
import subprocess
from typing import Optional
from app.ml.price_model import get_dynamic_market_narrative

logger = logging.getLogger(__name__)

# Bypass SSL for model download (common issue on some networks)
ssl._create_default_https_context = ssl._create_unverified_context

from app.ml.price_model import get_dynamic_market_narrative
from app.ai.brain_service import get_brain_service

logger = logging.getLogger(__name__)

class VoiceService:
    def __init__(self, model_size: str = "base"):
        logger.info(f"🚀 Initializing local Whisper model '{model_size}'...")
        try:
            # Force CPU for absolute stability on Mac (prevents MPS hallucinations)
            device = "cpu"
            logger.info(f"🖥️  Using device: {device}")
            
            # This might take a moment the first time it downloads
            self.model = whisper.load_model(model_size, device=device)
            logger.info(f"✅ Whisper model '{model_size}' loaded successfully on {device}.")
        except Exception as e:
            logger.error(f"❌ Failed to load Whisper model: {str(e)}")
            raise e

    def normalize_audio(self, input_path: str) -> str:
        """
        Converts any audio file to Whisper-optimized 16kHz Mono WAV.
        """
        output_path = input_path.replace(".webm", ".wav").replace("audio_", "norm_")
        try:
            # Use ffmpeg to normalize: 16kHz, 1 channel, 16bit PCM
            cmd = [
                "ffmpeg", "-y", "-i", input_path,
                "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return output_path
        except Exception as e:
            logger.error(f"FFmpeg normalization failed: {str(e)}")
            return input_path # Fallback to original

    def transcribe_audio(self, file_path: str) -> dict:
        """
        Standardizes and transcribes the given audio file using local Whisper.
        Returns: { "text": str, "language": str }
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found at {file_path}")

        # 1. Normalize Audio first for better accuracy
        norm_path = self.normalize_audio(file_path)
        
        # Multilingual Prompt: Bias toward Agri-context in all 3 languages
        initial_prompt = (
            "Kisan, Mandi, Bhav, Gehun, Rice, Cotton, Bajra, Jowar, Loan, Karz, Bank, "
            "Fraud, Fake, Nakli, Mausam, Chawal, Kapas, Pashu, Kheti, Yojana, "
            "हवामान, बाजार, कर्ज, फसवणूक, सरकारी योजना, पीक, अन्नदाता."
        )
        result = self.model.transcribe(
            norm_path, 
            initial_prompt=initial_prompt,
            fp16=False # Force CPU friendly
        )
        
        # Cleanup normalized file
        if norm_path != file_path and os.path.exists(norm_path):
            os.remove(norm_path)

        return {
            "text": result.get("text", "").strip(),
            "language": result.get("language", "en")
        }

    def detect_intent(self, text: str) -> str:
        text_lower = text.lower()
        for intent, lang_keywords in INTENT_KEYWORDS.items():
            for lang, keywords in lang_keywords.items():
                if any(k in text_lower for k in keywords):
                    return intent
        return "general"

    def extract_crop(self, text: str) -> str:
        text_lower = text.lower()
        for crop, variants in CROP_MAPPING.items():
            if any(v in text_lower for v in variants):
                return crop
        return "wheat" # Default fallback for price check

    def get_localized_narrative(self, crop: str, avg_price: float, best_mandi: str, best_price: float, location: str, lang: str) -> str:
        if lang == "hi":
            return (
                f"{crop} के लिए, औसत बाजार दर लगभग {int(avg_price)} रुपये प्रति क्विंटल है। "
                f"मुझे सबसे अच्छी कीमत {best_mandi} मंडी में मिली है, जहाँ यह {int(best_price)} में बिक रहा है। "
                f"यदि आप {location} के पास हैं, तो मैं बेचने से पहले स्थानीय गुणवत्ता की जांच करने की सलाह देता हूँ।"
            )
        elif lang == "mr":
            return (
                f"{crop} साठी, सरासरी बाजार भाव सुमारे {int(avg_price)} रुपये प्रति क्विंटल आहे. "
                f"मला सर्वात चांगली किंमत {best_mandi} मंडीमध्ये मिळाली आहे, जिथे ते {int(best_price)} रुपयांना विकले जात आहे. "
                f"जर तुम्ही {location} जवळ असाल, तर मी विक्रीपूर्वी स्थानिक गुणवत्तेची तपासणी करण्याची शिफारस करतो."
            )
        # Default English
        return (
            f"For {crop}, the average market rate is around {int(avg_price)} rupees per quintal. "
            f"The best price I've found is at {best_mandi} Mandi, where it's selling for {int(best_price)}. "
            f"If you are near {location}, I recommend checking the local quality before selling."
        )

    def get_ai_response(self, text: str, context_data: str = "", location: str = "Lucknow", lang: str = "en") -> dict:
        """
        Main logic to parse text and generate response via BrainService (LLM).
        """
        brain = get_brain_service()
        return brain.process_query(text, context_data, lang)

# Global Instance for injection
_voice_instance = None

def get_voice_service():
    global _voice_instance
    if _voice_instance is None:
        _voice_instance = VoiceService(model_size="base")
    return _voice_instance
