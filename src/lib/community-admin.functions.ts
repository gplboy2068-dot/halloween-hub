import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export type AdminFeedItem = {
  id: string;
  slug: string | null;
  tool_slug: string;
  tool_title: string;
  title: string | null;
  kind: string;
  prompt: string | null;
  output: string;
  hidden: boolean;
  editor_pick: boolean;
  moderation_status: string | null;
  moderation_reason: string | null;
  created_at: string;
  user_id: string;
  author: string;
  report_count: number;
  image_url?: string | null;
};

export type AdminFilter = "all" | "pending" | "reported" | "hidden" | "editor_picks";

export const adminListGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { filter?: AdminFilter; limit?: number } | undefined) =>
    z.object({
      filter: z.enum(["all", "pending", "reported", "hidden", "editor_picks"]).default("all"),
      limit: z.number().int().min(1).max(200).default(100),
    }).parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<{ items: AdminFeedItem[] }> => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("generations")
      .select("id, slug, tool_slug, tool_title, title, kind, prompt, output, hidden, editor_pick, moderation_status, moderation_reason, report_count, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (data.filter === "pending") q = q.eq("moderation_status", "pending");
    else if (data.filter === "reported") q = q.gt("report_count", 0);
    else if (data.filter === "hidden") q = q.eq("hidden", true);
    else if (data.filter === "editor_picks") q = q.eq("editor_pick", true);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const profRes = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, display_name").in("id", userIds)
      : { data: [] as any[] };
    const names: Record<string, string> = Object.fromEntries(
      ((profRes as any).data ?? []).map((p: any) => [p.id, p.display_name ?? "Guest"]),
    );

    const imagePaths = (rows ?? []).filter((r) => r.kind === "image").map((r) => r.output);
    const signed: Record<string, string> = {};
    if (imagePaths.length) {
      const { data: sig } = await supabaseAdmin.storage
        .from("community")
        .createSignedUrls(imagePaths, 60 * 60 * 24);
      (sig ?? []).forEach((s) => {
        if (s.path && s.signedUrl) signed[s.path] = s.signedUrl;
      });
    }

    return {
      items: (rows ?? []).map((r: any) => ({
        id: r.id,
        slug: r.slug,
        tool_slug: r.tool_slug,
        tool_title: r.tool_title,
        title: r.title,
        kind: r.kind,
        prompt: r.prompt,
        output: r.output,
        hidden: r.hidden,
        editor_pick: r.editor_pick,
        moderation_status: r.moderation_status,
        moderation_reason: r.moderation_reason,
        report_count: r.report_count ?? 0,
        created_at: r.created_at,
        user_id: r.user_id,
        author: names[r.user_id] ?? "Guest",
        image_url: r.kind === "image" ? signed[r.output] ?? null : null,
      })),
    };
  });

export const adminSetEditorPick = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; editor_pick: boolean }) =>
    z.object({ id: z.string().uuid(), editor_pick: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("generations")
      .update({ editor_pick: data.editor_pick })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetHidden = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; hidden: boolean }) =>
    z.object({ id: z.string().uuid(), hidden: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("generations")
      .update({ hidden: data.hidden })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Try to remove image from storage if applicable
    const { data: row } = await supabaseAdmin
      .from("generations")
      .select("kind, output")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.kind === "image" && row.output) {
      await supabaseAdmin.storage.from("community").remove([row.output]);
    }
    const { error } = await supabaseAdmin.from("generations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
