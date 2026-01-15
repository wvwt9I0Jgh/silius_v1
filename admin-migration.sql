-- =============================================
-- ADMIN PANELİ VE YENİ ÖZELLİKLER MİGRASYONU
-- =============================================
-- Bu SQL dosyasını Supabase Dashboard > SQL Editor'da çalıştırın

-- =============================================
-- 1. BANNED USERS TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS public.banned_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  banned_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text,
  banned_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  UNIQUE(user_id)
);

-- =============================================
-- 2. BANNED IPS TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS public.banned_ips (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  banned_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text,
  banned_at timestamp with time zone DEFAULT now(),
  UNIQUE(ip_address)
);

-- =============================================
-- 3. CMS PAGES TABLOSU
-- =============================================
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  is_published boolean DEFAULT false,
  show_in_menu boolean DEFAULT false,
  menu_order integer DEFAULT 0,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- 4. CMS MODULES TABLOSU (Gelişmiş Modül Tipleri)
-- =============================================
CREATE TABLE IF NOT EXISTS public.cms_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id uuid REFERENCES public.cms_pages(id) ON DELETE CASCADE NOT NULL,
  module_type text NOT NULL CHECK (module_type IN (
    'text',           -- Metin bloğu
    'heading',        -- Başlık
    'image',          -- Resim
    'button',         -- Buton
    'spacer',         -- Boşluk
    'card',           -- Kart
    'hero',           -- Hero bölümü
    'grid',           -- Grid layout
    'video',          -- Video embed
    'divider',        -- Ayırıcı çizgi
    'accordion',      -- Açılır kapanır
    'tabs',           -- Sekmeler
    'gallery',        -- Resim galerisi
    'testimonial',    -- Referans/Yorum
    'pricing',        -- Fiyat kartı
    'feature',        -- Özellik kartı
    'cta',            -- Call to action
    'social',         -- Sosyal medya linkleri
    'html',           -- Özel HTML
    'embed'           -- iFrame embed
  )),
  content jsonb NOT NULL DEFAULT '{}',
  styles jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- 5. COMMENTS TABLOSUNA PARENT_COMMENT_ID EKLE
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage banned users" ON public.banned_users;
DROP POLICY IF EXISTS "Admins can manage banned ips" ON public.banned_ips;
DROP POLICY IF EXISTS "Anyone can view published pages" ON public.cms_pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON public.cms_pages;
DROP POLICY IF EXISTS "Anyone can view modules" ON public.cms_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.cms_modules;

-- Banned users: Sadece adminler görebilir ve değiştirebilir
CREATE POLICY "Admins can manage banned users" ON public.banned_users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Banned IPs: Sadece adminler görebilir ve değiştirebilir
CREATE POLICY "Admins can manage banned ips" ON public.banned_ips
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- CMS Pages: Herkes yayınlanmış sayfaları okuyabilir, sadece adminler değiştirebilir
CREATE POLICY "Anyone can view published pages" ON public.cms_pages
  FOR SELECT USING (
    is_published = true OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage pages" ON public.cms_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- CMS Modules: Herkes okuyabilir, sadece adminler değiştirebilir
CREATE POLICY "Anyone can view modules" ON public.cms_modules
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage modules" ON public.cms_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 7. İNDEKSLER
-- =============================================
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip ON public.banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_cms_modules_page_id ON public.cms_modules(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_modules_order ON public.cms_modules(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);

-- =============================================
-- 8. ADMIN KULLANICISI OLUŞTUR
-- =============================================
-- NOT: Önce Supabase Dashboard > Authentication > Users'dan 
-- Admin@gmail.com / Allah4848 ile kullanıcı oluşturun
-- Sonra aşağıdaki komutu çalıştırın:

-- UPDATE public.users SET role = 'admin' WHERE email = 'Admin@gmail.com';

-- =============================================
-- MİGRASYON TAMAMLANDI!
-- =============================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Admin Migration tamamlandı!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Oluşturulan Tablolar:';
  RAISE NOTICE '   1. banned_users (Banlı kullanıcılar)';
  RAISE NOTICE '   2. banned_ips (Banlı IP adresleri)';
  RAISE NOTICE '   3. cms_pages (CMS sayfaları)';
  RAISE NOTICE '   4. cms_modules (CMS modülleri)';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Comments tablosuna parent_comment_id eklendi';
  RAISE NOTICE '';
  RAISE NOTICE '🎨 Desteklenen CMS Modülleri:';
  RAISE NOTICE '   - text, heading, image, button, spacer';
  RAISE NOTICE '   - card, hero, grid, video, divider';
  RAISE NOTICE '   - accordion, tabs, gallery, testimonial';
  RAISE NOTICE '   - pricing, feature, cta, social, html, embed';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ SON ADIM: Admin kullanıcısı için:';
  RAISE NOTICE '   1. Auth > Users > Add User: Admin@gmail.com / Allah4848';
  RAISE NOTICE '   2. SQL: UPDATE public.users SET role = ''admin'' WHERE email = ''Admin@gmail.com'';';
END $$;
