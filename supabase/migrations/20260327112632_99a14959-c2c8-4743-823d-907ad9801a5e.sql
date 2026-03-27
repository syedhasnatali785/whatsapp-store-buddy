
-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add category_id to products
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Store settings table for banners, timers, etc.
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  offer_banner_enabled BOOLEAN NOT NULL DEFAULT false,
  offer_banner_text TEXT DEFAULT '',
  urgency_timer_enabled BOOLEAN NOT NULL DEFAULT false,
  urgency_timer_end TIMESTAMP WITH TIME ZONE,
  urgency_timer_label TEXT DEFAULT 'Limited Time Offer!',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage their own settings" ON public.store_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
