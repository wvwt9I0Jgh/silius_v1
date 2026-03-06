-- =============================================
-- TOPLU MİGRASYON - TÜM EKSİK KOLONLAR
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Tüm eksik kolonları ve constraint'leri ekler

-- =============================================
-- 1. EVENTS TABLOSU - latitude/longitude KOLONLARI
-- =============================================
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Geo index (konuma göre arama için)
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================
-- 2. EVENTS TABLOSU - CATEGORY CHECK CONSTRAINT GÜNCELLE
-- =============================================
-- Eski constraint'i kaldır (varsa)
DO $$
BEGIN
  -- events_category_check constraint'ini bul ve kaldır
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%category%' 
    AND constraint_schema = 'public'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.events DROP CONSTRAINT ' || constraint_name
      FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%category%' 
      AND constraint_schema = 'public'
      LIMIT 1
    );
  END IF;
END $$;

-- Yeni parti kategorileri constraint'ini ekle
ALTER TABLE public.events ADD CONSTRAINT events_category_check 
  CHECK (category IN ('club', 'rave', 'beach', 'house', 'street', 'pub', 'coffee', 'other'));

-- Eski kategorileri yeni kategorilere dönüştür (mevcut veriler için)
UPDATE public.events SET category = 'club' WHERE category = 'party';
UPDATE public.events SET category = 'club' WHERE category = 'social';
UPDATE public.events SET category = 'other' WHERE category = 'study';
UPDATE public.events SET category = 'other' WHERE category = 'sport';
UPDATE public.events SET category = 'other' WHERE category = 'game';

-- =============================================
-- 3. USERS TABLOSU - VIBE SCORE KOLONLARI
-- =============================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalTimeSpent" integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastActiveAt" timestamp with time zone DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "dailyVibeCount" integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastVibeDate" date DEFAULT CURRENT_DATE;

-- Mevcut kullanıcılar için varsayılan değerleri ayarla
UPDATE public.users 
SET 
  "totalTimeSpent" = COALESCE("totalTimeSpent", 0),
  "lastActiveAt" = COALESCE("lastActiveAt", now()),
  "dailyVibeCount" = COALESCE("dailyVibeCount", 0),
  "lastVibeDate" = COALESCE("lastVibeDate", CURRENT_DATE);

-- =============================================
-- 4. EVENT_PARTICIPANTS - CHECK-IN SİSTEMİ
-- =============================================
-- checked_in kolonu (QR okutma durumu)
ALTER TABLE public.event_participants 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;

-- events tablosuna checkin_code ekle (QR doğrulama kodu)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS checkin_code TEXT DEFAULT substring(md5(random()::text) from 0 for 7);

-- UPDATE policy (check-in için gerekli - yoksa checked_in güncellenemez)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Users can update own participation'
  ) THEN
    CREATE POLICY "Users can update own participation"
      ON public.event_participants FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Event sahibi de katılımcıları güncelleyebilsin (QR onaylama)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' 
    AND policyname = 'Event owners can update participants'
  ) THEN
    CREATE POLICY "Event owners can update participants"
      ON public.event_participants FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.events 
          WHERE events.id = event_participants.event_id 
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- =============================================
-- 5. COMMENTS - PARENT_COMMENT_ID (YANIT SİSTEMİ)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

-- =============================================
-- 6. REALTIME - CHECK-IN GÜNCELLEMELERİ İÇİN
-- =============================================
-- event_participants tablosu için realtime aç (UPDATE olaylarını dinlemek için)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'event_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_participants;
  END IF;
END $$;

-- Replica identity full yap ki UPDATE olaylarında old/new verileri gönderilsin
ALTER TABLE public.event_participants REPLICA IDENTITY FULL;

-- =============================================
-- 6. DOĞRULAMA
-- =============================================
-- Events tablosu kontrolü
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
  AND column_name IN ('latitude', 'longitude', 'category')
ORDER BY column_name;

-- Users tablosu kontrolü
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
  AND column_name IN ('totalTimeSpent', 'lastActiveAt', 'dailyVibeCount', 'lastVibeDate')
ORDER BY column_name;

-- Constraint kontrolü
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' AND constraint_name LIKE '%category%';

-- event_participants kontrolü (checked_in kolonu)
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'event_participants' AND table_schema = 'public'
  AND column_name = 'checked_in';

-- RLS policy kontrolü
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'event_participants';
