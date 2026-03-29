"""Tests for /help-request, /ngo, and /admin endpoints."""
import pytest


class TestHelpRequests:
    def test_create_help_request(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/help-request",
            json={
                "user_id": farmer_user_id,
                "type": "fraud",
                "description": "Dealer ne mujhe fake pesticide diya aur paisa nahi lautaya.",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["status"] == "open"
        assert d["request_type"] == "fraud"

    def test_create_help_request_invalid_type(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/help-request",
            json={
                "user_id": farmer_user_id,
                "type": "unknown_type",
                "description": "Some description here.",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 422

    def test_create_help_request_short_description(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/help-request",
            json={"user_id": farmer_user_id, "type": "legal", "description": "short"},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 422

    def test_farmer_cannot_create_for_other(self, client, farmer_token):
        resp = client.post(
            "/help-request",
            json={
                "user_id": "other-user",
                "type": "fraud",
                "description": "Trying to file on behalf of someone else.",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_get_own_help_requests(self, client, farmer_token, farmer_user_id):
        resp = client.get(
            f"/help-request/{farmer_user_id}",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json()["data"], list)

    def test_no_auth_help_request(self, client, farmer_user_id):
        resp = client.post(
            "/help-request",
            json={"user_id": farmer_user_id, "type": "fraud", "description": "Test description long enough."},
        )
        assert resp.status_code in (401, 403)


class TestNGOModule:
    def test_ngo_get_farmers(self, client, ngo_token):
        resp = client.get(
            "/ngo/farmers?filter_status=needs_manual_review",
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json()["data"], list)

    def test_ngo_verify_farmer_approve(self, client, ngo_token, farmer_user_id):
        resp = client.post(
            "/ngo/verify",
            json={
                "farmer_id": farmer_user_id,
                "action": "approve",
                "notes": "Documents verified successfully",
            },
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["new_status"] == "verified"

    def test_ngo_verify_missing_farmer(self, client, ngo_token):
        resp = client.post(
            "/ngo/verify",
            json={"farmer_id": "fake-id", "action": "approve"},
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 404

    def test_ngo_get_help_requests(self, client, ngo_token):
        resp = client.get(
            "/ngo/help-requests",
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.json()["data"], list)

    def test_ngo_update_help_request(self, client, farmer_token, farmer_user_id, ngo_token):
        # Create a help request first
        create_resp = client.post(
            "/help-request",
            json={
                "user_id": farmer_user_id,
                "type": "agriculture",
                "description": "Need help with crop disease identification.",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        request_id = create_resp.json()["data"]["id"]

        # Update it
        resp = client.post(
            "/ngo/help-update",
            json={"request_id": request_id, "status": "in_progress", "notes": "Looking into it"},
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["status"] == "in_progress"

    def test_farmer_cannot_access_ngo_routes(self, client, farmer_token):
        resp = client.get("/ngo/farmers", headers={"Authorization": f"Bearer {farmer_token}"})
        assert resp.status_code in (401, 403)


class TestAdminModule:
    def test_admin_get_all_users(self, client, admin_token):
        resp = client.get(
            "/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        users = resp.json()["data"]
        assert isinstance(users, list)
        assert len(users) > 0

    def test_admin_filter_users_by_role(self, client, admin_token):
        resp = client.get(
            "/admin/users?role=farmer",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        for u in resp.json()["data"]:
            assert u["role"] == "farmer"

    def test_admin_verify_ngo(self, client, admin_token, ngo_user_id):
        resp = client.post(
            "/admin/verify-ngo",
            json={"user_id": ngo_user_id, "approve": True},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["new_status"] == "verified"

    def test_admin_verify_ngo_wrong_role(self, client, admin_token, farmer_user_id):
        resp = client.post(
            "/admin/verify-ngo",
            json={"user_id": farmer_user_id, "approve": True},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 400

    def test_admin_override_verification(self, client, admin_token, farmer_user_id):
        resp = client.post(
            "/admin/override-verification",
            json={
                "user_id": farmer_user_id,
                "status": "verified",
                "reason": "Manual admin review completed",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["new_status"] == "verified"

    def test_admin_override_invalid_status(self, client, admin_token, farmer_user_id):
        resp = client.post(
            "/admin/override-verification",
            json={
                "user_id": farmer_user_id,
                "status": "super_verified",
                "reason": "Testing invalid status",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 400

    def test_farmer_cannot_access_admin(self, client, farmer_token):
        resp = client.get("/admin/users", headers={"Authorization": f"Bearer {farmer_token}"})
        assert resp.status_code in (401, 403)
