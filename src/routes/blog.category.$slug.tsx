import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ArticleCard } from "@/components/ArticleCard";
import { getBlogCategoryBySlug, listArticles } from "@/lib/blog.functions";

const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "category", slug],
    queryFn: () => getBlogCategoryBySlug({ data: { slug } }),
  });

const categoryArticlesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "articles", slug, null],
    queryFn: () => listArticles({ data: { categorySlug: slug } }),
  });

export const Route = createFileRoute("/blog/category/$slug")({
  loader: async ({ params, context }) => {
    const category = await context.queryClient.ensureQueryData(categoryQuery(params.slug));
    if (!category) throw notFound();
    await context.queryClient.ensureQueryData(categoryArticlesQuery(params.slug));
    return {
      slug: params.slug,
      name: category.name,
      description: category.description ?? "",
      image: category.og_image ?? null,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/blog/category/${params.slug}`;
    const title = `${loaderData.name} — Halloween Blog`;
    const description =
      loaderData.description ||
      `Read the latest Halloween articles in the ${loaderData.name} category.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
    ];
    if (loaderData.image) meta.push({ property: "og:image", content: loaderData.image });
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url,
            isPartOf: { "@type": "Blog", name: "HalloweenTools Blog", url: "/blog" },
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
              { "@type": "ListItem", position: 3, name: loaderData.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Category not found</h1>
        <Link to="/blog" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to blog
        </Link>
      </div>
    </PageShell>
  ),
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Couldn't load category</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </PageShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug, name, description } = Route.useLoaderData();
  const { data: articles } = useSuspenseQuery(categoryArticlesQuery(slug));

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{name}</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          {name} <span className="text-gradient-primary">Articles</span>
        </h1>
        {description && (
          <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>
        )}

        {articles.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-border rounded-2xl">
            <div className="text-5xl mb-4 opacity-50">👻</div>
            <p className="text-muted-foreground">No articles in this category yet.</p>
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
