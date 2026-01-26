-- ============================================
-- USERS TABLOSU RLS DÜZELTMESİ
-- 406 hatası = SELECT policy eksik
-- Bu SQL'i Supabase'de çalıştırın
-- ============================================

-- 1. Users tablosu RLS aktif mi kontrol et
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Tüm eski policy'leri sil
DROP POLICY IF EXISTS "users_select_public" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- 3. YENİ POLICY'LER

-- SELECT: Giriş yapmış herkes tüm kullanıcıları görebilir
CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Anonim kullanıcılar da görebilsin (landing page için)
CREATE POLICY "users_select_anon" ON public.users
    FOR SELECT
    TO anon
    USING (true);

-- INSERT: Kullanıcı kendi profilini oluşturabilir
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- UPDATE: Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- ============================================
-- SONUÇ KONTROLÜ
-- ============================================
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';
