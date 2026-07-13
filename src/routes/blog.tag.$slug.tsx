import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ArticleCard } from "@/components/ArticleCard";
import { getBlogTagBySlug, listArticles } from "@/lib/blog.functions";

const tagQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "tag", slug],
    queryFn: () => getBlogTagBySlug({ data: { slug } }),
  });

const tagArticlesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "articles", null, slug],
    queryFn: () => listArticles({ data: { tagSlug: slug } }),
  });

export const Route = createFileRoute("/blog/tag/$slug")({
  loader: async ({ params, context }) => {
    const tag = await context.queryClient.ensureQueryData(tagQuery(params.slug));
    if (!tag) throw notFound();
    await context.queryClient.ensureQueryData(tagArticlesQuery(params.slug));
    return { slug: params.slug, name: tag.name, description: tag.description ?? "" };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/blog/tag/${params.slug}`;
    const title = `#${loaderData.name} — Halloween Blog`;
    const description =
      loaderData.description ||
      `Halloween articles tagged ${loaderData.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Tag not found</h1>
        <Link to="/blog" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to blog
        </Link>
      </div>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Couldn't load tag</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PageShell>
  ),
  component: TagPage,
});

function TagPage() {
  const { slug, name, description } = Route.useLoaderData();
  const { data: articles } = useSuspenseQuery(tagArticlesQuery(slug));

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">#{name}</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          #<span className="text-gradient-primary">{name}</span>
        </h1>
        {description && (
          <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>
        )}

        {articles.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="text-5xl mb-4 opacity-50">👻</div>
            <p className="text-muted-foreground">Nothing tagged with this yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
