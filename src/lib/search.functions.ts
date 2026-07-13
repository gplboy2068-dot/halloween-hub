/**
 * Public search index server function — returns a lightweight list of
 * published blog articles used by the global search palette + /search page.
 * Static content (tools, ideas, audiences, categories) is indexed client-side
 * in src/lib/search.ts.
 */
import { createServerFn } from "@tanstack/react-start";
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

export type SearchArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  tags: string[];
};

export const listSearchArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<SearchArticle[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, categories(name), article_tags(tags(name))")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) return [];
    return (data ?? []).map((row: any) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const tagRows = Array.isArray(row.article_tags) ? row.article_tags : [];
      return {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt ?? "",
        category: cat?.name ?? null,
        tags: tagRows
          .map((t: any) => {
            const tag = Array.isArray(t.tags) ? t.tags[0] : t.tags;
            return tag?.name ?? null;
          })
          .filter(Boolean),
      };
    });
  },
);
