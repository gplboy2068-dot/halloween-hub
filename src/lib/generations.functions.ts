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

export type FeedItem = {
  id: string;
  tool_slug: string;
  tool_title: string;
  kind: string;
  prompt: string | null;
  output: string;
  created_at: string;
  author: string;
};

/** Public feed — anyone can view non-hidden entries. */
export const listGenerations = createServerFn({ method: "GET" })
  .inputValidator((input: { tool?: string; limit?: number; before?: string } | undefined) =>
    z
      .object({
        tool: z.string().max(120).optional(),
        limit: z.number().int().min(1).max(50).default(30),
        before: z.string().datetime().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ items: FeedItem[] }> => {
    const supabase = publicClient();
    let q = supabase
      .from("generations")
      .select("id, tool_slug, tool_title, kind, prompt, output, created_at, user_id")
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.tool) q = q.eq("tool_slug", data.tool);
    if (data.before) q = q.lt("created_at", data.before);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let names: Record<string, string> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      names = Object.fromEntries((profs ?? []).map((p) => [p.id, p.display_name ?? "Guest"]));
    }
    return {
      items: (rows ?? []).map((r) => ({
        id: r.id,
        tool_slug: r.tool_slug,
        tool_title: r.tool_title,
        kind: r.kind,
        prompt: r.prompt,
        output: r.output,
        created_at: r.created_at,
        author: names[r.user_id] ?? "Guest",
      })),
    };
  });

/** Sign-in required — share your generation to the public feed. */
export const createGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    toolSlug: string;
    toolTitle: string;
    output: string;
    prompt?: string;
    kind?: "text" | "image" | "long";
  }) =>
    z
      .object({
        toolSlug: z.string().min(1).max(120),
        toolTitle: z.string().min(1).max(200),
        output: z.string().min(1).max(20000),
        prompt: z.string().max(2000).optional(),
        kind: z.enum(["text", "image", "long"]).default("text"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({
        user_id: context.userId,
        tool_slug: data.toolSlug,
        tool_title: data.toolTitle,
        output: data.output,
        prompt: data.prompt ?? null,
        kind: data.kind,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row!.id };
  });

/** Sign-in required — flag inappropriate content. */
export const reportGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; reason?: string }) =>
    z.object({ id: z.string().uuid(), reason: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generation_reports")
      .insert({ generation_id: data.id, reporter_id: context.userId, reason: data.reason ?? null });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

/** Sign-in required — delete your own entry. */
export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("generations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
