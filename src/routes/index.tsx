import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { Newsletter } from "@/components/Newsletter";
import { TOOLS, CATEGORIES, ARTICLES, SITE } from "@/lib/site";
import heroImg from "@/assets/hero-halloween.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = TOOLS.filter((t) => t.featured);
  const popular = TOOLS.filter((t) => t.popular);
  const latest = TOOLS.slice(0, 8);

  return (
    <PageShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Glowing jack-o-lantern in a misty graveyard"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> 25+ free Halloween tools
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl mx-auto">
            The internet's biggest{" "}
            <span className="text-gradient-primary">Halloween toolkit</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {SITE.description}
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              placeholder="Search costumes, pumpkins, wishes…"
              className="w-full h-14 pl-12 pr-32 rounded-full bg-card/80 backdrop-blur border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {["pumpkin carving", "costumes", "captions", "wishes", "party ideas"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Featured" title="Handpicked Halloween Tools" href="/tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Browse" title="Explore by Category" href="/categories" />
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-accent/60 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl">{c.emoji}</span>
              <h3 className="mt-3 font-display font-semibold group-hover:text-accent transition-colors">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Trending" title="Popular Right Now" href="/tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      {/* LATEST TOOLS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Fresh" title="Latest Tools" href="/tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Read" title="From the Blog" href="/blog" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/60 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">{a.category}</span>
              <h3 className="mt-2 font-display text-lg font-semibold group-hover:text-primary transition-colors">
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">{a.readingTime} min read</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <SectionHeader eyebrow="Help" title="Frequently Asked" />
        <div className="space-y-3">
          {[
            { q: "Are HalloweenTools tools really free?", a: "Yes — every tool is free to use with no signup required." },
            { q: "Can I use the generated content commercially?", a: "Most outputs are royalty-free for personal use. Check each tool's guidance for commercial terms." },
            { q: "Do you save my data?", a: "No. Tools run in your browser whenever possible and never sell your data." },
            { q: "Will you add more tools?", a: "Yes — new tools launch weekly during the Halloween season." },
          ].map((f, i) => (
            <details key={i} className="group rounded-xl border border-border bg-card p-5">
              <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
                {f.q}
                <span className="text-primary group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="py-8"><Newsletter /></div>
    </PageShell>
  );
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold">{title}</h2>
      </div>
      {href && (
        <Link to={href} className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
