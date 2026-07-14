/**
 * Server-only helpers for CMS server functions.
 * Imported by src/lib/cms.functions.ts inside .handler() bodies (via top-level import).
 */
import type { EntityKind } from "./cms-shared";

type CategoryRow = { id: string; name: string; slug: string };

export async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export function categoryNameMap(rows: CategoryRow[] | null | undefined) {
  const m = new Map<string, string>();
  (rows ?? []).forEach((c) => m.set(c.id, c.name));
  return m;
}

export function normalizeRow(entity: EntityKind, row: any, catMap: Map<string, string>): any {
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
        coverImage: row.cover_image ?? "",
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

export function toDbPatch(entity: EntityKind, values: Record<string, any>): Record<string, any> {
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
        cover_image: v.coverImage,
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

export function omitUndef<T extends Record<string, any>>(o: T): T {
  Object.keys(o).forEach((k) => (o[k] === undefined ? delete o[k] : null));
  return o;
}

export function orderCol(entity: EntityKind) {
  if (entity === "redirects" || entity === "categories" || entity === "tags") return "created_at";
  return "updated_at";
}

const uidSlug = () =>
  "draft-" + Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36);

export function defaultsFor(entity: EntityKind): Record<string, any> {
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
