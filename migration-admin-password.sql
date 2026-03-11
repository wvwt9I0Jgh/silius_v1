-- ============================================================
-- Admin password stored securely in database
-- Hash is NEVER exposed to the frontend via this setup:
--   1. app_config has RLS enabled with no SELECT policy
--   2. verify_admin_password() runs as SECURITY DEFINER
--      so it can read the table but clients cannot
-- ============================================================

-- Create config table
CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Enable RLS — no SELECT policy means no direct reads by clients
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Insert admin password hash (SHA-256)
-- To change the password, run:
--   SELECT encode(digest('YENİ_ŞİFRE', 'sha256'), 'hex');
-- then update the value below and re-run this INSERT.
INSERT INTO app_config (key, value)
VALUES ('admin_password_hash', '9361600728314f6dfd1ccd96896e1f85a197e908db856af3b14b48ac0e8266fc')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- RPC function: takes the SHA-256 hash of what the user typed,
-- compares it to the stored hash, returns only true/false.
-- SECURITY DEFINER = runs as table owner, bypassing RLS.
CREATE OR REPLACE FUNCTION verify_admin_password(input_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT value INTO stored_hash
  FROM app_config
  WHERE key = 'admin_password_hash';

  RETURN stored_hash IS NOT NULL AND stored_hash = input_hash;
END;
$$;

-- Allow anon and authenticated roles to call the function
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT) TO anon, authenticated;
