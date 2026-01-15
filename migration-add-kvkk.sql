-- KVKK Consent Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Users tablosuna KVKK consent alanları ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS kvkk_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_consent_date timestamp with time zone;

-- Mevcut kullanıcılar için varsayılan olarak true yap (geriye dönük uyumluluk)
UPDATE public.users 
SET kvkk_consent = true, 
    kvkk_consent_date = created_at 
WHERE kvkk_consent IS NULL OR kvkk_consent = false;

-- Yeni kayıtlar için zorunlu kıl
ALTER TABLE public.users 
ALTER COLUMN kvkk_consent SET NOT NULL;

COMMENT ON COLUMN public.users.kvkk_consent IS 'KVKK aydınlatma metninin okunup onaylandığını belirtir';
COMMENT ON COLUMN public.users.kvkk_consent_date IS 'KVKK onay tarihi';
