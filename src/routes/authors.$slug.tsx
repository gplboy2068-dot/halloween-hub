import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { getAuthor, AUTHORS, personJsonLd } from "@/lib/authors";

export const Route = createFileRoute("/authors/$slug")({
  loader: ({ params }) => {
    const author = getAuthor(params.slug);
    if (!author) throw notFound();
    return author;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const url = `/authors/${params.slug}`;
    return {
      meta: [
        { title: `${loaderData.name} — ${loaderData.role} at HalloweenTools` },
        { name: "description", content: loaderData.shortBio },
        { property: "og:title", content: `${loaderData.name} — ${loaderData.role}` },
        { property: "og:description", content: loaderData.shortBio },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(personJsonLd(loaderData)),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Authors", item: "/authors" },
              { "@type": "ListItem", position: 3, name: loaderData.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: AuthorPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-6xl mb-4">🕯️</div>
        <h1 className="font-display text-3xl font-bold">Author not found</h1>
        <Link to="/authors" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          All authors
        </Link>
      </div>
    </PageShell>
  ),
});

function AuthorPage() {
  const a = Route.useLoaderData();
  const others = AUTHORS.filter((x) => x.slug !== a.slug);
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/authors" className="hover:text-primary">Authors</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{a.name}</span>
        </nav>

        <header className="flex flex-col sm:flex-row gap-6 items-start">
          <span className="text-6xl flex-shrink-0" aria-hidden="true">{a.emoji}</span>
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold">{a.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-wider text-primary font-semibold">
              {a.role}
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{a.shortBio}</p>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">About</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">{a.longBio}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Areas of expertise</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {a.expertise.map((e) => (
              <li
                key={e}
                className="px-3 py-1 rounded-full text-xs border border-border bg-card/40"
              >
                {e}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          Profile last reviewed{" "}
          <time dateTime={a.updatedAt}>
            {new Date(a.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
          .
        </p>

        <section className="mt-14 pt-10 border-t border-border">
          <h2 className="font-display text-2xl font-bold">More from the team</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                to="/authors/$slug"
                params={{ slug: o.slug }}
                className="group flex gap-3 p-4 rounded-xl border border-border bg-card/40 transition hover:border-primary/60 hover:bg-primary/5"
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{o.emoji}</span>
                <div className="min-w-0">
                  <div className="font-display font-semibold group-hover:text-primary transition-colors">
                    {o.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{o.role}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </PageShell>
  );
}
