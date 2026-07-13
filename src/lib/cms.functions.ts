/**
 * CMS server functions — admin-scoped CRUD over Supabase.
 * All handlers require an authenticated user with the `admin` role.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { EntityKind } from "./cms-shared";
import { ENTITY_KINDS } from "./cms-shared";

const kindSchema = z.enum(ENTITY_KINDS);

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// -------------------- normalisation ---------------------------------

type CategoryRow = { id: string; name: string; slug: string };

function categoryNameMap(rows: CategoryRow[] | null | undefined) {
  const m = new Map<string, string>();
  (rows ?? []).forEach((c) => m.set(c.id, c.name));
  return m;
}

function normalizeRow(entity: EntityKind, row: any, catMap: Map<string, string>): any {
  const base = {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
  switch (entity) {
    case "tools":
      return {
        ...base,
        slug: row.slug,
        title: row.title,
        description: row.description ?? "",
        emoji: row.icon ?? "🎃",
        category: row.category_id ? catMap.get(row.category_id) ?? "" : "",
        categoryId: row.category_id,
        featured: !!row.featured,
        popular: !!row.popular,
        isNew: !!row.is_new,
        seoTitle: row.meta_title ?? "",
        seoDescription: row.meta_description ?? "",
        status: row.status,
        publishedAt: row.published_at,
      };
    case "articles":
      return {
        ...base,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt ?? "",
        content: row.content ?? "",
        category: row.category_id ? catMap.get(row.category_id) ?? "" : "",
        categoryId: row.category_id,
        readingTime: row.read_time_min ?? 0,
        tags: [],
        status: row.status,
        publishedAt: row.published_at,
      };
    case "categories":
      return {
        ...base,
        slug: row.slug,
        name: row.name,
        emoji: row.icon ?? "🎃",
        description: row.description ?? "",
        status: "published" as const,
      };
    case "tags":
      return {
        ...base,
        slug: row.slug,
        name: row.name,
        description: row.description ?? "",
        count: 0,
        status: "published" as const,
      };
    case "faqs":
      return {
        ...base,
        question: row.question,
        answer: row.answer,
        category: row.category_id ? catMap.get(row.category_id) ?? "" : "",
        categoryId: row.category_id,
        status: row.status,
      };
    case "redirects":
      return {
        ...base,
        from: row.source_path,
        to: row.target_path,
        code: row.status_code,
        status: "published" as const,
      };
  }
}

/** Map camelCase UI values → snake_case DB column names for writes. */
function toDbPatch(entity: EntityKind, values: Record<string, any>): Record<string, any> {
  const v = values;
  const status = v.status === "scheduled" ? "draft" : v.status;
  switch (entity) {
    case "tools":
      return omitUndef({
        slug: v.slug,
        title: v.title,
        description: v.description,
        icon: v.emoji,
        category_id: v.categoryId ?? undefined,
        featured: v.featured,
        popular: v.popular,
        is_new: v.isNew,
        meta_title: v.seoTitle,
        meta_description: v.seoDescription,
        status,
        published_at: status === "published" ? new Date().toISOString() : undefined,
      });
    case "articles":
      return omitUndef({
        slug: v.slug,
        title: v.title,
        excerpt: v.excerpt,
        content: v.content,
        category_id: v.categoryId ?? undefined,
        read_time_min: v.readingTime,
        status,
        published_at: status === "published" ? new Date().toISOString() : undefined,
      });
    case "categories":
      return omitUndef({
        slug: v.slug,
        name: v.name,
        description: v.description,
        icon: v.emoji,
      });
    case "tags":
      return omitUndef({ slug: v.slug, name: v.name, description: v.description });
    case "faqs":
      return omitUndef({
        question: v.question,
        answer: v.answer,
        category_id: v.categoryId ?? undefined,
        status,
      });
    case "redirects":
      return omitUndef({
        source_path: v.from,
        target_path: v.to,
        status_code: v.code ? Number(v.code) : undefined,
      });
  }
}

function omitUndef<T extends Record<string, any>>(o: T): T {
  Object.keys(o).forEach((k) => (o[k] === undefined ? delete o[k] : null));
  return o;
}

function orderCol(entity: EntityKind) {
  if (entity === "redirects" || entity === "categories" || entity === "tags") return "created_at";
  return "updated_at";
}

// -------------------- list -----------------------------------------

export const listEntities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entity: EntityKind }) =>
    z.object({ entity: kindSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { entity } = data;
    const { data: rows, error } = await context.supabase
      .from(entity)
      .select("*")
      .order(orderCol(entity), { ascending: false });
    if (error) throw new Error(error.message);
    let catMap = new Map<string, string>();
    if (entity === "tools" || entity === "articles" || entity === "faqs") {
      const { data: cats } = await context.supabase
        .from("categories")
        .select("id, name, slug");
      catMap = categoryNameMap(cats as CategoryRow[]);
    }
    return (rows ?? []).map((r) => normalizeRow(entity, r, catMap));
  });

// -------------------- get single -----------------------------------

export const getEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entity: EntityKind; id: string }) =>
    z.object({ entity: kindSchema, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from(data.entity)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    let catMap = new Map<string, string>();
    if (data.entity === "tools" || data.entity === "articles" || data.entity === "faqs") {
      const { data: cats } = await context.supabase.from("categories").select("id, name, slug");
      catMap = categoryNameMap(cats as CategoryRow[]);
    }
    return normalizeRow(data.entity, row, catMap);
  });

// -------------------- create ---------------------------------------

const uidSlug = () =>
  "draft-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36);

function defaultsFor(entity: EntityKind): Record<string, any> {
  switch (entity) {
    case "tools":
      return { slug: uidSlug(), title: "Untitled tool", status: "draft", icon: "🎃" };
    case "articles":
      return { slug: uidSlug(), title: "Untitled article", status: "draft" };
    case "categories":
      return { slug: uidSlug(), name: "New category" };
    case "tags":
      return { slug: uidSlug(), name: "new-tag" };
    case "faqs":
      return { question: "New question", answer: "Answer…", status: "draft" };
    case "redirects":
      return { source_path: "/from", target_path: "/to", status_code: 301 };
  }
}

export const createEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entity: EntityKind; values?: Record<string, any> }) =>
    z
      .object({ entity: kindSchema, values: z.record(z.string(), z.any()).optional() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch = { ...defaultsFor(data.entity), ...toDbPatch(data.entity, data.values ?? {}) };
    const { data: row, error } = await context.supabase
      .from(data.entity)
      .insert(patch as never)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId,
      action: "create",
      entity_type: data.entity,
      entity_id: row.id,
    });
    return { id: row.id as string };
  });

// -------------------- update ---------------------------------------

export const updateEntity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { entity: EntityKind; id: string; values: Record<string, any> }) =>
      z
        .object({
          entity: kindSchema,
          id: z.string().uuid(),
          values: z.record(z.string(), z.any()),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch = toDbPatch(data.entity, data.values);
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await context.supabase
      .from(data.entity)
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId,
      action: "update",
      entity_type: data.entity,
      entity_id: data.id,
    });
    return { ok: true };
  });

// -------------------- delete ---------------------------------------

export const deleteEntities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entity: EntityKind; ids: string[] }) =>
    z
      .object({ entity: kindSchema, ids: z.array(z.string().uuid()).min(1) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from(data.entity)
      .delete()
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert(
      data.ids.map((id) => ({
        actor_id: context.userId,
        action: "delete",
        entity_type: data.entity,
        entity_id: id,
      })),
    );
    return { ok: true };
  });

// -------------------- bulk status ----------------------------------

export const bulkUpdateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { entity: EntityKind; ids: string[]; status: string }) =>
      z
        .object({
          entity: kindSchema,
          ids: z.array(z.string().uuid()).min(1),
          status: z.enum(["draft", "published", "archived"]),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Only some tables have a status column.
    if (!["tools", "articles", "faqs"].includes(data.entity)) {
      return { ok: true, skipped: true };
    }
    const patch: Record<string, any> = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    const { error } = await context.supabase
      .from(data.entity)
      .update(patch as never)
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------------------- admin stats ----------------------------------

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [tools, articles, categories, faqs] = await Promise.all([
      context.supabase.from("tools").select("status", { count: "exact" }),
      context.supabase.from("articles").select("status", { count: "exact" }),
      context.supabase.from("categories").select("id", { count: "exact", head: true }),
      context.supabase.from("faqs").select("id", { count: "exact", head: true }),
    ]);
    const countBy = (rows: any[] | null, s: string) =>
      (rows ?? []).filter((r) => r.status === s).length;
    return {
      toolsCount: tools.count ?? 0,
      toolsPublished: countBy(tools.data as any[], "published"),
      toolsDrafts: countBy(tools.data as any[], "draft"),
      articlesCount: articles.count ?? 0,
      articlesPublished: countBy(articles.data as any[], "published"),
      articlesDrafts: countBy(articles.data as any[], "draft"),
      categoriesCount: categories.count ?? 0,
      faqsCount: faqs.count ?? 0,
    };
  });

// -------------------- recent activity ------------------------------

export const getRecentActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      createdAt: r.created_at,
      level: "info" as const,
      source: r.entity_type ?? "system",
      message: `${r.action} ${r.entity_type ?? ""} ${r.entity_id ?? ""}`.trim(),
    }));
  });

// -------------------- settings -------------------------------------

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  // Public read via Data API (RLS: settings readable by everyone).
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(process.env.SUPABASE_URL!, key, {
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
  const { data } = await supabase.from("site_settings").select("*");
  const out: Record<string, any> = {};
  (data ?? []).forEach((row: any) => {
    out[row.key] = row.value;
  });
  return out;
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { values: Record<string, any> }) =>
    z.object({ values: z.record(z.string(), z.any()) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const rows = Object.entries(data.values).map(([key, value]) => ({
      key,
      value,
      updated_by: context.userId,
    }));
    if (rows.length === 0) return { ok: true };
    const { error } = await context.supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
