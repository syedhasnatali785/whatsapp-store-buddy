
-- 1) Restrict profiles: remove blanket public read; create minimal public view
DROP POLICY IF EXISTS "Public can view profiles by store_name" ON public.profiles;

CREATE OR REPLACE VIEW public.public_stores AS
SELECT user_id, store_name, whatsapp
FROM public.profiles
WHERE status = 'approved';

GRANT SELECT ON public.public_stores TO anon, authenticated;
REVOKE SELECT ON public.profiles FROM anon;

-- 2) Coupons: remove public read (validation happens via edge function)
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
REVOKE SELECT ON public.coupons FROM anon;

-- 3) Custom replies: remove public read (matching happens via edge function)
DROP POLICY IF EXISTS "Public can view custom replies" ON public.custom_replies;
REVOKE SELECT ON public.custom_replies FROM anon;

-- 4) Tighten order INSERTs: require an approved store + non-empty contact fields
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated can create orders" ON public.orders;

CREATE POLICY "Customers can create orders for approved stores"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = orders.user_id AND p.status = 'approved')
  AND length(btrim(customer_name)) > 0
  AND length(btrim(phone)) > 0
);

-- 5) Lock down SECURITY DEFINER / trigger functions from being called directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 6) Storage: remove broad listing policy on the public product-images bucket.
-- Files remain accessible via their public URLs (bucket is public), but listing is disabled.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
