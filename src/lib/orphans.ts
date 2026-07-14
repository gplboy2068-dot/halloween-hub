/**
 * Orphan detection over the static content graph. Client-side —
 * good enough for editorial signals; complements the runtime
 * auto-linker in internal-linking.ts.
 */
import { TOOLS } from "@/lib/site";
import { allIdeaSlugs, AUDIENCE_PAGES, IDEA_CATEGORIES, getIdeaPage } from "@/lib/pseo";
import { allCollectionPages, resolveToolsForCollection } from "@/lib/collections";

export type NodeKind = "tool" | "idea" | "audience" | "collection" | "category";
export type Node = { kind: NodeKind; slug: string; title: string; href: string };

/** Build every internal link edge derivable statically. */
export function buildLinkGraph(): { nodes: Node[]; edges: Map<string, Set<string>> } {
  const nodes: Node[] = [];
  const idxByHref = new Map<string, Node>();
  const push = (n: Node) => { nodes.push(n); idxByHref.set(n.href, n); };

  for (const t of TOOLS) push({ kind: "tool", slug: t.slug, title: t.title, href: `/tools/${t.slug}` });
  for (const s of allIdeaSlugs()) {
    const p = getIdeaPage(s);
    if (p) push({ kind: "idea", slug: p.slug, title: p.title, href: `/ideas/${p.slug}` });
  }
  for (const a of AUDIENCE_PAGES) push({ kind: "audience", slug: a.slug, title: a.hero, href: `/for/${a.slug}` });
  for (const c of allCollectionPages()) push({ kind: "collection", slug: c.slug, title: c.h1, href: `/collections/${c.slug}` });

  // outgoing edges (source href -> set of target hrefs)
  const edges = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    if (from === to) return;
    const s = edges.get(from) ?? new Set<string>();
    s.add(to);
    edges.set(from, s);
  };

  // Collections -> tools
  for (const c of allCollectionPages()) {
    const from = `/collections/${c.slug}`;
    for (const t of resolveToolsForCollection(c)) add(from, `/tools/${t.slug}`);
  }
  // Audience -> ideas
  for (const a of AUDIENCE_PAGES) {
    const from = `/for/${a.slug}`;
    for (const s of a.ideaSlugs) add(from, `/ideas/${s}`);
  }
  // Ideas -> category flagship
  for (const s of allIdeaSlugs()) {
    const p = getIdeaPage(s);
    if (!p) continue;
    const from = `/ideas/${p.slug}`;
    add(from, `/ideas/${p.category.key}-creative`);
  }
  // Tools grouped by category link to siblings within the same category
  const byCat = new Map<string, typeof TOOLS>();
  for (const t of TOOLS) {
    const arr = byCat.get(t.category) ?? [];
    arr.push(t);
    byCat.set(t.category, arr);
  }
  for (const [, arr] of byCat) {
    for (const t of arr) {
      const from = `/tools/${t.slug}`;
      for (const sib of arr) if (sib.slug !== t.slug) add(from, `/tools/${sib.slug}`);
    }
  }

  return { nodes, edges };
}

/** Compute inbound counts and return orphan / low-inbound nodes. */
export function findOrphans() {
  const { nodes, edges } = buildLinkGraph();
  const inbound = new Map<string, number>();
  for (const [, targets] of edges) {
    for (const t of targets) inbound.set(t, (inbound.get(t) ?? 0) + 1);
  }
  const rows = nodes.map((n) => ({ ...n, inbound: inbound.get(n.href) ?? 0 }));
  rows.sort((a, b) => a.inbound - b.inbound || a.href.localeCompare(b.href));
  return {
    total: rows.length,
    orphans: rows.filter((r) => r.inbound === 0),
    weak: rows.filter((r) => r.inbound > 0 && r.inbound < 3),
    all: rows,
    categories: IDEA_CATEGORIES.length,
  };
}
