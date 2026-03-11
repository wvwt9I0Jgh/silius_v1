-- =============================================
-- TÜM EKSİK KOLONLARI EKLE - TEK SEFERDE ÇALIŞTIRIN
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın.
-- Eksik tüm kolonları ekler, varsa atlar.

-- ==================== USERS TABLOSU ====================

-- Profil tamamlama
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "isProfileComplete" BOOLEAN DEFAULT false;

-- KVKK
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kvkk_consent BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kvkk_consent_date TIMESTAMP WITH TIME ZONE;

-- Vibe Score sistemi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "totalTimeSpent" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "dailyVibeCount" INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastVibeDate" DATE DEFAULT CURRENT_DATE;

-- Mevcut kullanıcılar için profil tamamlanmış say
UPDATE public.users SET "isProfileComplete" = true WHERE "isProfileComplete" IS NULL;
UPDATE public.users SET kvkk_consent = true, kvkk_consent_date = created_at WHERE kvkk_consent IS NULL;

-- ==================== EVENTS TABLOSU ====================

-- Konum koordinatları
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Check-in kodu
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS checkin_code TEXT DEFAULT substring(md5(random()::text) from 0 for 7);

-- ==================== EVENT_PARTICIPANTS TABLOSU ====================

-- Check-in durumu
ALTER TABLE public.event_participants ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;

-- ==================== COMMENTS TABLOSU ====================

-- Nested yorumlar
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- ==================== EVENT_GALLERY TABLOSU ====================

CREATE TABLE IF NOT EXISTS public.event_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==================== RLS POLİCY'LERİ ====================

-- Event participants UPDATE policy (check-in için gerekli)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_participants' AND policyname = 'Users can update own participation'
  ) THEN
    CREATE POLICY "Users can update own participation"
      ON public.event_participants FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Event gallery RLS
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_gallery' AND policyname = 'Gallery viewable by everyone'
  ) THEN
    CREATE POLICY "Gallery viewable by everyone" ON public.event_gallery FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_gallery' AND policyname = 'Users can add gallery photos'
  ) THEN
    CREATE POLICY "Users can add gallery photos" ON public.event_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_gallery' AND policyname = 'Users can delete own gallery photos'
  ) THEN
    CREATE POLICY "Users can delete own gallery photos" ON public.event_gallery FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Doğrulama
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
