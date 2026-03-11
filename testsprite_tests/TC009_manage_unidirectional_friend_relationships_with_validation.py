import requests
import time

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1"
REST_URL = f"{BASE_URL}/rest/v1"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"

HEADERS_NO_AUTH = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json",
}
TIMEOUT = 30


def authenticate(email: str, password: str) -> str:
    url = f"{AUTH_URL}/token?grant_type=password"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, headers=HEADERS_NO_AUTH, timeout=TIMEOUT)
    resp.raise_for_status()
    token = resp.json().get("access_token")
    if not token:
        raise RuntimeError("Failed to obtain access token")
    return token


def get_my_user_id(token: str) -> str:
    url = f"{REST_URL}/users?select=id"
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {token}",
    }
    resp = requests.get(url, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    users = resp.json()
    if not users or not isinstance(users, list):
        raise RuntimeError("No users data returned")
    user_id = users[0].get("id")
    if not user_id:
        raise RuntimeError("User id not found in response")
    return user_id


def test_manage_unidirectional_friend_relationships_with_validation():
    email = "atakan0909xxnxx@gmail.com"
    password = "aaaaaa"
    token = authenticate(email, password)
    auth_headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Prefer": "return=representation",
    }
    # Obtain authenticated user id
    user_id = get_my_user_id(token)
    # We need a target friend user_id different from user_id.
    # Strategy: Create a dummy user (via signup) then use its id for friend_id.
    # However signup is not requested here and may require KVKK consent.
    # Alternative: Query for another user in users table who isn't self.
    # Since no user creation is requested, try to get another user from users table.
    # If none found other than self, skip.
    url_users = f"{REST_URL}/users?select=id&limit=2"
    resp_users = requests.get(url_users, headers=auth_headers, timeout=TIMEOUT)
    resp_users.raise_for_status()
    users_list = resp_users.json()
    friend_id = None
    for u in users_list:
        if u.get("id") != user_id:
            friend_id = u.get("id")
            break
    if not friend_id:
        raise RuntimeError("No different user found to use as friend")

    friend_record_id = None

    # 1) Add friend relation POST /rest/v1/friends {user_id, friend_id} -> 201
    try:
        payload = {"user_id": user_id, "friend_id": friend_id}
        resp = requests.post(f"{REST_URL}/friends", json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}"
        # The response contains the created friend record, extract its ID
        resp_data = resp.json()
        assert isinstance(resp_data, list) and len(resp_data) == 1, "Expected single friend record in response"
        friend_record_id = resp_data[0].get("id")
        assert friend_record_id, "Friend record id missing in response"

        # 2) Adding duplicate friend relation POST again -> 409 Conflict
        resp_dup = requests.post(f"{REST_URL}/friends", json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp_dup.status_code == 409, f"Expected 409 Conflict on duplicate, got {resp_dup.status_code}"

        # 3) Invalid friend_id format POST -> 400 Bad Request
        invalid_payload = {"user_id": user_id, "friend_id": "invalid-format-id"}
        resp_invalid = requests.post(f"{REST_URL}/friends", json=invalid_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp_invalid.status_code == 400, f"Expected 400 Bad Request on invalid friend_id, got {resp_invalid.status_code}"

        # 4) Delete friend relation DELETE /rest/v1/friends?id=eq.<friendRecordId> -> 204 No Content
        if friend_record_id:
            delete_url = f"{REST_URL}/friends?id=eq.{friend_record_id}"
            resp_del = requests.delete(delete_url, headers=auth_headers, timeout=TIMEOUT)
            assert resp_del.status_code == 204, f"Expected 204 No Content on delete, got {resp_del.status_code}"
            friend_record_id = None

    finally:
        # Cleanup friend relation if still exists
        if friend_record_id:
            try:
                delete_url = f"{REST_URL}/friends?id=eq.{friend_record_id}"
                requests.delete(delete_url, headers=auth_headers, timeout=TIMEOUT)
            except Exception:
                pass


test_manage_unidirectional_friend_relationships_with_validation()