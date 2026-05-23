ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS header_announcement TEXT DEFAULT 'Fast WhatsApp ordering across Pakistan',
  ADD COLUMN IF NOT EXISTS hero_slider_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_cta_text TEXT DEFAULT 'Shop Now',
  ADD COLUMN IF NOT EXISTS featured_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS featured_title TEXT DEFAULT 'Featured Products',
  ADD COLUMN IF NOT EXISTS featured_limit INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Thank you for shopping with us.';