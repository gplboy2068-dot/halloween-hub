import { useMemo, useState } from "react";
import { Link2, Copy, Plus, Search } from "lucide-react";
import { useEntityList, type ToolEntity, type ArticleEntity, type CategoryEntity } from "@/lib/admin-store";

type LinkItem = { kind: string; title: string; href: string; emoji?: string };

export function InternalLinkPicker({
  onInsert,
  currentSlug,
}: {
  onInsert: (markdown: string) => void;
  currentSlug?: string;
}) {
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");
  const categories = useEntityList<CategoryEntity>("categories");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "tool" | "article" | "category">("all");

  const items = useMemo<LinkItem[]>(() => {
    const all: LinkItem[] = [
      ...tools.map((t) => ({ kind: "tool", title: t.title, href: `/tools/${t.slug}`, emoji: t.emoji })),
      ...articles
        .filter((a) => a.slug !== currentSlug)
        .map((a) => ({ kind: "article", title: a.title, href: `/blog/${a.slug}`, emoji: "📖" })),
      ...categories.map((c) => ({ kind: "category", title: c.name, href: `/categories/${c.slug}`, emoji: c.emoji })),
    ];
    const query = q.trim().toLowerCase();
    return all.filter((i) => {
      if (kind !== "all" && i.kind !== kind) return false;
      if (!query) return true;
      return i.title.toLowerCase().includes(query) || i.href.toLowerCase().includes(query);
    });
  }, [tools, articles, categories, q, kind, currentSlug]);

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-muted-foreground flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5" /> Internal links (backlinks)
      </label>
      <div className="rounded-lg border border-border bg-input/40 p-3">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools, articles, categories…"
              className="w-full h-9 pl-8 pr-3 rounded-md bg-input border border-border text-sm"
            />
          </div>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="h-9 px-2 rounded-md bg-input border border-border text-sm"
          >
            <option value="all">All</option>
            <option value="tool">Tools</option>
            <option value="article">Articles</option>
            <option value="category">Categories</option>
          </select>
        </div>
        <ul className="max-h-64 overflow-y-auto divide-y divide-border/50 text-sm">
          {items.length === 0 && (
            <li className="py-3 text-center text-xs text-muted-foreground">No matches</li>
          )}
          {items.slice(0, 60).map((i) => {
            const md = `[${i.title}](${i.href})`;
            return (
              <li key={i.kind + i.href} className="py-2 flex items-center gap-2">
                <span className="text-base w-5 text-center">{i.emoji ?? "🔗"}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{i.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{i.kind} · {i.href}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onInsert(md)}
                  className="inline-flex items-center gap-1 px-2 h-7 rounded-md bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25"
                  title="Insert into content"
                >
                  <Plus className="h-3 w-3" /> Insert
                </button>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(md); }}
                  className="inline-flex items-center gap-1 px-2 h-7 rounded-md border border-border text-xs hover:border-primary/50"
                  title="Copy markdown"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Insert appends markdown to the Content field. Copy puts it on your clipboard so you can paste at the cursor.
        </p>
      </div>
    </div>
  );
}
