import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TOOLS, CATEGORIES } from "@/lib/site";
import { allIdeaSlugs, AUDIENCE_PAGES } from "@/lib/pseo";
import { listArticles, listBlogCategories, listBlogTags } from "@/lib/blog.functions";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [articles, blogCats, blogTags] = await Promise.all([
          listArticles({ data: { limit: 100 } }).catch(() => []),
          listBlogCategories().catch(() => []),
          listBlogTags().catch(() => []),
        ]);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/tools", changefreq: "weekly", priority: "0.9" },
          { path: "/categories", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/disclaimer", changefreq: "yearly", priority: "0.3" },
          { path: "/cookies", changefreq: "yearly", priority: "0.3" },
          ...TOOLS.map((t) => ({ path: `/tools/${t.slug}`, changefreq: "weekly" as const, priority: "0.8" })),
          ...CATEGORIES.map((c) => ({ path: `/categories/${c.slug}`, changefreq: "weekly" as const, priority: "0.7" })),
          ...articles.map((a) => ({
            path: `/blog/${a.slug}`,
            lastmod: (a.updatedAt ?? a.publishedAt ?? "").slice(0, 10),
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          ...blogCats.map((c) => ({
            path: `/blog/category/${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.6",
          })),
          ...blogTags.map((t) => ({
            path: `/blog/tag/${t.slug}`,
            changefreq: "weekly" as const,
            priority: "0.4",
          })),
          { path: "/ideas", changefreq: "weekly" as const, priority: "0.8" },
          { path: "/for", changefreq: "weekly" as const, priority: "0.8" },
          ...allIdeaSlugs().map((slug) => ({ path: `/ideas/${slug}`, changefreq: "monthly" as const, priority: "0.6" })),
          ...AUDIENCE_PAGES.map((p) => ({ path: `/for/${p.slug}`, changefreq: "monthly" as const, priority: "0.7" })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
