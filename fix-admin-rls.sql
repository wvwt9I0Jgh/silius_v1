-- =============================================
-- ADMIN RLS POLİCY DÜZELTME
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Admin kullanıcıların diğer kullanıcıları silmesi, banlaması ve 
-- vibeları düzenlemesi için gerekli izinleri ekler

-- =============================================
-- 1. USERS - Admin DELETE yetkisi
-- =============================================
DROP POLICY IF EXISTS "admins_can_delete_users" ON public.users;
DROP POLICY IF EXISTS "admins_can_update_users" ON public.users;

CREATE POLICY "admins_can_delete_users"
  ON public.users FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_can_update_users"
  ON public.users FOR UPDATE 
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 2. EVENTS - Admin tam yetki
-- =============================================
DROP POLICY IF EXISTS "admins_can_update_events" ON public.events;
DROP POLICY IF EXISTS "admins_can_delete_events" ON public.events;

CREATE POLICY "admins_can_update_events"
  ON public.events FOR UPDATE 
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_can_delete_events"
  ON public.events FOR DELETE 
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 3. BANNED_USERS - Admin tam yetki (zaten var ama kontrol)
-- =============================================
DROP POLICY IF EXISTS "Admins can manage banned users" ON public.banned_users;
DROP POLICY IF EXISTS "admins_banned_users_all" ON public.banned_users;

CREATE POLICY "admins_banned_users_all"
  ON public.banned_users FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 4. BANNED_IPS - Admin tam yetki
-- =============================================
DROP POLICY IF EXISTS "Admins can manage banned ips" ON public.banned_ips;
DROP POLICY IF EXISTS "admins_banned_ips_all" ON public.banned_ips;

CREATE POLICY "admins_banned_ips_all"
  ON public.banned_ips FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 5. CMS_PAGES - Admin tam yetki, herkes okuyabilir
-- =============================================
DROP POLICY IF EXISTS "Anyone can view published pages" ON public.cms_pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON public.cms_pages;
DROP POLICY IF EXISTS "cms_pages_select" ON public.cms_pages;
DROP POLICY IF EXISTS "cms_pages_admin_all" ON public.cms_pages;

CREATE POLICY "cms_pages_select"
  ON public.cms_pages FOR SELECT 
  USING (
    is_published = true OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "cms_pages_admin_all"
  ON public.cms_pages FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 6. CMS_MODULES - Admin tam yetki, herkes okuyabilir
-- =============================================
DROP POLICY IF EXISTS "Anyone can view modules" ON public.cms_modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.cms_modules;
DROP POLICY IF EXISTS "cms_modules_select" ON public.cms_modules;
DROP POLICY IF EXISTS "cms_modules_admin_all" ON public.cms_modules;

CREATE POLICY "cms_modules_select"
  ON public.cms_modules FOR SELECT USING (true);

CREATE POLICY "cms_modules_admin_all"
  ON public.cms_modules FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- BAŞARI MESAJI
-- =============================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Admin RLS Policy Düzeltmesi Tamamlandı!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Güncellenen Tablolar:';
  RAISE NOTICE '   - users (admin delete/update)';
  RAISE NOTICE '   - events (admin update/delete)';
  RAISE NOTICE '   - banned_users (admin full access)';
  RAISE NOTICE '   - banned_ips (admin full access)';
  RAISE NOTICE '   - cms_pages (admin full access)';
  RAISE NOTICE '   - cms_modules (admin full access)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ ÖNEMLİ: Admin kullanıcınızın role = admin olduğundan emin olun';
END $$;
