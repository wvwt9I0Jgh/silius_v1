import requests

BASE_URL = "http://localhost:4174"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
HEADERS = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json",
}


def test_validate_user_login_and_session_token_retrieval():
    login_url = f"{BASE_URL}/auth/v1/token?grant_type=password"

    # Valid credentials payload
    valid_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "aaaaaa"
    }

    # Invalid credentials payload
    invalid_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "wrongpassword"
    }

    # Test successful login with valid credentials
    try:
        valid_resp = requests.post(login_url, headers=HEADERS, json=valid_payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to login endpoint failed: {e}"

    assert valid_resp.status_code == 200, f"Expected 200 OK for valid login, got {valid_resp.status_code}"
    valid_resp_json = valid_resp.json()
    assert "access_token" in valid_resp_json and isinstance(valid_resp_json["access_token"], str) and valid_resp_json["access_token"], \
        "Response JSON must contain a non-empty 'access_token' on successful login"
    assert valid_resp_json.get("token_type", "").lower() == "bearer" or "token_type" not in valid_resp_json, \
        "token_type should be 'bearer' or omitted"

    access_token = valid_resp_json["access_token"]

    # Test error response for invalid credentials
    try:
        invalid_resp = requests.post(login_url, headers=HEADERS, json=invalid_payload, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to login endpoint with invalid credentials failed: {e}"

    assert invalid_resp.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {invalid_resp.status_code}"
    # Optionally check error message in body
    try:
        invalid_json = invalid_resp.json()
        # Supabase usually returns {"error": "...", "status": 401, "message": "..."}
        assert "error" in invalid_json or "message" in invalid_json, "Expected error or message key in 401 response JSON"
    except Exception:
        # If not JSON, ignore for now
        pass


test_validate_user_login_and_session_token_retrieval()