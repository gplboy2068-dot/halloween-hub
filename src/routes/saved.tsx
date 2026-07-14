import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { listSaved, onSavedChange, clearSaved, toggleSaved, type SavedItem } from "@/lib/saved";
import { Bookmark, Trash2 } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Your Saved Halloween Tools & Articles — HalloweenTools" },
      { name: "description", content: "Bookmark tools and articles from HalloweenTools and come back to them later — stored on your device." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Your Saved Items" },
      { property: "og:url", content: "/saved" },
    ],
    links: [{ rel: "canonical", href: "/saved" }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(listSaved());
    setReady(true);
    return onSavedChange(() => setItems(listSaved()));
  }, []);

  const tools = items.filter((i) => i.kind === "tool");
  const articles = items.filter((i) => i.kind === "article");

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              Your <span className="text-gradient-primary">Saved</span> items
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Bookmarks live on this device only — no account needed. Save any tool or article to come back later.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { if (confirm("Clear all saved items?")) clearSaved(); }}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:border-destructive/60 hover:text-destructive text-xs font-semibold"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          )}
        </header>

        {!ready ? null : items.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <Bookmark className="h-10 w-10 mx-auto text-muted-foreground opacity-70" />
            <p className="mt-4 text-muted-foreground">Nothing saved yet.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/tools" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Browse tools</Link>
              <Link to="/blog" className="px-4 py-2 rounded-lg border border-border text-sm font-semibold">Read the blog</Link>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {tools.length > 0 && (
              <Section title={`Saved tools (${tools.length})`} items={tools} />
            )}
            {articles.length > 0 && (
              <Section title={`Saved articles (${articles.length})`} items={articles} />
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Section({ title, items }: { title: string; items: SavedItem[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold mb-4">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li key={`${i.kind}:${i.slug}`} className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40 hover:border-primary/50 transition">
            <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{i.emoji ?? "🎃"}</span>
            <a href={i.href} className="flex-1 min-w-0">
              <div className="font-display font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {i.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 truncate">{i.href}</div>
            </a>
            <button
              onClick={() => toggleSaved({ kind: i.kind, slug: i.slug, title: i.title, emoji: i.emoji, href: i.href })}
              aria-label="Remove"
              className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
