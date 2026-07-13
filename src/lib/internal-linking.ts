/**
 * Auto-linker + TOC utilities that run server-side on rendered
 * article HTML (from marked + DOMPurify).
 *
 * `autoLinkHtml(html)` scans `<p>` and `<li>` text nodes for
 * high-value phrases (tool names, idea categories, audience hubs)
 * and wraps the FIRST occurrence of each in an internal <a>. Links
 * inside existing anchors, headings, code, and pre blocks are left
 * alone.
 *
 * `extractToc(html)` returns a flat list of heading anchors and
 * mutates the HTML to add `id` attributes on <h2>/<h3> so the
 * generated TOC can deep-link to them.
 */
import { TOOLS } from "./site";
import { IDEA_CATEGORIES, AUDIENCE_PAGES, buildIdeaPages } from "./pseo";

export type LinkTarget = {
  phrase: string; // case-insensitive match
  href: string;
  title: string; // for tooltip
};

// Build a static list of link targets, sorted longest phrase first
// so "pumpkin carving generator" wins over "pumpkin".
let _targets: LinkTarget[] | null = null;
function getLinkTargets(): LinkTarget[] {
  if (_targets) return _targets;
  const t: LinkTarget[] = [];

  // Tools — match the full title and its lowercase slug variant.
  for (const tool of TOOLS) {
    t.push({ phrase: tool.title, href: `/tools/${tool.slug}`, title: `Try the ${tool.title}` });
  }

  // Idea categories — the noun form ("pumpkin carving", "costume")
  // linked to the flagship /ideas/<key>-creative page.
  for (const cat of IDEA_CATEGORIES) {
    t.push({
      phrase: `${cat.noun} ideas`,
      href: `/ideas/${cat.key}-creative`,
      title: `Browse ${cat.noun} ideas`,
    });
  }

  // Audience hubs — link phrases like "Halloween for kids".
  for (const a of AUDIENCE_PAGES) {
    t.push({
      phrase: a.hero,
      href: `/for/${a.slug}`,
      title: a.hero,
    });
  }

  // A handful of high-value long-tail idea pages
  const idea = buildIdeaPages();
  const boosted = idea.filter((i) =>
    /(for-kids|for-couples|for-adults|for-teens|-easy|-scary|-diy)$/.test(i.slug),
  );
  for (const i of boosted) {
    t.push({
      phrase: `${i.category.noun} ideas ${i.audience !== "everyone" ? `for ${i.audience}` : i.style}`,
      href: `/ideas/${i.slug}`,
      title: i.title,
    });
  }

  // Sort longest phrase first so nested matches don't collide.
  t.sort((a, b) => b.phrase.length - a.phrase.length);
  _targets = t;
  return t;
}

// Escape a phrase for RegExp; only ASCII letters/numbers/spaces expected.
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wrap the FIRST case-insensitive occurrence of each target phrase
 * inside paragraph/list content in an internal <a>.
 * Skips <h*>, <a>, <code>, <pre> blocks entirely.
 */
export function autoLinkHtml(html: string, options: { excludeHref?: string } = {}): string {
  if (!html) return html;
  const targets = getLinkTargets().filter((t) => t.href !== options.excludeHref);
  if (!targets.length) return html;

  // Split around block tags we must skip; process only the "safe" pieces.
  const SKIP_TAGS = /<(a\b[^>]*>[\s\S]*?<\/a>|h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>|code\b[^>]*>[\s\S]*?<\/code>|pre\b[^>]*>[\s\S]*?<\/pre>)/gi;

  // Track which targets have been used across the whole doc.
  const used = new Set<string>();

  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = SKIP_TAGS.exec(html)) !== null) {
    parts.push(processChunk(html.slice(last, m.index), targets, used));
    parts.push(m[0]); // keep skipped block verbatim
    last = m.index + m[0].length;
  }
  parts.push(processChunk(html.slice(last), targets, used));
  return parts.join("");
}

function processChunk(chunk: string, targets: LinkTarget[], used: Set<string>): string {
  if (!chunk) return chunk;
  // Only inject inside <p>, <li>, <blockquote> text; other content passes through.
  // Cheap heuristic: split on tag boundaries and only run replace on text pieces.
  return chunk.replace(/(>)([^<]+)(<)/g, (_full, open, text, close) => {
    let out = text as string;
    for (const t of targets) {
      if (used.has(t.href)) continue;
      const re = new RegExp(`\\b(${escapeRe(t.phrase)})\\b`, "i");
      const found = re.exec(out);
      if (!found) continue;
      const start = found.index;
      const end = start + found[0].length;
      const anchor = `<a href="${t.href}" class="ht-autolink" title="${t.title.replace(/"/g, "&quot;")}">${found[0]}</a>`;
      out = out.slice(0, start) + anchor + out.slice(end);
      used.add(t.href);
    }
    return open + out + close;
  });
}

// ============= Table of contents =============

export type TocEntry = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Adds `id` attributes to <h2> and <h3> and returns the TOC.
 */
export function injectToc(html: string): { html: string; toc: TocEntry[] } {
  if (!html) return { html, toc: [] };
  const toc: TocEntry[] = [];
  const seen = new Set<string>();
  const out = html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_full, tag, attrs, inner) => {
    const level = tag === "h2" ? 2 : 3;
    // If it already has an id, respect it.
    const idMatch = /\sid=["']([^"']+)["']/i.exec(attrs);
    let id = idMatch?.[1] ?? slugify(inner);
    if (!id) return `<${tag}${attrs}>${inner}</${tag}>`;
    // Ensure uniqueness.
    let unique = id;
    let n = 2;
    while (seen.has(unique)) unique = `${id}-${n++}`;
    seen.add(unique);
    id = unique;
    toc.push({ id, text: inner.replace(/<[^>]+>/g, "").trim(), level: level as 2 | 3 });
    const newAttrs = idMatch ? attrs : ` id="${id}"${attrs}`;
    return `<${tag}${newAttrs}>${inner}</${tag}>`;
  });
  return { html: out, toc };
}
