-- Add birth date and district for profile setup
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS "birthDate" date,
  ADD COLUMN IF NOT EXISTS district text;

-- District values used in profile setup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_district_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_district_check
      CHECK (
        district IS NULL
        OR district IN (
          'mugla-merkez',
          'dalaman',
          'ortaca',
          'milas',
          'marmaris',
          'bodrum',
          'fethiye',
          'gocek',
          'koycegiz',
          'datca',
          'ula',
          'yatagan'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);

-- Birth date can be set only once for each user
CREATE OR REPLACE FUNCTION public.prevent_birthdate_update()
RETURNS trigger AS $$
BEGIN
  IF OLD."birthDate" IS NOT NULL
     AND NEW."birthDate" IS DISTINCT FROM OLD."birthDate" THEN
    RAISE EXCEPTION 'birthDate cannot be changed once set';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_birthdate_update ON public.users;
CREATE TRIGGER trg_prevent_birthdate_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_birthdate_update();
