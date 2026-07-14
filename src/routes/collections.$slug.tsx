import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import {
  getCollectionPage,
  resolveToolsForCollection,
  allCollectionPages,
} from "@/lib/collections";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const page = getCollectionPage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const url = `/collections/${params.slug}`;
    const tools = resolveToolsForCollection(loaderData);
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: loaderData.h1,
            description: loaderData.description,
            url,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: tools.map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: tool.title,
              url: `/tools/${tool.slug}`,
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Collections", item: "/collections" },
              { "@type": "ListItem", position: 3, name: loaderData.h1, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: loaderData.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: CollectionPageView,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">🕸️</div>
        <h1 className="font-display text-3xl font-bold">Collection not found</h1>
        <p className="mt-2 text-muted-foreground">Try browsing all collections instead.</p>
        <Link to="/collections" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          All collections
        </Link>
      </div>
    </PageShell>
  ),
});

function CollectionPageView() {
  const page = Route.useLoaderData();
  const tools = resolveToolsForCollection(page);
  const other = allCollectionPages().filter((p) => p.slug !== page.slug).slice(0, 6);

  return (
    <PageShell>
      <article className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/collections" className="hover:text-primary">Collections</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.h1}</span>
        </nav>

        <header className="text-center">
          <div className="text-6xl mb-4">{page.emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{page.h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {page.intro}
          </p>
        </header>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 max-w-3xl mx-auto">
          {page.bullets.map((b: string) => (
            <div key={b} className="flex gap-3 rounded-xl border border-border bg-card/40 p-4 text-sm">
              <span className="text-primary" aria-hidden="true">✦</span>
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Tools in this collection ({tools.length})</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card/40">
            {page.faqs.map((f) => (
              <details key={f.q} className="group p-5 open:bg-primary/5">
                <summary className="cursor-pointer font-display font-semibold flex items-center justify-between gap-4 list-none">
                  <span>{f.q}</span>
                  <span className="text-primary text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {other.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border">
            <h2 className="font-display text-2xl font-bold">More Halloween collections</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {other.map((p) => (
                <Link
                  key={p.slug}
                  to="/collections/$slug"
                  params={{ slug: p.slug }}
                  className="group flex gap-3 p-4 rounded-xl border border-border bg-background/40 transition hover:border-primary/60 hover:bg-primary/5"
                >
                  <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{p.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
                      {p.h1}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageShell>
  );
}
