-- =============================================
-- ADMIN DELETE & UPDATE POLICIES
-- Bu migration admin panelinden silme ve düzenleme işlemlerinin çalışması için gereklidir.
-- Supabase Dashboard → SQL Editor'de çalıştırın.
-- =============================================

-- EVENTS: Admin tüm etkinlikleri silebilir ve düzenleyebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any event"
    ON public.events FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update any event"
    ON public.events FOR UPDATE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- USERS: Admin tüm kullanıcıları silebilir ve düzenleyebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any user"
    ON public.users FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EVENT_PARTICIPANTS: Admin tüm katılımları silebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any participant"
    ON public.event_participants FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- COMMENTS: Admin tüm yorumları silebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any comment"
    ON public.comments FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- FRIENDS: Admin tüm arkadaşlıkları silebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any friend"
    ON public.friends FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTIFICATIONS: Admin tüm bildirimleri silebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any notification"
    ON public.notifications FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EVENT_GALLERY: Admin tüm galeri fotoğraflarını silebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any gallery photo"
    ON public.event_gallery FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- BANNED_USERS: Admin ban kayıtlarını silebilir ve ekleyebilir
DO $$ BEGIN
  CREATE POLICY "Admins can delete any ban"
    ON public.banned_users FOR DELETE
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert bans"
    ON public.banned_users FOR INSERT
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
