import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { IDEA_CATEGORIES, AUDIENCES, STYLES, allIdeaSlugs, getIdeaPage } from "@/lib/pseo";
import { breadcrumbListLd, collectionPageLd, itemListLd } from "@/lib/schema";

export const Route = createFileRoute("/ideas/")({
  head: () => {
    const slugs = allIdeaSlugs();
    return {
      meta: [
        { title: "Halloween Ideas Hub — Costumes, Makeup, Decor, Food & More (2026)" },
        { name: "description", content: "Curated Halloween idea pages: costumes, makeup, decorations, food, party themes, pumpkin carving — filtered by audience and style. Free, refreshed for 2026." },
        { property: "og:title", content: "Halloween Ideas Hub — 2026" },
        { property: "og:description", content: "Every Halloween idea you need, organized by audience and style." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/ideas" },
      ],
      links: [{ rel: "canonical", href: "/ideas" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            collectionPageLd({
              name: "Halloween Ideas Hub",
              description: "Every Halloween idea, organized by audience and style.",
              url: "/ideas",
              numberOfItems: slugs.length,
            }),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            itemListLd(
              slugs
                .map((s) => getIdeaPage(s))
                .filter((p): p is NonNullable<ReturnType<typeof getIdeaPage>> => p !== null)
                .map((p) => ({ name: p.title, url: `/ideas/${p.slug}`, description: p.description })),
              { name: "Halloween idea pages" },
            ),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbListLd([
              { name: "Home", item: "/" },
              { name: "Ideas", item: "/ideas" },
            ]),
          ),
        },
      ],
    };
  },
  component: IdeasHub,
});

function IdeasHub() {
  const totalPages = allIdeaSlugs().length;
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <header className="text-center">
          <div className="text-6xl mb-4">💡</div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold">Halloween Ideas Hub</h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {totalPages}+ curated idea pages for costumes, makeup, decor, food, party themes and pumpkin carving —
            filtered by audience and style. Everything refreshed for Halloween 2026.
          </p>
        </header>

        <div className="mt-14 space-y-16">
          {IDEA_CATEGORIES.map((cat) => (
            <section key={cat.key}>
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-display text-3xl font-bold">
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.noun.charAt(0).toUpperCase() + cat.noun.slice(1)} ideas
                </h2>
              </div>

              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">By audience</h3>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((aud) => {
                    const slug = `${cat.key}-for-${aud}`;
                    const p = getIdeaPage(slug);
                    if (!p) return null;
                    return (
                      <Link
                        key={slug}
                        to="/ideas/$slug"
                        params={{ slug }}
                        className="px-3 py-1.5 rounded-full border border-border bg-background/60 hover:border-primary/40 hover:bg-primary/10 text-xs font-medium transition"
                      >
                        For {aud}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">By style</h3>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((style) => {
                    const slug = `${cat.key}-${style}`;
                    const p = getIdeaPage(slug);
                    if (!p) return null;
                    return (
                      <Link
                        key={slug}
                        to="/ideas/$slug"
                        params={{ slug }}
                        className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/15 text-xs font-medium text-primary transition"
                      >
                        {style}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
