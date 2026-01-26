-- Google OAuth ve Profil Tamamlama için Migration
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- 1. Users tablosuna age (yaş) sütunu ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS age INTEGER;

-- 2. Users tablosuna isProfileComplete sütunu ekle
-- YENİ KULLANICILAR için default = false (ProfileSetup'a yönlendirilecek)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS "isProfileComplete" BOOLEAN DEFAULT false;

-- 3. MEVCUT kullanıcıları true olarak ayarla (onlar zaten kayıtlı, tekrar form çıkmasın)
UPDATE public.users 
SET "isProfileComplete" = true 
WHERE "isProfileComplete" IS NULL OR "isProfileComplete" = false;

-- 4. Yaş için kontrol ekle (18-30 arası) - eğer yoksa
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_age'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT check_age CHECK (age IS NULL OR (age >= 18 AND age <= 30));
    END IF;
END $$;

-- 5. Yeni kullanıcı oluşturulduğunda isProfileComplete = false olarak ayarla (trigger)
-- Bu sayede hem normal kayıt hem Google OAuth için çalışır
CREATE OR REPLACE FUNCTION set_profile_incomplete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."isProfileComplete" IS NULL THEN
        NEW."isProfileComplete" := false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı oluştur (varsa güncelle)
DROP TRIGGER IF EXISTS set_profile_incomplete_trigger ON public.users;
CREATE TRIGGER set_profile_incomplete_trigger
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION set_profile_incomplete();

-- İşlem tamamlandı!
SELECT 'Migration completed successfully! Yeni kullanıcılar artık ProfileSetup sayfasını görecek.' as status;
