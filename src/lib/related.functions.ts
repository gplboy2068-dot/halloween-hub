/**
 * Server function to fetch related blog articles for an arbitrary
 * context (tool page, idea page, audience hub, or another article).
 *
 * Uses the public Supabase client with the published-articles SELECT
 * policy — same shape as the blog list, but ranks candidates by
 * keyword overlap on title/excerpt/tags and by shared category slug.
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

export type RelatedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
};

const STOPWORDS = new Set([
  "the", "and", "for", "with", "your", "you", "our", "are", "this", "that",
  "from", "into", "will", "have", "has", "was", "were", "not", "any", "all",
  "can", "how", "why", "who", "what", "when", "where", "which", "but",
  "halloween", "ideas", "idea", "tool", "tools", "generator", "make", "maker",
  "guide", "best", "top", "free", "new", "get", "use", "using",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export const getRelatedArticlesForContext = createServerFn({ method: "GET" })
  .inputValidator((input: {
    title?: string;
    description?: string;
    keywords?: string[];
    categorySlug?: string;
    excludeSlug?: string;
    limit?: number;
  }) =>
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      categorySlug: z.string().optional(),
      excludeSlug: z.string().optional(),
      limit: z.number().int().positive().max(12).optional(),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<RelatedArticle[]> => {
    const supabase = publicClient();
    const limit = data.limit ?? 3;

    // Pull a candidate pool of the most recent published articles.
    // Small blog — 60 rows is plenty; scale later if needed.
    const { data: rows, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, cover_image, category_id, categories(slug), article_tags(tags(name))")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(60);
    if (error) throw new Error(error.message);

    const parts = [data.title ?? "", data.description ?? "", (data.keywords ?? []).join(" ")];
    const toks = tokenize(parts.join(" "));
    if (!toks.length && !data.categorySlug) {
      // No signal — just return newest 3.
      return (rows ?? [])
        .filter((r: any) => r.slug !== data.excludeSlug)
        .slice(0, limit)
        .map((r: any) => ({
          slug: r.slug,
          title: r.title,
          excerpt: r.excerpt ?? "",
          coverImage: r.cover_image ?? null,
        }));
    }

    const scored = (rows ?? [])
      .filter((r: any) => r.slug !== data.excludeSlug)
      .map((r: any) => {
        const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;
        const tagRows = Array.isArray(r.article_tags) ? r.article_tags : [];
        const tagNames = tagRows
          .map((t: any) => (Array.isArray(t.tags) ? t.tags[0] : t.tags)?.name)
          .filter(Boolean)
          .join(" ");
        const hay = `${r.title} ${r.excerpt ?? ""} ${tagNames}`.toLowerCase();
        let score = 0;
        for (const t of toks) if (hay.includes(t)) score += 1;
        if (data.categorySlug && cat?.slug === data.categorySlug) score += 3;
        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map((x) => ({
      slug: x.r.slug,
      title: x.r.title,
      excerpt: x.r.excerpt ?? "",
      coverImage: x.r.cover_image ?? null,
    }));
  });
