import requests
import json

BASE_URL = "http://localhost:4174"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
AUTH_HEADERS = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json"
}
REST_HEADERS = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json"
}

def test_fetch_and_update_user_profile_with_authorization():
    # Step 1: Authenticate and retrieve access token
    auth_url = f"{BASE_URL}/auth/v1/token?grant_type=password"
    auth_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "aaaaaa"
    }
    auth_resp = requests.post(auth_url, headers=AUTH_HEADERS, json=auth_payload, timeout=30)
    assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
    auth_data = auth_resp.json()
    assert "access_token" in auth_data, "Access token not found in auth response"
    access_token = auth_data["access_token"]

    # Prepare headers with Bearer token for authorized requests
    auth_rest_headers = {
        **REST_HEADERS,
        "Authorization": f"Bearer {access_token}",
        "Prefer": "return=representation"
    }

    # Step 2: GET /rest/v1/users?select=* to fetch user profile
    get_profile_url = f"{BASE_URL}/rest/v1/users?select=*"
    get_resp = requests.get(get_profile_url, headers=auth_rest_headers, timeout=30)
    assert get_resp.status_code == 200, f"Failed to fetch user profile: {get_resp.text}"
    users = get_resp.json()
    assert isinstance(users, list) and len(users) > 0, "User profile list is empty"
    user = users[0]
    assert "id" in user, "User object missing 'id'"

    user_id = user["id"]

    # Step 3: Attempt GET /rest/v1/users?select=* without Authorization header (should fail 401)
    unauth_get_resp = requests.get(get_profile_url, headers=REST_HEADERS, timeout=30)
    assert unauth_get_resp.status_code == 401, f"Unauthorized GET succeeded unexpectedly: {unauth_get_resp.text}"

    # Step 4: PATCH /rest/v1/users with valid update data
    patch_url = f"{BASE_URL}/rest/v1/users"
    updated_data = {
        "id": user_id,
        "firstName": "UpdatedFirstName",
        "lastName": "UpdatedLastName",
        "username": "updatedusername",
        "age": 30,
        "gender": "other",
        "bio": "Updated bio for testing.",
        "isProfileComplete": True
    }
    patch_resp = requests.patch(patch_url, headers=auth_rest_headers, json=updated_data, timeout=30)
    assert patch_resp.status_code == 200, f"Failed to update user profile: {patch_resp.text}"
    updated_user_list = patch_resp.json()
    assert isinstance(updated_user_list, list) and len(updated_user_list) == 1, "Update response format invalid"
    updated_user = updated_user_list[0]
    for key, val in updated_data.items():
        assert key in updated_user, f"Missing '{key}' in updated user data"
        assert updated_user[key] == val, f"Field '{key}' update mismatch (expected {val}, got {updated_user[key]})"

    # Step 5: PATCH /rest/v1/users with invalid data (username too short) should return 400
    invalid_update_data = {
        "id": user_id,
        "username": "ab"  # too short, assuming validation rule
    }
    invalid_patch_resp = requests.patch(patch_url, headers=auth_rest_headers, json=invalid_update_data, timeout=30)
    assert invalid_patch_resp.status_code == 400, f"Invalid PATCH accepted: {invalid_patch_resp.text}"

    # Step 6: PATCH /rest/v1/users without Authorization header should fail 401
    unauth_patch_resp = requests.patch(patch_url, headers=REST_HEADERS, json=updated_data, timeout=30)
    assert unauth_patch_resp.status_code == 401, f"Unauthorized PATCH succeeded unexpectedly: {unauth_patch_resp.text}"

test_fetch_and_update_user_profile_with_authorization()