
-- Revoke public execute on has_role (linter fix).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

-- Split the articles SELECT policy so anon doesn't need to call has_role.
DROP POLICY IF EXISTS "Published articles public" ON public.articles;

CREATE POLICY "Published articles readable by everyone"
  ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published'::content_status);

CREATE POLICY "Editors and admins read all articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'editor'::app_role));
