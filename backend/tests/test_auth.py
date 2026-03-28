"""Tests for /auth endpoints."""
import pytest


class TestLogin:
    def test_login_new_farmer(self, client):
        resp = client.post("/auth/login", json={"phone": "9111111111", "role": "farmer"})
        assert resp.status_code == 200
        d = resp.json()
        assert d["status"] == "success"
        assert d["data"]["role"] == "farmer"
        assert "token" in d["data"]
        assert d["data"]["is_new_user"] is True

    def test_login_existing_user(self, client):
        phone = "9111111111"
        resp1 = client.post("/auth/login", json={"phone": phone, "role": "farmer"})
        resp2 = client.post("/auth/login", json={"phone": phone, "role": "farmer"})
        assert resp2.json()["data"]["is_new_user"] is False

    def test_login_ngo_role(self, client):
        resp = client.post("/auth/login", json={"phone": "9222222222", "role": "ngo"})
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "ngo"

    def test_login_admin_role(self, client):
        resp = client.post("/auth/login", json={"phone": "9333333333", "role": "admin"})
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "admin"

    def test_login_invalid_phone_short(self, client):
        resp = client.post("/auth/login", json={"phone": "123", "role": "farmer"})
        assert resp.status_code == 422

    def test_login_invalid_role(self, client):
        resp = client.post("/auth/login", json={"phone": "9000000001", "role": "superuser"})
        assert resp.status_code == 422

    def test_login_default_role_is_farmer(self, client):
        resp = client.post("/auth/login", json={"phone": "9444444444"})
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "farmer"

    def test_login_returns_user_id(self, client):
        resp = client.post("/auth/login", json={"phone": "9555555555", "role": "farmer"})
        assert "user_id" in resp.json()["data"]
        assert len(resp.json()["data"]["user_id"]) > 0


class TestGetMe:
    def test_get_me_success(self, client, farmer_token):
        resp = client.get("/auth/me", headers={"Authorization": f"Bearer {farmer_token}"})
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert "id" in d
        assert "phone" in d
        assert d["role"] == "farmer"

    def test_get_me_no_token(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code in (401, 403)

    def test_get_me_invalid_token(self, client):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer invalidtoken123"})
        assert resp.status_code == 401
