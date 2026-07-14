
-- Community UGC platform upgrade

-- 1) Extend generations
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS editor_pick boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS generations_slug_uidx ON public.generations(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS generations_likes_idx ON public.generations(likes_count DESC) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS generations_views_idx ON public.generations(views_count DESC) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS generations_category_idx ON public.generations(category) WHERE hidden = false;
CREATE INDEX IF NOT EXISTS generations_tags_gin ON public.generations USING gin(tags);
CREATE INDEX IF NOT EXISTS generations_editor_idx ON public.generations(editor_pick, created_at DESC) WHERE hidden = false AND editor_pick = true;

DROP TRIGGER IF EXISTS generations_updated_at ON public.generations;
CREATE TRIGGER generations_updated_at BEFORE UPDATE ON public.generations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Extend profiles with handle
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS handle text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_uidx ON public.profiles(lower(handle)) WHERE handle IS NOT NULL;

-- 3) Likes table
CREATE TABLE IF NOT EXISTS public.generation_likes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, generation_id)
);
GRANT SELECT, INSERT, DELETE ON public.generation_likes TO authenticated;
GRANT ALL ON public.generation_likes TO service_role;
ALTER TABLE public.generation_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.generation_likes FOR SELECT USING (true);
CREATE POLICY "Users like as self" ON public.generation_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike self" ON public.generation_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4) Bookmarks
CREATE TABLE IF NOT EXISTS public.generation_bookmarks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id uuid NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, generation_id)
);
GRANT SELECT, INSERT, DELETE ON public.generation_bookmarks TO authenticated;
GRANT ALL ON public.generation_bookmarks TO service_role;
ALTER TABLE public.generation_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookmarks" ON public.generation_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users bookmark self" ON public.generation_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unbookmark self" ON public.generation_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5) Follows
CREATE TABLE IF NOT EXISTS public.creator_follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, creator_id),
  CHECK (follower_id <> creator_id)
);
GRANT SELECT, INSERT, DELETE ON public.creator_follows TO authenticated;
GRANT SELECT ON public.creator_follows TO anon;
GRANT ALL ON public.creator_follows TO service_role;
ALTER TABLE public.creator_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view follows" ON public.creator_follows FOR SELECT USING (true);
CREATE POLICY "Users follow as self" ON public.creator_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users unfollow self" ON public.creator_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- 6) Likes counter trigger
CREATE OR REPLACE FUNCTION public.on_generation_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.generations SET likes_count = likes_count + 1 WHERE id = NEW.generation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.generations SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.generation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS generation_likes_count_ins ON public.generation_likes;
CREATE TRIGGER generation_likes_count_ins AFTER INSERT ON public.generation_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_generation_like();
DROP TRIGGER IF EXISTS generation_likes_count_del ON public.generation_likes;
CREATE TRIGGER generation_likes_count_del AFTER DELETE ON public.generation_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_generation_like();

-- 7) View increment RPC (bypass RLS safely)
CREATE OR REPLACE FUNCTION public.increment_generation_view(_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.generations SET views_count = views_count + 1 WHERE id = _id AND hidden = false;
$$;
GRANT EXECUTE ON FUNCTION public.increment_generation_view(uuid) TO anon, authenticated;

-- 8) Slug generator helper
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(
    regexp_replace(lower(coalesce(txt,'')), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  );
$$;

-- 9) Backfill slugs & titles for existing rows
UPDATE public.generations
SET title = COALESCE(title, tool_title),
    slug = COALESCE(slug, public.slugify(tool_title) || '-' || substr(id::text, 1, 8)),
    category = COALESCE(category, tool_slug)
WHERE slug IS NULL OR title IS NULL OR category IS NULL;

-- 10) Backfill profile handles
UPDATE public.profiles
SET handle = COALESCE(handle, public.slugify(display_name) || '-' || substr(id::text, 1, 6))
WHERE handle IS NULL;

-- 11) Update handle_new_user to include handle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_name text;
  base_handle text;
  final_handle text;
  n int := 0;
BEGIN
  base_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  base_handle := public.slugify(base_name);
  IF base_handle = '' THEN base_handle := 'user'; END IF;
  final_handle := base_handle;
  WHILE EXISTS(SELECT 1 FROM public.profiles WHERE lower(handle) = lower(final_handle)) LOOP
    n := n + 1;
    final_handle := base_handle || '-' || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, display_name, avatar_url, handle)
  VALUES (NEW.id, base_name, NEW.raw_user_meta_data->>'avatar_url', final_handle);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
