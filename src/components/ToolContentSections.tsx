import type { ToolContent } from "@/lib/tool-content";

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
              <div className="font-display font-semibold">{s.name}</div>
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
      <h2 className="font-display text-2xl font-bold">Who it's for</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((u) => (
          <div key={u.title} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="text-2xl" aria-hidden="true">{u.emoji}</div>
            <div className="mt-2 font-display font-semibold">{u.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{u.description}</div>
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
      <h2 className="font-display text-2xl font-bold">Pro tips</h2>
      <ul className="mt-4 space-y-2">
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
