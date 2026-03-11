-- =============================================
-- EVENT GALLERY - Fotoğraf Galerisi Tablosu
-- =============================================
-- Her vibe'a birden fazla fotoğraf eklemeyi sağlar.
-- Ana kapak fotoğrafı (events.image) aynen kalır,
-- bu tablo ek galeri fotoğrafları içindir.

CREATE TABLE IF NOT EXISTS event_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index: Etkinlik bazında hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_event_gallery_event_id ON event_gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_event_gallery_user_id ON event_gallery(user_id);

-- =============================================
-- RLS Policies
-- =============================================
ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

-- Eski politikaları temizle (idempotent)
DROP POLICY IF EXISTS "Anyone can view gallery photos" ON event_gallery;
DROP POLICY IF EXISTS "Event owner can insert gallery photos" ON event_gallery;
DROP POLICY IF EXISTS "Photo owner can delete gallery photos" ON event_gallery;

-- Herkes galeri fotoğraflarını görebilir
CREATE POLICY "Anyone can view gallery photos"
  ON event_gallery FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcılar kendi etkinliklerine fotoğraf ekleyebilir
CREATE POLICY "Event owner can insert gallery photos"
  ON event_gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sadece fotoğrafı yükleyen kişi silebilir
CREATE POLICY "Photo owner can delete gallery photos"
  ON event_gallery FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- ÇALIŞTIRMAK İÇİN:
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- =============================================
