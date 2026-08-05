
-- =========================
-- Enums
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

-- =========================
-- Helper: updated_at trigger fn
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- Profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- User Roles
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- New user handler
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- Categories
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Editors manage categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Tags
-- =========================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are public" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Editors manage tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors update tags" ON public.tags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admins delete tags" ON public.tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- Tools
-- =========================
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  content TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  hero_image TEXT,
  icon TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  view_count INT NOT NULL DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tools_status_idx ON public.tools(status);
CREATE INDEX tools_category_idx ON public.tools(category_id);
GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tools public" ON public.tools FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors insert tools" ON public.tools FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors update tools" ON public.tools FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admins delete tools" ON public.tools FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Articles
-- =========================
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  read_time_min INT,
  view_count INT NOT NULL DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX articles_status_idx ON public.articles(status);
CREATE INDEX articles_category_idx ON public.articles(category_id);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles public" ON public.articles FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors insert articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Editors update articles" ON public.articles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Admins delete articles" ON public.articles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Join tables
-- =========================
CREATE TABLE public.tool_tags (
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);
GRANT SELECT ON public.tool_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_tags TO authenticated;
GRANT ALL ON public.tool_tags TO service_role;
ALTER TABLE public.tool_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tool_tags public read" ON public.tool_tags FOR SELECT USING (true);
CREATE POLICY "tool_tags editors write" ON public.tool_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
GRANT SELECT ON public.article_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_tags TO authenticated;
GRANT ALL ON public.article_tags TO service_role;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_tags public read" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "article_tags editors write" ON public.article_tags FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

-- =========================
-- FAQs
-- =========================
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public" ON public.faqs FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "faqs editors insert" ON public.faqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "faqs editors update" ON public.faqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "faqs admins delete" ON public.faqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Redirects
-- =========================
CREATE TABLE public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL UNIQUE,
  target_path TEXT NOT NULL,
  status_code INT NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redirects TO authenticated;
GRANT ALL ON public.redirects TO service_role;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "redirects public read" ON public.redirects FOR SELECT USING (true);
CREATE POLICY "redirects admins write" ON public.redirects FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER redirects_updated_at BEFORE UPDATE ON public.redirects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Newsletter Subscribers
-- =========================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- Activity Logs
-- =========================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "authed insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role remains executable by authenticated (needed for RLS evaluation from user context)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS description text;

-- Site settings key/value store for admin settings page
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings readable by everyone" ON public.site_settings;
CREATE POLICY "Settings readable by everyone" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Categories
INSERT INTO public.categories (slug, name, description, icon) VALUES
  ('design',     'Design',              'Cards, posters, flyers & more',              '🎨'),
  ('ai',         'AI Generators',       'Names, captions, stories',                   '🪄'),
  ('pumpkin',    'Pumpkin',             'Templates, stencils, faces',                 '🎃'),
  ('party',      'Party',               'Planners & invitations',                     '🥳'),
  ('images',     'Images',              'Wallpapers & stickers',                      '🖼️'),
  ('printables', 'Printables',          'Coloring pages & activities',                '🖨️'),
  ('social',     'Social',              'Captions, hashtags, memes',                  '📱'),
  ('wishes',     'Wishes & Quotes',     'Messages that spark joy',                    '🌙'),
  ('ideas',      'Ideas & Inspiration', 'Costumes, themes, and creative ideas',       '💡'),
  ('history',    'History & Lore',      'Origins, traditions, and Halloween lore',    '📜'),
  ('safety',     'Safety & Tips',       'Trick-or-treating and family safety guides', '🛡️')
ON CONFLICT (slug) DO NOTHING;

-- Tools
INSERT INTO public.tools (slug, title, description, icon, category_id, status, featured, popular, is_new, published_at)
SELECT v.slug, v.title, v.description, v.icon,
       (SELECT id FROM public.categories c WHERE c.slug = v.cat_slug),
       'published'::content_status, v.featured, v.popular, v.is_new, now()
FROM (VALUES
  ('halloween-card-maker',       'Halloween Card Maker',       'Design spooky greeting cards in seconds.',       '🎃', 'design',      true,  true,  false),
  ('invitation-maker',           'Invitation Maker',           'Craft party invitations guests can''t resist.',  '💌', 'design',      true,  false, false),
  ('poster-maker',               'Poster Maker',               'Bold Halloween posters for any event.',          '🖼️', 'design',     false, true,  false),
  ('banner-maker',               'Banner Maker',               'Web & social banners with a Halloween twist.',   '🏴', 'design',      false, false, false),
  ('flyer-maker',                'Flyer Maker',                'Print-ready flyers for parties and events.',     '📄', 'design',      false, false, false),
  ('logo-maker',                 'Logo Maker',                 'Instant Halloween-themed logos.',                '👻', 'design',      false, false, false),
  ('costume-generator',          'Costume Generator',          'AI-powered costume ideas tailored to you.',      '🧙', 'ai',          true,  false, true),
  ('name-generator',             'Name Generator',             'Spooky names for characters, pets, parties.',    '🪦', 'ai',          false, true,  false),
  ('caption-generator',          'Caption Generator',          'Instagram-ready Halloween captions.',            '📝', 'ai',          false, false, false),
  ('quote-generator',            'Quote Generator',            'Chilling quotes for cards and posts.',           '💀', 'ai',          false, false, false),
  ('wish-generator',             'Wish Generator',             'Send heartfelt Halloween wishes.',               '🌙', 'wishes',      false, false, false),
  ('message-generator',          'Message Generator',          'Custom Halloween messages.',                     '✉️', 'wishes',      false, false, false),
  ('party-planner',              'Party Planner',              'Plan the ultimate Halloween bash.',              '🥳', 'party',       true,  false, false),
  ('party-name-generator',       'Party Name Generator',       'Name your Halloween party.',                     '🎉', 'party',       false, false, false),
  ('pumpkin-carving-generator',  'Pumpkin Carving Generator',  'AI-generated carving patterns.',                 '🎃', 'pumpkin',     false, true,  true),
  ('pumpkin-template-generator', 'Pumpkin Template Generator', 'Printable pumpkin stencils.',                    '🕸️', 'pumpkin',    false, false, false),
  ('pumpkin-face-generator',     'Pumpkin Face Generator',     'Design custom pumpkin faces.',                   '😈', 'pumpkin',     false, false, false),
  ('wallpaper-generator',        'Wallpaper Generator',        'Halloween wallpapers for every device.',         '📱', 'images',      false, false, false),
  ('coloring-pages-generator',   'Coloring Pages Generator',   'Printable Halloween coloring pages.',            '🖍️', 'printables', false, false, false),
  ('hashtag-generator',          'Hashtag Generator',          'Trending Halloween hashtags.',                   '#️⃣', 'social',    false, false, false),
  ('ai-prompt-generator',        'AI Prompt Generator',        'Spooky prompts for AI art & writing.',           '🪄', 'ai',          false, false, false),
  ('sticker-generator',          'Sticker Generator',          'Halloween stickers on demand.',                  '🩸', 'images',      false, false, false),
  ('profile-picture-generator',  'Profile Picture Generator', 'Halloween-themed PFPs.',                          '🧛', 'images',      false, false, false),
  ('avatar-generator',           'Avatar Generator',           'Custom Halloween avatars.',                      '🧟', 'images',      false, false, false),
  ('scary-story-generator',      'Scary Story Generator',      'AI-crafted horror stories.',                     '📖', 'ai',          false, false, true),
  ('meme-generator',             'Meme Generator',             'Halloween memes in one click.',                  '😂', 'social',      false, false, false)
) AS v(slug, title, description, icon, cat_slug, featured, popular, is_new)
ON CONFLICT (slug) DO NOTHING;

-- Articles
INSERT INTO public.articles (slug, title, excerpt, read_time_min, category_id, status, published_at)
SELECT v.slug, v.title, v.excerpt, v.read_time_min,
       c.id AS category_id,
       'published'::content_status, v.published_at::timestamptz
FROM (VALUES
  ('best-halloween-costume-ideas-2026', '50 Best Halloween Costume Ideas for 2026', 'From classic to trending — costume inspiration for every age and budget.', 9, 'ideas', '2026-07-01'),
  ('pumpkin-carving-guide',              'The Ultimate Pumpkin Carving Guide',       'Tools, techniques, safety, and 20 free templates.',                          12, 'pumpkin', '2026-06-28'),
  ('halloween-party-planning-checklist', 'Halloween Party Planning Checklist',       'The step-by-step guide to hosting the party of the year.',                    8, 'party', '2026-06-20'),
  ('history-of-halloween',               'The Real History of Halloween',            'From Samhain to today — how the world''s spookiest holiday evolved.',        11, 'history', '2026-05-14'),
  ('halloween-safety-tips-kids',         'Halloween Safety Tips for Kids',           'Trick-or-treating safely — a parent''s guide.',                               6, 'safety', '2026-06-02'),
  ('diy-halloween-decorations',          '25 DIY Halloween Decorations You''ll Love','Budget-friendly decor ideas anyone can make.',                              10, 'design', '2026-06-11')
) AS v(slug, title, excerpt, read_time_min, cat_slug, published_at)
JOIN public.categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- Tags
INSERT INTO public.tags (slug, name) VALUES
  ('halloween','halloween'), ('spooky','spooky'), ('pumpkin','pumpkin'),
  ('costume','costume'), ('party','party'), ('diy','diy'),
  ('printable','printable'), ('kids','kids')
ON CONFLICT (slug) DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, status)
VALUES
  ('Are HalloweenTools tools free?', 'Yes, every tool is free with no signup.', 'published'::content_status),
  ('Do you save my data?',           'No â€” tools run in your browser whenever possible.', 'published'::content_status),
  ('Can I use outputs commercially?','Most outputs are royalty-free for personal use.',   'published'::content_status)
ON CONFLICT DO NOTHING;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

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
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  referrer text,
  session_id text,
  user_id uuid references auth.users(id) on delete set null,
  props jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_event_idx on public.analytics_events (event, created_at desc);
create index analytics_events_path_idx on public.analytics_events (path, created_at desc);

grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;

alter table public.analytics_events enable row level security;

create policy "Admins read analytics"
on public.analytics_events for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'admin@demo.com';
  v_password text := 'Admin123!';
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      v_email, crypt(v_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name','Demo Admin'),
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now());
  END IF;

  INSERT INTO public.profiles (id, display_name)
  VALUES (v_user_id, 'Demo Admin')
  ON CONFLICT (id) DO NOTHING;

  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin');
END $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;

GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins read analytics" ON public.analytics_events;
CREATE POLICY "Admins read analytics" ON public.analytics_events
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete articles" ON public.articles;
CREATE POLICY "Admins delete articles" ON public.articles
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors and admins read all articles" ON public.articles;
CREATE POLICY "Editors and admins read all articles" ON public.articles
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Editors insert articles" ON public.articles;
CREATE POLICY "Editors insert articles" ON public.articles
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Editors update articles" ON public.articles;
CREATE POLICY "Editors update articles" ON public.articles
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins delete categories" ON public.categories;
CREATE POLICY "Admins delete categories" ON public.categories
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors manage categories" ON public.categories;
CREATE POLICY "Editors manage categories" ON public.categories
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Editors update categories" ON public.categories;
CREATE POLICY "Editors update categories" ON public.categories
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "faqs admins delete" ON public.faqs;
CREATE POLICY "faqs admins delete" ON public.faqs
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "faqs editors insert" ON public.faqs;
CREATE POLICY "faqs editors insert" ON public.faqs
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "faqs editors update" ON public.faqs;
CREATE POLICY "faqs editors update" ON public.faqs
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "faqs public" ON public.faqs;
CREATE POLICY "Published faqs public" ON public.faqs
FOR SELECT TO anon, authenticated
USING (status = 'published');
CREATE POLICY "Editors and admins read all faqs" ON public.faqs
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete tools" ON public.tools;
CREATE POLICY "Admins delete tools" ON public.tools
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors insert tools" ON public.tools;
CREATE POLICY "Editors insert tools" ON public.tools
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Editors update tools" ON public.tools;
CREATE POLICY "Editors update tools" ON public.tools
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'))
WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Published tools public" ON public.tools;
CREATE POLICY "Published tools public" ON public.tools
FOR SELECT TO anon, authenticated
USING (status = 'published');
CREATE POLICY "Editors and admins read all tools" ON public.tools
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Visitors can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (true);
DROP POLICY IF EXISTS "Visitors can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Visitors can subscribe with valid email" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (email IS NOT NULL AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
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
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

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

REVOKE ALL ON FUNCTION public.on_generation_report() FROM PUBLIC, anon, authenticated;

CREATE POLICY "Users can upload to their folder in community"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can read community objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community');

CREATE POLICY "Users can delete their own community objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can delete any community object"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'community' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "article-images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

CREATE POLICY "article-images admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "article-images admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "article-images admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));

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

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT regexp_replace(
    regexp_replace(lower(coalesce(txt,'')), '[^a-z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.on_generation_like() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.slugify(text) TO service_role;

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

CREATE TABLE public.legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  lead TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published legal pages"
  ON public.legal_pages FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage legal pages"
  ON public.legal_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_legal_pages_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.legal_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL REFERENCES public.legal_pages(slug) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL,
  lead TEXT,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, version)
);

GRANT SELECT, INSERT ON public.legal_page_versions TO authenticated;
GRANT ALL ON public.legal_page_versions TO service_role;

ALTER TABLE public.legal_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read versions"
  ON public.legal_page_versions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins create versions"
  ON public.legal_page_versions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_legal_page_versions_slug ON public.legal_page_versions(slug, version DESC);

CREATE OR REPLACE FUNCTION public.snapshot_legal_page()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.content IS DISTINCT FROM NEW.content
      OR OLD.title IS DISTINCT FROM NEW.title
      OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
      OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
      OR OLD.lead IS DISTINCT FROM NEW.lead) THEN
    INSERT INTO public.legal_page_versions
      (slug, version, title, lead, meta_title, meta_description, content, created_by)
    VALUES
      (OLD.slug, OLD.version, OLD.title, OLD.lead, OLD.meta_title, OLD.meta_description, OLD.content, OLD.updated_by);
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_legal_pages_snapshot
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_legal_page();

INSERT INTO public.legal_pages (slug, title, lead, meta_title, meta_description, content) VALUES
(
  'privacy',
  'Privacy Policy',
  'How HalloweenTools.com collects, uses, and protects your information. Last updated November 2026.',
  'Privacy Policy â€” HalloweenTools',
  'How HalloweenTools.com collects, uses, and protects your data across our free tools, community, and AI features.',
$$<p>HalloweenTools.com ("we", "us", "our") operates halloweentools.com and provides free Halloween tools, AI generators, printables, community posts, and related content. This Privacy Policy explains what information we collect, how we use it, and the choices you have.</p>

<h2>Information We Collect</h2>
<p>We collect the minimum information needed to run the site, keep our tools working, and improve your experience.</p>

<h3>Personal Information</h3>
<p>When you create an account we collect your email address, chosen display name, handle, and (optionally) profile photo. If you sign in with a third-party provider such as Google, we receive basic profile details from that provider.</p>

<h3>Usage Data</h3>
<p>We collect standard technical information when you visit the site â€” pages viewed, referring URL, approximate location derived from IP, device type, browser, and timestamps.</p>

<h3>Cookies</h3>
<p>We use a small number of first-party and third-party cookies for essential functionality, analytics, and (where applicable) advertising. See our <a href="/cookies">Cookie Policy</a> for full details.</p>

<h3>Log Files</h3>
<p>Our servers automatically log IP addresses, user agents, and request paths for security, abuse prevention, and diagnostics. Logs are retained for a limited period and then rotated.</p>

<h2>Analytics</h2>
<p>We use privacy-respecting analytics to understand aggregate traffic patterns. Analytics data is aggregated and does not identify individual users.</p>

<h3>Google Analytics</h3>
<p>If Google Analytics is enabled, it may set cookies to measure page views and interactions. You can opt out using the Google Analytics browser add-on.</p>

<h2>Advertising</h2>
<p>Some pages may display advertisements from third-party ad networks.</p>

<h3>Google AdSense</h3>
<p>Google AdSense may serve ads on our site and use cookies to show ads based on prior visits. You can opt out of personalized advertising at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p>

<h3>Amazon Associates Disclosure</h3>
<p>HalloweenTools.com may participate in the Amazon Services LLC Associates Program, an affiliate advertising program. If you buy through certain product links we may earn a commission at no additional cost to you.</p>

<h2>Email Newsletter</h2>
<p>If you subscribe to our newsletter we store your email solely to send Halloween-related content and updates. You can unsubscribe from any email using the link in the footer.</p>

<h2>Contact Forms</h2>
<p>When you contact us we receive your name, email, and message. We use this information only to respond and, where applicable, to keep a record of the request.</p>

<h2>User Generated Content</h2>
<p>Anything you publish in our community â€” posts, images, captions, quotes, wishes, remixes â€” is public by design. Do not include personal information you do not want to share. See our <a href="/ugc-policy">User Generated Content Policy</a>.</p>

<h2>Community Posts</h2>
<p>Posts you publish are tied to your public creator profile (display name, handle, avatar) and remain visible until you delete them or we remove them under our policies.</p>

<h2>AI Generated Content</h2>
<p>Prompts you send to our AI tools are transmitted to AI providers to generate the response. We may retain prompts and outputs for abuse prevention, quality improvement, and moderation. See our <a href="/ai-content-policy">AI Content Policy</a>.</p>

<h2>Third Party Services</h2>
<p>We rely on third-party providers for hosting, authentication, email delivery, AI, analytics, and storage. Each provider processes data under its own privacy terms and only for the purposes we specify.</p>

<h2>Data Retention</h2>
<p>We retain personal information for as long as your account is active or as needed to provide the service. When you delete your account we remove or anonymize personal data, except where retention is required for legal or security reasons.</p>

<h2>User Rights</h2>
<p>You can access, correct, export, or delete your personal information at any time by contacting us via the <a href="/contact">contact page</a>. You may also withdraw consent for optional processing.</p>

<h2>Children's Privacy</h2>
<p>HalloweenTools.com is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided information, contact us and we will remove it.</p>

<h2>Security</h2>
<p>We use industry-standard measures â€” encrypted connections, hashed credentials, access controls, and monitored infrastructure â€” to protect your information. No online service is 100% secure, so we cannot guarantee absolute security.</p>

<h2>International Users</h2>
<p>The site is operated from and stored on servers that may be located outside your country. By using the service you consent to the transfer of your information to those jurisdictions.</p>

<h2>California Privacy Rights (CCPA)</h2>
<p>California residents have the right to know what personal information we collect, to request deletion, to opt out of the "sale" of personal information (we do not sell it), and to be free from discrimination for exercising these rights. Submit requests via the <a href="/contact">contact page</a>.</p>

<h2>GDPR Information</h2>
<p>If you are in the European Economic Area or the UK, you have the right to access, rectify, erase, restrict, or port your personal data, and to object to processing. Our lawful bases are consent, legitimate interests, and contract performance. You may also lodge a complaint with your local supervisory authority.</p>

<h2>Changes to This Policy</h2>
<p>We may update this policy from time to time. Material changes will be announced on the site and the "last updated" date at the top will change. Continued use after an update constitutes acceptance.</p>

<h2>Contact</h2>
<p>Privacy questions? Reach us via the <a href="/contact">contact page</a> or email privacy@halloweentools.com.</p>$$
),
(
  'terms',
  'Terms and Conditions',
  'The rules that govern your use of HalloweenTools.com. Last updated November 2026.',
  'Terms and Conditions â€” HalloweenTools',
  'The terms that govern use of HalloweenTools.com â€” accounts, community content, AI tools, intellectual property, and more.',
$$<p>These Terms and Conditions ("Terms") govern your access to and use of HalloweenTools.com and all associated tools, features, and content ("Service"). By using the Service you agree to these Terms. If you disagree with any part, do not use the Service.</p>

<h2>Website Usage</h2>
<p>You may use HalloweenTools.com for personal and non-commercial purposes, and for commercial purposes where a specific tool page explicitly allows it. You are responsible for your use of the Service and for any content you submit.</p>

<h2>User Accounts</h2>
<p>Creating an account is optional but unlocks community publishing, saved items, and personalized features. You must provide accurate information, keep your credentials secure, and notify us of any unauthorized use. You are responsible for all activity under your account.</p>

<h2>Community Guidelines</h2>
<p>Community participation is governed by our <a href="/community-guidelines">Community Guidelines</a>. Violations may result in content removal, temporary suspension, or permanent account termination.</p>

<h2>User Generated Content</h2>
<p>You retain ownership of content you publish. By posting to the community you grant HalloweenTools.com a worldwide, non-exclusive, royalty-free license to host, display, distribute, and adapt that content within the Service and for promotion of the Service. See our <a href="/ugc-policy">UGC Policy</a>.</p>

<h2>AI Generated Content</h2>
<p>AI outputs generated through our tools are provided "as is". You are responsible for reviewing, editing, and confirming suitability before any public or commercial use. See our <a href="/ai-content-policy">AI Content Policy</a>.</p>

<h2>Intellectual Property</h2>
<p>The HalloweenTools.com brand, logo, code, design system, editorial content, and curated collections are owned by us and protected by intellectual property laws. Nothing in these Terms transfers those rights to you.</p>

<h2>Copyright</h2>
<p>Do not upload, post, or share content you do not own or have permission to use. We respond to valid copyright takedown notices under our <a href="/dmca">DMCA Policy</a>.</p>

<h2>DMCA</h2>
<p>If you believe your copyright has been infringed on HalloweenTools.com, submit a notice as described in our <a href="/dmca">DMCA Policy</a>.</p>

<h2>Acceptable Use</h2>
<p>You may not use the Service to engage in unlawful, harmful, deceptive, or abusive behavior. You may not attempt to disrupt the Service, bypass rate limits, scrape at scale, or reverse engineer our systems.</p>

<h2>Prohibited Activities</h2>
<p>Prohibited activities include but are not limited to: harassment, hate speech, sexual content involving minors, malware distribution, spam, phishing, impersonation, and any activity that violates applicable law.</p>

<h2>Account Suspension</h2>
<p>We may suspend accounts that violate these Terms, our Community Guidelines, or any policy referenced here. Serious or repeated violations may result in permanent termination without notice.</p>

<h2>Termination</h2>
<p>You may delete your account at any time. We may terminate or restrict access to the Service where we reasonably believe you have breached these Terms or applicable law.</p>

<h2>Payments</h2>
<p>The Service is currently free. If we introduce paid features in the future, additional terms will govern purchases and will be presented before any charge.</p>

<h2>Premium Features</h2>
<p>Premium features, if launched, may be offered on a subscription or one-time basis with clearly disclosed pricing, renewal terms, and cancellation options.</p>

<h2>Disclaimer of Warranties</h2>
<p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. See our <a href="/disclaimer">Disclaimer</a>.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, HalloweenTools.com, its operators, and its contributors are not liable for indirect, incidental, special, consequential, or exemplary damages arising from your use of the Service.</p>

<h2>External Links</h2>
<p>The Service may link to external websites we do not control. We are not responsible for the content, policies, or practices of third-party sites.</p>

<h2>Third Party Services</h2>
<p>The Service integrates with third-party providers (AI, hosting, analytics, email). Your use of features that involve these providers is also subject to their terms.</p>

<h2>Changes</h2>
<p>We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>

<h2>Contact</h2>
<p>Questions about these Terms? Reach us via our <a href="/contact">contact page</a>.</p>$$
),
(
  'disclaimer',
  'Disclaimer',
  'Important information about the content and tools offered on HalloweenTools.com.',
  'Disclaimer â€” HalloweenTools',
  'General disclaimer for HalloweenTools.com content, AI outputs, community posts, affiliate links, and third-party ads.',
$$<h2>General Disclaimer</h2>
<p>HalloweenTools.com provides content, tools, and community features for entertainment and informational purposes only. We make no warranty as to the accuracy, completeness, or suitability of any information or output on the site.</p>

<h2>AI Generated Content Disclaimer</h2>
<p>Our AI tools generate text and images algorithmically. Outputs may contain factual errors, biased phrasing, or content that does not match your intent. Always review AI-generated content before publishing, sharing, or using it commercially.</p>

<h2>Entertainment Purposes</h2>
<p>Halloween wishes, quotes, story generators, costume ideas, and similar tools are intended for fun and creativity. They are not statements of fact.</p>

<h2>Accuracy Disclaimer</h2>
<p>We strive to keep information current, but we cannot guarantee that every page, template, printable, or generated output reflects the latest information, safety guidance, or best practice.</p>

<h2>No Legal Advice</h2>
<p>Nothing on HalloweenTools.com constitutes legal advice. Consult a qualified attorney for advice specific to your situation.</p>

<h2>No Medical Advice</h2>
<p>Content related to face paint, costume materials, allergens, or party food is informational only. It is not a substitute for professional medical guidance.</p>

<h2>No Professional Advice</h2>
<p>Party planning, event safety, decoration, and DIY project guidance is general in nature. Consult qualified professionals for specialized situations.</p>

<h2>No Guarantees</h2>
<p>We do not guarantee uninterrupted access to the Service, error-free tools, or specific results from any generator, template, or feature.</p>

<h2>Affiliate Disclaimer</h2>
<p>Some outbound product links on HalloweenTools.com may be affiliate links. If you purchase through such a link we may earn a small commission at no additional cost to you. Affiliate relationships never influence editorial recommendations.</p>

<h2>Advertising Disclaimer</h2>
<p>Third-party ads may appear on the site. Advertisements are served by external networks and do not represent endorsement by HalloweenTools.com.</p>

<h2>Community Content Disclaimer</h2>
<p>Community posts are created by users and represent their views, not those of HalloweenTools.com. We moderate reported content but do not pre-screen every submission.</p>$$
),
(
  'cookies',
  'Cookie Policy',
  'What cookies HalloweenTools.com uses and how you can manage them.',
  'Cookie Policy â€” HalloweenTools',
  'How HalloweenTools.com uses essential, analytics, and advertising cookies, and how you can manage them.',
$$<p>Cookies are small text files stored by your browser. HalloweenTools.com uses cookies to run the site, understand usage, and (where applicable) support advertising. This page explains what each type does.</p>

<h2>Essential Cookies</h2>
<p>Required for the Service to function â€” for example remembering your theme choice, keeping you signed in, and protecting form submissions from abuse. Essential cookies cannot be turned off from within the site.</p>

<h2>Analytics Cookies</h2>
<p>Help us understand aggregate traffic â€” which tools are used, which pages load slowly, where visitors come from. Analytics data is aggregated and does not identify individual users.</p>

<h2>Marketing Cookies</h2>
<p>If advertising is enabled on a given page, marketing cookies may be used by ad networks to measure ad performance and, in some cases, to personalize the ads shown to you.</p>

<h2>Third Party Cookies</h2>
<p>Some cookies are set by third-party services we integrate â€” analytics, embedded video, social share widgets, and ad networks. Each provider follows its own cookie policy.</p>

<h2>Google Cookies</h2>
<p>Google services (Analytics, AdSense) may set cookies for measurement and, where enabled, advertising. You can opt out of personalized advertising at <a href="https://adssettings.google.com" rel="nofollow noopener">Google Ads Settings</a>.</p>

<h2>User Preferences</h2>
<p>Cookies also remember preferences such as dark mode, saved items, and dismissed banners so you don''t have to reconfigure them on every visit.</p>

<h2>Managing Cookies</h2>
<p>You can clear existing cookies and block new ones from your browser settings. Some features (such as staying signed in or saving items) will stop working without essential cookies.</p>

<h2>Browser Settings</h2>
<p>Instructions for managing cookies are available in the help pages of Chrome, Firefox, Safari, and Edge. On mobile, cookie controls live within your device''s browser settings.</p>

<h2>Consent</h2>
<p>By using HalloweenTools.com you consent to the use of cookies as described here. Where required by law, we display a consent banner asking for your permission before setting non-essential cookies.</p>$$
),
(
  'dmca',
  'DMCA Policy',
  'How to report copyright infringement on HalloweenTools.com.',
  'DMCA Policy â€” HalloweenTools',
  'How to submit a DMCA takedown notice or counter-notice to HalloweenTools.com under the Digital Millennium Copyright Act.',
$$<h2>Copyright Protection</h2>
<p>HalloweenTools.com respects intellectual property rights and expects users to do the same. We respond to properly submitted takedown notices under the Digital Millennium Copyright Act ("DMCA") and equivalent laws.</p>

<h2>Reporting Copyright Infringement</h2>
<p>If you believe content on HalloweenTools.com infringes your copyright, send a DMCA notice to <strong>dmca@halloweentools.com</strong>.</p>

<h2>Submitting a DMCA Notice</h2>
<p>A valid notice must include:</p>
<ul>
<li>Your physical or electronic signature.</li>
<li>Identification of the copyrighted work you claim has been infringed.</li>
<li>The URL(s) of the specific material on our site that you believe is infringing.</li>
<li>Your name, address, phone number, and email.</li>
<li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
<li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on behalf of the owner.</li>
</ul>

<h2>Counter Notice</h2>
<p>If content you posted was removed and you believe the removal was mistaken, you may submit a counter-notice containing your contact information, the material that was removed, the URL where it appeared, a statement under penalty of perjury that you have a good faith belief the removal was in error, and your consent to jurisdiction in a US federal court.</p>

<h2>Repeat Infringer Policy</h2>
<p>Accounts that repeatedly infringe intellectual property rights will be terminated. We keep records of DMCA notices and act promptly on repeat infringement.</p>

<h2>Contact</h2>
<p>DMCA notices and counter-notices: <strong>dmca@halloweentools.com</strong>. General copyright questions: <a href="/contact">contact page</a>.</p>$$
),
(
  'community-guidelines',
  'Community Guidelines',
  'The behavior we expect from everyone in the HalloweenTools.com community.',
  'Community Guidelines â€” HalloweenTools',
  'Community rules for HalloweenTools.com â€” respectful behavior, spam, harassment, adult content, and reporting.',
$$<p>The HalloweenTools.com community is a place for Halloween creators to share cards, invitations, posters, wallpapers, captions, quotes, wishes, stories, images, and ideas. These guidelines exist so that everyone can participate safely.</p>

<h2>Respectful Behavior</h2>
<p>Treat other creators with respect. Constructive feedback is welcome; personal attacks are not.</p>

<h2>No Spam</h2>
<p>Do not post repetitive content, off-topic promotion, referral bait, or automated submissions. Rate limits and duplicate detection are in place, and violating them will cause posts to be rejected or hidden.</p>

<h2>No Harassment</h2>
<p>Do not target individuals with abuse, threats, doxxing, sustained negative attention, or coordinated pile-ons.</p>

<h2>No Adult Content</h2>
<p>HalloweenTools.com is a family-friendly Halloween site. Sexual, sexually suggestive, or explicit content is not allowed anywhere in the community.</p>

<h2>No Graphic Violence</h2>
<p>Spooky and creepy Halloween themes are welcome. Gore, real-world violence, self-harm content, and shock imagery are not.</p>

<h2>No Hate Speech</h2>
<p>Content that attacks people based on race, ethnicity, national origin, religion, disability, gender, sexual orientation, or similar characteristics is prohibited.</p>

<h2>No Illegal Content</h2>
<p>Do not post content that is illegal where you live or where our service operates.</p>

<h2>Respect Copyright</h2>
<p>Only publish work you created or have permission to use. Attribution is required when a tool page or template calls for it. See our <a href="/dmca">DMCA Policy</a>.</p>

<h2>No Fake or Misleading Content</h2>
<p>Do not misrepresent AI-generated content as another person''s work, impersonate real people, or use community features to spread false information.</p>

<h2>Reporting Users and Posts</h2>
<p>Every community post has a Report button. Reports are reviewed by moderators; posts flagged multiple times are auto-hidden pending review.</p>

<h2>Moderation</h2>
<p>We combine automatic moderation (AI content review, duplicate/spam detection, rate limits) with human review. Moderation decisions aim to protect the community, not to police creativity.</p>

<h2>Account Actions</h2>
<p>Consequences scale with severity: content removal, temporary posting restrictions, temporary suspension, and â€” for serious or repeated violations â€” permanent account termination.</p>$$
),
(
  'ai-content-policy',
  'AI Content Policy',
  'How AI works on HalloweenTools.com and what we expect from users.',
  'AI Content Policy â€” HalloweenTools',
  'How AI-generated content works on HalloweenTools.com, user responsibilities, limitations, and acceptable use.',
$$<h2>How AI Content Is Generated</h2>
<p>Our AI tools send your prompt to a large language model or image model, then return the model''s response. We use a fallback chain across multiple AI providers to keep the tools running.</p>

<h2>User Responsibility</h2>
<p>You are responsible for the prompts you submit and for the outputs you publish, share, or use commercially. Do not prompt for content that violates our <a href="/community-guidelines">Community Guidelines</a> or applicable law.</p>

<h2>Limitations</h2>
<p>AI models can produce plausible-sounding but incorrect information, biased phrasing, or images with anatomical or textual glitches. Outputs are a starting point, not a finished deliverable.</p>

<h2>Accuracy</h2>
<p>Do not rely on AI outputs for factual claims, safety guidance, medical, legal, or professional advice. Verify anything important against authoritative sources.</p>

<h2>Review Before Publishing</h2>
<p>Read and edit AI outputs before publishing them to the community or using them publicly. You are the author of the final version.</p>

<h2>Acceptable Use</h2>
<p>Do not use AI tools to generate sexual content, sexual content involving minors, targeted harassment, hate speech, disinformation, deceptive impersonation, or content that infringes third-party rights.</p>

<h2>Ownership</h2>
<p>Subject to the model provider''s terms and applicable law, outputs you generate through our tools are yours to use. HalloweenTools.com does not claim ownership over AI outputs you generate for personal use.</p>

<h2>AI Generated Images</h2>
<p>Images produced by our AI image tools may include a subtle "AI generated" indicator in metadata. When sharing AI images publicly, label them as AI-generated where the context calls for it.</p>

<h2>AI Generated Text</h2>
<p>Captions, quotes, wishes, stories, and other text outputs are computer-generated. Human editing is recommended before publishing to the community or using in commercial materials.</p>$$
),
(
  'ugc-policy',
  'User Generated Content Policy',
  'What you can publish to the HalloweenTools.com community, and how it is licensed.',
  'User Generated Content Policy â€” HalloweenTools',
  'Rules for publishing community content on HalloweenTools.com â€” ownership, licensing, moderation, and removal.',
$$<h2>Publishing Rules</h2>
<p>Community publishing is available to signed-in accounts in good standing. Every submission passes through automatic moderation, duplicate detection, spam heuristics, and rate limits.</p>

<h2>Ownership</h2>
<p>You retain full ownership of content you publish. HalloweenTools.com does not claim your work as its own.</p>

<h2>Licensing</h2>
<p>By publishing to the community you grant HalloweenTools.com a worldwide, non-exclusive, royalty-free license to host, display, distribute, adapt (for example generating thumbnails or previews), and use your submission to operate and promote the Service. The license ends when you delete the content, except for cached copies already served.</p>

<h2>Public Visibility</h2>
<p>Community posts are public. Each post has its own URL, appears in listings and search results, and can be shared externally. Do not include personal information you do not want to share.</p>

<h2>Moderation</h2>
<p>We use a combination of automatic moderation (AI review, duplicate hashing, spam heuristics, rate limits) and human review. Posts may be hidden, unpublished, or removed for violating our <a href="/community-guidelines">Community Guidelines</a>.</p>

<h2>Reporting</h2>
<p>Every post has a Report button. Reports are reviewed by moderators; posts flagged multiple times are auto-hidden pending review.</p>

<h2>Removal Requests</h2>
<p>You may delete your own posts at any time from your creator profile. If you cannot access your account, contact us via the <a href="/contact">contact page</a>.</p>

<h2>Copyright</h2>
<p>Only publish work you created or have the right to publish. Copyright infringement is handled under our <a href="/dmca">DMCA Policy</a>.</p>

<h2>Privacy</h2>
<p>Do not publish personal information about other people without their consent. Do not use community features to identify, locate, or harass private individuals.</p>

<h2>Content Retention</h2>
<p>Published posts remain online until you delete them, we remove them under our policies, or your account is closed. Backups and logs may retain traces for a limited period after deletion.</p>$$
),
(
  'accessibility',
  'Accessibility Statement',
  'Our commitment to making HalloweenTools.com usable by everyone.',
  'Accessibility Statement â€” HalloweenTools',
  'How HalloweenTools.com works with screen readers, keyboards, and assistive technologies, and how to report issues.',
$$<h2>Accessibility Goals</h2>
<p>HalloweenTools.com aims to conform to WCAG 2.1 Level AA across our tools, articles, and community features. Accessibility work is ongoing, and we treat accessibility bugs as first-class issues.</p>

<h2>Screen Reader Support</h2>
<p>Pages use semantic HTML â€” headings, landmarks, lists, and labels â€” so screen readers can navigate content in a meaningful order. Images include alt text where they convey information.</p>

<h2>Keyboard Navigation</h2>
<p>All interactive elements â€” links, buttons, form fields, dialogs â€” are reachable and operable with a keyboard. Visible focus indicators are preserved.</p>

<h2>Contrast</h2>
<p>Text meets WCAG AA contrast ratios against its background. The dark Halloween palette is tuned so headings, body text, and interactive controls remain readable.</p>

<h2>Responsive Design</h2>
<p>The site adapts to mobile, tablet, and desktop viewports, and supports browser zoom up to 200% without loss of content or functionality.</p>

<h2>Reporting Accessibility Issues</h2>
<p>Found something that does not work with your assistive technology? Email <strong>accessibility@halloweentools.com</strong> or reach us via the <a href="/contact">contact page</a>. Include the page URL, the assistive tech you are using, and a short description. We take accessibility reports seriously and respond within a reasonable time.</p>$$
),
(
  'contact',
  'Contact HalloweenTools',
  'Get in touch with the HalloweenTools team.',
  'Contact â€” HalloweenTools',
  'Contact HalloweenTools for support, business inquiries, copyright, DMCA, and privacy requests.',
$$<p>We read everything. Use the address that matches your request so we can route it to the right person.</p>

<h2>General &amp; Support</h2>
<p>Questions about tools, bug reports, feature requests: <strong>hello@halloweentools.com</strong></p>

<h2>Business Inquiries</h2>
<p>Partnerships, sponsorships, editorial collaborations: <strong>business@halloweentools.com</strong></p>

<h2>Copyright Requests</h2>
<p>Attribution questions, licensing, permissions: <strong>copyright@halloweentools.com</strong></p>

<h2>DMCA Requests</h2>
<p>Formal DMCA takedown notices and counter-notices: <strong>dmca@halloweentools.com</strong>. See our <a href="/dmca">DMCA Policy</a> for the required contents.</p>

<h2>Privacy Requests</h2>
<p>Data access, correction, deletion, CCPA and GDPR requests: <strong>privacy@halloweentools.com</strong>. See our <a href="/privacy">Privacy Policy</a> for your rights.</p>

<h2>Accessibility</h2>
<p>Report accessibility issues: <strong>accessibility@halloweentools.com</strong>.</p>

<h2>Response Time</h2>
<p>We aim to reply within two business days. Formal legal requests are handled in the order received.</p>$$
),
(
  'about',
  'About HalloweenTools',
  'The internet''s biggest Halloween toolkit â€” built by Halloween people, for Halloween people.',
  'About HalloweenTools â€” The Internet''s Biggest Halloween Toolkit',
  'HalloweenTools.com is a free Halloween toolkit â€” interactive tools, AI generators, printables, and a creator community.',
$$<h2>Our Mission</h2>
<p>Halloween should be creative, playful, and accessible to everyone. HalloweenTools.com exists to give makers, parents, teachers, party hosts, and creators a single home for every Halloween idea â€” free forever, fast to use, and safe by default.</p>

<h2>Our Vision</h2>
<p>We want HalloweenTools.com to be the most useful Halloween resource on the internet â€” the first place people open in October, and the place they return to every year. That means great tools, great content, and a community of creators who make each other better.</p>

<h2>Why HalloweenTools.com Exists</h2>
<p>Halloween content online is scattered across dozens of blogs, generators, and printable sites â€” most of them slow, ad-heavy, or paywalled. We built HalloweenTools.com to fix that. Every tool loads fast, every printable is free, and every AI feature is one click away.</p>

<h2>What Makes It Different</h2>

<h3>Free Tools</h3>
<p>Every core tool â€” wish generators, quote makers, costume idea finders, pumpkin templates, party planners, banner and poster builders â€” is free to use. No sign-up wall for basic features.</p>

<h3>Community</h3>
<p>Creators can publish their Halloween cards, invitations, posters, banners, wallpapers, captions, quotes, wishes, pumpkin designs, costume ideas, party ideas, AI stories, and AI images to the community. Every post gets its own URL, its own SEO-friendly page, and a creator profile.</p>

<h3>AI Features</h3>
<p>Our AI generators use a fallback chain across multiple providers, so the tools keep working even when one provider is rate-limited. Prompts are moderated automatically, and every output can be edited before publishing.</p>

<h3>Safety</h3>
<p>Community submissions run through automatic content moderation, duplicate detection, and spam heuristics. Users can report anything with one click, and repeated reports auto-hide a post pending review.</p>

<h3>Privacy</h3>
<p>We collect the minimum amount of data needed to run the service. We do not sell personal information. Our <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a> lay out exactly what we collect and why.</p>

<h2>Get Involved</h2>
<p>Sign in to publish to the community, save your favorite tools, and follow other creators. Have feedback or a tool idea? Reach us via our <a href="/contact">contact page</a>.</p>$$
);

REVOKE EXECUTE ON FUNCTION public.snapshot_legal_page() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

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
