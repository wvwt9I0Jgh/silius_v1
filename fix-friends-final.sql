-- ============================================
-- ARKADAŞ SİSTEMİ DÜZELTMESİ - FOREIGN KEY FIX
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- SORUN: friends tablosu auth.users'a referans veriyor
-- ama kullanıcılar public.users tablosunda
-- ÇÖZÜM: Foreign key'leri public.users'a yönlendir

-- =====================
-- ADIM 1: ESKİ TABLOYU SİL VE YENİDEN OLUŞTUR
-- =====================

-- Önce eski tabloyu sil (varsa)
DROP TABLE IF EXISTS public.friends CASCADE;

-- Yeni tablo oluştur - DOĞRU REFERANS: public.users
CREATE TABLE public.friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    -- Doğru foreign key: public.users tablosuna
    CONSTRAINT friends_user_fk FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT friends_friend_fk FOREIGN KEY (friend_id) 
        REFERENCES public.users(id) ON DELETE CASCADE
);

-- Index'ler
CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);

-- =====================
-- ADIM 2: RLS AKTİF ET VE POLICY'LER EKLE
-- =====================

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- SELECT: Herkes görebilir
CREATE POLICY "friends_select" ON public.friends
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Kullanıcı kendi adına ekleyebilir
CREATE POLICY "friends_insert" ON public.friends
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Kullanıcı kendi eklediğini silebilir
CREATE POLICY "friends_delete" ON public.friends
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- ADIM 3: NOTIFICATIONS TABLOSU (Aynı düzeltme)
-- =====================

DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    from_user_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    event_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Doğru foreign key: public.users tablosuna
    CONSTRAINT notifications_user_fk FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT notifications_from_user_fk FOREIGN KEY (from_user_id) 
        REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: Kendi bildirimlerini gör
CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Herkes bildirim gönderebilir
CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE: Kendi bildirimlerini güncelle
CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- DELETE: Kendi bildirimlerini sil
CREATE POLICY "notifications_delete" ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================
-- SONUÇ
-- =====================
SELECT 'FOREIGN KEY VE RLS DÜZELTME TAMAMLANDI!' as status;
