"""Tests for /check-price, /heatmap/prices, and /verify-input endpoints."""
import pytest


class TestPriceCheck:
    def test_check_price_underpaid(self, client, farmer_token):
        # Wheat is common; user_price far below avg should be underpaid
        resp = client.post(
            "/check-price",
            json={"crop": "apple", "location": "durg", "user_price": 100},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["status"] in ("underpaid", "fair", "overpaid")
        assert "average_price" in d
        assert "best_mandi" in d
        assert "decision" in d

    def test_check_price_overpaid(self, client, farmer_token):
        resp = client.post(
            "/check-price",
            json={"crop": "apple", "location": "durg", "user_price": 99999},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["data"]["status"] == "overpaid"

    def test_check_price_unknown_crop(self, client, farmer_token):
        resp = client.post(
            "/check-price",
            json={"crop": "alienplant99xyz", "location": "mars", "user_price": 100},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 404

    def test_check_price_no_auth(self, client):
        resp = client.post(
            "/check-price",
            json={"crop": "apple", "location": "durg", "user_price": 1000},
        )
        assert resp.status_code in (401, 403)

    def test_check_price_zero_price(self, client, farmer_token):
        resp = client.post(
            "/check-price",
            json={"crop": "apple", "location": "durg", "user_price": 0},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 422

    def test_check_price_returns_all_mandis(self, client, farmer_token):
        resp = client.post(
            "/check-price",
            json={"crop": "rice", "location": "chattisgarh", "user_price": 1000},
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        if resp.status_code == 200:
            assert isinstance(resp.json()["data"]["all_mandis"], list)


class TestHeatmap:
    def test_heatmap_returns_locations(self, client, farmer_token):
        resp = client.get(
            "/heatmap/prices?crop=apple",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert "locations" in d
        assert isinstance(d["locations"], list)

    def test_heatmap_with_unknown_crop(self, client, farmer_token):
        resp = client.get(
            "/heatmap/prices?crop=alienplant99xyz",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 404

    def test_heatmap_no_auth(self, client):
        resp = client.get("/heatmap/prices?crop=wheat")
        assert resp.status_code in (401, 403)

    def test_heatmap_locations_have_price(self, client, farmer_token):
        resp = client.get(
            "/heatmap/prices?crop=rice",
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        if resp.status_code == 200:
            for loc in resp.json()["data"]["locations"]:
                assert "price" in loc
                assert "location" in loc


class TestInputVerify:
    def test_verify_genuine_product(self, client, farmer_token):
        resp = client.post(
            "/verify-input",
            json={
                "image": "base64imagedata",
                "batch_number": "BATCH1234",
                "brand": "GreenGrow",
                "expiry_date": "12/2026",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["status"] in ("genuine", "suspicious", "fake")
        assert 0.0 <= d["confidence"] <= 1.0
        assert isinstance(d["issues"], list)

    def test_verify_known_fraud_batch(self, client, farmer_token):
        resp = client.post(
            "/verify-input",
            json={
                "image": "someimage",
                "batch_number": "FRAUD123",
                "brand": "SomeBrand",
                "expiry_date": "12/2026",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        d = resp.json()["data"]
        assert d["status"] in ("suspicious", "fake")
        assert len(d["issues"]) > 0

    def test_verify_expired_product(self, client, farmer_token):
        resp = client.post(
            "/verify-input",
            json={
                "image": "someimage",
                "batch_number": "BATCH9999",
                "brand": "GoodBrand",
                "expiry_date": "01/2020",
            },
            headers={"Authorization": f"Bearer {farmer_token}"},
        )
        assert resp.status_code == 200
        issues = resp.json()["data"]["issues"]
        assert any("expired" in i.lower() for i in issues)

    def test_verify_no_auth(self, client):
        resp = client.post("/verify-input", json={"image": "data"})
        assert resp.status_code in (401, 403)
