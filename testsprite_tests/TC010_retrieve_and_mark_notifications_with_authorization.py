import requests
import time

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1"
REST_URL = f"{BASE_URL}/rest/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc"
EMAIL = "atakan0909xxnxx@gmail.com"
PASSWORD = "aaaaaa"
TIMEOUT = 30

def test_TC010_retrieve_and_mark_notifications_with_authorization():
    session = requests.Session()
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }
    try:
        # Authenticate user to get access_token
        resp = session.post(
            f"{AUTH_URL}/token?grant_type=password",
            json={"email": EMAIL, "password": PASSWORD},
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        token_data = resp.json()
        access_token = token_data.get("access_token")
        assert access_token, "access_token missing in response"

        auth_headers = headers.copy()
        auth_headers["Authorization"] = f"Bearer {access_token}"

        # Get current authenticated user info for user_id (notifications require user_id filter)
        user_resp = session.get(f"{AUTH_URL}/user", headers=auth_headers, timeout=TIMEOUT)
        assert user_resp.status_code == 200, f"Failed to fetch user info: {user_resp.text}"
        user_data = user_resp.json()
        user_id = user_data.get("id")
        assert user_id, "User id missing in authenticated user data"

        # Test unauthorized access: GET /rest/v1/notifications without Authorization
        unauth_resp = session.get(
            f"{REST_URL}/notifications?order=created_at.desc&limit=20",
            headers=headers,
            timeout=TIMEOUT,
        )
        assert unauth_resp.status_code == 401, f"Unauthorized GET notifications did not fail as expected, got {unauth_resp.status_code}"

        # GET /rest/v1/notifications?user_id=eq.<user_id>&order=created_at.desc&limit=20
        params = {
            "user_id": f"eq.{user_id}",
            "order": "created_at.desc",
            "limit": "20",
        }
        notifications_resp = session.get(
            f"{REST_URL}/notifications",
            headers=auth_headers,
            params=params,
            timeout=TIMEOUT,
        )
        assert notifications_resp.status_code == 200, f"Failed to get notifications: {notifications_resp.text}"
        notifications = notifications_resp.json()
        assert isinstance(notifications, list), "Notifications response is not a list"

        notification_id = None
        if notifications:
            # Select a notification id from existing list to test PATCH
            notification_id = notifications[0].get("id")

        if not notification_id:
            # No notification found, create one to patch and delete in finally
            # For creation, we need a minimal payload for notifications
            # Since no endpoint in PRD for POST notifications, create via /rest/v1/notifications insert POST (assuming allowed)
            create_payload = {
                "user_id": user_id,
                "title": "Test Notification",
                "body": "This is a test notification for TC010.",
                "is_read": False,
                # if additional mandatory fields needed, add here
            }
            create_resp = session.post(
                f"{REST_URL}/notifications",
                headers={**auth_headers, "Prefer": "return=representation"},
                json=create_payload,
                timeout=TIMEOUT,
            )
            assert create_resp.status_code in (201, 200), f"Failed to create test notification: {create_resp.text}"
            created_notifications = create_resp.json()
            assert isinstance(created_notifications, list) and len(created_notifications) > 0, "No created notification returned"
            notification_id = created_notifications[0].get("id")
            assert notification_id, "Created notification id missing"

            created_notification_created = True
        else:
            created_notification_created = False

        # PATCH /rest/v1/notifications?id=eq.<notification_id> set is_read = true
        patch_resp = session.patch(
            f"{REST_URL}/notifications",
            headers={**auth_headers, "Prefer": "return=representation"},
            params={"id": f"eq.{notification_id}"},
            json={"is_read": True},
            timeout=TIMEOUT,
        )
        assert patch_resp.status_code == 200, f"Failed to patch notification: {patch_resp.text}"
        patched_notifications = patch_resp.json()
        assert isinstance(patched_notifications, list) and len(patched_notifications) == 1, "Patch did not return one updated notification"
        assert patched_notifications[0].get("is_read") is True, "Notification is_read was not set to True"

        # PATCH with non-existent notification id should return 404
        non_existent_id = 999999999
        patch_nonexistent_resp = session.patch(
            f"{REST_URL}/notifications",
            headers={**auth_headers, "Prefer": "return=representation"},
            params={"id": f"eq.{non_existent_id}"},
            json={"is_read": True},
            timeout=TIMEOUT,
        )
        assert patch_nonexistent_resp.status_code == 404, f"Expected 404 when patching non-existent notification, got {patch_nonexistent_resp.status_code}"

        # Also verify GET with invalid credentials returns 401
        bad_auth_headers = headers.copy()
        bad_auth_headers["Authorization"] = "Bearer invalidtoken123"
        invalid_token_resp = session.get(
            f"{REST_URL}/notifications?user_id=eq.{user_id}",
            headers=bad_auth_headers,
            timeout=TIMEOUT,
        )
        assert invalid_token_resp.status_code == 401, f"GET notifications with invalid token should be 401 but got {invalid_token_resp.status_code}"

    finally:
        # Cleanup: delete created notification if we created one
        if 'created_notification_created' in locals() and created_notification_created and notification_id:
            try:
                del_resp = session.delete(
                    f"{REST_URL}/notifications",
                    headers=auth_headers,
                    params={"id": f"eq.{notification_id}"},
                    timeout=TIMEOUT,
                )
                # No strict assert here, just attempt cleanup
            except Exception:
                pass

test_TC010_retrieve_and_mark_notifications_with_authorization()