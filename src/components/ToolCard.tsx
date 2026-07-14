import { Link } from "@tanstack/react-router";
import type { ToolCard as T } from "@/lib/site";
import { SaveButton } from "@/components/SaveButton";

export function ToolCard({ tool }: { tool: T }) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5"
    >
      <div className="absolute top-3 right-3 z-10">
        <SaveButton
          item={{
            kind: "tool",
            slug: tool.slug,
            title: tool.title,
            emoji: tool.emoji,
            href: `/tools/${tool.slug}`,
          }}
        />
      </div>
      <div className="flex items-start justify-between pr-10">
        <span className="text-3xl group-hover:scale-110 transition-transform">{tool.emoji}</span>
        <div className="flex gap-1">
          {tool.isNew && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
              New
            </span>
          )}
          {tool.popular && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
              Hot
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold group-hover:text-primary transition-colors">
        {tool.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
      <span className="mt-3 text-xs text-muted-foreground/80">{tool.category}</span>
    </Link>
  );
}
