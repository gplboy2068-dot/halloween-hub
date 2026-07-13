import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ARTICLES } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Halloween Blog — Ideas, Guides & Inspiration" },
      { name: "description", content: "Halloween party planning, costume ideas, pumpkin carving guides, DIY decor, history & more." },
      { property: "og:title", content: "Halloween Blog" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

function BlogIndex() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Halloween <span className="text-gradient-primary">Blog</span></h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Guides, ideas & inspiration for the spookiest season of the year.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">{a.category}</span>
              <h2 className="mt-2 font-display text-xl font-semibold group-hover:text-primary transition-colors">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">{a.readingTime} min read · Updated {a.updatedAt}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
