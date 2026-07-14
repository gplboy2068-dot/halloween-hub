import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CATEGORIES, TOOLS } from "@/lib/site";
import { breadcrumbListLd, collectionPageLd, itemListLd } from "@/lib/schema";

export const Route = createFileRoute("/categories/")({
  component: CategoriesIndex,
  head: () => ({
    meta: [
      { title: "Halloween Categories — HalloweenTools" },
      { name: "description", content: "Browse Halloween tools and content by category: design, AI, pumpkin, party, images, printables and more." },
      { property: "og:title", content: "Halloween Categories" },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          collectionPageLd({
            name: "Halloween Categories",
            description: "Every Halloween category on HalloweenTools.",
            url: "/categories",
            numberOfItems: CATEGORIES.length,
          }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          itemListLd(
            CATEGORIES.map((c) => ({ name: c.name, url: `/categories/${c.slug}`, description: c.description })),
            { name: "Categories" },
          ),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListLd([
            { name: "Home", item: "/" },
            { name: "Categories", item: "/categories" },
          ]),
        ),
      },
    ],
  }),
});

function CategoriesIndex() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Categories</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Everything Halloween, neatly organised.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const count = TOOLS.filter((t) => t.category.toLowerCase() === c.name.toLowerCase()).length;
            return (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-accent/60 hover:-translate-y-0.5 transition-all"
              >
                <span className="text-4xl">{c.emoji}</span>
                <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-accent">{c.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{count} tools</p>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
