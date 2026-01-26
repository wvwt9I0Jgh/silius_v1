-- ============================================
-- TÜM RLS DÜZELTMELERİ - TEK DOSYA
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- =====================
-- 1. USERS TABLOSU
-- =====================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Eski policy'leri sil
DROP POLICY IF EXISTS "users_select_public" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_anon" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Yeni policy'ler
CREATE POLICY "users_select_authenticated" ON public.users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_select_anon" ON public.users
    FOR SELECT TO anon USING (true);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =====================
-- 2. FRIENDS TABLOSU
-- =====================

-- Tabloyu sil ve yeniden oluştur
DROP TABLE IF EXISTS public.friends CASCADE;

CREATE TABLE public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friends_user ON public.friends(user_id);
CREATE INDEX idx_friends_friend ON public.friends(friend_id);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select" ON public.friends
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "friends_insert" ON public.friends
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friends_delete" ON public.friends
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- 3. NOTIFICATIONS TABLOSU
-- =====================

DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
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

CREATE INDEX idx_notifications_user ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =====================
-- SONUÇ
-- =====================
SELECT 'TÜM RLS DÜZELTMELERİ TAMAMLANDI!' as status;
