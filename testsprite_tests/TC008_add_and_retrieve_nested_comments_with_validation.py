import requests
import json

BASE_URL = "http://localhost:4174"
AUTH_URL = f"{BASE_URL}/auth/v1/token?grant_type=password"
COMMENTS_URL = f"{BASE_URL}/rest/v1/comments"
HEADERS_BASE = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc",
    "Content-Type": "application/json"
}
USER_EMAIL = "atakan0909xxnxx@gmail.com"
USER_PASSWORD = "aaaaaa"
TIMEOUT = 30

def test_add_and_retrieve_nested_comments_with_validation():
    # Authenticate user and get access token
    auth_payload = {"email": USER_EMAIL, "password": USER_PASSWORD}
    auth_resp = requests.post(AUTH_URL, headers={"Content-Type": "application/json", "apikey": HEADERS_BASE["apikey"]},
                              data=json.dumps(auth_payload), timeout=TIMEOUT)
    assert auth_resp.status_code == 200, f"Auth failed with status {auth_resp.status_code}"
    auth_json = auth_resp.json()
    access_token = auth_json.get("access_token")
    assert access_token, "No access_token in auth response"

    auth_headers = {
        **HEADERS_BASE,
        "Authorization": f"Bearer {access_token}"
    }

    # Step 1: Identify an event_id for comment (need one to create a comment)
    # Since test plan / PRD doesn't specify event creation here, create a dummy event to comment on, then cleanup
    event_id = None
    event_url = f"{BASE_URL}/rest/v1/events"
    # Create event payload
    import time
    event_payload = {
        "title": f"Test Event for Comments {int(time.time())}",
        "description": "Event to test nested comments",
        "date": "2099-12-31T23:59:59Z",
        "location": "Test Location",
        "category": "test",
        "image": None
    }
    create_event_resp = requests.post(event_url, headers=auth_headers | {"Prefer": "return=representation"},
                                      data=json.dumps(event_payload), timeout=TIMEOUT)
    assert create_event_resp.status_code in (201, 200), f"Failed to create event for comments setup: {create_event_resp.text}"
    event_data = create_event_resp.json()
    assert isinstance(event_data, list) and len(event_data) == 1, "Unexpected event creation response"
    event_id = event_data[0].get("id")
    assert event_id, "No event_id returned from event creation"

    comment_id = None
    reply_comment_id = None
    try:
        # Step 2: Add a root comment to the event
        comment_payload = {
            "event_id": event_id,
            "text": "This is a root comment for testing.",
        }
        post_comment_resp = requests.post(COMMENTS_URL, headers=auth_headers | {"Prefer": "return=representation"},
                                          data=json.dumps(comment_payload), timeout=TIMEOUT)
        assert post_comment_resp.status_code in (201, 200), f"Failed to add root comment: {post_comment_resp.text}"
        comment_data = post_comment_resp.json()
        assert isinstance(comment_data, list) and len(comment_data) == 1, "Unexpected comment creation response"
        comment_id = comment_data[0].get("id")
        user_id_comment = comment_data[0].get("user_id")
        assert comment_id, "No comment_id returned"
        assert user_id_comment, "No user_id in created comment"
        assert comment_data[0].get("parent_comment_id") is None, "Root comment should have no parent_comment_id"

        # Step 3: Add a reply comment referencing the root comment
        reply_payload = {
            "event_id": event_id,
            "text": "This is a nested reply.",
            "parent_comment_id": comment_id
        }
        post_reply_resp = requests.post(COMMENTS_URL, headers=auth_headers | {"Prefer": "return=representation"},
                                       data=json.dumps(reply_payload), timeout=TIMEOUT)
        assert post_reply_resp.status_code in (201, 200), f"Failed to add reply comment: {post_reply_resp.text}"
        reply_data = post_reply_resp.json()
        assert isinstance(reply_data, list) and len(reply_data) == 1, "Unexpected reply creation response"
        reply_comment_id = reply_data[0].get("id")
        assert reply_comment_id, "No reply comment_id returned"
        assert reply_data[0].get("parent_comment_id") == comment_id, "Reply comment parent_comment_id mismatch"

        # Step 4: Attempt to add a reply with invalid (non-existent) parent_comment_id -> expect 400
        invalid_parent_payload = {
            "event_id": event_id,
            "text": "Invalid reply parent test",
            "parent_comment_id": 9999999999  # Assuming this ID does not exist
        }
        invalid_reply_resp = requests.post(COMMENTS_URL, headers=auth_headers,
                                           data=json.dumps(invalid_parent_payload), timeout=TIMEOUT)
        assert invalid_reply_resp.status_code == 400, f"Expected 400 for invalid parent_comment_id but got {invalid_reply_resp.status_code}"

        # Step 5: Retrieve comments for the event, verify nested replies structure
        # Ordering by created_at ascending to match PRD
        get_comments_resp = requests.get(f"{COMMENTS_URL}?event_id=eq.{event_id}&order=created_at.asc", headers=auth_headers, timeout=TIMEOUT)
        assert get_comments_resp.status_code == 200, f"Failed to retrieve comments: {get_comments_resp.text}"
        comments_list = get_comments_resp.json()
        assert isinstance(comments_list, list), "Comments response is not a list"

        # Validate the root comment and nested reply present
        # Supabase PostgREST does not nest automatically by default, assume flat list
        # We check for presence of both comment and reply, and correct parent_comment_id linking
        found_root = False
        found_reply = False
        for c in comments_list:
            if c.get("id") == comment_id:
                found_root = True
                assert c.get("parent_comment_id") is None, "Root comment has parent_comment_id"
                assert c.get("text") == "This is a root comment for testing."
            if c.get("id") == reply_comment_id:
                found_reply = True
                assert c.get("parent_comment_id") == comment_id, "Reply comment's parent_comment_id mismatch"
                assert c.get("text") == "This is a nested reply."
        assert found_root, "Root comment not found in retrieved comments"
        assert found_reply, "Reply comment not found in retrieved comments"

    finally:
        # Cleanup: delete created comments and event
        # Delete reply comment if created
        if reply_comment_id:
            del_reply_resp = requests.delete(f"{COMMENTS_URL}?id=eq.{reply_comment_id}", headers=auth_headers, timeout=TIMEOUT)
            assert del_reply_resp.status_code in (204, 200), f"Failed to delete reply comment: {del_reply_resp.text}"
        # Delete root comment if created
        if comment_id:
            del_comment_resp = requests.delete(f"{COMMENTS_URL}?id=eq.{comment_id}", headers=auth_headers, timeout=TIMEOUT)
            assert del_comment_resp.status_code in (204, 200), f"Failed to delete root comment: {del_comment_resp.text}"
        # Delete event if created
        if event_id:
            del_event_resp = requests.delete(f"{event_url}?id=eq.{event_id}", headers=auth_headers, timeout=TIMEOUT)
            assert del_event_resp.status_code in (204, 200), f"Failed to delete event: {del_event_resp.text}"

test_add_and_retrieve_nested_comments_with_validation()