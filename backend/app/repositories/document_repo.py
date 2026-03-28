from sqlalchemy.orm import Session
from app.models.models import Document
from datetime import datetime


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, doc_type: str, file_path: str, original_filename: str) -> Document:
        doc = Document(
            user_id=user_id,
            doc_type=doc_type,
            file_path=file_path,
            original_filename=original_filename,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def update_ai_result(
        self, doc_id: str, status: str, confidence: float, extracted_fields: str, notes: str
    ) -> Document | None:
        doc = self.db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        doc.status = status
        doc.ai_confidence = confidence
        doc.extracted_fields = extracted_fields
        doc.ai_notes = notes
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_by_user_id(self, user_id: str) -> list[Document]:
        return self.db.query(Document).filter(Document.user_id == user_id).all()

    def get_avg_confidence(self, user_id: str) -> float:
        docs = self.get_by_user_id(user_id)
        if not docs:
            return 0.0
        return sum(d.ai_confidence for d in docs) / len(docs)

    def get_all_by_status(self, status: str) -> list[Document]:
        return self.db.query(Document).filter(Document.status == status).all()
