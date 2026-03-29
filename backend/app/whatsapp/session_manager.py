import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class WhatsAppSession:
    def __init__(self):
        self.state = "LANG_SELECT"
        self.last_intent = None
        self.context = {} # e.g., {"crop": "wheat"}
        self.last_updated = time.time()
        self.detected_lang = None # Will be set in LANG_SELECT state

class SessionManager:
    """
    In-memory session manager for WhatsApp chatbot.
    Note: For production, this should be Redis or a Database.
    """
    def __init__(self, expiry_seconds: int = 1800): # 30 min expiry
        self.sessions: Dict[str, WhatsAppSession] = {}
        self.expiry_seconds = expiry_seconds

    def get_session(self, phone_number: str) -> WhatsAppSession:
        """Retrieves or creates a session for the given phone number."""
        now = time.time()
        
        # Cleanup expired sessions occasionally or check on get
        if phone_number in self.sessions:
            session = self.sessions[phone_number]
            if now - session.last_updated > self.expiry_seconds:
                logger.info(f"Session expired for {phone_number}. Resetting to MENU.")
                self.sessions[phone_number] = WhatsAppSession()
            else:
                session.last_updated = now
        else:
            logger.info(f"New WhatsApp session started for {phone_number}.")
            self.sessions[phone_number] = WhatsAppSession()
            
        return self.sessions[phone_number]

    def clear_session(self, phone_number: str):
        if phone_number in self.sessions:
            del self.sessions[phone_number]

# Global Instance
_session_instance = SessionManager()

def get_session_manager():
    return _session_instance
