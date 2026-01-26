-- ============================================
-- ARKADAŞ EKLEME 409/23503 HATASI DÜZELTMESİ
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- SORUN: Foreign key hatası - kullanıcı auth.users'da var ama public.users'da yok
-- ÇÖZÜM: auth.users'daki kullanıcıları public.users'a senkronize et

-- =====================
-- ADIM 0: EKSİK KULLANICILARI PUBLIC.USERS'A EKLE (KRİTİK!)
-- =====================

-- auth.users'da olup public.users'da olmayan kullanıcıları ekle
INSERT INTO public.users (id, email, "firstName", "lastName", username, bio, avatar, role, "hasAcceptedTerms", "isProfileComplete")
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'firstName', SPLIT_PART(au.email, '@', 1)) as "firstName",
    COALESCE(au.raw_user_meta_data->>'lastName', '') as "lastName",
    COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
    'Silius''ta yeni bir macera başlıyor...' as bio,
    COALESCE(
        au.raw_user_meta_data->>'avatar',
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || au.id
    ) as avatar,
    'user' as role,
    true as "hasAcceptedTerms",
    false as "isProfileComplete"
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================
-- ADIM 1: MEVCUT POLICY'LERİ KONTROL ET VE GÜNCELLE
-- =====================

-- Önce mevcut policy'leri temizle (YENİ EKLENENLER DAHİL)
DROP POLICY IF EXISTS "friends_select" ON public.friends;
DROP POLICY IF EXISTS "friends_insert" ON public.friends;
DROP POLICY IF EXISTS "friends_delete" ON public.friends;
DROP POLICY IF EXISTS "friends_update" ON public.friends;
DROP POLICY IF EXISTS "friends_select_all" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_own" ON public.friends;
DROP POLICY IF EXISTS "friends_update_own" ON public.friends;
DROP POLICY IF EXISTS "friends_delete_own" ON public.friends;
DROP POLICY IF EXISTS "service_role_all" ON public.friends;
DROP POLICY IF EXISTS "Friends are viewable by everyone" ON public.friends;
DROP POLICY IF EXISTS "Users can insert their own friends" ON public.friends;
DROP POLICY IF EXISTS "Users can delete their own friends" ON public.friends;

-- =====================
-- ADIM 2: YENİ POLICY'LER EKLE (Daha esnek)
-- =====================

-- SELECT: Herkes görebilir (authenticated users)
CREATE POLICY "friends_select_all" ON public.friends
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Kullanıcı kendi adına ekleyebilir
CREATE POLICY "friends_insert_own" ON public.friends
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Kullanıcı kendi kayıtlarını güncelleyebilir (upsert için gerekli)
CREATE POLICY "friends_update_own" ON public.friends
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Kullanıcı kendi eklediğini silebilir
CREATE POLICY "friends_delete_own" ON public.friends
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- ADIM 3: SERVICE ROLE İÇİN BYPASS (Admin işlemleri)
-- =====================

-- Service role için tüm işlemlere izin ver
CREATE POLICY "service_role_all" ON public.friends
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================
-- ADIM 4: UNIQUE CONSTRAINT KONTROL
-- =====================

-- Unique constraint'in doğru olduğundan emin ol
-- Bu zaten fix-friends-final.sql'de yapılmış olmalı
-- Kontrol için:
-- ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_user_id_friend_id_key;
-- ALTER TABLE public.friends ADD CONSTRAINT friends_user_id_friend_id_key UNIQUE (user_id, friend_id);

-- =====================
-- ADIM 5: USERS TABLOSU RLS POLICY'LERİ
-- =====================

-- Önce mevcut policy'leri temizle (YENİ EKLENENLER DAHİL)
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_service_role" ON public.users;
DROP POLICY IF EXISTS "users_anon_select" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- SELECT: Herkes tüm profilleri görebilir
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT
    TO authenticated
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
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role için full access
CREATE POLICY "users_service_role" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Anon users için SELECT (landing page için)
CREATE POLICY "users_anon_select" ON public.users
    FOR SELECT
    TO anon
    USING (true);

-- =====================
-- ADIM 6: NOTIFICATIONS TABLOSU İÇİN AYNI İŞLEMLER
-- =====================

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_service_role" ON public.notifications;

-- SELECT: Kendi bildirimlerini gör
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Herkes bildirim gönderebilir
CREATE POLICY "notifications_insert_all" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE: Kendi bildirimlerini güncelle (okundu işareti vb)
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- DELETE: Kendi bildirimlerini silebilir
CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role için full access
CREATE POLICY "notifications_service_role" ON public.notifications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================
-- İŞLEM TAMAMLANDI!
-- =====================
-- Bu SQL'i çalıştırdıktan sonra:
-- 1. Sayfayı yenileyin (F5)
-- 2. Tekrar arkadaş eklemeyi deneyin
-- 3. Hala sorun varsa Supabase Dashboard > Authentication > Users kısmından
--    kullanıcının auth.users ve public.users'da olduğunu kontrol edin
