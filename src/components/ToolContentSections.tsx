import { Link } from "@tanstack/react-router";
import type { ToolContent } from "@/lib/tool-content";
import type { ToolCard as TCard } from "@/lib/site";

export function ToolAbout({ toolTitle, about }: { toolTitle: string; about: string }) {
  if (!about) return null;
  // Split on double newlines so long about blocks can render as multiple paragraphs.
  const paragraphs = about.split(/\n\n+/).filter(Boolean);
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold">About the {toolTitle}</h2>
      <div className="mt-3 space-y-4 text-muted-foreground leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

export function ToolFeatures({ features }: { features: ToolContent["features"] }) {
  if (!features.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Why creators love it</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="text-2xl" aria-hidden="true">{f.emoji}</div>
            <div className="mt-2 font-display font-semibold">{f.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{f.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolBenefits({ benefits }: { benefits: ToolContent["benefits"] }) {
  if (!benefits?.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Key benefits</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{b.emoji}</span>
              <h3 className="font-display font-semibold">{b.title}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolHowTo({ steps, toolTitle }: { steps: ToolContent["howTo"]; toolTitle: string }) {
  if (!steps.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">How to use the {toolTitle}</h2>
      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={s.name} className="flex gap-4 rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/15 text-primary font-display font-bold flex items-center justify-center">
              {i + 1}
            </div>
            <div>
              <h3 className="font-display font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ToolUseCases({ useCases }: { useCases: ToolContent["useCases"] }) {
  if (!useCases.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Best use cases</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((u) => (
          <div key={u.title} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="text-2xl" aria-hidden="true">{u.emoji}</div>
            <h3 className="mt-2 font-display font-semibold">{u.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{u.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolTips({ tips }: { tips: string[] }) {
  if (!tips.length) return null;
  return (
    <section className="mt-14 rounded-3xl border border-primary/25 bg-primary/5 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-bold">Tips &amp; best practices</h2>
      <ul className="mt-4 space-y-3">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
            <span className="text-primary flex-shrink-0" aria-hidden="true">✦</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ToolMistakes({ mistakes }: { mistakes: ToolContent["mistakes"] }) {
  if (!mistakes?.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Common mistakes to avoid</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {mistakes.map((m) => (
          <div key={m.title} className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5">
            <div className="flex items-center gap-2">
              <span className="text-destructive" aria-hidden="true">⚠︎</span>
              <h3 className="font-display font-semibold">{m.title}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolFaqs({ faqs }: { faqs: ToolContent["faqs"] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card/40">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5 open:bg-primary/5">
            <summary className="cursor-pointer font-display font-semibold flex items-center justify-between gap-4 list-none">
              <span>{f.q}</span>
              <span className="text-primary text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ToolCta({ cta, currentSlug }: { cta: TCard | undefined; currentSlug: string }) {
  if (!cta || cta.slug === currentSlug) return null;
  return (
    <section className="mt-14">
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-10 text-center">
        <div className="text-4xl" aria-hidden="true">{cta.emoji}</div>
        <p className="mt-3 text-xs uppercase tracking-widest text-primary font-semibold">Try next</p>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold">{cta.title}</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{cta.description}</p>
        <Link
          to="/tools/$slug"
          params={{ slug: cta.slug }}
          className="mt-6 inline-flex px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          Open the {cta.title}
        </Link>
      </div>
    </section>
  );
}

export function ContinueExploring({
  categories,
}: {
  categories: { slug: string; name: string; emoji: string; description: string }[];
}) {
  if (!categories.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">Continue exploring</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        More Halloween categories to browse — every category has its own free tools and printables.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/categories/$slug"
            params={{ slug: c.slug }}
            className="rounded-2xl border border-border bg-card/40 p-4 hover:border-primary/60 transition"
          >
            <div className="text-2xl" aria-hidden="true">{c.emoji}</div>
            <div className="mt-2 font-display font-semibold">{c.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
