-- ============================================
-- VERİTABANI KONTROL VE DÜZELTME
-- Bu SQL'i Supabase'de çalıştırın
-- ============================================

-- 1. ÖNCE KONTROL: Kullanıcı public.users'da var mı?
SELECT 
    'USERS TABLOSU KONTROLÜ:' as info,
    COUNT(*) as toplam_kullanici
FROM public.users;

-- 2. Bu ID'li kullanıcı var mı?
SELECT * FROM public.users WHERE id = 'c5cc6e90-70a0-425a-b0b6-8969b8146420';

-- 3. RLS POLICY KONTROLÜ
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('users', 'friends', 'notifications')
ORDER BY tablename;

-- ============================================
-- EĞER USERS TABLOSU BOŞSA VEYA POLICY YOKSA:
-- ============================================

-- 4. Users tablosu policy'leri (varsa hata verir, yoksa oluşturur)
DO $$
BEGIN
    -- SELECT policy kontrol
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public' AND cmd = 'SELECT'
    ) THEN
        EXECUTE 'CREATE POLICY "allow_select_users" ON public.users FOR SELECT USING (true)';
        RAISE NOTICE 'Users SELECT policy oluşturuldu';
    ELSE
        RAISE NOTICE 'Users SELECT policy zaten var';
    END IF;
END
$$;

-- 5. Friends tablosu policy'leri
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friends' AND schemaname = 'public' AND cmd = 'SELECT'
    ) THEN
        EXECUTE 'CREATE POLICY "allow_select_friends" ON public.friends FOR SELECT USING (true)';
        RAISE NOTICE 'Friends SELECT policy oluşturuldu';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'friends' AND schemaname = 'public' AND cmd = 'INSERT'
    ) THEN
        EXECUTE 'CREATE POLICY "allow_insert_friends" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id)';
        RAISE NOTICE 'Friends INSERT policy oluşturuldu';
    END IF;
END
$$;

-- ============================================
-- SONUÇ
-- ============================================
SELECT 'KONTROL TAMAMLANDI - Yukarıdaki sonuçları kontrol edin' as status;
