-- =============================================
-- GENDER CONSTRAINT GÜNCELLENMESİ
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Mevcut gender kolonunun constraint'ini genişletiyor

-- Eski constraint'i kaldır
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_gender_check;

-- Yeni genişletilmiş constraint ekle
ALTER TABLE public.users 
ADD CONSTRAINT users_gender_check 
CHECK (gender IN ('male', 'female', 'transgender', 'lesbian', 'gay', 'bisexual_male', 'bisexual_female', 'prefer_not_to_say'));

-- Başarılı mesajı
DO $$ 
BEGIN
  RAISE NOTICE '✅ Gender constraint başarıyla güncellendi!';
  RAISE NOTICE 'Artık 8 farklı seçenek mevcut:';
  RAISE NOTICE '  - male (Erkek)';
  RAISE NOTICE '  - female (Kadın)';
  RAISE NOTICE '  - transgender (Transgender/Transseksüel)';
  RAISE NOTICE '  - lesbian (Lezbiyen)';
  RAISE NOTICE '  - gay (Gey)';
  RAISE NOTICE '  - bisexual_male (Biseksüel Erkek)';
  RAISE NOTICE '  - bisexual_female (Biseksüel Kız)';
  RAISE NOTICE '  - prefer_not_to_say (Belirtmek İstemiyorum)';
END $$;
