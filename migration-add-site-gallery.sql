-- =====================================================
-- SITE GALLERY TABLE + POLICIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.site_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site gallery is public" ON public.site_gallery;
CREATE POLICY "Site gallery is public"
  ON public.site_gallery FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert site gallery" ON public.site_gallery;
CREATE POLICY "Only admins can insert site gallery"
  ON public.site_gallery FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete site gallery" ON public.site_gallery;
CREATE POLICY "Only admins can delete site gallery"
  ON public.site_gallery FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update site gallery" ON public.site_gallery;
CREATE POLICY "Only admins can update site gallery"
  ON public.site_gallery FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_site_gallery_created_at ON public.site_gallery(created_at DESC);
