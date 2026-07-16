import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type LegalPage = {
  slug: string;
  title: string;
  lead: string | null;
  meta_title: string;
  meta_description: string;
  content: string;
  published: boolean;
  version: number;
  updated_at: string;
  created_at: string;
};

export type LegalVersion = {
  id: string;
  slug: string;
  version: number;
  title: string;
  lead: string | null;
  meta_title: string;
  meta_description: string;
  content: string;
  created_at: string;
};

function makePublicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const url = process.env.SUPABASE_URL!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
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

/** Public: fetch a published legal page by slug. Returns null when missing. */
export const getLegalPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = makePublicClient();
    const { data: row, error } = await sb
      .from("legal_pages")
      .select("slug,title,lead,meta_title,meta_description,content,published,version,updated_at,created_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as LegalPage | null) ?? null;
  });

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

/** Admin: list all legal pages (draft + published). */
export const adminListLegalPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("legal_pages")
      .select("slug,title,lead,meta_title,meta_description,content,published,version,updated_at,created_at")
      .order("slug", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as LegalPage[];
  });

export const adminGetLegalPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("legal_pages")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as LegalPage | null) ?? null;
  });

export const adminSaveLegalPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    slug: string;
    title: string;
    lead: string | null;
    meta_title: string;
    meta_description: string;
    content: string;
    published: boolean;
  }) =>
    z
      .object({
        slug: z.string().min(1).max(80),
        title: z.string().min(1).max(200),
        lead: z.string().max(500).nullable(),
        meta_title: z.string().min(1).max(200),
        meta_description: z.string().min(1).max(400),
        content: z.string().min(1),
        published: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("legal_pages")
      .upsert({ ...data, updated_by: context.userId }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListLegalVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("legal_page_versions")
      .select("id,slug,version,title,lead,meta_title,meta_description,content,created_at")
      .eq("slug", data.slug)
      .order("version", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (rows ?? []) as LegalVersion[];
  });

export const adminRevertLegalVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { versionId: string }) => z.object({ versionId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: v, error: vErr } = await context.supabase
      .from("legal_page_versions")
      .select("*")
      .eq("id", data.versionId)
      .maybeSingle();
    if (vErr) throw new Error(vErr.message);
    if (!v) throw new Error("Version not found");
    const { error } = await context.supabase
      .from("legal_pages")
      .update({
        title: v.title,
        lead: v.lead,
        meta_title: v.meta_title,
        meta_description: v.meta_description,
        content: v.content,
        updated_by: context.userId,
      })
      .eq("slug", v.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
