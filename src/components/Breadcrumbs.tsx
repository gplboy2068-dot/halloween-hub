import { Link } from "@tanstack/react-router";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.to && !isLast ? (
                // @ts-expect-error - dynamic route param spread
                <Link to={c.to} params={c.params} className="hover:text-primary">
                  {c.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground line-clamp-1" : ""}>{c.label}</span>
              )}
              {!isLast && <span className="mx-1">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** BreadcrumbList JSON-LD shaped for schema.org. */
export function breadcrumbJsonLd(items: { name: string; item: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
}
