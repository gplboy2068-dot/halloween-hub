import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { getCreatorByHandle } from "@/lib/community.functions";

const creatorQuery = (handle: string) =>
  queryOptions({
    queryKey: ["creator", handle],
    queryFn: () => getCreatorByHandle({ data: { handle } }),
  });

export const Route = createFileRoute("/creator/$handle")({
  loader: async ({ params, context }) => {
    const res = await context.queryClient.ensureQueryData(creatorQuery(params.handle));
    if (!res.creator) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.creator;
    if (!c) return { meta: [{ title: "Creator not found" }, { name: "robots", content: "noindex" }] };
    const desc = c.bio ?? `${c.display_name}'s Halloween creations on HalloweenTools — ${c.stats.posts} posts.`;
    const url = `/creator/${params.handle}`;
    return {
      meta: [
        { title: `${c.display_name} — HalloweenTools Creator` },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: `${c.display_name} on HalloweenTools` },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        ...(c.avatar_url ? [{ property: "og:image", content: c.avatar_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: c.display_name,
            url,
            ...(c.avatar_url ? { image: c.avatar_url } : {}),
            ...(c.bio ? { description: c.bio } : {}),
          }),
        },
      ],
    };
  },
  component: CreatorPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-5xl">👻</div>
        <h1 className="mt-4 font-display text-3xl font-bold">Creator not found</h1>
        <Link to="/community" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to Community
        </Link>
      </div>
    </PageShell>
  ),
});

function CreatorPage() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(creatorQuery(handle));
  const c = data.creator!;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {/* Hero */}
        <header className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold overflow-hidden">
            {c.avatar_url ? (
              <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              c.display_name[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{c.display_name}</h1>
            <p className="text-sm text-muted-foreground">@{c.handle}</p>
            {c.bio && <p className="mt-2 text-muted-foreground max-w-2xl">{c.bio}</p>}
            <div className="mt-3 flex gap-4 text-sm justify-center sm:justify-start">
              <span><b>{c.stats.posts}</b> <span className="text-muted-foreground">posts</span></span>
              <span><b>{c.stats.likes}</b> <span className="text-muted-foreground">likes</span></span>
              <span><b>{c.stats.views}</b> <span className="text-muted-foreground">views</span></span>
              <span><b>{c.stats.followers}</b> <span className="text-muted-foreground">followers</span></span>
            </div>
            {c.favorite_categories && c.favorite_categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                <span className="text-xs text-muted-foreground mr-1">Favorite categories:</span>
                {c.favorite_categories.map((cat: { name: string; count: number }) => (
                  <Link
                    key={cat.name}
                    to="/community"
                    search={{ category: cat.name } as any}
                    className="px-2 py-0.5 rounded-full text-xs bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                  >
                    {cat.name} · {cat.count}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Posts */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Recent Creations</h2>
          {c.posts.length === 0 ? (
            <p className="mt-6 text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {c.posts.map((p: any) => (
                <Link
                  key={p.id}
                  to="/community/$slug"
                  params={{ slug: p.slug ?? p.id }}
                  className="group rounded-2xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 transition"
                >
                  {p.kind === "image" ? (
                    <img src={p.output} alt={p.title ?? p.tool_title} loading="lazy" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="p-4 min-h-[200px] whitespace-pre-wrap text-sm line-clamp-[10]">{p.output}</div>
                  )}
                  <div className="p-3 border-t border-border/50">
                    <div className="text-xs text-primary font-semibold truncate">{p.tool_title}</div>
                    <div className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{p.title ?? p.tool_title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">❤️ {p.likes_count} · 👁 {p.views_count}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
