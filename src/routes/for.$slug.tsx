import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { getAudiencePage, resolveToolsForAudience, AUDIENCE_PAGES, getIdeaPage } from "@/lib/pseo";
import type { AudiencePage, IdeaPage } from "@/lib/pseo";

export const Route = createFileRoute("/for/$slug")({
  loader: ({ params }) => {
    const page = getAudiencePage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.hero} — Ideas, Tools & Inspiration 2026`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.intro.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.intro.slice(0, 155) },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/for/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/for/${params.slug}` }],
    };
  },
  component: AudiencePageView,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">👻</div>
        <h1 className="font-display text-3xl font-bold">Audience page not found</h1>
        <Link to="/for" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          Browse audiences
        </Link>
      </div>
    </PageShell>
  ),
});

function AudiencePageView() {
  const page = Route.useLoaderData() as AudiencePage;
  const tools = resolveToolsForAudience(page);
  const ideas = page.ideaSlugs.map((s: string) => getIdeaPage(s)).filter((x: IdeaPage | null): x is IdeaPage => x !== null);

  return (
    <PageShell>
      <article className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/for" className="hover:text-primary">For</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{page.hero}</span>
        </nav>

        <header className="text-center">
          <div className="text-6xl mb-4">{page.emoji}</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold">{page.hero}</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{page.intro}</p>
        </header>

        {tools.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-2">Recommended tools</h2>
            <p className="text-muted-foreground text-sm mb-6">Handpicked for {page.audience.toLowerCase()} — free, no signup.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
            </div>
          </section>
        )}

        {page.sections.map((s: AudiencePage["sections"][number]) => (
          <section key={s.heading} className="mt-14 rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold mb-6">{s.heading}</h2>
            <ul className="space-y-3">
              {s.points.map((p: string, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="text-primary mt-1">▸</span>
                  <span className="text-sm sm:text-base leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {ideas.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold mb-6">Idea pages you'll love</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ideas.map((idea: IdeaPage) => (
                <Link
                  key={idea!.slug}
                  to="/ideas/$slug"
                  params={{ slug: idea!.slug }}
                  className="p-4 rounded-xl border border-border bg-background/40 hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  <div className="font-semibold">{idea!.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{idea!.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 text-center">
          <h2 className="font-display text-xl font-bold mb-4">Halloween for everyone</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {AUDIENCE_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <Link
                key={p.slug}
                to="/for/$slug"
                params={{ slug: p.slug }}
                className="px-4 py-2 rounded-full border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/10 text-sm font-medium transition"
              >
                {p.emoji} {p.audience}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
