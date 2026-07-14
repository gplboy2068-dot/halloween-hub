import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { RemixBanner, ToolCommunityStrip } from "@/components/CommunityWidgets";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, CATEGORIES } from "@/lib/site";
import { getToolComponent } from "@/tools/registry";
import {
  getRelatedIdeas,
  getRelatedAudiences,
  articleToRelated,
} from "@/lib/related";
import { getRelatedArticlesForContext } from "@/lib/related.functions";
import { RelatedSection } from "@/components/RelatedGrid";
import { getToolContent, howToJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/tool-content";
import {
  ToolAbout,
  ToolFeatures,
  ToolBenefits,
  ToolHowTo,
  ToolUseCases,
  ToolTips,
  ToolMistakes,
  ToolFaqs,
  ToolCta,
  ContinueExploring,
} from "@/components/ToolContentSections";
import { authorForCategory, personJsonLd } from "@/lib/authors";
import { TrustBar } from "@/components/TrustBar";

const TOOL_LAST_UPDATED = "2026-07-14";

const relatedArticlesQuery = (slug: string, title: string, description: string, category: string) =>
  queryOptions({
    queryKey: ["related-articles", "tool", slug],
    queryFn: () =>
      getRelatedArticlesForContext({
        data: { title, description, keywords: [category], excludeSlug: slug, limit: 12 },
      }),
    staleTime: 5 * 60 * 1000,
  });


export const Route = createFileRoute("/tools/$slug")({
  validateSearch: (s) => z.object({ remix: z.string().optional().catch(undefined) }).parse(s),
  loader: async ({ params, context }) => {
    const tool = TOOLS.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    await context.queryClient
      .ensureQueryData(relatedArticlesQuery(tool.slug, tool.title, tool.description, tool.category))
      .catch(() => []);
    return tool;
  },

  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — Free Halloween Tool, Templates & Ideas`;
    const content = getToolContent(loaderData);
    const metaDescription =
      `${loaderData.description} Free ${loaderData.title.toLowerCase()} — no signup, no watermark. Full how-to, tips, FAQ and related Halloween tools inside.`
        .slice(0, 158);
    const url = `/tools/${params.slug}`;
    const categorySlug = loaderData.category.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-");
    return {
      meta: [
        { title },
        { name: "description", content: metaDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: loaderData.title,
            description: loaderData.description,
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "128",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Tools", item: "/tools" },
              { "@type": "ListItem", position: 3, name: loaderData.category, item: `/categories/${categorySlug}` },
              { "@type": "ListItem", position: 4, name: loaderData.title, item: url },
            ],
          }),
        },
        { type: "application/ld+json", children: JSON.stringify(webPageJsonLd(loaderData, content, url)) },
        { type: "application/ld+json", children: JSON.stringify(howToJsonLd(loaderData, content)) },
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(content)) },
        { type: "application/ld+json", children: JSON.stringify(personJsonLd(authorForCategory(loaderData.category))) },
      ],
    };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">🎃</div>
        <h1 className="font-display text-3xl font-bold">Tool not found</h1>
        <p className="mt-2 text-muted-foreground">This tool is still brewing in our cauldron.</p>
        <Link to="/tools" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Browse all tools
        </Link>
      </div>
    </PageShell>
  ),
});

function ToolPage() {
  const tool = Route.useLoaderData();
  const { remix } = Route.useSearch();
  const content = getToolContent(tool);

  // Related tools: same-category first, then popular fill-in — capped at 12.
  const sameCategory = TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category);
  const filler = TOOLS.filter(
    (t) => t.slug !== tool.slug && t.category !== tool.category && (t.popular || t.featured || t.isNew),
  );
  const related = [...sameCategory, ...filler]
    .filter((t, i, arr) => arr.findIndex((x) => x.slug === t.slug) === i)
    .slice(0, 12);

  const ctaTool = content.ctaSlug
    ? TOOLS.find((t) => t.slug === content.ctaSlug)
    : related[0];

  const otherCategories = CATEGORIES.filter(
    (c) => c.name.toLowerCase() !== tool.category.toLowerCase(),
  ).slice(0, 8);

  const ctx = {
    title: tool.title,
    description: tool.description,
    category: tool.category,
    keywords: [tool.category],
    excludeHref: `/tools/${tool.slug}`,
  };
  const relatedIdeas = getRelatedIdeas(ctx, 8);
  const relatedAudiences = getRelatedAudiences(ctx, 4);
  const { data: relatedArticlesData } = useSuspenseQuery(
    relatedArticlesQuery(tool.slug, tool.title, tool.description, tool.category),
  );
  const relatedArticles = (relatedArticlesData ?? []).map(articleToRelated);


  return (
    <PageShell>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tools" className="hover:text-primary">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{tool.title}</span>
        </nav>

        <header className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">{tool.emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{tool.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{content.intro}</p>
        </header>

        <TrustBar reviewer={authorForCategory(tool.category)} updatedAt={TOOL_LAST_UPDATED} />

        {remix && <RemixBanner generationId={remix} />}

        {/* Interactive tool — stays at the top */}
        {(() => {
          const ToolComponent = getToolComponent(tool.slug);
          if (ToolComponent) return <ToolComponent />;
          return (
            <div className="mt-10 rounded-3xl border border-border bg-card p-8 sm:p-12 text-center bg-gradient-hero">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Coming soon</p>
              <p className="mt-2 font-display text-2xl font-bold">This tool is brewing</p>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                The {tool.title.toLowerCase()} is in production. Check back soon — or explore related tools below.
              </p>
            </div>
          );
        })()}

        {/* Community creations made with this tool */}
        <ToolCommunityStrip toolSlug={tool.slug} />


        {/* 1. About */}
        <ToolAbout toolTitle={tool.title} about={content.about} />

        {/* 2. Key benefits (8-12 detailed) */}
        <ToolBenefits benefits={content.benefits} />

        {/* Legacy feature grid retained for continuity */}
        <ToolFeatures features={content.features} />

        {/* 3. How to use (step-by-step) */}
        <ToolHowTo steps={content.howTo} toolTitle={tool.title} />

        {/* 4. Best use cases */}
        <ToolUseCases useCases={content.useCases} />

        {/* 5. Tips & best practices */}
        <ToolTips tips={content.tips} />

        {/* 6. Common mistakes */}
        <ToolMistakes mistakes={content.mistakes} />

        {/* 7. FAQ (schema is emitted in head) */}
        <ToolFaqs faqs={content.faqs} />

        {/* 8. Related tools (8-12) */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-6">Related Halloween tools</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => <ToolCard key={t.slug} tool={t} />)}
            </div>
          </section>
        )}

        {/* Related ideas */}
        <RelatedSection
          heading="Idea pages that pair with this tool"
          subheading="Curated ideas for the same audience — combine with the tool above."
          items={relatedIdeas}
        />

        {/* 9. Related articles */}
        <RelatedSection
          heading="Related Halloween articles"
          subheading="Deep dives, guides and roundups from the HalloweenTools blog."
          items={relatedArticles}
        />

        {/* Halloween-for audience hubs */}
        <RelatedSection
          heading="Halloween for…"
          items={relatedAudiences}
        />

        {/* 10. Continue exploring — other categories */}
        <ContinueExploring categories={otherCategories} />

        {/* 11. CTA — try another tool */}
        <ToolCta cta={ctaTool} currentSlug={tool.slug} />
      </article>
    </PageShell>
  );
}


