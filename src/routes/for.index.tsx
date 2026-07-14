import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AUDIENCE_PAGES } from "@/lib/pseo";
import { breadcrumbListLd, collectionPageLd, itemListLd } from "@/lib/schema";

export const Route = createFileRoute("/for/")({
  head: () => ({
    meta: [
      { title: "Halloween For Everyone — Kids, Adults, Couples, Pets & More (2026)" },
      { name: "description", content: "Audience-specific Halloween hubs: kids, adults, couples, teens, teachers, work, pets. Handpicked tools, ideas and inspiration for every group." },
      { property: "og:title", content: "Halloween For Everyone" },
      { property: "og:description", content: "Halloween pages tuned for every audience — from toddlers to teachers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/for" },
    ],
    links: [{ rel: "canonical", href: "/for" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          collectionPageLd({
            name: "Halloween For Everyone",
            description: "Audience-tuned Halloween hubs.",
            url: "/for",
            numberOfItems: AUDIENCE_PAGES.length,
          }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          itemListLd(
            AUDIENCE_PAGES.map((p) => ({ name: p.hero, url: `/for/${p.slug}`, description: p.intro.slice(0, 155) })),
            { name: "Audiences" },
          ),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListLd([
            { name: "Home", item: "/" },
            { name: "For You", item: "/for" },
          ]),
        ),
      },
    ],
  }),
  component: ForHub,
});

function ForHub() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <header className="text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold">Halloween for Everyone</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked Halloween ideas, costumes, tools and party plans — organized by who you're planning for.
          </p>
        </header>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_PAGES.map((p) => (
            <Link
              key={p.slug}
              to="/for/$slug"
              params={{ slug: p.slug }}
              className="group p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/40 hover:bg-primary/5 transition"
            >
              <div className="text-4xl mb-3">{p.emoji}</div>
              <h2 className="font-display text-xl font-bold group-hover:text-primary transition">{p.hero}</h2>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
