/**
 * CMS server functions — admin-scoped CRUD over Supabase.
 * All handlers require an authenticated user with the `admin` role.
 * Helpers live in ./cms-helpers.server.ts to satisfy TanStack Start's server-fn splitter.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ENTITY_KINDS, type EntityKind } from "./cms-shared";
import {
  assertAdmin,
  categoryNameMap,
  defaultsFor,
  normalizeRow,
  orderCol,
  toDbPatch,
} from "./cms-helpers.server";

const kindSchema = z.enum(ENTITY_KINDS);

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
      const { data: cats } = await context.supabase.from("categories").select("id, name, slug");
      catMap = categoryNameMap(cats as any);
    }
    return (rows ?? []).map((r: any) => normalizeRow(entity, r, catMap));
  });

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
      catMap = categoryNameMap(cats as any);
    }
    return normalizeRow(data.entity, row, catMap);
  });

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

export const deleteEntities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entity: EntityKind; ids: string[] }) =>
    z.object({ entity: kindSchema, ids: z.array(z.string().uuid()).min(1) }).parse(input),
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

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
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
    // SECURITY: Do not leak API keys, secrets, or tokens to the public client
    const lowerKey = row.key.toLowerCase();
    if (lowerKey.includes("key") || lowerKey.includes("secret") || lowerKey.includes("token")) {
      return;
    }
    out[row.key] = row.value;
  });
  return out;
});

export const getAdminSiteSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("site_settings").select("*");
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
      .upsert(rows as never, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const importArticles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      articles: Array<{
        slug: string;
        title: string;
        excerpt?: string;
        content?: string;
        coverImage?: string;
        categorySlug?: string;
        categoryId?: string;
        readingTime?: number;
        status?: "draft" | "published" | "archived";
        publishedAt?: string;
      }>;
    }) =>
      z
        .object({
          articles: z.array(
            z.object({
              slug: z.string().min(1),
              title: z.string().min(1),
              excerpt: z.string().optional(),
              content: z.string().optional(),
              coverImage: z.string().optional(),
              categorySlug: z.string().optional(),
              categoryId: z.string().uuid().optional(),
              readingTime: z.number().optional(),
              status: z.enum(["draft", "published", "archived"]).optional(),
              publishedAt: z.string().optional(),
            })
          ),
        })
        .parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    // 1. Fetch existing categories to map & validate foreign keys
    const { data: existingCats, error: catErr } = await context.supabase
      .from("categories")
      .select("id, slug, name");

    if (catErr) throw new Error(catErr.message);

    const catBySlug = new Map<string, string>();
    const validCatIds = new Set<string>();

    (existingCats ?? []).forEach((c: any) => {
      catBySlug.set(c.slug, c.id);
      catBySlug.set(c.name.toLowerCase(), c.id);
      validCatIds.add(c.id);
    });

    // 2. Identify missing categories and ensure they are created first
    const missingCategorySlugs = new Set<string>();
    for (const art of data.articles) {
      if (
        art.categorySlug &&
        !catBySlug.has(art.categorySlug) &&
        !catBySlug.has(art.categorySlug.toLowerCase())
      ) {
        missingCategorySlugs.add(art.categorySlug);
      }
    }

    if (missingCategorySlugs.size > 0) {
      const newCatsToInsert = Array.from(missingCategorySlugs).map((slug) => ({
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: `${slug} articles`,
        icon: "📚",
      }));

      const { data: insertedCats, error: insertCatErr } = await context.supabase
        .from("categories")
        .upsert(newCatsToInsert as never, { onConflict: "slug" })
        .select("id, slug, name");

      if (insertCatErr) {
        throw new Error(`Failed to create missing categories: ${insertCatErr.message}`);
      }

      (insertedCats ?? []).forEach((c: any) => {
        catBySlug.set(c.slug, c.id);
        catBySlug.set(c.name.toLowerCase(), c.id);
        validCatIds.add(c.id);
      });
    }

    // 3. Map every article's category_id to an existing category ID & validate FK
    const articlesToInsert = [];
    for (const art of data.articles) {
      let resolvedCatId: string | null = null;

      if (art.categoryId && validCatIds.has(art.categoryId)) {
        resolvedCatId = art.categoryId;
      } else if (art.categorySlug) {
        resolvedCatId =
          catBySlug.get(art.categorySlug) ||
          catBySlug.get(art.categorySlug.toLowerCase()) ||
          null;
      }

      // Foreign key validation: ensure category_id exists in categories table or is null
      if (resolvedCatId && !validCatIds.has(resolvedCatId)) {
        resolvedCatId = null;
      }

      articlesToInsert.push({
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt ?? "",
        content: art.content ?? "",
        cover_image: art.coverImage ?? null,
        category_id: resolvedCatId,
        read_time_min: art.readingTime ?? 5,
        status: art.status ?? "published",
        published_at:
          art.publishedAt ??
          (art.status === "published" ? new Date().toISOString() : null),
      });
    }

    // 4. Import articles
    const { data: insertedArticles, error: artErr } = await context.supabase
      .from("articles")
      .upsert(articlesToInsert as never, { onConflict: "slug" })
      .select("id, slug, title, category_id");

    if (artErr) throw new Error(`Article import failed: ${artErr.message}`);

    return {
      success: true,
      importedCount: insertedArticles?.length ?? 0,
      articles: insertedArticles,
    };
  });

