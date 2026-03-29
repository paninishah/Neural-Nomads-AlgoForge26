"""
Pytest configuration and shared test fixtures.
"""
import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use in-memory SQLite for tests
os.environ["DATABASE_URL"] = "sqlite:///./test_annadata.db"
os.environ["MARKET_DATA_PATH"] = "app/data/market_data.csv"

from app.main import app
from app.database import Base, get_db

TEST_DB_URL = "sqlite:///./test_annadata.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("test_annadata.db"):
        os.remove("test_annadata.db")


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def setup_users(client):
    # Register core test users via the API
    # Farmer and Admin use phone flow
    client.post("/auth/register", json={"name": "Farmer 1", "phone": "8000000001", "password": "password123", "role": "farmer"})
    client.post("/auth/register", json={"name": "Admin 1", "phone": "8000000003", "password": "password123", "role": "admin"})
    
    # NGO uses new email flow
    client.post("/auth/ngo/register", json={
        "email": "ngo@example.com",
        "password": "password123",
        "operator_full_name": "NGO Operator",
        "organization_name": "Global Help NGO"
    })
    return True

@pytest.fixture(scope="session")
def farmer_token(client, setup_users):
    resp = client.post("/auth/login", json={"phone": "8000000001", "password": "password123"})
    assert resp.status_code == 200
    return resp.json()["data"]["token"]

@pytest.fixture(scope="session")
def farmer_user_id(client, setup_users):
    resp = client.post("/auth/login", json={"phone": "8000000001", "password": "password123"})
    return resp.json()["data"]["user_id"]

@pytest.fixture(scope="session")
def ngo_token(client, setup_users):
    resp = client.post("/auth/ngo/login", json={"email": "ngo@example.com", "password": "password123"})
    assert resp.status_code == 200
    return resp.json()["data"]["token"]

@pytest.fixture(scope="session")
def ngo_user_id(client, setup_users):
    resp = client.post("/auth/ngo/login", json={"email": "ngo@example.com", "password": "password123"})
    return resp.json()["data"]["user_id"]

@pytest.fixture(scope="session")
def admin_token(client, setup_users):
    resp = client.post("/auth/login", json={"phone": "8000000003", "password": "password123"})
    assert resp.status_code == 200
    return resp.json()["data"]["token"]

@pytest.fixture(scope="session")
def admin_user_id(client, setup_users):
    resp = client.post("/auth/login", json={"phone": "8000000003", "password": "password123"})
    return resp.json()["data"]["user_id"]
