import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const url = process.env.SUPABASE_URL!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function signImageIfNeeded(sb: any, kind: string, output: string): Promise<string> {
  if (kind !== "image") return output;
  const { data } = await sb.storage.from("community").createSignedUrl(output, 60 * 60 * 24);
  return data?.signedUrl ?? output;
}

export type CommunityCard = {
  id: string;
  slug: string;
  tool_slug: string;
  tool_title: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  kind: string;
  output: string;
  prompt: string | null;
  likes_count: number;
  views_count: number;
  editor_pick: boolean;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    handle: string | null;
    avatar_url: string | null;
  };
};

export type CommunitySort = "trending" | "newest" | "most_liked" | "most_viewed" | "editors_picks" | "recommended";

/** Public feed with filters — anyone can view non-hidden entries. */
export const listCommunity = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      sort?: CommunitySort;
      tool?: string;
      category?: string;
      tag?: string;
      creator?: string; // handle
      limit?: number;
    } | undefined) =>
      z
        .object({
          sort: z.enum(["trending", "newest", "most_liked", "most_viewed", "editors_picks", "recommended"]).default("trending"),
          tool: z.string().max(120).optional(),
          category: z.string().max(120).optional(),
          tag: z.string().max(60).optional(),
          creator: z.string().max(60).optional(),
          limit: z.number().int().min(1).max(60).default(30),
        })
        .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ items: CommunityCard[] }> => {
    const sb = publicClient();

    let creatorId: string | null = null;
    if (data.creator) {
      const { data: prof } = await sb.from("profiles").select("id").ilike("handle", data.creator).maybeSingle();
      if (!prof) return { items: [] };
      creatorId = prof.id;
    }

    let q = sb
      .from("generations")
      .select(
        "id, slug, tool_slug, tool_title, title, description, category, tags, kind, output, prompt, likes_count, views_count, editor_pick, created_at, user_id",
      )
      .eq("hidden", false)
      .eq("moderation_status", "approved")
      .limit(data.limit);

    if (data.tool) q = q.eq("tool_slug", data.tool);
    if (data.category) q = q.eq("category", data.category);
    if (data.tag) q = q.contains("tags", [data.tag]);
    if (creatorId) q = q.eq("user_id", creatorId);
    if (data.sort === "editors_picks") q = q.eq("editor_pick", true);

    switch (data.sort) {
      case "newest":
        q = q.order("created_at", { ascending: false });
        break;
      case "most_liked":
        q = q.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "most_viewed":
        q = q.order("views_count", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "editors_picks":
        q = q.order("created_at", { ascending: false });
        break;
      case "recommended":
        // Recommended: editor picks + trending mix — fetch wide, score client-side
        q = q.order("created_at", { ascending: false }).limit(Math.max(data.limit * 3, 60));
        break;
      case "trending":
      default:
        // simple trending: weighted score client-side after fetch
        q = q.order("created_at", { ascending: false }).limit(Math.max(data.limit * 2, 40));
        break;
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let list = rows ?? [];

    if (data.sort === "trending" || data.sort === "recommended") {
      const editorBonus = data.sort === "recommended" ? 20 : 0;
      list = [...list]
        .map((r) => ({
          ...r,
          _score:
            r.likes_count * 3 +
            r.views_count * 0.2 +
            (r.editor_pick ? editorBonus : 0) +
            Math.max(0, 72 - (Date.now() - new Date(r.created_at).getTime()) / 3_600_000),
        }))
        .sort((a: any, b: any) => b._score - a._score)
        .slice(0, data.limit);
    }

    const userIds = Array.from(new Set(list.map((r) => r.user_id)));
    const { data: profs } = userIds.length
      ? await sb.from("profiles").select("id, display_name, handle, avatar_url").in("id", userIds)
      : { data: [] as any[] };
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));

    const cards: CommunityCard[] = [];
    for (const r of list) {
      const p = profMap.get(r.user_id) ?? { id: r.user_id, display_name: "Guest", handle: null, avatar_url: null };
      cards.push({
        id: r.id,
        slug: r.slug ?? r.id,
        tool_slug: r.tool_slug,
        tool_title: r.tool_title,
        title: r.title ?? r.tool_title,
        description: r.description,
        category: r.category,
        tags: r.tags ?? [],
        kind: r.kind,
        output: await signImageIfNeeded(sb, r.kind, r.output),
        prompt: r.prompt,
        likes_count: r.likes_count,
        views_count: r.views_count,
        editor_pick: r.editor_pick,
        created_at: r.created_at,
        author: {
          id: p.id,
          display_name: p.display_name ?? "Guest",
          handle: p.handle,
          avatar_url: p.avatar_url,
        },
      });
    }
    return { items: cards };
  });

/** Public — single post by slug. */
export const getCommunityPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("generations")
      .select(
        "id, slug, tool_slug, tool_title, title, description, category, tags, kind, output, prompt, likes_count, views_count, editor_pick, created_at, user_id",
      )
      .eq("slug", data.slug)
      .eq("hidden", false)
      .eq("moderation_status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { post: null as CommunityCard | null };

    const { data: prof } = await sb
      .from("profiles")
      .select("id, display_name, handle, avatar_url")
      .eq("id", row.user_id)
      .maybeSingle();

    // fire-and-forget view counter
    void sb.rpc("increment_generation_view", { _id: row.id });

    const post: CommunityCard = {
      id: row.id,
      slug: row.slug ?? row.id,
      tool_slug: row.tool_slug,
      tool_title: row.tool_title,
      title: row.title ?? row.tool_title,
      description: row.description,
      category: row.category,
      tags: row.tags ?? [],
      kind: row.kind,
      output: await signImageIfNeeded(sb, row.kind, row.output),
      prompt: row.prompt,
      likes_count: row.likes_count,
      views_count: row.views_count,
      editor_pick: row.editor_pick,
      created_at: row.created_at,
      author: {
        id: prof?.id ?? row.user_id,
        display_name: prof?.display_name ?? "Guest",
        handle: prof?.handle ?? null,
        avatar_url: prof?.avatar_url ?? null,
      },
    };
    return { post };
  });

/** Public — fetch by id (for remix banner). */
export const getCommunityPostById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb
      .from("generations")
      .select("id, slug, tool_slug, tool_title, title, kind, output, prompt, user_id")
      .eq("id", data.id)
      .eq("hidden", false)
      .maybeSingle();
    if (!row) return { post: null };
    const { data: prof } = await sb.from("profiles").select("display_name, handle").eq("id", row.user_id).maybeSingle();
    return {
      post: {
        id: row.id,
        slug: row.slug ?? row.id,
        tool_slug: row.tool_slug,
        tool_title: row.tool_title,
        title: row.title ?? row.tool_title,
        kind: row.kind,
        output: await signImageIfNeeded(sb, row.kind, row.output),
        prompt: row.prompt,
        author: { display_name: prof?.display_name ?? "Guest", handle: prof?.handle ?? null },
      },
    };
  });

/** Public — creator profile by handle. */
export const getCreatorByHandle = createServerFn({ method: "GET" })
  .inputValidator((input: { handle: string }) => z.object({ handle: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: prof } = await sb
      .from("profiles")
      .select("id, display_name, handle, avatar_url, bio, created_at")
      .ilike("handle", data.handle)
      .maybeSingle();
    if (!prof) return { creator: null };

    const [{ data: rows }, { count: followerCount }] = await Promise.all([
      sb
        .from("generations")
        .select("id, slug, tool_slug, tool_title, title, kind, output, likes_count, views_count, category, created_at")
        .eq("user_id", prof.id)
        .eq("hidden", false)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(30),
      sb.from("creator_follows").select("*", { count: "exact", head: true }).eq("creator_id", prof.id),
    ]);

    // Sign image outputs
    const signed = await Promise.all(
      (rows ?? []).map(async (r: any) => ({ ...r, output: await signImageIfNeeded(sb, r.kind, r.output) })),
    );

    const totalLikes = (rows ?? []).reduce((s: number, r: any) => s + (r.likes_count ?? 0), 0);
    const totalViews = (rows ?? []).reduce((s: number, r: any) => s + (r.views_count ?? 0), 0);

    return {
      creator: {
        id: prof.id,
        display_name: prof.display_name ?? "Guest",
        handle: prof.handle,
        avatar_url: prof.avatar_url,
        bio: prof.bio,
        created_at: prof.created_at,
        stats: {
          posts: (rows ?? []).length,
          likes: totalLikes,
          views: totalViews,
          followers: followerCount ?? 0,
        },
        posts: signed as any[],
      },
    };
  });

/** Signed-in — toggle like. */
export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { generationId: string }) =>
    z.object({ generationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("generation_likes")
      .select("user_id")
      .eq("user_id", context.userId)
      .eq("generation_id", data.generationId)
      .maybeSingle();
    if (existing) {
      await context.supabase
        .from("generation_likes")
        .delete()
        .eq("user_id", context.userId)
        .eq("generation_id", data.generationId);
      return { liked: false };
    }
    await context.supabase
      .from("generation_likes")
      .insert({ user_id: context.userId, generation_id: data.generationId });
    return { liked: true };
  });

/** Signed-in — check my like status for a post. */
export const getMyLikeStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { generationId: string }) =>
    z.object({ generationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("generation_likes")
      .select("user_id")
      .eq("user_id", context.userId)
      .eq("generation_id", data.generationId)
      .maybeSingle();
    return { liked: !!row };
  });

/** Signed-in — toggle bookmark. */
export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { generationId: string }) =>
    z.object({ generationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("generation_bookmarks")
      .select("user_id")
      .eq("user_id", context.userId)
      .eq("generation_id", data.generationId)
      .maybeSingle();
    if (existing) {
      await context.supabase
        .from("generation_bookmarks")
        .delete()
        .eq("user_id", context.userId)
        .eq("generation_id", data.generationId);
      return { bookmarked: false };
    }
    await context.supabase
      .from("generation_bookmarks")
      .insert({ user_id: context.userId, generation_id: data.generationId });
    return { bookmarked: true };
  });

// ------- AI moderation (with provider fallback) -------
async function moderateText(text: string): Promise<{ allow: boolean; reason?: string }> {
  if (!text || text.length < 3) return { allow: true };
  try {
    const { aiChatWithFallback } = await import("./ai-providers.server");
    const raw = await aiChatWithFallback({
      model: "google/gemini-2.5-flash-lite",
      jsonMode: true,
      messages: [
        {
          role: "system",
          content:
            'You are a content moderator for a family-friendly Halloween UGC site. Halloween spooky/horror/witchy themes are perfectly fine. REJECT only: sexual content, hate speech, harassment, real-world violence glorification, self-harm, personal data (phone/email/address), spam links, or content unrelated to Halloween. Reply ONLY with strict JSON: {"allow": boolean, "reason": string}.',
        },
        { role: "user", content: text.slice(0, 4000) },
      ],
    });
    const parsed = JSON.parse(raw || "{}");
    return { allow: !!parsed.allow, reason: parsed.reason };
  } catch {
    return { allow: true }; // fail-open
  }
}

const CommunitySubmitInput = z.object({
  toolSlug: z.string().min(1).max(120),
  toolTitle: z.string().min(1).max(200),
  output: z.string().min(1).max(20000),
  prompt: z.string().max(2000).optional(),
  kind: z.enum(["text", "image", "long"]).default("text"),
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(60).optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
});

/** Signed-in — publish a generation to Community with metadata + AI moderation. */
export const submitToCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof CommunitySubmitInput>) => CommunitySubmitInput.parse(input))
  .handler(async ({ data, context }) => {
    // AI moderation on text-like fields
    const textForMod = [data.title, data.description, data.prompt, data.kind !== "image" ? data.output : ""]
      .filter(Boolean)
      .join("\n");
    const mod = await moderateText(textForMod);

    const title = data.title?.trim() || data.toolTitle;
    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({
        user_id: context.userId,
        tool_slug: data.toolSlug,
        tool_title: data.toolTitle,
        output: data.output,
        prompt: data.prompt ?? null,
        kind: data.kind,
        title,
        description: data.description ?? null,
        category: data.category ?? data.toolSlug,
        tags: data.tags ?? [],
        slug: uniqueSlug,
        moderation_status: mod.allow ? "approved" : "rejected",
        moderation_reason: mod.reason ?? null,
        hidden: !mod.allow,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id, slug: row!.slug, allowed: mod.allow, reason: mod.reason };
  });

/** Public — trending strip for homepage / tool pages. */
export const listTrendingCompact = createServerFn({ method: "GET" })
  .inputValidator((input: { tool?: string; limit?: number } | undefined) =>
    z
      .object({
        tool: z.string().max(120).optional(),
        limit: z.number().int().min(1).max(24).default(8),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("generations")
      .select("id, slug, tool_slug, tool_title, title, kind, output, likes_count, views_count, created_at")
      .eq("hidden", false)
      .eq("moderation_status", "approved")
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.tool) q = q.eq("tool_slug", data.tool);
    const { data: rows } = await q;
    const items = await Promise.all(
      (rows ?? []).map(async (r: any) => ({ ...r, output: await signImageIfNeeded(sb, r.kind, r.output) })),
    );
    return { items };
  });

/** Public — creator directory (top creators by post count). */
export const listTopCreators = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number } | undefined) =>
    z.object({ limit: z.number().int().min(1).max(24).default(12) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await sb
      .from("generations")
      .select("user_id")
      .eq("hidden", false)
      .eq("moderation_status", "approved");
    const counts = new Map<string, number>();
    (rows ?? []).forEach((r: any) => counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, data.limit);
    const ids = top.map(([id]) => id);
    const { data: profs } = ids.length
      ? await sb.from("profiles").select("id, display_name, handle, avatar_url").in("id", ids)
      : { data: [] as any[] };
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    return {
      creators: top.map(([id, count]) => ({
        id,
        count,
        display_name: profMap.get(id)?.display_name ?? "Guest",
        handle: profMap.get(id)?.handle ?? null,
        avatar_url: profMap.get(id)?.avatar_url ?? null,
      })),
    };
  });
