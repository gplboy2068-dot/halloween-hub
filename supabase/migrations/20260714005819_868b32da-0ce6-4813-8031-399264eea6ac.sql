DROP POLICY IF EXISTS "admins read logs" ON public.activity_logs;
CREATE POLICY "admins read logs" ON public.activity_logs
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "article_tags editors write" ON public.article_tags;
CREATE POLICY "article_tags editors write" ON public.article_tags
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "admins read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admins delete subscribers" ON public.newsletter_subscribers
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "redirects admins write" ON public.redirects;
CREATE POLICY "redirects admins write" ON public.redirects
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete tags" ON public.tags;
CREATE POLICY "Admins delete tags" ON public.tags
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors manage tags" ON public.tags;
CREATE POLICY "Editors manage tags" ON public.tags
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Editors update tags" ON public.tags;
CREATE POLICY "Editors update tags" ON public.tags
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "tool_tags editors write" ON public.tool_tags;
CREATE POLICY "tool_tags editors write" ON public.tool_tags
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));