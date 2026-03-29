"""Tests for /documents and /trust-score endpoints."""
import io
import pytest


SAMPLE_PDF_BYTES = b"%PDF-1.0 mock content for testing"


class TestDocumentUpload:
    def test_upload_aadhaar(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "aadhaar", "user_id": farmer_user_id},
            files={"file": ("aadhaar.pdf", io.BytesIO(SAMPLE_PDF_BYTES), "application/pdf")},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["doc_type"] == "aadhaar"
        assert "ai_confidence" in d
        assert d["status"] in ("auto_verified", "pending_ai_review", "needs_manual_review")
        assert d["ai_confidence"] >= 0.0

    def test_upload_land_document(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "land", "user_id": farmer_user_id},
            files={"file": ("land.jpg", io.BytesIO(b"fake image content"), "image/jpeg")},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["doc_type"] == "land"

    def test_upload_invalid_doc_type(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "passport", "user_id": farmer_user_id},
            files={"file": ("file.pdf", io.BytesIO(b"content"), "application/pdf")},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 400

    def test_upload_wrong_extension(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "aadhaar", "user_id": farmer_user_id},
            files={"file": ("file.exe", io.BytesIO(b"content"), "application/octet-stream")},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 400

    def test_upload_no_auth(self, client, farmer_user_id):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "aadhaar", "user_id": farmer_user_id},
            files={"file": ("file.pdf", io.BytesIO(SAMPLE_PDF_BYTES), "application/pdf")},
        )
        assert resp.status_code in (401, 403)

    def test_farmer_cannot_upload_for_other(self, client, farmer_token):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "aadhaar", "user_id": "some-other-user"},
            files={"file": ("file.pdf", io.BytesIO(SAMPLE_PDF_BYTES), "application/pdf")},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_upload_nonexistent_user(self, client, ngo_token):
        resp = client.post(
            "/documents/upload",
            data={"doc_type": "aadhaar", "user_id": "does-not-exist"},
            files={"file": ("file.pdf", io.BytesIO(SAMPLE_PDF_BYTES), "application/pdf")},
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 404


class TestGetDocuments:
    def test_get_own_documents(self, client, farmer_token, farmer_user_id):
        resp = client.get(
            f"/documents/{farmer_user_id}",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json()["data"], list)

    def test_get_documents_no_auth(self, client, farmer_user_id):
        resp = client.get(f"/documents/{farmer_user_id}")
        assert resp.status_code in (401, 403)

    def test_farmer_cannot_see_other_docs(self, client, farmer_token):
        resp = client.get(
            "/documents/another-user-id",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)


class TestTrustScore:
    def test_get_trust_score_success(self, client, farmer_token, farmer_user_id):
        resp = client.get(
            f"/trust-score/{farmer_user_id}",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert 0 <= d["score"] <= 100
        assert d["level"] in ("low", "medium", "high")
        assert "factors" in d
        assert "phone_verified" in d["factors"]

    def test_trust_score_user_not_found(self, client, ngo_token):
        resp = client.get(
            "/trust-score/nonexistent",
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 404

    def test_trust_score_farmer_denied_for_other(self, client, farmer_token):
        resp = client.get(
            "/trust-score/other-user",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)
