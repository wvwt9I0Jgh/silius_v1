-- ============================================
-- ARKADAŞ SİSTEMİ TAM DÜZELTME
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Friends tablosu varsa, yoksa oluştur
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 2. RLS'i etkinleştir
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 3. Tüm eski policy'leri kaldır
DROP POLICY IF EXISTS "Users can insert their own friend relationships" ON public.friends;
DROP POLICY IF EXISTS "Users can view their own friends" ON public.friends;
DROP POLICY IF EXISTS "Users can delete their own friend relationships" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_policy" ON public.friends;
DROP POLICY IF EXISTS "friends_select_policy" ON public.friends;
DROP POLICY IF EXISTS "friends_delete_policy" ON public.friends;
DROP POLICY IF EXISTS "allow_insert_friends" ON public.friends;
DROP POLICY IF EXISTS "allow_select_friends" ON public.friends;
DROP POLICY IF EXISTS "allow_delete_friends" ON public.friends;

-- 4. YENİ POLICY'LER

-- SELECT: Herkes okuyabilir (public profiller)
CREATE POLICY "allow_select_friends" ON public.friends
    FOR SELECT
    USING (true);

-- INSERT: Kullanıcı sadece kendi adına arkadaş ekleyebilir
CREATE POLICY "allow_insert_friends" ON public.friends
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Kullanıcı kendi eklediği arkadaşlıkları silebilir
CREATE POLICY "allow_delete_friends" ON public.friends
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLOSU
-- ============================================

-- 5. Notifications tablosu varsa, yoksa oluştur
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

-- 6. RLS'i etkinleştir
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7. Eski policy'leri kaldır
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
DROP POLICY IF EXISTS "allow_select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "allow_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "allow_update_notifications" ON public.notifications;

-- 8. YENİ NOTIFICATIONS POLICY'LER

-- SELECT: Sadece kendi bildirimlerini görebilir
CREATE POLICY "allow_select_notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Herkes bildirim oluşturabilir (başka kullanıcıya bildirim göndermek için)
CREATE POLICY "allow_insert_notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- UPDATE: Kendi bildirimlerini güncelleyebilir (okundu olarak işaretle)
CREATE POLICY "allow_update_notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- KONTROL
-- ============================================
SELECT 'RLS Policies fixed! Tables ready.' as status;
