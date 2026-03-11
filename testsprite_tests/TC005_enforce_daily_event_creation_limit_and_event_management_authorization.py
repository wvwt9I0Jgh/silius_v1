import requests
import datetime
import time

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1/token?grant_type=password"
EVENTS_URL = f"{BASE_URL}/rest/v1/events"
HEADERS_BASE = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc",
    "Content-Type": "application/json",
}
TIMEOUT = 30


def test_tc005_event_creation_limit_and_authorization():
    # Step 1: Authenticate user
    auth_payload = {
        "email": "atakan0909xxnxx@gmail.com",
        "password": "aaaaaa"
    }
    auth_resp = requests.post(AUTH_URL, json=auth_payload, headers=HEADERS_BASE, timeout=TIMEOUT)
    assert auth_resp.status_code == 200, f"Authentication failed: {auth_resp.text}"
    access_token = auth_resp.json().get("access_token")
    assert access_token, "No access_token in auth response"
    auth_headers = {
        **HEADERS_BASE,
        "Authorization": f"Bearer {access_token}",
        "Prefer": "return=representation"
    }

    created_event_ids = []

    try:
        # Step 2: Create up to 3 events to reach daily limit
        # We'll try creating 3 events (assuming the daily limit is 3)
        for i in range(3):
            event_payload = {
                "title": f"Test Event {i+1} - TC005",
                "description": "Event to test daily creation limit",
                "date": datetime.datetime.utcnow().isoformat() + "Z",
                "location": "Test Location",
                "category": "test",
                "image": None
            }
            resp = requests.post(EVENTS_URL, json=event_payload, headers=auth_headers, timeout=TIMEOUT)
            assert resp.status_code == 201, f"Failed to create event #{i+1}: {resp.text}"
            data = resp.json()
            assert isinstance(data, list) and len(data) == 1 and "id" in data[0], f"Unexpected response for event create #{i+1}: {data}"
            created_event_ids.append(data[0]["id"])

        # Step 3: Attempt 4th event creation, expect 429 Too Many Requests
        event_payload = {
            "title": "Test Event 4 - TC005",
            "description": "This should exceed daily limit",
            "date": datetime.datetime.utcnow().isoformat() + "Z",
            "location": "Test Location",
            "category": "test",
            "image": None
        }
        resp = requests.post(EVENTS_URL, json=event_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 429, f"Expected 429 Too Many Requests but got {resp.status_code}"
        resp_json = resp.json()
        # Confirm message about retry-after or limit exceeded
        assert any(k in resp_json for k in ("message", "error")), f"429 response missing error message: {resp.text}"

        # Step 4: Test GET /rest/v1/events for filtering and sorting
        params = {
            "order": "created_at.desc",
            "category": "eq.test",
            "select": "*"
        }
        get_resp = requests.get(EVENTS_URL, headers=auth_headers, params=params, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Failed to get events list: {get_resp.text}"
        events_list = get_resp.json()
        # Validate the list order (newest first) and category filter
        assert isinstance(events_list, list), "Events list response is not a list"
        if len(events_list) > 1:
            for i in range(len(events_list)-1):
                dt_cur = datetime.datetime.fromisoformat(events_list[i]["created_at"].replace("Z", "+00:00"))
                dt_next = datetime.datetime.fromisoformat(events_list[i+1]["created_at"].replace("Z", "+00:00"))
                assert dt_cur >= dt_next, "Events are not sorted by created_at descending"
            # all categories should match "test"
            for ev in events_list:
                assert ev["category"] == "test", f"Event category mismatch: expected 'test', got '{ev['category']}'"

        # Step 5: Test PATCH /rest/v1/events only owner can update
        # We'll create another user to try editing the first event created by main user
        # So first get this main user's id (uid) from auth/v1/user
        user_resp = requests.get(f"{BASE_URL}/auth/v1/user", headers={"Authorization": f"Bearer {access_token}"}, timeout=TIMEOUT)
        assert user_resp.status_code == 200, f"Failed to get authenticated user info: {user_resp.text}"
        user_info = user_resp.json()
        user_uid = user_info.get("id") or user_info.get("user", {}).get("id") or user_info.get("user_id") or user_info.get("sub") or user_info.get("auth", {}).get("uid")
        if not user_uid:
            # Sometimes user id is inside "id" or "user_id" or "sub"
            user_uid = user_info.get("id") or user_info.get("user_id") or user_info.get("sub")
        assert user_uid, f"User ID not found in user info: {user_info}"

        # For owner requirement check, we try to patch event as a different user:
        # So we create another user and login for them.
        # Create new unique email using timestamp
        import random
        import string
        import time as t
        rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        test_email = f"test_{int(t.time())}_{rand_suffix}@example.com"
        signup_url = f"{BASE_URL}/auth/v1/signup"
        signup_payload = {
            "email": test_email,
            "password": "aaaaaa",
            "kvkkConsent": True
        }
        signup_resp = requests.post(signup_url, json=signup_payload, headers=HEADERS_BASE, timeout=TIMEOUT)
        assert signup_resp.status_code == 200, f"Failed to signup other test user: {signup_resp.text}"
        other_access_token = signup_resp.json().get("access_token")
        assert other_access_token, "No access_token in other user's signup response"
        other_auth_headers = {
            **HEADERS_BASE,
            "Authorization": f"Bearer {other_access_token}",
            "Prefer": "return=representation"
        }

        # Try to update first created event (owned by main user) as other user => expect 403 Forbidden
        if created_event_ids:
            event_id = created_event_ids[0]
            patch_url = f"{EVENTS_URL}?id=eq.{event_id}"
            patch_payload = {
                "title": "Updated Title By Other User",
                "description": "Attempt to update by non-owner"
            }
            patch_resp = requests.patch(patch_url, json=patch_payload, headers=other_auth_headers, timeout=TIMEOUT)
            assert patch_resp.status_code == 403, f"Expected 403 Forbidden when non-owner updates event but got {patch_resp.status_code}: {patch_resp.text}"

            # Also test valid update by owner user - must succeed
            patch_resp_owner = requests.patch(patch_url, json={"title": "Owner Updated Title"}, headers=auth_headers, timeout=TIMEOUT)
            assert patch_resp_owner.status_code == 200, f"Owner failed to update event: {patch_resp_owner.text}"
            patch_data = patch_resp_owner.json()
            assert isinstance(patch_data, list) and patch_data[0]["title"] == "Owner Updated Title", "Event title not updated by owner"

    finally:
        # Cleanup created events
        for eid in created_event_ids:
            delete_resp = requests.delete(f"{EVENTS_URL}?id=eq.{eid}", headers=auth_headers, timeout=TIMEOUT)
            # Accept 204 No Content or 200 OK with empty body for delete
            assert delete_resp.status_code in (200, 204), f"Failed to delete event id {eid}: {delete_resp.status_code} {delete_resp.text}"


test_tc005_event_creation_limit_and_authorization()