
-- Table: public.generations - stores user AI generations for a public community feed
CREATE TABLE public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  tool_title text NOT NULL,
  kind text NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'long'
  prompt text,
  output text NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  report_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX generations_created_idx ON public.generations (created_at DESC) WHERE hidden = false;
CREATE INDEX generations_tool_idx ON public.generations (tool_slug, created_at DESC) WHERE hidden = false;

GRANT SELECT ON public.generations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.generations TO authenticated;
GRANT ALL ON public.generations TO service_role;

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible generations"
  ON public.generations FOR SELECT
  USING (hidden = false);

CREATE POLICY "Owners can view their own"
  ON public.generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON public.generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON public.generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any generation"
  ON public.generations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any generation"
  ON public.generations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Table: public.generation_reports - user reports for moderation
CREATE TABLE public.generation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (generation_id, reporter_id)
);

GRANT SELECT, INSERT ON public.generation_reports TO authenticated;
GRANT ALL ON public.generation_reports TO service_role;

ALTER TABLE public.generation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own reports"
  ON public.generation_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.generation_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.generation_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: bump report_count and auto-hide at threshold (>=3)
CREATE OR REPLACE FUNCTION public.on_generation_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE public.generations
    SET report_count = report_count + 1,
        hidden = (report_count + 1 >= 3) OR hidden
    WHERE id = NEW.generation_id
    RETURNING report_count INTO new_count;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generation_reports_bump
  AFTER INSERT ON public.generation_reports
  FOR EACH ROW EXECUTE FUNCTION public.on_generation_report();
