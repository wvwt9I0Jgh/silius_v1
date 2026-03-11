-- ============================================================
-- SİLİUS BACKEND BUG FIX - TÜM DÜZELTMELER
-- TestSprite Backend Test Raporu Sonuçları (2026-03-08)
-- ============================================================
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'da çalıştırın
-- 4 adet bug düzeltmesi içerir
-- ============================================================


-- ============================================================
-- BUG-B01: Users tablosu email + kişisel verileri
--          anonim kullanıcılara açık gösteriyor (KVKK ihlali)
-- ============================================================

-- Tablo erişim yetkilerini koru (select=* için gerekli)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;

-- NOT: PostgreSQL column-level REVOKE PostgREST ile uyumsuz —
-- select=* sorgularını tüm tablolarda (events dahil) 400 ile kırıyor.
-- Bunun yerine RLS politikası ile email dahil tüm veriyi
-- sadece authenticated kullanıcılara açıyoruz.

-- Eski permissive politikaları temizle
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "users_select_anon" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_public" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Sadece giriş yapmış kullanıcılar profilleri görebilir (email dahil)
-- Anonim ziyaretçiler: 200 [] (boş array — veri sızıntısı yok)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- BUG-B02: KVKK onayı backend'de doğrulanmıyor
--          API üzerinden consent olmadan kayıt olunabiliyor
-- ============================================================

-- 1. kvkk_consent ve kvkk_consent_date sütunları yoksa ekle
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS kvkk_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS kvkk_consent_date timestamp with time zone;

-- 2. handle_new_user trigger'ını güncelle — KVKK kontrolü ekle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _kvkk boolean;
BEGIN
  -- Signup metadata'dan kvkkConsent değerini al
  _kvkk := COALESCE((new.raw_user_meta_data->>'kvkkConsent')::boolean, false);
  
  -- KVKK onayı yoksa kullanıcı kaydını engelle
  IF NOT _kvkk THEN
    RAISE EXCEPTION 'KVKK onayı zorunludur. Kayıt reddedildi.'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.users (
    id, 
    email, 
    "firstName", 
    "lastName", 
    username, 
    avatar, 
    bio, 
    role,
    "hasAcceptedTerms",
    kvkk_consent,
    kvkk_consent_date
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id::text),
    'Silius''ta yeni bir macera başlıyor...',
    'user',
    true,
    true,
    now()
  );
  RETURN new;
EXCEPTION
  WHEN check_violation THEN
    -- KVKK ihlali → auth.users kaydı da geri alınır (transaction rollback)
    RAISE;
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Trigger zaten var, fonksiyon güncellendi — trigger otomatik yeni fonksiyonu kullanır


-- ============================================================
-- BUG-B03: Events INSERT'te user_id client'tan doğru
--          gönderilmezse RLS 403 hatası veriyor
-- ============================================================

-- NOT: auto_set_user_id trigger yaklaşımı kullanılmıyor.
-- SECURITY DEFINER triggerda auth.uid() NULL döner → user_id NOT NULL ihlali → 400 hatası.
-- Frontend zaten user_id'yi doğru gönderiyor, RLS yeterli.
-- Eğer daha önce bu triggerlar oluşturulduysa temizle:
DROP TRIGGER IF EXISTS events_auto_set_user_id ON public.events;
DROP TRIGGER IF EXISTS participants_auto_set_user_id ON public.event_participants;
DROP TRIGGER IF EXISTS comments_auto_set_user_id ON public.comments;
DROP TRIGGER IF EXISTS friends_auto_set_user_id ON public.friends;
DROP FUNCTION IF EXISTS public.auto_set_user_id();


-- ============================================================
-- BUG-B04: Friends RLS politikaları çakışıyor
--          Birden fazla migration dosyası birbiriyle çelişiyor
-- ============================================================

-- Tüm eski friends politikalarını temizle
DROP POLICY IF EXISTS "friends_insert" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_own" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_policy" ON public.friends;
DROP POLICY IF EXISTS "allow_insert_friends" ON public.friends;
DROP POLICY IF EXISTS "Users can add friends" ON public.friends;
DROP POLICY IF EXISTS "Users can insert their own friends" ON public.friends;
DROP POLICY IF EXISTS "Users can insert their own friend relationships" ON public.friends;

DROP POLICY IF EXISTS "friends_select" ON public.friends;
DROP POLICY IF EXISTS "friends_select_own" ON public.friends;
DROP POLICY IF EXISTS "Friends viewable by everyone" ON public.friends;

DROP POLICY IF EXISTS "friends_delete" ON public.friends;
DROP POLICY IF EXISTS "friends_delete_own" ON public.friends;
DROP POLICY IF EXISTS "Users can remove friends" ON public.friends;
DROP POLICY IF EXISTS "Users can delete their own friend relationships" ON public.friends;

-- RLS aktif olduğundan emin ol
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Oluşturulacak politikalar zaten varsa temizle (idempotent)
DROP POLICY IF EXISTS "friends_select_all" ON public.friends;
DROP POLICY IF EXISTS "friends_insert_own" ON public.friends;
DROP POLICY IF EXISTS "friends_delete_own" ON public.friends;

-- Tek ve net politikalar
CREATE POLICY "friends_select_all" ON public.friends
  FOR SELECT USING (true);

CREATE POLICY "friends_insert_own" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friends_delete_own" ON public.friends
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- BUG-B05: Events tablosunda latitude/longitude kolonları eksik
--          migration-add-location-coords.sql hiç çalıştırılmamış
--          → PGRST204: Could not find the 'latitude' column
-- ============================================================

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_events_location 
  ON public.events (latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;


-- ============================================================
-- BUG-B06: event_participants tablosunda checked_in kolonu eksik
--          migration-add-checkin.sql hiç çalıştırılmamış
--          → PGRST204: Could not find the 'checked_in' column
--          → getLiveParticipantCount her event için 400 veriyor
-- ============================================================

ALTER TABLE public.event_participants 
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;

ALTER TABLE public.event_participants 
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;


-- ============================================================
-- SCHEMA CACHE YENİLE (önemli!)
-- Column-level privilege değişikliğinden sonra PostgREST
-- schema cache'ini yenilemesi gerekir, yoksa 400 hataları oluşur
-- ============================================================
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- DOĞRULAMA: Politikaları listele
-- ============================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'events', 'friends', 'notifications')
ORDER BY tablename, policyname;
