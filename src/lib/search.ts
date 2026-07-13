/**
 * Client-side global search index + fuzzy matcher.
 * Builds a flat SearchItem[] from tools, categories, ideas, audience hubs,
 * and (when hydrated) blog articles. All routes are internal.
 */
import { TOOLS, CATEGORIES } from "./site";
import { AUDIENCE_PAGES, buildIdeaPages } from "./pseo";
import type { SearchArticle } from "./search.functions";

export type SearchKind =
  | "tool"
  | "article"
  | "idea"
  | "category"
  | "audience"
  | "tag"
  | "page";

export type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  emoji?: string;
  keywords: string; // pre-lowercased haystack
  category?: string;
};

const STATIC_PAGES: SearchItem[] = [
  { id: "p:home", kind: "page", title: "Home", description: "HalloweenTools homepage", href: "/", emoji: "🏠", keywords: "home halloween tools" },
  { id: "p:tools", kind: "page", title: "All Tools", description: "Browse every Halloween tool", href: "/tools", emoji: "🧰", keywords: "all tools browse" },
  { id: "p:ideas", kind: "page", title: "Ideas Hub", description: "Halloween ideas index", href: "/ideas", emoji: "💡", keywords: "ideas hub inspiration" },
  { id: "p:for", kind: "page", title: "For You", description: "Halloween by audience", href: "/for", emoji: "🎭", keywords: "for audience kids adults couples" },
  { id: "p:blog", kind: "page", title: "Blog", description: "Halloween articles & guides", href: "/blog", emoji: "📰", keywords: "blog articles guides" },
  { id: "p:categories", kind: "page", title: "Categories", description: "Browse by category", href: "/categories", emoji: "🗂️", keywords: "categories" },
];

let staticIndex: SearchItem[] | null = null;

function buildStaticIndex(): SearchItem[] {
  if (staticIndex) return staticIndex;
  const items: SearchItem[] = [...STATIC_PAGES];

  for (const t of TOOLS) {
    items.push({
      id: `t:${t.slug}`,
      kind: "tool",
      title: t.title,
      description: t.description,
      href: `/tools/${t.slug}`,
      emoji: t.emoji,
      category: t.category,
      keywords: `${t.title} ${t.description} ${t.category} tool`.toLowerCase(),
    });
  }
  for (const c of CATEGORIES) {
    items.push({
      id: `c:${c.slug}`,
      kind: "category",
      title: c.name,
      description: c.description,
      href: `/categories/${c.slug}`,
      emoji: c.emoji,
      keywords: `${c.name} ${c.description} category`.toLowerCase(),
    });
  }
  for (const p of AUDIENCE_PAGES) {
    items.push({
      id: `a:${p.slug}`,
      kind: "audience",
      title: p.hero,
      description: p.intro.slice(0, 140),
      href: `/for/${p.slug}`,
      emoji: p.emoji,
      keywords: `${p.hero} ${p.audience} halloween for`.toLowerCase(),
    });
  }
  for (const idea of buildIdeaPages()) {
    items.push({
      id: `i:${idea.slug}`,
      kind: "idea",
      title: idea.title,
      description: idea.description,
      href: `/ideas/${idea.slug}`,
      emoji: idea.category.emoji,
      keywords: `${idea.title} ${idea.description} ${idea.category.noun} ${idea.audience} ${idea.style}`.toLowerCase(),
    });
  }

  staticIndex = items;
  return items;
}

export function buildFullIndex(articles: SearchArticle[] = []): SearchItem[] {
  const base = buildStaticIndex();
  const articleItems: SearchItem[] = articles.map((a) => ({
    id: `b:${a.slug}`,
    kind: "article",
    title: a.title,
    description: a.excerpt,
    href: `/blog/${a.slug}`,
    emoji: "📖",
    category: a.category ?? undefined,
    keywords: `${a.title} ${a.excerpt} ${a.category ?? ""} ${a.tags.join(" ")} article`.toLowerCase(),
  }));
  const tagSet = new Set<string>();
  for (const a of articles) for (const t of a.tags) tagSet.add(t);
  const tagItems: SearchItem[] = Array.from(tagSet).map((name) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return {
      id: `tag:${slug}`,
      kind: "tag",
      title: `#${name}`,
      description: `Articles tagged ${name}`,
      href: `/blog/tag/${slug}`,
      emoji: "🏷️",
      keywords: `${name} tag`.toLowerCase(),
    };
  });
  return [...base, ...articleItems, ...tagItems];
}

/** Simple weighted search: title > description > keywords, supports multi-token AND. */
export function searchItems(index: SearchItem[], query: string, limit = 40): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];
  for (const it of index) {
    const title = it.title.toLowerCase();
    const desc = it.description.toLowerCase();
    let score = 0;
    let allTokensMatch = true;
    for (const tok of tokens) {
      if (title.startsWith(tok)) score += 12;
      else if (title.includes(tok)) score += 8;
      else if (desc.includes(tok)) score += 3;
      else if (it.keywords.includes(tok)) score += 1;
      else {
        allTokensMatch = false;
        break;
      }
    }
    if (!allTokensMatch) continue;
    // Kind boost: prefer tools & articles slightly
    if (it.kind === "tool") score += 2;
    if (it.kind === "article") score += 1;
    scored.push({ item: it, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

export function groupByKind(items: SearchItem[]): Record<SearchKind, SearchItem[]> {
  const out: Record<SearchKind, SearchItem[]> = {
    tool: [], article: [], idea: [], category: [], audience: [], tag: [], page: [],
  };
  for (const it of items) out[it.kind].push(it);
  return out;
}

export const KIND_LABELS: Record<SearchKind, string> = {
  tool: "Tools",
  article: "Articles",
  idea: "Ideas",
  category: "Categories",
  audience: "For You",
  tag: "Tags",
  page: "Pages",
};

// ============= Popular / Trending / Recent =============

export const POPULAR_SEARCHES = [
  "pumpkin carving",
  "costume ideas",
  "scary story",
  "halloween captions",
  "party planner",
  "kids costume",
  "couple costume",
  "spooky wallpaper",
];

export const TRENDING_SEARCHES = [
  "cracked porcelain makeup",
  "dark academia costume",
  "AI pumpkin template",
  "halloween 2026",
  "group costume ideas",
  "diy costume last minute",
];

const RECENT_KEY = "ht:recent-searches";
const RECENT_MAX = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(q: string) {
  if (typeof window === "undefined") return;
  const clean = q.trim();
  if (!clean) return;
  const prev = getRecentSearches().filter((s) => s.toLowerCase() !== clean.toLowerCase());
  const next = [clean, ...prev].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}
