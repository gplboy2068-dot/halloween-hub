/**
 * Shared JSON-LD schema builders for Phase 16 advanced schema coverage.
 * All URLs are relative — resolved against the host at crawl time.
 */
import { SITE } from "@/lib/site";

export type Crumb = { name: string; item: string };

export function breadcrumbListLd(items: Crumb[]) {
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

export type ListItemInput = {
  name: string;
  url: string;
  description?: string;
  image?: string;
};

export function itemListLd(items: ListItemInput[], meta?: { name?: string; description?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(meta?.name ? { name: meta.name } : {}),
    ...(meta?.description ? { description: meta.description } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url,
      name: it.name,
      ...(it.description ? { description: it.description } : {}),
      ...(it.image ? { image: it.image } : {}),
    })),
  };
}

export function collectionPageLd(opts: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: "/" },
    ...(opts.numberOfItems != null
      ? { mainEntity: { "@type": "ItemList", numberOfItems: opts.numberOfItems } }
      : {}),
  };
}

export function publisherLd() {
  return {
    "@type": "Organization",
    name: SITE.name,
    url: "/",
    logo: {
      "@type": "ImageObject",
      url: "/favicon.ico",
    },
  };
}

export function imageObjectLd(url: string, width = 1600, height = 900) {
  return {
    "@type": "ImageObject",
    url,
    width,
    height,
  };
}

export function speakableLd() {
  return {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "article p"],
  };
}

/** Approximate word count from HTML string (strip tags). */
export function wordCountFromHtml(html: string | null | undefined): number {
  if (!html) return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}
