import { createFileRoute } from "@tanstack/react-router";
import { listArticles } from "@/lib/blog.functions";
import { SITE } from "@/lib/site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const articles = await listArticles({ data: { limit: 40 } });

        const items = articles
          .map((a) => {
            const link = `${origin}/blog/${a.slug}`;
            const pubDate = new Date(a.publishedAt ?? a.updatedAt).toUTCString();
            const cats = [a.category?.name, ...a.tags.map((t) => t.name)].filter(Boolean) as string[];
            return [
              "  <item>",
              `    <title>${esc(a.title)}</title>`,
              `    <link>${link}</link>`,
              `    <guid isPermaLink="true">${link}</guid>`,
              `    <pubDate>${pubDate}</pubDate>`,
              `    <description>${esc(a.excerpt)}</description>`,
              ...cats.map((c) => `    <category>${esc(c)}</category>`),
              a.coverImage
                ? `    <enclosure url="${esc(a.coverImage)}" type="image/jpeg" />`
                : "",
              "  </item>",
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `<channel>`,
          `  <title>${esc(SITE.name)} — Blog</title>`,
          `  <link>${origin}/blog</link>`,
          `  <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />`,
          `  <description>${esc(SITE.description)}</description>`,
          `  <language>en-US</language>`,
          `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
          items,
          `</channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
