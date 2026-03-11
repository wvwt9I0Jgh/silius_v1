-- =============================================
-- CHECK-IN UPDATE POLICY
-- =============================================
-- event_participants tablosunda UPDATE policy eksikti.
-- Bu migration'ı Supabase Dashboard > SQL Editor'da çalıştırın.

-- Kullanıcılar kendi katılım kayıtlarını güncelleyebilsin (check-in için)
CREATE POLICY "Users can update own participation"
  ON public.event_participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
