-- =============================================
-- GENDER KOLONU EKLENMESİ
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Gender kolonu ekle (eğer yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='gender'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'transgender', 'lesbian', 'gay', 'bisexual_male', 'bisexual_female', 'prefer_not_to_say'));
    
    RAISE NOTICE '✅ Gender kolonu başarıyla eklendi!';
    RAISE NOTICE 'Kullanılabilir seçenekler:';
    RAISE NOTICE '  - male (👨 Erkek)';
    RAISE NOTICE '  - female (👩 Kadın)';
    RAISE NOTICE '  - transgender (⚧️ Transgender/Transseksüel)';
    RAISE NOTICE '  - lesbian (👩‍❤️‍👩 Lezbiyen)';
    RAISE NOTICE '  - gay (👨‍❤️‍👨 Gey)';
    RAISE NOTICE '  - bisexual_male (👨💗💜💙 Biseksüel Erkek)';
    RAISE NOTICE '  - bisexual_female (👩💗💜💙 Biseksüel Kız)';
    RAISE NOTICE '  - prefer_not_to_say (🤐 Belirtmek İstemiyorum)';
  ELSE
    RAISE NOTICE '⚠️ Gender kolonu zaten mevcut.';
    RAISE NOTICE 'Constraint güncellemesi için migration-update-gender-constraint.sql dosyasını kullanın.';
  END IF;
END $$;

-- Mevcut kullanıcılar için default değer (opsiyonel)
-- UPDATE public.users SET gender = 'prefer_not_to_say' WHERE gender IS NULL;
