"""Tests for /profile endpoints."""
import pytest


class TestCreateProfile:
    def test_create_profile_success(self, client, farmer_token, farmer_user_id):
        resp = client.post(
            "/profile",
            json={
                "name": "Ramesh Kumar",
                "village": "Nashik",
                "state": "Maharashtra",
                "crop": "tomato",
                "land_acres": 3.5,
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["name"] == "Ramesh Kumar"
        assert d["crop"] == "tomato"

    def test_update_existing_profile(self, client, farmer_token):
        resp = client.post(
            "/profile",
            json={"name": "Ramesh Updated", "crop": "wheat"},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["name"] == "Ramesh Updated"

    def test_create_profile_no_auth(self, client):
        resp = client.post("/profile", json={"name": "Test"})
        assert resp.status_code in (401, 403)

    def test_create_profile_short_name(self, client, farmer_token):
        resp = client.post(
            "/profile",
            json={"name": "A"},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 422

    def test_create_profile_negative_land(self, client, farmer_token):
        resp = client.post(
            "/profile",
            json={"name": "Valid Name", "land_acres": -1.0},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 422


class TestGetProfile:
    def test_get_own_profile(self, client, farmer_token, farmer_user_id):
        # Ensure profile exists
        client.post(
            "/profile",
            json={"name": "Ramesh Kumar", "crop": "rice"},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        resp = client.get(
            f"/profile/{farmer_user_id}",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["user_id"] == farmer_user_id

    def test_get_other_farmer_profile_as_farmer_denied(self, client, farmer_token):
        resp = client.get(
            "/profile/fake-user-id-9999",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code in (401, 403)

    def test_get_profile_not_found(self, client, ngo_token):
        resp = client.get(
            "/profile/nonexistent-user-id",
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        assert resp.status_code == 404

    def test_ngo_can_view_any_profile(self, client, ngo_token, farmer_user_id):
        resp = client.get(
            f"/profile/{farmer_user_id}",
            headers={"Authorization": f"Bearer {ngo_token}"},
        )
        # Either found or not found (depends on profile existence), but not 403
        assert resp.status_code in (200, 404)
