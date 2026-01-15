-- =============================================
-- RLS POLICY TAMİR - TÜM TABLOLAR
-- =============================================
-- Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================
-- 1. USERS TABLOSU
-- =============================================
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own" ON public.users;
DROP POLICY IF EXISTS "Admins can do anything" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "public_users_select" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_users_select"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. EVENTS TABLOSU
-- =============================================
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "events_insert"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update"
  ON public.events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "events_delete"
  ON public.events FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. EVENT_PARTICIPANTS TABLOSU (406 HATASINI ÇÖZ)
-- =============================================
DROP POLICY IF EXISTS "Participants are viewable by everyone" ON public.event_participants;
DROP POLICY IF EXISTS "Participants viewable by everyone" ON public.event_participants;
DROP POLICY IF EXISTS "Authenticated users can join events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_select" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_insert" ON public.event_participants;
DROP POLICY IF EXISTS "event_participants_delete" ON public.event_participants;

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_participants_select"
  ON public.event_participants FOR SELECT USING (true);

CREATE POLICY "event_participants_insert"
  ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_participants_delete"
  ON public.event_participants FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. COMMENTS TABLOSU
-- =============================================
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_delete" ON public.comments;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "comments_insert"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete"
  ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 7. KVKK Alanları Ekle (Yoksa)
-- =============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS kvkk_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_consent_date timestamp with time zone;

-- =============================================
-- BAŞARI MESAJI
-- =============================================
SELECT 'RLS POLICY KURULUMU TAMAMLANDI! Tüm tablolar güncellendi.' as status;
