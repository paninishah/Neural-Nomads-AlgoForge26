import time
import httpx
import json
import os

BASE_URL = "http://127.0.0.1:8001"

def benchmark_endpoint(method, path, name, payload=None, files=None, headers=None):
    print(f"[*] Testing {name} ({path})...", end="", flush=True)
    start = time.time()
    try:
        if method == "POST":
            if files:
                r = httpx.post(f"{BASE_URL}{path}", data=payload, files=files, headers=headers, timeout=30.0)
            else:
                r = httpx.post(f"{BASE_URL}{path}", json=payload, headers=headers, timeout=10.0)
        else:
            r = httpx.get(f"{BASE_URL}{path}", headers=headers, timeout=10.0)
        
        duration = (time.time() - start) * 1000
        # Check if status is 200 or 400 (if already registered)
        is_ok = r.status_code < 400 or (r.status_code == 400 and "already registered" in r.text)
        status = "PASS" if is_ok else f"FAIL ({r.status_code}: {r.text[:50]})"
        print(f" {status} in {duration:.2f}ms")
        return r, duration
    except Exception as e:
        print(f" ERROR: {e}")
        return None, 0

def run_benchmarks():
    # 0. Setup: Register a Farmer & NGO
    reg_payload = {"name": "Test Farmer", "phone": str(int(time.time()))[-10:], "password": "password123"}
    benchmark_endpoint("POST", "/auth/register", "Farmer Register", payload=reg_payload)
    
    ngo_email = f"ngo_{int(time.time())}@test.com"
    ngo_reg = {"email": ngo_email, "password": "password123", "operator_full_name": "Op", "organization_name": "Org"}
    benchmark_endpoint("POST", "/auth/ngo/register", "NGO Register", payload=ngo_reg)

    # 1. Login
    login_payload = {"phone": reg_payload["phone"], "password": "password123"}
    resp, t_login = benchmark_endpoint("POST", "/auth/login", "Authentication", payload=login_payload)
    
    token = None
    farmer_id = None
    if resp and resp.status_code == 200:
        d = resp.json()["data"]
        token = d["token"]
        farmer_id = d["user_id"]
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 2. Price Check (ML Engine)
    price_payload = {"crop": "apple", "location": "durg", "user_price": 500}
    benchmark_endpoint("POST", "/check-price", "Price Check (ML)", payload=price_payload, headers=headers)

    # 3. Trust Score (Aggregation)
    if farmer_id:
        benchmark_endpoint("GET", f"/trust-score/{farmer_id}", "Trust Score", headers=headers)

    # 4. NGO Login Performance
    ngo_login = {"email": ngo_email, "password": "password123"}
    benchmark_endpoint("POST", "/auth/ngo/login", "NGO Login", payload=ngo_login)

if __name__ == "__main__":
    print("\n=== ANNADATA BACKEND PERFORMANCE AUDIT ===")
    run_benchmarks()
    print("==========================================\n")
