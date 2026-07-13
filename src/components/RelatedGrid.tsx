import { Link } from "@tanstack/react-router";
import type { RelatedItem, RelatedKind, MixedRelated } from "@/lib/related";

const KIND_STYLES: Record<RelatedKind, { ring: string; label: string }> = {
  tool: { ring: "hover:border-primary/60 hover:bg-primary/5", label: "Tool" },
  idea: { ring: "hover:border-accent/60 hover:bg-accent/5", label: "Idea" },
  audience: { ring: "hover:border-secondary/60 hover:bg-secondary/5", label: "For You" },
  article: { ring: "hover:border-primary/60 hover:bg-primary/5", label: "Article" },
};

function RelatedCard({ item }: { item: RelatedItem }) {
  const style = KIND_STYLES[item.kind];
  return (
    <Link
      to={item.href}
      className={`group flex gap-3 p-4 rounded-xl border border-border bg-background/40 transition ${style.ring}`}
    >
      {item.emoji && (
        <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">
          {item.emoji}
        </span>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            {item.badge ?? style.label}
          </span>
        </div>
        <div className="font-display font-semibold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </div>
        {item.description && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </div>
        )}
      </div>
    </Link>
  );
}

export function RelatedSection({
  heading,
  subheading,
  items,
}: {
  heading: string;
  subheading?: string;
  items: RelatedItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold">{heading}</h2>
      {subheading && (
        <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <RelatedCard key={`${item.kind}:${item.slug}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export function RelatedMixSection({
  heading = "You might also love",
  mix,
}: {
  heading?: string;
  mix: MixedRelated;
}) {
  const merged: RelatedItem[] = [
    ...mix.tools.slice(0, 2),
    ...mix.articles.slice(0, 2),
    ...mix.ideas.slice(0, 2),
    ...mix.audiences.slice(0, 1),
  ];
  if (!merged.length) return null;
  return (
    <section className="mt-14 pt-10 border-t border-border">
      <h2 className="font-display text-2xl font-bold">{heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hand-picked tools, articles and ideas from across HalloweenTools.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {merged.map((item) => (
          <RelatedCard key={`${item.kind}:${item.slug}`} item={item} />
        ))}
      </div>
    </section>
  );
}
