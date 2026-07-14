import { Link } from "@tanstack/react-router";
import type { Author } from "@/lib/authors";

/**
 * Compact E-E-A-T trust strip — shows reviewer + last-updated date on
 * content pages. Uses existing tokens; no visual redesign.
 */
export function TrustBar({
  reviewer,
  updatedAt,
}: {
  reviewer: Author;
  updatedAt: string; // ISO
}) {
  const formatted = new Date(updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <aside
      className="mt-10 rounded-2xl border border-border bg-card/40 px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
      aria-label="Editorial trust information"
    >
      <span className="flex items-center gap-2">
        <span className="text-lg leading-none" aria-hidden="true">{reviewer.emoji}</span>
        <span>
          Reviewed by{" "}
          <Link
            to="/authors/$slug"
            params={{ slug: reviewer.slug }}
            className="text-foreground font-medium hover:text-primary"
          >
            {reviewer.name}
          </Link>
          <span className="hidden sm:inline">, {reviewer.role}</span>
        </span>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last updated <time dateTime={updatedAt}>{formatted}</time>
      </span>
      <span aria-hidden="true">·</span>
      <Link to="/editorial-policy" className="hover:text-primary underline">
        Editorial policy
      </Link>
    </aside>
  );
}
