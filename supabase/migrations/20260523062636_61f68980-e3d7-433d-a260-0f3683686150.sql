ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_slides JSONB NOT NULL DEFAULT '[]'::jsonb;