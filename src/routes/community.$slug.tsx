import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import {
  getCommunityPost,
  toggleLike,
  toggleBookmark,
  getMyLikeStatus,
  listTrendingCompact,
} from "@/lib/community.functions";
import { reportGeneration } from "@/lib/generations.functions";
import { useAuth } from "@/hooks/use-auth";
import { TOOLS } from "@/lib/site";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["community-post", slug],
    queryFn: () => getCommunityPost({ data: { slug } }),
  });

const relatedQuery = (tool: string) =>
  queryOptions({
    queryKey: ["community-related", tool],
    queryFn: () => listTrendingCompact({ data: { tool, limit: 8 } }),
  });

export const Route = createFileRoute("/community/$slug")({
  loader: async ({ params, context }) => {
    const res = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (res.post) {
      await context.queryClient.prefetchQuery(relatedQuery(res.post.tool_slug));
    }
    return res;
  },
  head: ({ params, loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [
          { title: "Creation not found — HalloweenTools Community" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const desc =
      post.description ??
      `${post.title} — created with ${post.tool_title} on HalloweenTools Community.`;
    const url = `/community/${post.slug}`;
    return {
      meta: [
        { title: `${post.title} — HalloweenTools Community` },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: post.title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(post.kind === "image" ? [{ property: "og:image", content: post.output }] : []),
        { name: "twitter:card", content: post.kind === "image" ? "summary_large_image" : "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: post.title,
            description: desc,
            dateCreated: post.created_at,
            url,
            author: {
              "@type": "Person",
              name: post.author.display_name,
              ...(post.author.handle ? { url: `/creator/${post.author.handle}` } : {}),
            },
            ...(post.kind === "image" ? { image: post.output } : {}),
            isBasedOn: { "@type": "SoftwareApplication", name: post.tool_title, url: `/tools/${post.tool_slug}` },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Community", item: "/community" },
              { "@type": "ListItem", position: 2, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-5xl">👻</div>
        <h1 className="mt-4 font-display text-3xl font-bold">This creation vanished</h1>
        <p className="mt-2 text-muted-foreground">It might be hidden or deleted.</p>
        <Link to="/community" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to Community
        </Link>
      </div>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-destructive">{error.message}</div>
    </PageShell>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post;
  const { session } = useAuth();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  const relatedRes = useQuery(relatedQuery(post?.tool_slug ?? ""));
  const relatedTool = TOOLS.find((t) => t.slug === post?.tool_slug);

  const likeFn = useServerFn(toggleLike);
  const bookmarkFn = useServerFn(toggleBookmark);
  const likeStatusFn = useServerFn(getMyLikeStatus);
  const reportFn = useServerFn(reportGeneration);

  const likeStatus = useQuery({
    queryKey: ["like-status", post?.id],
    queryFn: () => likeStatusFn({ data: { generationId: post!.id } }),
    enabled: !!session && !!post,
  });

  const likeMut = useMutation({
    mutationFn: () => likeFn({ data: { generationId: post!.id } }),
    onSuccess: (res) => {
      qc.setQueryData(["like-status", post!.id], { liked: res.liked });
      qc.invalidateQueries({ queryKey: ["community-post", slug] });
    },
  });

  const bookmarkMut = useMutation({
    mutationFn: () => bookmarkFn({ data: { generationId: post!.id } }),
    onSuccess: (res) => toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed bookmark"),
  });

  if (!post) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/community/${post.slug}` : `/community/${post.slug}`;
  const shareText = `${post.title} — HalloweenTools`;

  const socials = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "X", href: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}${post.kind === "image" ? `&media=${encodeURIComponent(post.output)}` : ""}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const report = async () => {
    if (!session) {
      toast.error("Sign in to report");
      return;
    }
    if (!confirm("Report this creation?")) return;
    try {
      await reportFn({ data: { id: post.id } });
      setReported(true);
      toast.success("Reported. Thanks — we'll review.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to report");
    }
  };

  const liked = likeStatus.data?.liked ?? false;

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/community" className="hover:text-primary">Community</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground/80">{post.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div>
            <header>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {post.editor_pick && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-bold uppercase tracking-wider">
                    ⭐ Editor's Pick
                  </span>
                )}
                <Link
                  to="/tools/$slug"
                  params={{ slug: post.tool_slug }}
                  className="px-2.5 py-0.5 rounded-full border border-primary/40 text-primary hover:bg-primary/10"
                >
                  {post.tool_title}
                </Link>
                {post.category && (
                  <Link
                    to="/community"
                    search={{ category: post.category } as any}
                    className="px-2.5 py-0.5 rounded-full border border-border text-muted-foreground"
                  >
                    {post.category}
                  </Link>
                )}
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold">{post.title}</h1>
              {post.description && (
                <p className="mt-3 text-muted-foreground max-w-2xl">{post.description}</p>
              )}
              <div className="mt-4 flex items-center gap-3">
                {post.author.handle ? (
                  <Link
                    to="/creator/$handle"
                    params={{ handle: post.author.handle }}
                    className="flex items-center gap-2 group"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold overflow-hidden">
                      {post.author.avatar_url ? (
                        <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        post.author.display_name[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-primary">{post.author.display_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} · {post.views_count} views
                      </div>
                    </div>
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">by {post.author.display_name}</span>
                )}
              </div>
            </header>

            {/* Preview */}
            <div className="mt-6 rounded-2xl border border-border bg-card/60 overflow-hidden">
              {post.kind === "image" ? (
                <img src={post.output} alt={post.title} className="w-full max-h-[80vh] object-contain bg-black/40" />
              ) : (
                <div className="p-6 sm:p-10 whitespace-pre-wrap text-base sm:text-lg leading-relaxed">{post.output}</div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => (session ? likeMut.mutate() : toast.error("Sign in to like"))}
                disabled={likeMut.isPending}
                className={`px-4 py-2 rounded-lg border font-semibold text-sm transition ${
                  liked ? "bg-primary/20 border-primary/40 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                {liked ? "❤️" : "🤍"} {post.likes_count}
              </button>
              <button
                onClick={() => (session ? bookmarkMut.mutate() : toast.error("Sign in to save"))}
                className="px-4 py-2 rounded-lg border border-border font-semibold text-sm hover:border-primary/40"
              >
                🔖 Save
              </button>
              <button
                onClick={copyLink}
                className="px-4 py-2 rounded-lg border border-border font-semibold text-sm hover:border-primary/40"
              >
                {copied ? "✓ Copied" : "🔗 Copy link"}
              </button>
              <Link
                to="/tools/$slug"
                params={{ slug: post.tool_slug }}
                search={{ remix: post.id } as any}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
              >
                🎃 Remix This
              </Link>
              <Link
                to="/tools/$slug"
                params={{ slug: post.tool_slug }}
                className="px-4 py-2 rounded-lg border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10"
              >
                🛠 Open Tool
              </Link>
              <button
                onClick={report}
                disabled={reported}
                className="ml-auto px-3 py-2 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {reported ? "✓ Reported" : "⚑ Report"}
              </button>
            </div>

            {/* Socials */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs rounded-md border border-border bg-background/60 hover:border-primary/40 hover:text-primary transition"
                >
                  {s.label}
                </a>
              ))}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    to="/community"
                    search={{ tag: t } as any}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {relatedTool && (
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                <h3 className="font-display text-lg font-semibold">Made with</h3>
                <Link
                  to="/tools/$slug"
                  params={{ slug: relatedTool.slug }}
                  className="mt-3 flex items-center gap-3 group"
                >
                  <span className="text-3xl">{relatedTool.emoji}</span>
                  <div>
                    <div className="font-semibold group-hover:text-primary">{relatedTool.title}</div>
                    <div className="text-xs text-muted-foreground">{relatedTool.description}</div>
                  </div>
                </Link>
                <Link
                  to="/tools/$slug"
                  params={{ slug: relatedTool.slug }}
                  search={{ remix: post.id } as any}
                  className="mt-4 block text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
                >
                  ✨ Create Similar
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <h3 className="font-display text-lg font-semibold">More like this</h3>
              <div className="mt-3 grid gap-3">
                {(relatedRes.data?.items ?? [])
                  .filter((r: any) => r.id !== post.id)
                  .slice(0, 6)
                  .map((r: any) => (
                    <Link
                      key={r.id}
                      to="/community/$slug"
                      params={{ slug: r.slug ?? r.id }}
                      className="flex items-center gap-3 group"
                    >
                      {r.kind === "image" ? (
                        <img src={r.output} alt="" className="h-14 w-14 rounded-md object-cover bg-muted" />
                      ) : (
                        <div className="h-14 w-14 rounded-md bg-muted/60 p-2 text-[10px] leading-tight overflow-hidden">
                          {r.output.slice(0, 60)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-primary">
                          {r.title ?? r.tool_title}
                        </div>
                        <div className="text-xs text-muted-foreground">❤️ {r.likes_count} · 👁 {r.views_count}</div>
                      </div>
                    </Link>
                  ))}
                {(relatedRes.data?.items ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">Be the first to remix.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
