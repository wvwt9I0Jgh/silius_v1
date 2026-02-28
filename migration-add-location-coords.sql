-- Migration: Add latitude and longitude columns to events table
-- Run this in Supabase SQL Editor
-- 
-- Bu migration, vibe/etkinliklere Google Maps konum desteği ekler.
-- Kullanıcılar yazılı adres girmenin yanı sıra isteğe bağlı olarak
-- harita üzerinden de konum seçebilirler.

-- Add latitude column (isteğe bağlı - kullanıcı harita konumu girmeyebilir)
ALTER TABLE events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

-- Add longitude column (isteğe bağlı - kullanıcı harita konumu girmeyebilir)
ALTER TABLE events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add comment for documentation
COMMENT ON COLUMN events.latitude IS 'Vibe konumu - Google Maps latitude koordinatı (isteğe bağlı)';
COMMENT ON COLUMN events.longitude IS 'Vibe konumu - Google Maps longitude koordinatı (isteğe bağlı)';
COMMENT ON COLUMN events.location IS 'Vibe yazılı adresi - kullanıcının girdiği metin (zorunlu)';

-- Create index for geo queries (optional, for future proximity searches)
CREATE INDEX IF NOT EXISTS idx_events_location ON events (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
