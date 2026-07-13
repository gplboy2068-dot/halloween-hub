/**
 * Related Content Engine — client-safe keyword scoring across all
 * content types (tools, ideas, audience hubs). Blog articles come
 * from the server via `related.functions.ts`.
 *
 * Design goal: given any "context" (title + description + keywords),
 * return the top N most relevant items of each kind, so every content
 * page can cross-link into Tools ↔ Ideas ↔ Audience ↔ Articles.
 */
import { TOOLS, type ToolCard } from "./site";
import { AUDIENCE_PAGES, buildIdeaPages, type IdeaPage, type AudiencePage } from "./pseo";

export type RelatedKind = "tool" | "idea" | "audience" | "article";

export type RelatedItem = {
  kind: RelatedKind;
  slug: string;
  title: string;
  description: string;
  href: string;
  emoji?: string;
  badge?: string; // small label e.g. "Tool", "Idea"
};

const STOPWORDS = new Set([
  "the", "and", "for", "with", "your", "you", "our", "are", "this", "that",
  "from", "into", "will", "have", "has", "was", "were", "not", "any", "all",
  "can", "how", "why", "who", "what", "when", "where", "which", "but",
  "halloween", "ideas", "idea", "tool", "tools", "generator", "make", "maker",
  "guide", "best", "top", "free", "new", "get", "use", "using",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

export type RelatedContext = {
  title?: string;
  description?: string;
  keywords?: string[]; // extra explicit tags (tag names, category, audience...)
  category?: string;
  excludeHref?: string; // don't recommend the page you're on
};

function contextTokens(ctx: RelatedContext): string[] {
  const parts: string[] = [];
  if (ctx.title) parts.push(ctx.title);
  if (ctx.description) parts.push(ctx.description);
  if (ctx.category) parts.push(ctx.category);
  if (ctx.keywords?.length) parts.push(ctx.keywords.join(" "));
  const toks = tokenize(parts.join(" "));
  // dedupe while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of toks) if (!seen.has(t)) { seen.add(t); out.push(t); }
  return out;
}

function scoreOverlap(haystack: string, tokens: string[]): number {
  if (!tokens.length) return 0;
  const hay = haystack.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 1;
  }
  return score;
}

// ============= Tools =============

function toolToRelated(t: ToolCard): RelatedItem {
  return {
    kind: "tool",
    slug: t.slug,
    title: t.title,
    description: t.description,
    href: `/tools/${t.slug}`,
    emoji: t.emoji,
    badge: "Tool",
  };
}

export function getRelatedTools(ctx: RelatedContext, limit = 4): RelatedItem[] {
  const toks = contextTokens(ctx);
  const scored = TOOLS.map((t) => {
    const hay = `${t.title} ${t.description} ${t.category}`;
    let s = scoreOverlap(hay, toks);
    if (ctx.category && t.category.toLowerCase() === ctx.category.toLowerCase()) s += 3;
    if (t.featured) s += 0.5;
    return { t, s };
  })
    .filter((x) => x.s > 0 && `/tools/${x.t.slug}` !== ctx.excludeHref)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
  return scored.map((x) => toolToRelated(x.t));
}

// ============= Ideas =============

let _ideaCache: IdeaPage[] | null = null;
function allIdeas(): IdeaPage[] {
  if (!_ideaCache) _ideaCache = buildIdeaPages();
  return _ideaCache;
}

function ideaToRelated(i: IdeaPage): RelatedItem {
  return {
    kind: "idea",
    slug: i.slug,
    title: i.title,
    description: i.description,
    href: `/ideas/${i.slug}`,
    emoji: i.category.emoji,
    badge: "Idea",
  };
}

export function getRelatedIdeas(ctx: RelatedContext, limit = 4): RelatedItem[] {
  const toks = contextTokens(ctx);
  if (!toks.length) return [];
  const scored = allIdeas().map((i) => {
    const hay = `${i.title} ${i.description} ${i.category.noun} ${i.audience} ${i.style}`;
    return { i, s: scoreOverlap(hay, toks) };
  })
    .filter((x) => x.s > 0 && `/ideas/${x.i.slug}` !== ctx.excludeHref)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
  return scored.map((x) => ideaToRelated(x.i));
}

// ============= Audience hubs =============

function audienceToRelated(a: AudiencePage): RelatedItem {
  return {
    kind: "audience",
    slug: a.slug,
    title: a.hero,
    description: a.intro.slice(0, 140),
    href: `/for/${a.slug}`,
    emoji: a.emoji,
    badge: "For You",
  };
}

export function getRelatedAudiences(ctx: RelatedContext, limit = 3): RelatedItem[] {
  const toks = contextTokens(ctx);
  if (!toks.length) return [];
  const scored = AUDIENCE_PAGES.map((a) => {
    const hay = `${a.hero} ${a.audience} ${a.intro}`;
    return { a, s: scoreOverlap(hay, toks) };
  })
    .filter((x) => x.s > 0 && `/for/${x.a.slug}` !== ctx.excludeHref)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
  return scored.map((x) => audienceToRelated(x.a));
}

// ============= Article shape (server-injected) =============

export type RelatedArticleInput = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
};

export function articleToRelated(a: RelatedArticleInput): RelatedItem {
  return {
    kind: "article",
    slug: a.slug,
    title: a.title,
    description: a.excerpt,
    href: `/blog/${a.slug}`,
    emoji: "📖",
    badge: "Article",
  };
}

// ============= Unified mixer =============

export type MixedRelated = {
  tools: RelatedItem[];
  ideas: RelatedItem[];
  audiences: RelatedItem[];
  articles: RelatedItem[];
};

export function buildRelatedMix(
  ctx: RelatedContext,
  articles: RelatedArticleInput[] = [],
  limits: Partial<Record<RelatedKind, number>> = {},
): MixedRelated {
  return {
    tools: getRelatedTools(ctx, limits.tool ?? 4),
    ideas: getRelatedIdeas(ctx, limits.idea ?? 4),
    audiences: getRelatedAudiences(ctx, limits.audience ?? 3),
    articles: articles.slice(0, limits.article ?? 3).map(articleToRelated),
  };
}
