import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { listGenerations, reportGeneration, type FeedItem } from "@/lib/generations.functions";
import { useAuth } from "@/hooks/use-auth";

const feedQuery = queryOptions({
  queryKey: ["community-feed"],
  queryFn: () => listGenerations({ data: { limit: 50 } }),
});

export const Route = createFileRoute("/feed")({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery),
  component: FeedPage,
  head: () => ({
    meta: [
      { title: "Community Feed — Halloween AI creations by users" },
      {
        name: "description",
        content:
          "See what the HalloweenTools community is generating — costumes, wishes, quotes, captions, stories and more. Share your own creations.",
      },
      { property: "og:title", content: "Community Feed — HalloweenTools" },
      { property: "og:description", content: "See what users are generating with Halloween AI tools." },
      { property: "og:url", content: "/feed" },
    ],
    links: [{ rel: "canonical", href: "/feed" }],
  }),
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function FeedCard({ item }: { item: FeedItem }) {
  const { session } = useAuth();
  const reportFn = useServerFn(reportGeneration);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);

  const report = async () => {
    if (!session) {
      toast.error("Sign in to report");
      return;
    }
    if (!confirm("Report this entry as inappropriate?")) return;
    try {
      await reportFn({ data: { id: item.id } });
      setReported(true);
      toast.success("Reported. Thanks — we'll review.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to report");
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(item.output);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadImage = async () => {
    try {
      const res = await fetch(item.output);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.tool_slug}-${item.id.slice(0, 8)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Download failed");
    }
  };

  const isImage = item.kind === "image";

  return (
    <article className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition flex flex-col">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <Link to="/tools/$slug" params={{ slug: item.tool_slug }} className="hover:text-primary font-semibold">
          {item.tool_title}
        </Link>
        <span>{timeAgo(item.created_at)}</span>
      </div>

      {isImage ? (
        <div className="mt-3 rounded-xl overflow-hidden bg-black/40 aspect-square flex items-center justify-center">
          <img
            src={item.output}
            alt={item.prompt ?? item.tool_title}
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm sm:text-base leading-relaxed line-clamp-[12] flex-1">
          {item.output}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground truncate">by {item.author}</span>
        <div className="flex items-center gap-1.5">
          {isImage ? (
            <button
              type="button"
              onClick={downloadImage}
              className="px-2.5 py-1 rounded-md border border-border bg-background/60 hover:border-primary/40 hover:text-primary transition"
            >
              ⬇️ Download
            </button>
          ) : (
            <button
              type="button"
              onClick={copyText}
              className="px-2.5 py-1 rounded-md border border-border bg-background/60 hover:border-primary/40 hover:text-primary transition"
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          )}
          <button
            type="button"
            onClick={report}
            disabled={reported}
            className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            {reported ? "✓" : "⚑"}
          </button>
        </div>
      </div>
    </article>
  );
}


function FeedPage() {
  const { data } = useSuspenseQuery(feedQuery);
  const [activeTool, setActiveTool] = useState<string>("all");

  // Build categories from what's actually in the feed
  const categoryMap = new Map<string, { title: string; count: number }>();
  for (const it of data.items) {
    const cur = categoryMap.get(it.tool_slug);
    if (cur) cur.count += 1;
    else categoryMap.set(it.tool_slug, { title: it.tool_title, count: 1 });
  }
  const categories = Array.from(categoryMap.entries())
    .map(([slug, v]) => ({ slug, title: v.title, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const filtered =
    activeTool === "all" ? data.items : data.items.filter((i) => i.tool_slug === activeTool);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Community Feed</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Fresh Halloween creations shared by users. Generate something on any tool and hit{" "}
          <span className="text-primary font-semibold">🌍 Share</span> to see it here.
        </p>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTool("all")}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
                activeTool === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              All <span className="opacity-70">({data.items.length})</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveTool(c.slug)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
                  activeTool === c.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c.title} <span className="opacity-70">({c.count})</span>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-5xl mb-3">👻</div>
            <p>
              {data.items.length === 0
                ? "No creations yet. Be the first!"
                : "Nothing in this category yet."}
            </p>
            <Link
              to="/tools"
              className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Browse tools
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
