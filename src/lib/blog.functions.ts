/**
 * Public blog server functions — unauthenticated, uses the Supabase
 * publishable client with narrow public SELECT policies (published
 * articles, tags, categories, profiles).
 *
 * Consumed by the public /blog, /blog/$slug, /blog/category/$slug,
 * /blog/tag/$slug routes, plus the sitemap/RSS handlers.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function publicClient(): SupabaseClient {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: { id: string; slug: string; name: string } | null;
  readTimeMin: number;
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  tags: { slug: string; name: string }[];
};

export type ArticleDetail = ArticleListItem & {
  contentHtml: string;
  contentRaw: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
};

function shapeListRow(row: any): ArticleListItem {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const tagRows = Array.isArray(row.article_tags) ? row.article_tags : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    coverImage: row.cover_image ?? null,
    category: cat ? { id: cat.id, slug: cat.slug, name: cat.name } : null,
    readTimeMin: row.read_time_min ?? 5,
    featured: !!row.featured,
    publishedAt: row.published_at ?? null,
    updatedAt: row.updated_at ?? row.created_at,
    tags: tagRows
      .map((t: any) => {
        const tag = Array.isArray(t.tags) ? t.tags[0] : t.tags;
        return tag ? { slug: tag.slug, name: tag.name } : null;
      })
      .filter(Boolean),
  };
}

async function renderMarkdown(md: string, articleSlug?: string): Promise<{ html: string; toc: import("./internal-linking").TocEntry[] }> {
  if (!md?.trim()) return { html: "", toc: [] };
  const { marked } = await import("marked");
  const DOMPurifyMod = await import("isomorphic-dompurify");
  const DOMPurify = (DOMPurifyMod as any).default ?? DOMPurifyMod;
  const { autoLinkHtml, injectToc } = await import("./internal-linking");
  marked.setOptions({ gfm: true, breaks: false });
  const raw = await marked.parse(md);
  const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "rel", "id", "class", "title"] });
  const linked = autoLinkHtml(clean, {
    excludeHref: articleSlug ? `/blog/${articleSlug}` : undefined,
  });
  const { html, toc } = injectToc(linked);
  return { html, toc };
}


const LIST_SELECT =
  "id, slug, title, excerpt, cover_image, read_time_min, featured, status, published_at, updated_at, created_at, category_id, categories(id, slug, name), article_tags(tags(slug, name))";

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator(
    (input?: { limit?: number; featuredOnly?: boolean; categorySlug?: string; tagSlug?: string }) =>
      z
        .object({
          limit: z.number().int().positive().max(100).optional(),
          featuredOnly: z.boolean().optional(),
          categorySlug: z.string().optional(),
          tagSlug: z.string().optional(),
        })
        .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let query = supabase
      .from("articles")
      .select(LIST_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (data.featuredOnly) query = query.eq("featured", true);

    if (data.categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      if (!cat) return [] as ArticleListItem[];
      query = query.eq("category_id", cat.id);
    }

    if (data.limit) query = query.limit(data.limit);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    let list = (rows ?? []).map(shapeListRow);

    if (data.tagSlug) {
      list = list.filter((a) => a.tags.some((t) => t.slug === data.tagSlug));
    }
    return list;
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<ArticleDetail | null> => {
    const supabase = publicClient();
    const { data: row, error } = await supabase
      .from("articles")
      .select(
        LIST_SELECT +
          ", content, meta_title, meta_description, og_image, author_id",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const base = shapeListRow(row);
    let author: ArticleDetail["author"] = null;
    const authorId = (row as any).author_id as string | null;
    if (authorId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio")
        .eq("id", authorId)
        .maybeSingle();
      if (prof) {
        author = {
          id: (prof as any).id,
          displayName: (prof as any).display_name,
          avatarUrl: (prof as any).avatar_url,
          bio: (prof as any).bio,
        };
      }
    }
    const contentRaw = (row as any).content ?? "";
    const contentHtml = await renderMarkdown(contentRaw);
    return {
      ...base,
      contentRaw,
      contentHtml,
      metaTitle: (row as any).meta_title ?? null,
      metaDescription: (row as any).meta_description ?? null,
      ogImage: (row as any).og_image ?? null,
      author,
    };
  });


export const listRelatedArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { articleId: string; categoryId?: string | null; limit?: number }) =>
    z
      .object({
        articleId: z.string().uuid(),
        categoryId: z.string().uuid().nullish(),
        limit: z.number().int().positive().max(12).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    let query = supabase
      .from("articles")
      .select(LIST_SELECT)
      .eq("status", "published")
      .neq("id", data.articleId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(data.limit ?? 3);
    if (data.categoryId) query = query.eq("category_id", data.categoryId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const list = (rows ?? []).map(shapeListRow);
    if (list.length >= (data.limit ?? 3) || !data.categoryId) return list;
    // Backfill with any recent published article.
    const need = (data.limit ?? 3) - list.length;
    const { data: extras } = await supabase
      .from("articles")
      .select(LIST_SELECT)
      .eq("status", "published")
      .neq("id", data.articleId)
      .not("category_id", "eq", data.categoryId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(need);
    return [...list, ...((extras ?? []) as any[]).map(shapeListRow)];
  });

export const listBlogCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data: cats, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, icon, color, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  const { data: countsRows } = await supabase
    .from("articles")
    .select("category_id, id")
    .eq("status", "published");
  const counts = new Map<string, number>();
  (countsRows ?? []).forEach((r: any) => {
    if (!r.category_id) return;
    counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
  });
  return (cats ?? [])
    .map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      icon: c.icon ?? "",
      color: c.color ?? "",
      count: counts.get(c.id) ?? 0,
    }))
    .filter((c) => c.count > 0);
});

export const listBlogTags = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data: rows, error } = await supabase
    .from("article_tags")
    .select("tags(id, slug, name), articles!inner(status)")
    .eq("articles.status", "published");
  if (error) throw new Error(error.message);
  const acc = new Map<string, { slug: string; name: string; count: number }>();
  (rows ?? []).forEach((r: any) => {
    const t = Array.isArray(r.tags) ? r.tags[0] : r.tags;
    if (!t) return;
    const prev = acc.get(t.slug);
    if (prev) prev.count += 1;
    else acc.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
  });
  return Array.from(acc.values()).sort((a, b) => b.count - a.count);
});

export const getBlogCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: cat, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, meta_title, meta_description, og_image, icon")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return cat ?? null;
  });

export const getBlogTagBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: tag, error } = await supabase
      .from("tags")
      .select("id, slug, name, description")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return tag ?? null;
  });
