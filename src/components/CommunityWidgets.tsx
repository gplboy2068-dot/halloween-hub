import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCommunityPostById, listTrendingCompact } from "@/lib/community.functions";

/** Banner shown at the top of a tool page when opened via ?remix=<id>. */
export function RemixBanner({ generationId }: { generationId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["remix-source", generationId],
    queryFn: () => getCommunityPostById({ data: { id: generationId } }),
  });

  if (isLoading) return null;
  const post = data?.post;
  if (!post) return null;

  const copyPrompt = async () => {
    if (!post.prompt) return;
    try {
      await navigator.clipboard.writeText(post.prompt);
    } catch {}
  };

  return (
    <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🎃</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Remixing</div>
          <div className="mt-0.5 font-semibold truncate">{post.title}</div>
          <div className="text-xs text-muted-foreground">
            by {post.author.display_name}
            {" · "}
            <Link to="/community/$slug" params={{ slug: post.slug }} className="hover:text-primary underline">
              view original
            </Link>
          </div>
          {post.prompt && (
            <div className="mt-2 text-xs bg-background/60 rounded-md px-3 py-2 border border-border">
              <div className="text-muted-foreground uppercase tracking-widest text-[10px] font-semibold mb-1">Original prompt</div>
              <div className="whitespace-pre-wrap">{post.prompt}</div>
            </div>
          )}
        </div>
        {post.prompt && (
          <button
            onClick={copyPrompt}
            className="px-3 py-1.5 rounded-md border border-border text-xs font-semibold hover:bg-primary/10 hover:border-primary/40"
          >
            Copy prompt
          </button>
        )}
      </div>
    </div>
  );
}

/** Compact community-creations strip for a specific tool. */
export function ToolCommunityStrip({ toolSlug }: { toolSlug: string }) {
  const { data } = useQuery({
    queryKey: ["tool-community", toolSlug],
    queryFn: () => listTrendingCompact({ data: { tool: toolSlug, limit: 6 } }),
  });
  const items = data?.items ?? [];
  if (items.length === 0) return null;
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Made with this tool</h2>
          <p className="text-sm text-muted-foreground">Community creations you can remix.</p>
        </div>
        <Link to="/community" search={{ tool: toolSlug } as any} className="text-sm text-primary hover:underline">
          See all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r: any) => (
          <Link
            key={r.id}
            to="/community/$slug"
            params={{ slug: r.slug ?? r.id }}
            className="group rounded-xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 transition"
          >
            {r.kind === "image" ? (
              <img src={r.output} alt={r.title ?? r.tool_title} loading="lazy" className="aspect-video w-full object-cover" />
            ) : (
              <div className="p-4 min-h-[120px] text-sm line-clamp-5 whitespace-pre-wrap bg-muted/20">{r.output}</div>
            )}
            <div className="p-3 border-t border-border/50">
              <div className="font-semibold text-sm line-clamp-1 group-hover:text-primary">{r.title ?? r.tool_title}</div>
              <div className="text-xs text-muted-foreground">❤️ {r.likes_count} · 👁 {r.views_count}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
