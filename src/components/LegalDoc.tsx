import { useMemo } from "react";
import { PageShell } from "./PageShell";
import { Breadcrumbs } from "./Breadcrumbs";
import type { LegalPage } from "@/lib/legal.functions";

function slugifyHeading(s: string) {
  return s
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LegalDoc({ page, path }: { page: LegalPage; path: string }) {
  const { html, toc } = useMemo(() => {
    const toc: { id: string; text: string }[] = [];
    const html = page.content.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
      const text = String(inner).replace(/<[^>]+>/g, "").trim();
      const id = slugifyHeading(text);
      toc.push({ id, text });
      return `<h2 id="${id}">${inner}</h2>`;
    });
    return { html, toc };
  }, [page.content]);

  const updated = new Date(page.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: page.title }]} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="min-w-0">
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">{page.title}</h1>
            {page.lead && <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{page.lead}</p>}
            <p className="mt-3 text-xs text-muted-foreground">Last updated: {updated}</p>
            <div
              className="mt-10 space-y-4 text-muted-foreground leading-relaxed
                [&_p]:mb-4
                [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:scroll-mt-24
                [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2
                [&_a]:text-primary [&_a:hover]:underline
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_ol]:mb-4
                [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
          {toc.length > 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                  On this page
                </p>
                <ul className="space-y-2 text-sm border-l border-border pl-4">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary block leading-snug">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export function LegalNotFound({ title }: { title: string }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="text-5xl mb-4">🎃</div>
        <h1 className="font-display text-3xl font-bold">{title} is not available</h1>
        <p className="mt-2 text-muted-foreground">
          This page hasn't been published yet. Please check back soon.
        </p>
      </div>
    </PageShell>
  );
}

export function legalHead(page: LegalPage | null | undefined, path: string) {
  if (!page) {
    return {
      meta: [
        { title: "Unavailable — HalloweenTools" },
        { name: "robots", content: "noindex" },
      ],
    };
  }
  return {
    meta: [
      { title: page.meta_title },
      { name: "description", content: page.meta_description },
      { property: "og:title", content: page.meta_title },
      { property: "og:description", content: page.meta_description },
      { property: "og:url", content: path },
      { property: "og:type", content: "article" },
      { property: "article:modified_time", content: page.updated_at },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.meta_title },
      { name: "twitter:description", content: page.meta_description },
    ],
    links: [{ rel: "canonical", href: path }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.meta_title,
          description: page.meta_description,
          url: path,
          dateModified: page.updated_at,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: page.title, item: path },
          ],
        }),
      },
    ],
  };
}
