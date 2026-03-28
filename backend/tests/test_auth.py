"""Tests for /auth endpoints."""
import pytest
import uuid


class TestAuth:
    def test_register_new_farmer(self, client):
        resp = client.post("/auth/register", json={"name": "Test Farmer", "phone": "9111111111", "password": "password123", "role": "farmer"})
        assert resp.status_code == 200
        d = resp.json()
        assert d["status"] == "success"
        assert d["data"]["role"] == "farmer"

    def test_register_existing_user(self, client):
        phone = "9111111112"
        client.post("/auth/register", json={"name": "User 1", "phone": phone, "password": "password123", "role": "farmer"})
        resp2 = client.post("/auth/register", json={"name": "User 2", "phone": phone, "password": "password123", "role": "farmer"})
        assert resp2.status_code == 400

    def test_login_success(self, client):
        phone = "9222222222"
        client.post("/auth/register", json={"name": "NGO Role", "phone": phone, "password": "password123", "role": "ngo"})
        resp = client.post("/auth/login", json={"phone": phone, "password": "password123"})
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "ngo"
        assert "token" in resp.json()["data"]

    def test_login_invalid_password(self, client):
        phone = "9333333333"
        client.post("/auth/register", json={"name": "Admin Role", "phone": phone, "password": "password123", "role": "admin"})
        resp = client.post("/auth/login", json={"phone": phone, "password": "wrongpassword"})
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post("/auth/login", json={"phone": "9999999999", "password": "password123"})
        assert resp.status_code == 401

    def test_ngo_register_success(self, client):
        email = f"new_ngo_{uuid.uuid4().hex}@example.com"
        payload = {
            "email": email,
            "password": "password123",
            "operator_full_name": "Test Operator",
            "organization_name": "Test NGO Org"
        }
        resp = client.post("/auth/ngo/register", json=payload)
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "ngo"

    def test_ngo_register_duplicate_email(self, client):
        email = "duplicate@example.com"
        payload = {
            "email": email,
            "password": "password123",
            "operator_full_name": "Op 1",
            "organization_name": "Org 1"
        }
        client.post("/auth/ngo/register", json=payload)
        resp = client.post("/auth/ngo/register", json=payload)
        assert resp.status_code == 400
        assert "Email already registered" in resp.json()["detail"]

    def test_ngo_login_success(self, client):
        email = "login_test@example.com"
        client.post("/auth/ngo/register", json={
            "email": email,
            "password": "secret_pass",
            "operator_full_name": "Login Op",
            "organization_name": "Login Org"
        })
        resp = client.post("/auth/ngo/login", json={"email": email, "password": "secret_pass"})
        assert resp.status_code == 200
        assert "token" in resp.json()["data"]

    def test_register_invalid_phone_short(self, client):
        resp = client.post("/auth/register", json={"name": "Short", "phone": "123", "password": "password123", "role": "farmer"})
        assert resp.status_code == 422

    def test_register_invalid_role(self, client):
        # Validation error happens, but standard role validation returns "farmer" if not provided?
        # No, if invalid it raises ValueError which converts to 422
        resp = client.post("/auth/register", json={"name": "Super", "phone": "9000000001", "password": "password123", "role": "superuser"})
        assert resp.status_code == 422

    def test_register_default_role_is_farmer(self, client):
        resp = client.post("/auth/register", json={"name": "Default", "phone": "9444444444", "password": "password123"})
        assert resp.status_code == 200
        assert resp.json()["data"]["role"] == "farmer"


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
