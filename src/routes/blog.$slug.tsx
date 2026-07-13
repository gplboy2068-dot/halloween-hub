import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Newsletter } from "@/components/Newsletter";
import { ARTICLES } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = ARTICLES.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.title} — HalloweenTools` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData.title,
          description: loaderData.excerpt,
          datePublished: loaderData.updatedAt,
          dateModified: loaderData.updatedAt,
        }),
      }],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to blog
        </Link>
      </div>
    </PageShell>
  ),
});

function ArticlePage() {
  const a = Route.useLoaderData();
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground line-clamp-1">{a.title}</span>
        </nav>

        <span className="text-xs uppercase tracking-wider text-primary font-semibold">{a.category}</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold leading-tight">{a.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span>By HalloweenTools Editorial</span>
          <span>·</span>
          <span>{a.readingTime} min read</span>
          <span>·</span>
          <span>Updated {a.updatedAt}</span>
        </div>

        <div className="mt-10 prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">{a.excerpt}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Full article content will be authored via the Admin CMS in Phase 2. This placeholder confirms
            routing, SEO metadata, JSON-LD article schema, and breadcrumbs are wired for every post.
          </p>
        </div>

        <div className="mt-16"><Newsletter /></div>
      </article>
    </PageShell>
  );
}
