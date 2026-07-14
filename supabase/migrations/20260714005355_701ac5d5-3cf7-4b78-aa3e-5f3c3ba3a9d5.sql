DROP POLICY IF EXISTS "Visitors can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Visitors can subscribe with valid email" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (email IS NOT NULL AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');