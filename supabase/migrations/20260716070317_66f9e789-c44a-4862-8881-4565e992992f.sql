
CREATE TABLE public.abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  target_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  moderator_notes TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.abuse_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.abuse_reports TO authenticated;
GRANT ALL ON public.abuse_reports TO service_role;

ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an abuse report"
  ON public.abuse_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view abuse reports"
  ON public.abuse_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update abuse reports"
  ON public.abuse_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete abuse reports"
  ON public.abuse_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_abuse_reports_updated_at
BEFORE UPDATE ON public.abuse_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_abuse_reports_status_created ON public.abuse_reports (status, created_at DESC);
