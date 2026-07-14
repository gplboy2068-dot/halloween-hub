import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AUTHORS } from "@/lib/authors";
import { breadcrumbListLd, collectionPageLd, itemListLd } from "@/lib/schema";

export const Route = createFileRoute("/authors/")({
  head: () => ({
    meta: [
      { title: "Meet the HalloweenTools Editorial Team" },
      { name: "description", content: "The writers, designers, and editors behind every tool and article on HalloweenTools.com. Real experts, real credentials." },
      { property: "og:title", content: "Meet the HalloweenTools Editorial Team" },
      { property: "og:description", content: "Real writers, designers, and editors behind every tool and article on HalloweenTools.com." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/authors" },
    ],
    links: [{ rel: "canonical", href: "/authors" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          collectionPageLd({
            name: "HalloweenTools Editorial Team",
            description: "Named, credentialed reviewers behind every guide.",
            url: "/authors",
            numberOfItems: AUTHORS.length,
          }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          itemListLd(
            AUTHORS.map((a) => ({
              name: a.name,
              url: `/authors/${a.slug}`,
              description: `${a.role} — ${a.shortBio}`,
            })),
            { name: "Editorial team" },
          ),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbListLd([
            { name: "Home", item: "/" },
            { name: "Authors", item: "/authors" },
          ]),
        ),
      },
    ],
  }),
  component: AuthorsIndex,
});

function AuthorsIndex() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <header className="text-center">
          <div className="text-6xl mb-4">✍️</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Our Editorial Team</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            HalloweenTools is written and reviewed by working professionals — designers,
            teachers, event planners, and AI engineers. Every guide passes through named,
            credentialed reviewers before it ships.
          </p>
          <div className="mt-6 flex justify-center gap-3 text-xs text-muted-foreground">
            <Link to="/editorial-policy" className="hover:text-primary underline">
              Editorial policy
            </Link>
            <span>·</span>
            <Link to="/about" className="hover:text-primary underline">
              About HalloweenTools
            </Link>
          </div>
        </header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {AUTHORS.map((a) => (
            <Link
              key={a.slug}
              to="/authors/$slug"
              params={{ slug: a.slug }}
              className="group flex gap-4 p-6 rounded-2xl border border-border bg-card/40 transition hover:border-primary/60 hover:bg-primary/5"
            >
              <span className="text-4xl flex-shrink-0" aria-hidden="true">{a.emoji}</span>
              <div className="min-w-0">
                <div className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                  {a.name}
                </div>
                <div className="text-xs uppercase tracking-wider text-primary font-semibold mt-1">
                  {a.role}
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.shortBio}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
