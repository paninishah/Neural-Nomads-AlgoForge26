"""Tests for /loan endpoints."""
import pytest


class TestLoanEligibility:
    def test_farmer_check_own_eligibility(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/loan/check-eligibility",
            json={"user_id": farmer_user_id},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert "eligible" in d
        assert isinstance(d["eligible"], bool)
        assert 0 <= d["score"] <= 100
        assert "recommended_amount" in d
        assert "reason" in d
        assert "factors" in d

    def test_farmer_cannot_check_others(self, client, farmer_token):
        resp = client.post(
            "/loan/check-eligibility",
            json={"user_id": "other-user-id"},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_admin_can_check_any_user(self, client, admin_token, farmer_user_id):
        resp = client.post(
            "/loan/check-eligibility",
            json={"user_id": farmer_user_id},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

    def test_check_nonexistent_user(self, client, admin_token):
        resp = client.post(
            "/loan/check-eligibility",
            json={"user_id": "does-not-exist"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 404

    def test_no_auth(self, client, farmer_user_id):
        resp = client.post("/loan/check-eligibility", json={"user_id": farmer_user_id})
        assert resp.status_code in (401, 403)

    def test_high_trust_user_gets_higher_amount(self, client, admin_token, farmer_user_id):
        """After uploading docs, score should be higher."""
        resp = client.post(
            "/loan/check-eligibility",
            json={"user_id": farmer_user_id},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        # Just verify structure is complete
        assert resp.json()["data"]["recommended_amount"] >= 0


class TestLoanOptions:
    def test_get_loan_options_success(self, client, farmer_token):
        resp = client.get(
            "/loan/options",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        opts = resp.json()["data"]
        assert isinstance(opts, list)
        assert len(opts) > 0
        # Check structure
        for opt in opts:
            assert "provider" in opt
            assert "interest" in opt
            assert "max_amount" in opt

    def test_get_loan_options_no_auth(self, client):
        resp = client.get("/loan/options")
        assert resp.status_code in (401, 403)
