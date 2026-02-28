
-- Add checked_in column to event_participants
ALTER TABLE public.event_participants 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;

-- Add checking_secret to events to prevent random guessing of check-in URLs
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS checkin_code TEXT DEFAULT substring(md5(random()::text) from 0 for 7);
