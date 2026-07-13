
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
