import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ArticleCard } from "@/components/ArticleCard";
import { Newsletter } from "@/components/Newsletter";
import { getArticleBySlug, listRelatedArticles } from "@/lib/blog.functions";
import { getRelatedTools, getRelatedIdeas, getRelatedAudiences } from "@/lib/related";
import { RelatedSection } from "@/components/RelatedGrid";
import { TableOfContents } from "@/components/TableOfContents";
import { publisherLd, imageObjectLd, speakableLd, wordCountFromHtml } from "@/lib/schema";
import { ReadingProgress } from "@/components/ReadingProgress";
import { StickyShareBar } from "@/components/StickyShareBar";
import { SaveButton } from "@/components/SaveButton";



const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", "article", slug],
    queryFn: () => getArticleBySlug({ data: { slug } }),
  });

const relatedQuery = (articleId: string, categoryId: string | null | undefined) =>
  queryOptions({
    queryKey: ["blog", "related", articleId, categoryId ?? null],
    queryFn: () => listRelatedArticles({ data: { articleId, categoryId, limit: 3 } }),
  });

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    await context.queryClient.ensureQueryData(
      relatedQuery(article.id, article.category?.id ?? null),
    );
    return {
      slug: params.slug,
      title: article.metaTitle ?? article.title,
      description: article.metaDescription ?? article.excerpt,
      image: article.ogImage ?? article.coverImage,
      publishedAt: article.publishedAt ?? article.updatedAt,
      updatedAt: article.updatedAt,
    };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/blog/${params.slug}`;
    const meta: Array<Record<string, string>> = [
      { title: `${loaderData.title} — HalloweenTools` },
      { name: "description", content: loaderData.description },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "article:published_time", content: loaderData.publishedAt },
      { property: "article:modified_time", content: loaderData.updatedAt },
      { name: "twitter:card", content: loaderData.image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: loaderData.title },
      { name: "twitter:description", content: loaderData.description },
    ];
    if (loaderData.image) {
      meta.push({ property: "og:image", content: loaderData.image });
      meta.push({ name: "twitter:image", content: loaderData.image });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  errorComponent: ({ error }) => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Couldn't load this post</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/blog" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to blog
        </Link>
      </div>
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">🪦</div>
        <h1 className="font-display text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This story has vanished into the mist.</p>
        <Link to="/blog" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Back to blog
        </Link>
      </div>
    </PageShell>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useLoaderData();
  const { data: article } = useSuspenseQuery(articleQuery(slug));
  if (!article) return null;
  const { data: related } = useSuspenseQuery(
    relatedQuery(article.id, article.category?.id ?? null),
  );

  const articleUrl = `/blog/${article.slug}`;
  const wordCount = wordCountFromHtml(article.contentHtml);
  const keywords = [
    ...(article.category ? [article.category.name] : []),
    ...article.tags.map((t) => t.name),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [imageObjectLd(article.coverImage)] : undefined,
    datePublished: article.publishedAt ?? article.updatedAt,
    dateModified: article.updatedAt,
    author: article.author?.displayName
      ? {
          "@type": "Person",
          name: article.author.displayName,
          ...(article.author.bio ? { description: article.author.bio } : {}),
        }
      : { "@type": "Organization", name: "HalloweenTools" },
    publisher: publisherLd(),
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.category ? { articleSection: article.category.name } : {}),
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    ...(wordCount ? { wordCount } : {}),
    inLanguage: "en",
    speakable: speakableLd(),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "/blog" },
      ...(article.category
        ? [{ "@type": "ListItem", position: 3, name: article.category.name, item: `/blog/category/${article.category.slug}` }]
        : []),
      {
        "@type": "ListItem",
        position: article.category ? 4 : 3,
        name: article.title,
        item: `/blog/${article.slug}`,
      },
    ],
  };


  return (
    <PageShell>
      <ReadingProgress />
      <StickyShareBar title={article.title} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          {article.category && (
            <>
              <span className="mx-2">/</span>
              <Link
                to="/blog/category/$slug"
                params={{ slug: article.category.slug }}
                className="hover:text-primary"
              >
                {article.category.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        {article.category && (
          <Link
            to="/blog/category/$slug"
            params={{ slug: article.category.slug }}
            className="text-xs uppercase tracking-wider text-primary font-semibold hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            {article.title}
          </h1>
          <SaveButton
            variant="pill"
            item={{
              kind: "article",
              slug: article.slug,
              title: article.title,
              emoji: "📖",
              href: `/blog/${article.slug}`,
            }}
            className="mt-2 flex-shrink-0"
          />
        </div>
        {article.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {article.author?.displayName && (
            <span className="flex items-center gap-2">
              {article.author.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.displayName}
                  loading="lazy"
                  decoding="async"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-primary/20 grid place-items-center text-primary text-[10px] font-bold">
                  {article.author.displayName.charAt(0).toUpperCase()}
                </span>
              )}
              By {article.author.displayName}
            </span>
          )}
          <span>·</span>
          <span>{article.readTimeMin} min read</span>
          {article.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </>
          )}
        </div>

        {article.coverImage && (
          <div className="mt-8 rounded-2xl overflow-hidden border border-border">
            <img
              src={article.coverImage}
              alt={article.title}
              fetchPriority="high"
              decoding="async"
              width={1600}
              height={900}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        )}

        {article.toc && article.toc.length > 0 && (
          <TableOfContents toc={article.toc} />
        )}

        {article.contentHtml ? (
          <div
            className="prose prose-invert prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary-glow prose-img:rounded-xl mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        ) : (
          <div className="mt-10 text-muted-foreground italic">
            Full article coming soon — subscribe below to be notified when it publishes.
          </div>
        )}


        {article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">
                Tags:
              </span>
              {article.tags.map((t) => (
                <Link
                  key={t.slug}
                  to="/blog/tag/$slug"
                  params={{ slug: t.slug }}
                  className="px-3 py-1 rounded-full text-xs border border-border hover:border-primary/60 hover:text-primary transition-colors"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {article.author?.bio && (
          <aside className="mt-10 rounded-2xl border border-border bg-card p-6 flex gap-4">
            {article.author.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.displayName ?? "Author"}
                loading="lazy"
                decoding="async"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span className="w-14 h-14 rounded-full bg-primary/20 grid place-items-center text-primary text-lg font-bold flex-shrink-0">
                {(article.author.displayName ?? "A").charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                About the author
              </p>
              <p className="mt-1 font-display font-semibold">{article.author.displayName}</p>
              <p className="mt-2 text-sm text-muted-foreground">{article.author.bio}</p>
            </div>
          </aside>
        )}

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border">
            <h2 className="font-display text-2xl font-bold">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </section>
        )}

        {(() => {
          const ctx = {
            title: article.title,
            description: article.excerpt,
            category: article.category?.name ?? "",
            keywords: [
              ...(article.category ? [article.category.name] : []),
              ...article.tags.map((t) => t.name),
            ],
          };
          const tools = getRelatedTools(ctx, 4);
          const ideas = getRelatedIdeas(ctx, 4);
          const audiences = getRelatedAudiences(ctx, 3);
          return (
            <>
              <RelatedSection
                heading="Try these free tools"
                subheading="Hand-picked Halloween tools that match this article."
                items={tools}
              />
              <RelatedSection
                heading="Idea pages you'll love"
                items={ideas}
              />
              <RelatedSection
                heading="Halloween for…"
                items={audiences}
              />
            </>
          );
        })()}


        <div className="mt-16">
          <Newsletter />
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </PageShell>
  );
}

