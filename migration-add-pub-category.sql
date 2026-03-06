-- Migration: Add 'pub' to event category constraint
-- Run this in Supabase SQL Editor

-- 1. Drop the old CHECK constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;

-- 2. Add the new CHECK constraint with 'pub' included
ALTER TABLE events ADD CONSTRAINT events_category_check 
  CHECK (category IN ('club', 'rave', 'beach', 'house', 'street', 'pub', 'coffee', 'other'));
