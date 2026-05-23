
ALTER VIEW public.public_stores SET (security_invoker = true);

-- Ensure anon/authenticated can still query needed columns through the view
GRANT SELECT (user_id, store_name, whatsapp, status) ON public.profiles TO anon, authenticated;
