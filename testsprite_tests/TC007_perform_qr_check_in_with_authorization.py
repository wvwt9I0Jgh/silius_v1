import requests
import time

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1"
REST_URL = f"{BASE_URL}/rest/v1"

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
TEST_EMAIL = "atakan0909xxnxx@gmail.com"
TEST_PASSWORD = "aaaaaa"

HEADERS_ANON = {
    "apikey": API_KEY,
    "Content-Type": "application/json",
}

def get_access_token(email, password):
    url = f"{AUTH_URL}/token?grant_type=password"
    payload = {"email": email, "password": password}
    try:
        resp = requests.post(url, json=payload, headers=HEADERS_ANON, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        access_token = data.get("access_token")
        assert access_token, "No access_token in response"
        return access_token
    except requests.RequestException as e:
        raise RuntimeError(f"Authentication failed: {e}")

def get_user_profile(access_token):
    url = f"{REST_URL}/users?select=*"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    users = resp.json()
    assert isinstance(users, list) and len(users) >= 1, "User profile not found"
    # Return first user object (should be only one for the authenticated user)
    return users[0]

def create_event(access_token):
    url = f"{REST_URL}/events"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    # Minimal event data - title and date required for sanity, others can be dummy
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    event_payload = {
        "title": "Test Event for QR Checkin",
        "description": "Test event created for TC007",
        "date": now_iso,
        "location": "Test Location",
        "category": "test",
        "image": None,
    }
    resp = requests.post(url, headers=headers, json=event_payload, timeout=30)
    resp.raise_for_status()
    event_data = resp.json()
    assert isinstance(event_data, list) and len(event_data) == 1, "Event creation failed or no representation returned"
    return event_data[0]

def join_event(access_token, user_id, event_id):
    url = f"{REST_URL}/event_participants"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    payload = {
        "event_id": event_id,
        "user_id": user_id,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code == 201:
        participant_data = resp.json()
        assert isinstance(participant_data, list) and len(participant_data) == 1, "Join event failed or no representation returned"
        return participant_data[0]
    elif resp.status_code == 409:
        # Already participant - parse the error and treat as acceptable for test
        return None
    else:
        resp.raise_for_status()

def leave_event(access_token, participant_id):
    url = f"{REST_URL}/event_participants?id=eq.{participant_id}"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {access_token}",
    }
    resp = requests.delete(url, headers=headers, timeout=30)
    if resp.status_code not in (204, 200):
        resp.raise_for_status()

def perform_qr_checkin(access_token, user_id, event_id):
    url = f"{REST_URL}/event_checkins"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    payload = {
        "event_id": event_id,
        "user_id": user_id,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    return resp

def test_perform_qr_checkin_with_authorization():
    # Authenticate and get access token
    access_token = get_access_token(TEST_EMAIL, TEST_PASSWORD)

    # Get user profile to find user_id
    user = get_user_profile(access_token)
    user_id = user.get("id")
    assert user_id, "User ID not found in profile"

    # Create an event to join and check-in
    event = create_event(access_token)
    event_id = event.get("id")
    assert event_id, "Event ID not found"

    participant_id = None

    try:
        # Join the event to enable check-in
        participant = join_event(access_token, user_id, event_id)
        if participant is not None:
            participant_id = participant.get("id")

        # 1) Perform QR check-in with valid authorization
        resp_checkin = perform_qr_checkin(access_token, user_id, event_id)
        assert resp_checkin.status_code == 201, f"Expected 201 Created, got {resp_checkin.status_code}"
        checkin_data = resp_checkin.json()
        assert isinstance(checkin_data, list) and len(checkin_data) == 1, "Invalid check-in response format"
        record = checkin_data[0]
        assert record.get("event_id") == event_id
        assert record.get("user_id") == user_id
        assert "vibe_points_earned" in record

        # 2) Attempt QR check-in without authorization header (should be rejected)
        url = f"{REST_URL}/event_checkins"
        headers_no_auth = {
            "apikey": API_KEY,
            "Content-Type": "application/json",
        }
        payload = {"event_id": event_id, "user_id": user_id}
        resp_no_auth = requests.post(url, headers=headers_no_auth, json=payload, timeout=30)
        assert resp_no_auth.status_code == 401, f"Expected 401 Unauthorized without token, got {resp_no_auth.status_code}"

    finally:
        # Cleanup: leave event if joined
        if participant_id:
            leave_event(access_token, participant_id)

        # Delete the created event to keep environment clean
        if event_id:
            url_delete_event = f"{REST_URL}/events?id=eq.{event_id}"
            headers_delete = {
                "apikey": API_KEY,
                "Authorization": f"Bearer {access_token}",
            }
            resp = requests.delete(url_delete_event, headers=headers_delete, timeout=30)
            if resp.status_code not in (204, 200):
                # Log but do not raise during cleanup
                print(f"Warning: failed to delete event {event_id}, status: {resp.status_code}")

test_perform_qr_checkin_with_authorization()