
-- Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL DEFAULT '',
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their orders
CREATE POLICY "Users can manage their own orders"
ON public.orders FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Public can insert orders (customers placing orders)
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT TO anon
WITH CHECK (true);

-- Public can also insert as authenticated
CREATE POLICY "Authenticated can create orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add stock_count and video_url to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count integer DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text DEFAULT NULL;
