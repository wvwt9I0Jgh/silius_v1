-- =============================================
-- BANNED_USERS SELECT POLİCY DÜZELTMESİ
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- Kullanıcıların kendi ban durumlarını kontrol edebilmesi için gerekli

-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "admins_banned_users_all" ON public.banned_users;
DROP POLICY IF EXISTS "users_check_own_ban" ON public.banned_users;

-- Herkes kendi ban durumunu okuyabilir
CREATE POLICY "users_check_own_ban"
  ON public.banned_users FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Adminler banlayabilir ve ban kaldırabilir
CREATE POLICY "admins_banned_users_all"
  ON public.banned_users FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- BAŞARI
-- =============================================
SELECT 'Banned users policy düzeltildi!' as status;
