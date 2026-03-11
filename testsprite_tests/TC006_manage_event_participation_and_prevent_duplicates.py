import requests
import time

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1/token?grant_type=password"
REST_URL = f"{BASE_URL}/rest/v1"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
HEADERS_AUTH = {
    "apikey": ANON_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_manage_event_participation_and_prevent_duplicates():
    # Step 1: Authenticate user to get access token
    auth_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "aaaaaa"
    }
    try:
        auth_resp = requests.post(AUTH_URL, json=auth_payload, headers=HEADERS_AUTH, timeout=TIMEOUT)
        assert auth_resp.status_code == 200, f"Auth failed with status {auth_resp.status_code}: {auth_resp.text}"
        auth_data = auth_resp.json()
        access_token = auth_data.get("access_token")
        assert access_token, "access_token missing in auth response"
    except Exception as e:
        raise AssertionError(f"Authentication request failed: {e}")

    # Common headers for authenticated requests
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    participant_id = None
    event_id = None
    user_id = None

    # Step 2: Fetch user info to get user_id
    try:
        user_resp = requests.get(f"{BASE_URL}/auth/v1/user", headers={"Authorization": f"Bearer {access_token}"}, timeout=TIMEOUT)
        assert user_resp.status_code == 200, f"Get user failed with status {user_resp.status_code}: {user_resp.text}"
        user_data = user_resp.json()
        user_id = user_data.get("id")
        assert user_id, "User ID missing in user info"
    except Exception as e:
        raise AssertionError(f"Fetching user info failed: {e}")

    # Step 3: Create a new event (needed to join)
    event_payload = {
        "title": f"Test Event {int(time.time())}",
        "description": "Test Event for participation",
        "date": "2099-12-31T12:00:00Z",
        "location": "Test Location",
        "category": "test",
        "image": "https://example.com/image.png"
    }
    try:
        create_event_resp = requests.post(f"{REST_URL}/events", json=event_payload, headers=headers, timeout=TIMEOUT)
        assert create_event_resp.status_code in (200,201), f"Create event failed with status {create_event_resp.status_code}: {create_event_resp.text}"
        created_events = create_event_resp.json()
        assert isinstance(created_events, list) and len(created_events) > 0, "No event data returned after creation"
        event_id = created_events[0].get("id") or created_events[0].get("event_id") or created_events[0].get("id")
        assert event_id, "Created event ID missing"
    except Exception as e:
        raise AssertionError(f"Creating event failed: {e}")

    try:
        # Step 4: POST /event_participants to join event
        join_payload = {
            "event_id": event_id,
            "user_id": user_id
        }
        join_resp = requests.post(f"{REST_URL}/event_participants", json=join_payload, headers=headers, timeout=TIMEOUT)
        assert join_resp.status_code in (200,201), f"Join event failed with status {join_resp.status_code}: {join_resp.text}"
        join_data = join_resp.json()
        assert isinstance(join_data, list) and len(join_data) > 0, "No data returned after join event"
        participant_id = None
        # participant id might be in returned list object under 'id' or 'participant_id'
        if "id" in join_data[0]:
            participant_id = join_data[0]["id"]
        elif "participant_id" in join_data[0]:
            participant_id = join_data[0]["participant_id"]
        else:
            participant_id = join_data[0].get("id")
        assert participant_id, "Participant ID missing in join response"

        # Step 5: Attempt to join the same event again to test duplicate handling
        dup_resp = requests.post(f"{REST_URL}/event_participants", json=join_payload, headers=headers, timeout=TIMEOUT)
        assert dup_resp.status_code == 409, f"Duplicate participation should fail with 409 but got {dup_resp.status_code}"

        # Step 6: DELETE /event_participants?id=eq.<participant_id> to leave event
        delete_resp = requests.delete(f"{REST_URL}/event_participants?id=eq.{participant_id}", headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 204, f"Leave event failed with status {delete_resp.status_code}: {delete_resp.text}"

        # Step 7: Attempt to delete again (or verify participant no longer exists)
        del_again_resp = requests.delete(f"{REST_URL}/event_participants?id=eq.{participant_id}", headers=headers, timeout=TIMEOUT)
        # Could be 204 No Content again or 404 Not Found - both acceptable to confirm deletion
        assert del_again_resp.status_code in (204,404), f"Second leave attempt unexpected status {del_again_resp.status_code}"

    finally:
        # Cleanup: delete created event if exists
        if event_id:
            try:
                del_event_resp = requests.delete(f"{REST_URL}/events?id=eq.{event_id}", headers=headers, timeout=TIMEOUT)
                # Accept 204 No Content or 404 if already deleted
                assert del_event_resp.status_code in (204,404), f"Cleanup event deletion failed, status {del_event_resp.status_code}"
            except Exception:
                pass

test_manage_event_participation_and_prevent_duplicates()