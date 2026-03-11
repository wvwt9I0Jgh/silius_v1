import requests

BASE_URL = "http://localhost:4174"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"

HEADERS_COMMON = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json",
}

def test_fetch_authenticated_user_details_with_valid_token():
    # Step 1: Login to get access token
    login_url = f"{BASE_URL}/auth/v1/token?grant_type=password"
    login_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "aaaaaa"
    }
    try:
        login_resp = requests.post(login_url, headers=HEADERS_COMMON, json=login_payload, timeout=30)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("access_token")
        assert access_token, "No access_token returned in login response"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Failed to obtain access token: {e}")

    # Step 2: Use access token to GET /auth/v1/user
    user_url = f"{BASE_URL}/auth/v1/user"
    headers_auth = {
        **HEADERS_COMMON,
        "Authorization": f"Bearer {access_token}"
    }
    try:
        user_resp = requests.get(user_url, headers=headers_auth, timeout=30)
        assert user_resp.status_code == 200, f"Fetching user details failed: {user_resp.status_code} {user_resp.text}"
        user_data = user_resp.json()
        # Verify response contains auth.uid (user id)
        assert "id" in user_data or "user" in user_data, "User response missing expected user details"
        assert user_data.get("id") or user_data.get("user") or user_data.get("aud") or user_data.get("email"), "User data does not contain identifiable user info"
        # Additional basic check: email in response matches login email
        # If user_data contains email field:
        email_in_response = user_data.get("email") or (user_data.get("user", {}).get("email") if isinstance(user_data.get("user"), dict) else None)
        assert email_in_response == "atakan0909xxnxx@gmail.com", "Email in user details does not match"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Failed fetching authenticated user details: {e}")

    # Step 3: Verify authorization enforcement by calling without token
    try:
        noauth_resp = requests.get(user_url, headers=HEADERS_COMMON, timeout=30)
        assert noauth_resp.status_code == 401, f"Unauthorized request should return 401 but got {noauth_resp.status_code}"
    except requests.RequestException as e:
        raise AssertionError(f"Failed unauthorized access test: {e}")

test_fetch_authenticated_user_details_with_valid_token()