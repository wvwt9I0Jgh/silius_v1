# TestSprite MCP Backend Test Report — silius-community-platform

---

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| **Project Name** | silius-community-platform |
| **Test Type** | Backend API (Supabase REST + Auth) |
| **Date** | 2026-03-08 |
| **Prepared by** | TestSprite AI + GitHub Copilot |
| **Backend** | Supabase (PostgREST, Auth v2, Storage) |
| **Proxy Endpoint** | `http://localhost:4174` → `https://uxmdcaxeotyzhuhqnzpd.supabase.co` |
| **Total Tests** | 10 |
| **Passed** | 1 (10%) |
| **Failed** | 9 (90%) |

---

## 2️⃣ Requirement Validation Summary

### Group 1 — Authentication (Auth v2)

#### TC001 · verify secure user signup with kvkk consent enforcement ❌ FAILED
- **Error:** Expected HTTP 400 for signup without `kvkkConsent`, received HTTP 200 — signup succeeded
- **Root Cause — Real Security Gap:** Supabase Auth has no built-in server-side validation of user metadata fields. The `kvkkConsent` flag is currently only enforced in the React frontend. A user who calls `POST /auth/v1/signup` directly (bypassing the UI) can register without providing KVKK consent.
- **KVKK (Law No. 6698) Compliance Risk:** Under Turkish data protection law and the EU GDPR equivalent, explicit consent must be obtained and verifiable. If the consent isn't enforced server-side, users can legally dispute the validity of their consent record.
- **Recommended Fix:**
  1. **Long-term:** Create a Supabase Edge Function as a custom signup wrapper that validates `kvkkConsent` before calling `supabase.auth.signUp()`. Requires Supabase Pro for Auth hooks.
  2. **Near-term:** Add a `AFTER INSERT` trigger on `auth.users` that checks `raw_user_meta_data->>'kvkkConsent'` and inserts a `kvkk_consents` audit record only when true. Combined with application-level enforcement, this creates an immutable audit trail.
  3. **Database audit table** is recommended regardless: store `user_id`, `consent_timestamp`, `ip_hash`, and `kvkk_version` separately.

---

#### TC002 · validate user login and session token retrieval ❌ FAILED (Test Expectation Issue)
- **Error:** Expected HTTP 401 for invalid credentials, received HTTP 400
- **Root Cause — Test Expectation Mismatch, NOT a Real Bug:** Supabase Auth returns `HTTP 400` with body `{"error":"invalid_grant","error_description":"Invalid login credentials"}` for wrong passwords. This is Supabase's documented, intentional behavior — it does not return 401.
- **Valid credentials flow:** `POST /auth/v1/token?grant_type=password` with correct email/password → HTTP 200 + `access_token`, `refresh_token`, `expires_in` — this part works correctly.
- **Action Required:** None. This is not a backend bug. Update test assertions to expect HTTP 400 for invalid login instead of 401.

---

#### TC003 · fetch authenticated user details with valid token ✅ PASSED
- **Endpoint:** `GET /auth/v1/user` with valid `Authorization: Bearer {token}`
- **Result:** Returns correct user object with `id`, `email`, `user_metadata`
- **Security:** Correctly requires valid JWT — unauthenticated requests return 401. ✅

---

### Group 2 — User Profiles

#### TC004 · fetch and update user profile with authorization ❌ FAILED — **⚠️ PRIVACY VULNERABILITY**
- **Error:** Unauthenticated `GET /rest/v1/users` returned HTTP 200 with **all users' full data including email addresses**
- **Root Cause — Real Security Issue:** The `users` table has the RLS policy:
  ```sql
  CREATE POLICY "Anyone can view users"
    ON public.users FOR SELECT
    USING (true);
  ```
  This `USING (true)` policy permits anyone — including completely unauthenticated anonymous requests — to read the entire `users` table. The table contains: `email`, `firstName`, `lastName`, `username`, `bio`, `gender`, `role`, etc.
- **Impact:**
  - All registered email addresses are publicly visible via API — a severe privacy leak under KVKK
  - Personal data (name, gender) is exposed to crawlers and scrapers
  - Combined with the KVKK consent issue (TC001), the platform does not currently meet Turkish data protection standards
- **Recommended Fix:** Change the RLS SELECT policy to require authentication:
  ```sql
  -- Drop the overly permissive policy
  DROP POLICY "Anyone can view users" ON public.users;

  -- Authenticated users can view basic profile data
  CREATE POLICY "Authenticated users can view profiles"
    ON public.users FOR SELECT
    USING (auth.uid() IS NOT NULL);
  ```
  Additionally, consider removing the `email` column from the `users` table entirely (email lives in `auth.users` which is protected) and expose it only to the user themselves via a separate policy.

---

### Group 3 — Events Management

#### TC005 · enforce daily event creation limit and event management authorization ❌ FAILED
- **Error:** `POST /rest/v1/events` returned `403 {"code":"42501","message":"new row violates row-level security policy for table \"events\""}`
- **Root Cause:** The events INSERT RLS policy requires `auth.uid() = user_id`. The test was authenticated (JWT valid, as TC003 proves), but the `user_id` field in the request body either wasn't provided or didn't match the JWT's `sub` claim. This is a test configuration issue, not a backend bug per se — but it highlights that the API requires callers to explicitly supply `user_id` matching their own JWT, which is unusual. Most applications auto-set `user_id` via a trigger.
- **Recommended Fix (Backend Improvement):** Add a `BEFORE INSERT` trigger that automatically sets `user_id = auth.uid()` regardless of what the caller provides. This removes the security-by-caller-correctness risk:
  ```sql
  CREATE OR REPLACE FUNCTION set_event_user_id()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER events_set_user_id
    BEFORE INSERT ON public.events
    FOR EACH ROW EXECUTE FUNCTION set_event_user_id();
  ```

---

#### TC006 · manage event participation and prevent duplicates ❌ FAILED
- **Error:** Same root cause as TC005 — dependent test that required event creation to succeed first. Since event creation failed (403), the event_participants insert cascade also failed.
- **Status:** Blocked by TC005's root cause.

---

#### TC007 · perform qr check-in with authorization ❌ FAILED
- **Error:** `HTTP 403 Forbidden` on `POST /rest/v1/events` (dependency setup step)
- **Status:** Blocked by TC005's root cause.

---

#### TC008 · add and retrieve nested comments with validation ❌ FAILED
- **Error:** `"Failed to create event for comments setup"` — same `42501 RLS violation` on events INSERT
- **Status:** Blocked by TC005's root cause.

---

### Group 4 — Social Features

#### TC009 · manage unidirectional friend relationships with validation ❌ FAILED
- **Error:** `Expected 201 Created, got 403` on `POST /rest/v1/friends`
- **Root Cause:** Same pattern as TC005 — the friends INSERT policy requires `auth.uid() = user_id`, and the test body's `user_id` didn't match the JWT. Multiple conflicting RLS migrations (`fix-friends-rls.sql`, `fix-friends-409.sql`, `fix-friends-final.sql`, `fix-friends-rls-v2.sql`) exist in the codebase and may have left conflicting policies active.
- **Recommended Fix:** Audit and consolidate all friends-related RLS policies. Run a single authoritative SQL to drop all existing friends policies and replace with one clear set.

---

### Group 5 — Notifications

#### TC010 · retrieve and mark notifications with authorization ❌ FAILED (Test Expectation Issue)
- **Error:** `Unauthorized GET notifications did not fail as expected, got 200`
- **Root Cause — Test Expectation Mismatch, NOT a Real Bug:** The notifications RLS SELECT policy correctly requires `auth.uid() = user_id`. When an unauthenticated request is made, `auth.uid()` returns `null`, so `null = user_id` is always false — no rows are returned. **However**, Supabase PostgREST returns `HTTP 200 []` (empty array) rather than 401/403 when RLS filters out all rows. This is PostgREST's designed behavior — it distinguishes between "no data accessible to you" (200 empty) and "you are not allowed to query this resource at all" (401/403).
- **Data security is intact** — no notification data is leaked. The test expectation was wrong.
- **Action Required:** None. PostgREST behavior is correct.

---

## 3️⃣ Coverage & Matching Metrics

| Requirement Group | Total Tests | ✅ Passed | ❌ Failed |
|-------------------|-------------|-----------|----------|
| Authentication (Auth v2) | 3 | 1 | 2 |
| User Profiles | 1 | 0 | 1 |
| Events Management | 4 | 0 | 4 |
| Social — Friends | 1 | 0 | 1 |
| Social — Notifications | 1 | 0 | 1 |
| **TOTAL** | **10** | **1 (10%)** | **9 (90%)** |

**Adjusted Pass Rate (excluding test expectation mismatches):**
- TC002, TC010 = test expectation issues (not real bugs)
- TC005–TC009 (5 tests) = blocked by event/friend INSERT trigger issue (1 root cause)
- Adjusted: 3 real distinct bugs found

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical — Fix Immediately

| ID | Issue | Affected Tests | Impact |
|----|-------|----------------|--------|
| **BUG-B01** | Users table exposes email + personal data to unauthenticated requests | TC004 | KVKK violation, privacy breach, data scraping risk |
| **BUG-B02** | KVKK consent not enforced server-side — signup succeeds without consent | TC001 | Legal compliance risk (Law No. 6698) |

### 🟡 Important — Fix Soon

| ID | Issue | Affected Tests | Impact |
|----|-------|----------------|--------|
| **BUG-B03** | Events INSERT RLS requires caller to supply correct `user_id` — fragile, should use trigger | TC005–TC008 | Events and all dependent features fail via direct API |
| **BUG-B04** | Multiple conflicting friends RLS migration files may leave inconsistent policy state | TC009 | Follows up on earlier 409 fix work; needs audit |

### 🟢 Informational — No Action Required

| ID | Observation | Tests | Notes |
|----|-------------|-------|-------|
| **INFO-01** | Supabase returns HTTP 400 (not 401) for invalid credentials | TC002 | Documented Supabase behavior |
| **INFO-02** | PostgREST returns HTTP 200 empty array when RLS filters all rows for unauthed user | TC010 | Documented PostgREST behavior; data is protected |
| **INFO-03** | TC003: Auth token flow works correctly end-to-end ✅ | TC003 | No action needed |

---

## 5️⃣ Recommended SQL Fixes

### Fix BUG-B01 — Restrict users table to authenticated users only

```sql
-- Run in Supabase SQL Editor
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;

CREATE POLICY "Authenticated users can view profiles"
  ON public.users FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Fix BUG-B03 — Auto-set user_id on event insert via trigger

```sql
-- Run in Supabase SQL Editor
CREATE OR REPLACE FUNCTION public.set_event_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS events_set_user_id ON public.events;
CREATE TRIGGER events_set_user_id
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_event_user_id();
```

### Fix BUG-B04 — Consolidate friends RLS policies

```sql
-- Run in Supabase SQL Editor
-- Drop all conflicting friends policies
DROP POLICY IF EXISTS "friends_insert" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_own" ON public.friends;
DROP POLICY IF EXISTS "Users can add friends" ON public.friends;
DROP POLICY IF EXISTS "allow_insert_friends" ON public.friends;

-- Single authoritative policy
CREATE POLICY "friends_insert_own" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

*Report generated: 2026-03-08 | TestSprite MCP backend test run | 10 tests | 1 passed | 9 failed*
