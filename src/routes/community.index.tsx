import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { PageShell } from "@/components/PageShell";
import { listCommunity, listTopCreators, type CommunitySort } from "@/lib/community.functions";
import { CATEGORIES, TOOLS } from "@/lib/site";

const searchSchema = z.object({
  sort: z.enum(["trending", "recommended", "newest", "most_liked", "most_viewed", "editors_picks"]).catch("trending"),
  tool: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  tag: z.string().optional().catch(undefined),
});

const feedQuery = (input: {
  sort: CommunitySort;
  tool?: string;
  category?: string;
  tag?: string;
}) =>
  queryOptions({
    queryKey: ["community-feed", input],
    queryFn: () => listCommunity({ data: { ...input, limit: 40 } }),
  });

const creatorsQuery = queryOptions({
  queryKey: ["community-top-creators"],
  queryFn: () => listTopCreators({ data: { limit: 8 } }),
});

export const Route = createFileRoute("/community/")({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(feedQuery(deps));
    context.queryClient.prefetchQuery(creatorsQuery);
  },
  head: () => ({
    meta: [
      { title: "Community — Halloween creations from the HalloweenTools community" },
      {
        name: "description",
        content:
          "Discover, share, and remix Halloween creations from the HalloweenTools community. Trending costumes, quotes, memes, invitations and more.",
      },
      { property: "og:title", content: "HalloweenTools Community" },
      { property: "og:description", content: "Discover, share, and remix Halloween creations." },
      { property: "og:url", content: "/community" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/community" }],
  }),
  component: CommunityFeedPage,
});

const SORTS: { key: CommunitySort; label: string; emoji: string }[] = [
  { key: "trending", label: "Trending", emoji: "🔥" },
  { key: "newest", label: "Newest", emoji: "🆕" },
  { key: "most_liked", label: "Most Liked", emoji: "❤️" },
  { key: "most_viewed", label: "Most Viewed", emoji: "👁" },
  { key: "editors_picks", label: "Editor's Picks", emoji: "⭐" },
];

function CommunityFeedPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(feedQuery(search));
  const { data: creators } = useSuspenseQuery(creatorsQuery);

  const setFilter = (patch: Partial<z.infer<typeof searchSchema>>) => {
    navigate({ search: { ...search, ...patch } as any });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <header className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            <span className="text-gradient-primary">Community</span> Creations
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Discover Halloween costumes, quotes, invitations, memes, and more — made by the community, powered by
            HalloweenTools.
          </p>
        </header>

        {/* Sort */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter({ sort: s.key })}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                search.sort === s.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
          <button
            onClick={() => setFilter({ category: undefined, tool: undefined })}
            className={`px-3 py-1 rounded-full text-xs border ${
              !search.category && !search.tool ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setFilter({ category: c.name, tool: undefined })}
              className={`px-3 py-1 rounded-full text-xs border ${
                search.category === c.name ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {search.tag && (
          <div className="mt-3 text-center text-sm">
            Filtering by <span className="text-primary font-semibold">#{search.tag}</span>{" "}
            <button onClick={() => setFilter({ tag: undefined })} className="ml-2 text-xs underline">
              clear
            </button>
          </div>
        )}
        {search.tool && (
          <div className="mt-3 text-center text-sm">
            Made with{" "}
            <span className="text-primary font-semibold">
              {TOOLS.find((t) => t.slug === search.tool)?.title ?? search.tool}
            </span>{" "}
            <button onClick={() => setFilter({ tool: undefined })} className="ml-2 text-xs underline">
              clear
            </button>
          </div>
        )}

        {/* Grid */}
        {data.items.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-5xl mb-3">👻</div>
            <p>No creations yet. Be the first!</p>
            <Link to="/tools" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
              Browse tools
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <Link
                key={post.id}
                to="/community/$slug"
                params={{ slug: post.slug }}
                className="group rounded-2xl border border-border bg-card/60 overflow-hidden hover:border-primary/40 transition flex flex-col"
              >
                {post.kind === "image" ? (
                  <div className="aspect-square bg-black/40 overflow-hidden">
                    <img
                      src={post.output}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                ) : (
                  <div className="p-5 min-h-[220px] whitespace-pre-wrap text-sm leading-relaxed line-clamp-[10] flex-1 bg-gradient-to-b from-muted/20 to-transparent">
                    {post.output}
                  </div>
                )}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-primary font-semibold truncate">{post.tool_title}</span>
                    {post.editor_pick && <span className="text-accent">⭐</span>}
                  </div>
                  <div className="mt-1 font-semibold text-sm line-clamp-2 group-hover:text-primary">{post.title}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">by {post.author.display_name}</span>
                    <span>❤️ {post.likes_count} · 👁 {post.views_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Top creators */}
        {creators.creators.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">🎨 Featured Creators</h2>
            <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
              {creators.creators.map((c) =>
                c.handle ? (
                  <Link
                    key={c.id}
                    to="/creator/$handle"
                    params={{ handle: c.handle }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden">
                      {c.avatar_url ? <img src={c.avatar_url} alt="" className="h-full w-full object-cover" /> : c.display_name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{c.display_name}</div>
                      <div className="text-xs text-muted-foreground">{c.count} posts</div>
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}
