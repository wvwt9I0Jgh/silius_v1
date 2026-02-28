-- =============================================
-- VIBE SCORE SİSTEMİ - VERİTABANI GÜNCELLEMESİ
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Users tablosuna vibe score için gerekli sütunları ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "totalTimeSpent" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastActiveAt" timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS "dailyVibeCount" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastVibeDate" date DEFAULT CURRENT_DATE;

-- 2. Mevcut kullanıcılar için varsayılan değerleri ayarla
UPDATE public.users 
SET 
  "totalTimeSpent" = COALESCE("totalTimeSpent", 0),
  "lastActiveAt" = COALESCE("lastActiveAt", now()),
  "dailyVibeCount" = COALESCE("dailyVibeCount", 0),
  "lastVibeDate" = COALESCE("lastVibeDate", CURRENT_DATE);

-- 3. Sütunların eklendiğini doğrula
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('totalTimeSpent', 'lastActiveAt', 'dailyVibeCount', 'lastVibeDate');
