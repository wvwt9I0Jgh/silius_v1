import requests
import time

BASE_URL = "http://localhost:4174"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
HEADERS = {
    "apikey": API_KEY,
    "Content-Type": "application/json"
}

def test_verify_secure_user_signup_with_kvkk_consent_enforcement():
    url = f"{BASE_URL}/auth/v1/signup"
    timestamp = int(time.time())
    unique_email = f"test_{timestamp}@example.com"
    password = "TestPass123!"

    # 1) Attempt signup without kvkkConsent field
    payload_missing_consent = {
        "email": unique_email,
        "password": password
    }
    resp_missing = requests.post(url, json=payload_missing_consent, headers=HEADERS, timeout=30)
    assert resp_missing.status_code == 400, f"Expected 400 for missing kvkkConsent, got {resp_missing.status_code}"
    # Check error message presence
    json_missing = resp_missing.json()
    error_msg_1 = str(json_missing).lower()
    assert "kvkk" in error_msg_1 or "consent" in error_msg_1 or "required" in error_msg_1, f"Unexpected error message for missing kvkkConsent: {json_missing}"

    # 2) Attempt signup with kvkkConsent = False
    payload_false_consent = {
        "email": f"test_false_{timestamp}@example.com",
        "password": password,
        "kvkkConsent": False
    }
    resp_false = requests.post(url, json=payload_false_consent, headers=HEADERS, timeout=30)
    assert resp_false.status_code == 400, f"Expected 400 for false kvkkConsent, got {resp_false.status_code}"
    json_false = resp_false.json()
    error_msg_2 = str(json_false).lower()
    assert "kvkk" in error_msg_2 or "consent" in error_msg_2 or "required" in error_msg_2, f"Unexpected error message for false kvkkConsent: {json_false}"

    # 3) Successful signup with kvkkConsent = True
    payload_true_consent = {
        "email": f"test_true_{timestamp}@example.com",
        "password": password,
        "kvkkConsent": True
    }
    resp_true = requests.post(url, json=payload_true_consent, headers=HEADERS, timeout=30)
    assert resp_true.status_code == 200, f"Expected 200 for signup with kvkkConsent true, got {resp_true.status_code}"
    json_true = resp_true.json()

    # Response should contain access_token/session token and user metadata keys
    assert "access_token" in json_true or "session" in json_true or "user" in json_true, f"Signup success response missing expected keys: {json_true}"

test_verify_secure_user_signup_with_kvkk_consent_enforcement()