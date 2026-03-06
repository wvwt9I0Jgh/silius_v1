-- Migration: Coffee kategorisi ekleme
-- Tarih: 2026-03-05
-- Açıklama: Events tablosuna 'coffee' kategorisi eklenir

-- 1. Eski CHECK constraint'i kaldır
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;

-- 2. Yeni CHECK constraint ekle (coffee dahil)
ALTER TABLE events ADD CONSTRAINT events_category_check 
  CHECK (category IN ('club', 'rave', 'beach', 'house', 'street', 'pub', 'coffee', 'other'));

-- 3. Doğrulama
SELECT DISTINCT category FROM events ORDER BY category;
