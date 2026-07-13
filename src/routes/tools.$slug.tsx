import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS } from "@/lib/site";
import { getToolComponent } from "@/tools/registry";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = TOOLS.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    return tool;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.title} — Free Halloween Tool`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.description} Free, no signup, mobile-friendly.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/tools/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/tools/${params.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: loaderData.title,
          description: loaderData.description,
          applicationCategory: "DesignApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      }],
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
  const related = TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category).slice(0, 8);

  return (
    <PageShell>
      <article className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/tools" className="hover:text-primary">Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{tool.title}</span>
        </nav>

        <header className="text-center">
          <div className="text-6xl mb-4">{tool.emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">{tool.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{tool.description}</p>
        </header>

        {/* Tool interface */}
        {(() => {
          const ToolComponent = getToolComponent(tool.slug);
          if (ToolComponent) return <ToolComponent />;
          return (
            <div className="mt-10 rounded-3xl border border-border bg-card p-8 sm:p-12 text-center bg-gradient-hero">
              <p className="text-sm uppercase tracking-widest text-primary font-semibold">Coming soon</p>
              <h2 className="mt-2 font-display text-2xl font-bold">This tool is brewing</h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                The {tool.title.toLowerCase()} is in production. Check back soon — or explore related tools below.
              </p>
            </div>
          );
        })()}

        {/* About */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">About this tool</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The {tool.title} is a free, browser-based Halloween utility built for creators, families,
            teachers and party hosts. Whether you're planning a spooky bash or crafting content for social,
            this tool is designed to make your Halloween prep faster, easier and more fun.
          </p>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-6">Related tools</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => <ToolCard key={t.slug} tool={t} />)}
            </div>
          </section>
        )}
      </article>
    </PageShell>
  );
}
