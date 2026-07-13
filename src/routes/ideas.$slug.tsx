import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { getIdeaPage, resolveToolsForIdea, IDEA_CATEGORIES, allIdeaSlugs } from "@/lib/pseo";
import type { IdeaPage as IdeaPageType } from "@/lib/pseo";
import { getRelatedAudiences, articleToRelated } from "@/lib/related";
import { getRelatedArticlesForContext } from "@/lib/related.functions";
import { RelatedSection } from "@/components/RelatedGrid";

const ideaRelatedArticlesQuery = (slug: string, title: string, description: string, kw: string[]) =>
  queryOptions({
    queryKey: ["related-articles", "idea", slug],
    queryFn: () =>
      getRelatedArticlesForContext({
        data: { title, description, keywords: kw, limit: 3 },
      }),
    staleTime: 5 * 60 * 1000,
  });


export const Route = createFileRoute("/ideas/$slug")({
  loader: async ({ params, context }) => {
    const page = getIdeaPage(params.slug);
    if (!page) throw notFound();
    await context.queryClient
      .ensureQueryData(
        ideaRelatedArticlesQuery(page.slug, page.title, page.description, [
          page.category.noun,
          page.audience,
          page.style,
        ]),
      )
      .catch(() => []);
    return page;
  },

  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/ideas/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/ideas/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: loaderData.title,
            description: loaderData.description,
            numberOfItems: 15,
          }),
        },
      ],
    };
  },
  component: IdeaPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">🕸️</div>
        <h1 className="font-display text-3xl font-bold">This idea page hasn't been conjured yet</h1>
        <Link to="/ideas" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Browse all ideas
        </Link>
      </div>
    </PageShell>
  ),
});

function IdeaPage() {
  const page = Route.useLoaderData() as IdeaPageType;
  const items = page.category.items(page.audience, page.style);
  const tools = resolveToolsForIdea(page);

  // Related idea pages: same category, sibling audiences/styles
  const related = allIdeaSlugs()
    .filter((s: string) => s.startsWith(page.category.key) && s !== page.slug)
    .slice(0, 6)
    .map((s: string) => getIdeaPage(s))
    .filter((p): p is IdeaPageType => p !== null);

  const relCtx = {
    title: page.title,
    description: page.description,
    keywords: [page.category.noun, page.audience, page.style],
    excludeHref: `/ideas/${page.slug}`,
  };
  const relatedAudiences = getRelatedAudiences(relCtx, 3);
  const { data: relArticlesRaw } = useSuspenseQuery(
    ideaRelatedArticlesQuery(page.slug, page.title, page.description, [
      page.category.noun,
      page.audience,
      page.style,
    ]),
  );
  const relatedArticles = (relArticlesRaw ?? []).map(articleToRelated);


  return (
    <PageShell>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/ideas" className="hover:text-primary">Ideas</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        <header className="text-center">
          <div className="text-6xl mb-4">{page.category.emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{page.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{page.description}</p>
        </header>

        <section className="mt-10 rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
          <p className="text-base leading-relaxed">{page.category.intro(page.audience, page.style)}</p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-6">
            Our top 15 picks
          </h2>
          <ol className="space-y-2">
            {items.map((item: string, i: number) => (
              <li key={i} className="flex gap-3 p-3 sm:p-4 rounded-xl border border-border bg-background/40 hover:border-primary/40 transition">
                <span className="text-primary font-display font-bold w-8 shrink-0">{i + 1}.</span>
                <span className="text-sm sm:text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        {tools.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-2">Tools that help</h2>
            <p className="text-muted-foreground text-sm mb-6">Free, no signup — jump straight in.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
            </div>
          </section>
        )}

        <section className="mt-14 rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold mb-4">Frequently asked</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary">When should I start planning?</h3>
              <p className="text-sm text-muted-foreground mt-1">Start 3–4 weeks before Halloween for costumes and party ideas; 1 week is fine for last-minute picks.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Do I need special supplies?</h3>
              <p className="text-sm text-muted-foreground mt-1">Most ideas above use household items plus a small trip to a craft or party store. We flag what's genuinely optional vs required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Is any of this AI-generated?</h3>
              <p className="text-sm text-muted-foreground mt-1">The suggestions are curated by our team. The <Link to="/tools" className="text-primary hover:underline">HalloweenTools</Link> can help you generate custom variations of any idea.</p>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-6">More {page.category.noun} ideas</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/ideas/$slug"
                  params={{ slug: r.slug }}
                  className="p-4 rounded-xl border border-border bg-background/40 hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <RelatedSection
          heading="Read next on the blog"
          items={relatedArticles}
        />

        <RelatedSection
          heading="Halloween for…"
          items={relatedAudiences}
        />



        <section className="mt-14 text-center">
          <h2 className="font-display text-xl font-bold mb-4">Explore other categories</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {IDEA_CATEGORIES.filter((c) => c.key !== page.category.key).map((c) => (
              <Link
                key={c.key}
                to="/ideas/$slug"
                params={{ slug: `${c.key}-creative` }}
                className="px-4 py-2 rounded-full border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/10 text-sm font-medium transition"
              >
                {c.emoji} {c.noun} ideas
              </Link>
            ))}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
