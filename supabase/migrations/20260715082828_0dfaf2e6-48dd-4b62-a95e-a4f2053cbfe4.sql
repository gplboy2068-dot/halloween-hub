
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE INDEX IF NOT EXISTS generations_content_hash_idx
  ON public.generations(user_id, content_hash)
  WHERE content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS generations_editor_pick_idx
  ON public.generations(editor_pick, created_at DESC)
  WHERE editor_pick = true AND hidden = false;

CREATE INDEX IF NOT EXISTS generations_moderation_status_idx
  ON public.generations(moderation_status, created_at DESC);
