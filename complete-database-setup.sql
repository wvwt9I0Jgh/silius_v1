-- =============================================
-- SİLİUS COMMUNITY PLATFORM - KOMPLE DATABASE KURULUMU
-- =============================================
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'da çalıştırın
-- Tek seferde tüm veritabanı yapısını oluşturur

-- =============================================
-- ADIM 1: TEMİZLİK (Eski yapıları sil)
-- =============================================

-- Tabloları sil
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Trigger ve Function'ları sil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =============================================
-- ADIM 2: TABLOLARI OLUŞTUR
-- =============================================

-- 1. USERS TABLOSU
CREATE TABLE public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  username text UNIQUE NOT NULL,
  bio text DEFAULT 'Silius''ta yeni bir macera başlıyor...',
  avatar text,
  gender text CHECK (gender IN ('male', 'female', 'transgender', 'lesbian', 'gay', 'bisexual_male', 'bisexual_female', 'prefer_not_to_say') OR gender IS NULL),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  "hasAcceptedTerms" boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. EVENTS TABLOSU
CREATE TABLE public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  image text NOT NULL,
  category text NOT NULL CHECK (category IN ('party', 'social', 'coffee', 'study', 'sport', 'game', 'other')),
  created_at timestamp with time zone DEFAULT now()
);

-- 3. EVENT_PARTICIPANTS TABLOSU
CREATE TABLE public.event_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 4. COMMENTS TABLOSU
CREATE TABLE public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. FRIENDS TABLOSU
CREATE TABLE public.friends (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- 6. NOTIFICATIONS TABLOSU
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('friend_request', 'event_join', 'event_comment')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  from_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- ADIM 3: ROW LEVEL SECURITY (RLS) AKTİF ET
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ADIM 4: RLS POLICY'LERİ OLUŞTUR
-- =============================================

-- USERS POLICIES
CREATE POLICY "Anyone can view users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- EVENTS POLICIES
CREATE POLICY "Events viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- EVENT_PARTICIPANTS POLICIES
CREATE POLICY "Participants viewable by everyone"
  ON public.event_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join events"
  ON public.event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
  ON public.event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- FRIENDS POLICIES
CREATE POLICY "Friends viewable by everyone"
  ON public.friends FOR SELECT
  USING (true);

CREATE POLICY "Users can add friends"
  ON public.friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends"
  ON public.friends FOR DELETE
  USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- =============================================
-- ADIM 5: OTOMATİK KULLANICI OLUŞTURMA TRİGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    "firstName", 
    "lastName", 
    username, 
    avatar, 
    bio, 
    role
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id::text),
    'Silius''ta yeni bir macera başlıyor...',
    'user'
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ADIM 6: MEVCUT AUTH KULLANICILARI İÇİN PROFİL OLUŞTUR
-- =============================================

INSERT INTO public.users (id, email, "firstName", "lastName", username, avatar, bio, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'firstName', 'User'),
  COALESCE(au.raw_user_meta_data->>'lastName', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || au.id::text),
  'Silius''ta yeni bir macera başlıyor...',
  'user'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- =============================================
-- ADIM 7: İNDEKSLER (Performans İçin)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_event_id ON public.comments(event_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =============================================
-- ADIM 8: STORAGE BUCKET POLICY'LERİ (AVATARS)
-- =============================================
-- Not: Önce Supabase Dashboard > Storage'da "avatars" bucket'ı oluşturun (Public olarak)

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- Yeni policy'ler
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

-- =============================================
-- KURULUM TAMAMLANDI!
-- =============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ ✅ ✅ DATABASE KURULUMU BAŞARIYLA TAMAMLANDI! ✅ ✅ ✅';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Oluşturulan Tablolar:';
  RAISE NOTICE '   1. users (Kullanıcı profilleri + gender alanı)';
  RAISE NOTICE '   2. events (Etkinlikler)';
  RAISE NOTICE '   3. event_participants (Katılımcılar)';
  RAISE NOTICE '   4. comments (Yorumlar)';
  RAISE NOTICE '   5. friends (Arkadaşlıklar)';
  RAISE NOTICE '   6. notifications (Bildirimler)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 RLS Policy''leri aktif';
  RAISE NOTICE '⚡ Trigger''lar kurulu';
  RAISE NOTICE '📦 İndeksler oluşturuldu';
  RAISE NOTICE '';
  RAISE NOTICE '🎨 Cinsiyet Seçenekleri:';
  RAISE NOTICE '   - male (👨 Erkek)';
  RAISE NOTICE '   - female (👩 Kadın)';
  RAISE NOTICE '   - transgender (⚧️ Transgender)';
  RAISE NOTICE '   - lesbian (👩‍❤️‍👩 Lezbiyen)';
  RAISE NOTICE '   - gay (👨‍❤️‍👨 Gey)';
  RAISE NOTICE '   - bisexual_male (👨💗💜💙 Biseksüel Erkek)';
  RAISE NOTICE '   - bisexual_female (👩💗💜💙 Biseksüel Kız)';
  RAISE NOTICE '   - prefer_not_to_say (🤐 Belirtmek İstemiyorum)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ ÖNEMLİ: Storage > avatars bucket''ı manuel oluşturmanız gerekiyor!';
  RAISE NOTICE '   1. Supabase Dashboard > Storage''a gidin';
  RAISE NOTICE '   2. "New Bucket" > "avatars" adıyla oluşturun';
  RAISE NOTICE '   3. "Public bucket" seçeneğini işaretleyin';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Artık uygulamanızı kullanmaya başlayabilirsiniz!';
END $$;
