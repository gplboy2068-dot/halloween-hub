import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { allCollectionPages } from "@/lib/collections";
import { breadcrumbListLd, collectionPageLd, itemListLd } from "@/lib/schema";

export const Route = createFileRoute("/collections/")({
  head: () => {
    const pages = allCollectionPages();
    return {
      meta: [
        { title: "Halloween Tool Collections — Curated Toolkits by Audience & Use" },
        { name: "description", content: "Curated collections of free Halloween tools — for teachers, parents, couples, teens, small business, content creators and more." },
        { property: "og:title", content: "Halloween Tool Collections" },
        { property: "og:description", content: "Curated collections of free Halloween tools by audience and use case." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/collections" },
      ],
      links: [{ rel: "canonical", href: "/collections" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            collectionPageLd({
              name: "Halloween Tool Collections",
              description: "Curated Halloween toolkits by audience and use case.",
              url: "/collections",
              numberOfItems: pages.length,
            }),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            itemListLd(
              pages.map((p) => ({ name: p.h1, url: `/collections/${p.slug}`, description: p.description })),
              { name: "Collections" },
            ),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbListLd([
              { name: "Home", item: "/" },
              { name: "Collections", item: "/collections" },
            ]),
          ),
        },
      ],
    };
  },
  component: CollectionsIndex,
});

function CollectionsIndex() {
  const pages = allCollectionPages();
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <header className="text-center">
          <div className="text-6xl mb-4">🧰</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Halloween Tool Collections</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked toolkits for every kind of Halloween need — for teachers, parents,
            couples, teens, work, small business and more.
          </p>
        </header>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p.slug}
              to="/collections/$slug"
              params={{ slug: p.slug }}
              className="group flex gap-3 p-5 rounded-2xl border border-border bg-card/40 transition hover:border-primary/60 hover:bg-primary/5"
            >
              <span className="text-3xl flex-shrink-0" aria-hidden="true">{p.emoji}</span>
              <div className="min-w-0">
                <div className="font-display font-semibold group-hover:text-primary transition-colors">
                  {p.h1}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {p.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
