/**
 * Admin store — localStorage-backed CRUD for the CMS.
 * Phase 3 will swap this for Supabase. All hooks use the same shape,
 * so route/UI code won't change.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { TOOLS, ARTICLES, CATEGORIES } from "./site";

export type Status = "draft" | "scheduled" | "published" | "archived";

export type BaseEntity = {
  id: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  author?: string;
};

export type ToolEntity = BaseEntity & {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  featured: boolean;
  popular: boolean;
  isNew: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type ArticleEntity = BaseEntity & {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readingTime: number;
  tags: string[];
};

export type CategoryEntity = BaseEntity & {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export type TagEntity = BaseEntity & { slug: string; name: string; count: number };
export type FaqEntity = BaseEntity & { question: string; answer: string; category: string };
export type RedirectEntity = BaseEntity & { from: string; to: string; code: 301 | 302 };
export type UserEntity = BaseEntity & { email: string; name: string; role: "admin" | "editor" | "viewer" };
export type LogEntity = BaseEntity & { level: "info" | "warn" | "error"; message: string; source: string };

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

// Seed data on first load
const seed: Record<string, unknown[]> = {
  tools: TOOLS.map((t): ToolEntity => ({
    id: uid(),
    slug: t.slug,
    title: t.title,
    description: t.description,
    emoji: t.emoji,
    category: t.category,
    featured: !!t.featured,
    popular: !!t.popular,
    isNew: !!t.isNew,
    status: "published",
    createdAt: now(),
    updatedAt: now(),
    publishedAt: now(),
    author: "Editorial",
  })),
  articles: ARTICLES.map((a): ArticleEntity => ({
    id: uid(),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: "",
    category: a.category,
    readingTime: a.readingTime,
    tags: [],
    status: "published",
    createdAt: now(),
    updatedAt: a.updatedAt,
    publishedAt: a.updatedAt,
    author: "Editorial",
  })),
  categories: CATEGORIES.map((c): CategoryEntity => ({
    id: uid(),
    slug: c.slug,
    name: c.name,
    emoji: c.emoji,
    description: c.description,
    status: "published",
    createdAt: now(),
    updatedAt: now(),
  })),
  tags: ["halloween", "spooky", "pumpkin", "costume", "party", "diy", "printable", "kids"].map((t): TagEntity => ({
    id: uid(), slug: t, name: t, count: Math.floor(Math.random() * 30) + 3,
    status: "published", createdAt: now(), updatedAt: now(),
  })),
  faqs: [
    { question: "Are HalloweenTools tools free?", answer: "Yes, every tool is free with no signup.", category: "General" },
    { question: "Do you save my data?", answer: "No — tools run in your browser whenever possible.", category: "Privacy" },
    { question: "Can I use outputs commercially?", answer: "Most outputs are royalty-free for personal use.", category: "Legal" },
  ].map((f): FaqEntity => ({ id: uid(), ...f, status: "published", createdAt: now(), updatedAt: now() })),
  redirects: [] as RedirectEntity[],
  users: [
    { email: "admin@halloweentools.com", name: "Admin", role: "admin" as const },
  ].map((u): UserEntity => ({ id: uid(), ...u, status: "published", createdAt: now(), updatedAt: now() })),
  logs: [
    { level: "info" as const, message: "Site deployed", source: "system" },
    { level: "info" as const, message: "Seed data loaded", source: "cms" },
  ].map((l): LogEntity => ({ id: uid(), ...l, status: "published", createdAt: now(), updatedAt: now() })),
};

const STORE_KEY = "halloweentools_cms_v1";

type Store = Record<string, BaseEntity[]>;

const listeners = new Set<() => void>();
let cache: Store | null = null;

function loadStore(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return seed as unknown as Store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache!;
    }
  } catch {}
  cache = seed as unknown as Store;
  saveStore(cache);
  return cache;
}

function saveStore(s: Store) {
  cache = s;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function useEntityList<T extends BaseEntity>(entity: string): T[] {
  const store = useSyncExternalStore(
    subscribe,
    () => loadStore()[entity] ?? [],
    () => seed[entity] as BaseEntity[] ?? [],
  );
  return store as T[];
}

export function useEntity<T extends BaseEntity>(entity: string, id: string): T | undefined {
  const list = useEntityList<T>(entity);
  return list.find((x) => x.id === id);
}

export function createEntity<T extends BaseEntity>(entity: string, data: Partial<T>): T {
  const store = { ...loadStore() };
  const item = {
    id: uid(),
    status: "draft" as Status,
    createdAt: now(),
    updatedAt: now(),
    ...data,
  } as unknown as T;
  store[entity] = [item, ...(store[entity] ?? [])];
  saveStore(store);
  return item;
}

export function updateEntity<T extends BaseEntity>(entity: string, id: string, patch: Partial<T>): void {
  const store = { ...loadStore() };
  store[entity] = (store[entity] ?? []).map((x) =>
    x.id === id ? ({ ...x, ...patch, updatedAt: now() } as BaseEntity) : x,
  );
  saveStore(store);
}

export function deleteEntity(entity: string, id: string): void {
  const store = { ...loadStore() };
  store[entity] = (store[entity] ?? []).filter((x) => x.id !== id);
  saveStore(store);
}

export function bulkUpdate(entity: string, ids: string[], patch: Partial<BaseEntity>): void {
  const store = { ...loadStore() };
  store[entity] = (store[entity] ?? []).map((x) =>
    ids.includes(x.id) ? ({ ...x, ...patch, updatedAt: now() }) : x,
  );
  saveStore(store);
}

export function bulkDelete(entity: string, ids: string[]): void {
  const store = { ...loadStore() };
  store[entity] = (store[entity] ?? []).filter((x) => !ids.includes(x.id));
  saveStore(store);
}

export function useAdminStats() {
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");
  const categories = useEntityList<CategoryEntity>("categories");
  const faqs = useEntityList<FaqEntity>("faqs");
  return {
    toolsCount: tools.length,
    toolsPublished: tools.filter((t) => t.status === "published").length,
    toolsDrafts: tools.filter((t) => t.status === "draft").length,
    articlesCount: articles.length,
    articlesPublished: articles.filter((a) => a.status === "published").length,
    articlesDrafts: articles.filter((a) => a.status === "draft").length,
    categoriesCount: categories.length,
    faqsCount: faqs.length,
  };
}

/** Optional localStorage-backed settings/values (theme, site meta, etc.) */
export function useKV<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`kv:${key}`);
      if (raw) setVal(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = useCallback((v: T) => {
    setVal(v);
    try { localStorage.setItem(`kv:${key}`, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}
