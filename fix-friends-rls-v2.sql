-- ============================================
-- ARKADAŞ SİSTEMİ GÜNCELLENMİŞ RLS POLİCY'LERİ
-- Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Friends tablosu varsa düzenle, yoksa oluştur
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 2. Index ekle - performans için
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_combo ON public.friends(user_id, friend_id);

-- 3. RLS'i etkinleştir
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 4. Tüm eski policy'leri kaldır (temiz başlangıç)
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'friends' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.friends', pol.policyname);
    END LOOP;
END $$;

-- 5. YENİ BASIT POLICY'LER

-- SELECT: Herkes okuyabilir (arkadaşlıkları görmek için)
CREATE POLICY "friends_select_all" ON public.friends
    FOR SELECT
    USING (true);

-- INSERT: Kullanıcı sadece kendisi için arkadaş ekleyebilir
CREATE POLICY "friends_insert_own" ON public.friends
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Kullanıcı kendi eklediği arkadaşlıkları silebilir
CREATE POLICY "friends_delete_own" ON public.friends
    FOR DELETE
    USING (auth.uid() = user_id);

-- UPDATE: Gerekli değil ama ekleyelim
CREATE POLICY "friends_update_own" ON public.friends
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLOSU GÜNCELLEME
-- ============================================

-- 6. Notifications tablosu
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    event_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Index ekle
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- 8. RLS'i etkinleştir
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9. Eski policy'leri kaldır
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
    END LOOP;
END $$;

-- 10. YENİ NOTIFICATIONS POLICY'LER

-- SELECT: Sadece kendi bildirimlerini görebilir
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Herkes bildirim oluşturabilir (başka kullanıcıya göndermek için)
CREATE POLICY "notifications_insert_any" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- UPDATE: Kendi bildirimlerini güncelleyebilir (okundu işareti)
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- DELETE: Kendi bildirimlerini silebilir
CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- USERS TABLOSU PERFORMANS İYİLEŞTİRMELERİ
-- ============================================

-- 11. Users tablosu indexleri
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- ============================================
-- SONUÇ KONTROLÜ
-- ============================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename IN ('friends', 'notifications')
ORDER BY tablename, policyname;
