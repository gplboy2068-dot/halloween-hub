DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Visitors can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (true);