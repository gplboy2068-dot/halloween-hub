import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ArticleCard } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";
import { listArticles, listBlogCategories, listBlogTags } from "@/lib/blog.functions";
import { z } from "zod";

const searchSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
});

const articlesQuery = (params: { categorySlug?: string; tagSlug?: string }) =>
  queryOptions({
    queryKey: ["blog", "articles", params.categorySlug ?? null, params.tagSlug ?? null],
    queryFn: () => listArticles({ data: params }),
  });

const catsQuery = queryOptions({
  queryKey: ["blog", "categories"],
  queryFn: () => listBlogCategories(),
});

const tagsQuery = queryOptions({
  queryKey: ["blog", "tags"],
  queryFn: () => listBlogTags(),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ category: search.category, tag: search.tag }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        articlesQuery({ categorySlug: deps.category, tagSlug: deps.tag }),
      ),
      context.queryClient.ensureQueryData(catsQuery),
      context.queryClient.ensureQueryData(tagsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Halloween Blog — Ideas, Guides & Inspiration" },
      {
        name: "description",
        content:
          "Halloween party planning, costume ideas, pumpkin carving guides, DIY decor, history & more — updated weekly.",
      },
      { property: "og:title", content: "Halloween Blog" },
      { property: "og:description", content: "Guides, ideas & inspiration for the spookiest season." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
    ],
    links: [
      { rel: "canonical", href: "/blog" },
      { rel: "alternate", type: "application/rss+xml", title: "HalloweenTools Blog RSS", href: "/rss.xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "HalloweenTools Blog",
          description: "Guides, ideas & inspiration for the spookiest season.",
          url: "/blog",
          publisher: { "@type": "Organization", name: "HalloweenTools", url: "/" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
          ],
        }),
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Something went bump in the night</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PageShell>
  ),
  component: BlogIndex,
});

function BlogIndex() {
  const { category, tag } = Route.useSearch();
  const { data: articles } = useSuspenseQuery(
    articlesQuery({ categorySlug: category, tagSlug: tag }),
  );
  const { data: categories } = useSuspenseQuery(catsQuery);
  const { data: tags } = useSuspenseQuery(tagsQuery);

  const featured = articles.filter((a) => a.featured);
  const hero = featured[0];
  const rest = articles.filter((a) => a.id !== hero?.id);
  const activeFilter = category || tag;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              Halloween <span className="text-gradient-primary">Blog</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Guides, ideas & inspiration for the spookiest season of the year.
            </p>
          </div>
          <a
            href="/rss.xml"
            className="text-xs text-muted-foreground hover:text-primary transition-colors self-start md:self-auto"
          >
            RSS feed →
          </a>
        </div>

        {/* Filters */}
        {(categories.length > 0 || tags.length > 0) && (
          <div className="mt-8 space-y-3">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/blog"
                  search={{}}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    !activeFilter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/blog"
                    search={{ category: c.slug }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      category === c.slug
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {c.name} <span className="opacity-60">({c.count})</span>
                  </Link>
                ))}
              </div>
            )}
            {tag && (
              <div className="text-xs text-muted-foreground">
                Filtering by tag: <span className="text-primary font-semibold">#{tag}</span>{" "}
                <Link to="/blog" search={{}} className="ml-2 underline hover:text-primary">
                  clear
                </Link>
              </div>
            )}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="text-5xl mb-4 opacity-50">👻</div>
            <p className="text-muted-foreground">No posts found in this section yet.</p>
            <Link to="/blog" search={{}} className="mt-4 inline-block text-primary hover:underline">
              ← Back to all posts
            </Link>
          </div>
        ) : (
          <>
            {hero && !activeFilter && (
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <ArticleCard article={hero} featured />
                {featured.slice(1, 3).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            )}

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(activeFilter ? articles : rest).map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </>
        )}

        {/* Tag cloud */}
        {tags.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-lg font-semibold">Browse by tag</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  to="/blog/tag/$slug"
                  params={{ slug: t.slug }}
                  className="px-3 py-1 rounded-full text-xs border border-border hover:border-primary/60 hover:text-primary transition-colors"
                >
                  #{t.name} <span className="opacity-60">{t.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16">
          <Newsletter />
        </div>
      </div>
    </PageShell>
  );
}
