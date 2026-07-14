import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { TOOLS, CATEGORIES } from "@/lib/site";
import { allIdeaSlugs, AUDIENCE_PAGES, getIdeaPage } from "@/lib/pseo";
import { allCollectionPages } from "@/lib/collections";
import { AUTHORS } from "@/lib/authors";
import { listArticles, listBlogCategories, listBlogTags } from "@/lib/blog.functions";

const sitemapQuery = queryOptions({
  queryKey: ["html-sitemap"],
  queryFn: async () => {
    const [articles, cats, tags] = await Promise.all([
      listArticles({ data: { limit: 200 } }).catch(() => []),
      listBlogCategories().catch(() => []),
      listBlogTags().catch(() => []),
    ]);
    return { articles, cats, tags };
  },
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/sitemap")({
  loader: ({ context }) => context.queryClient.ensureQueryData(sitemapQuery),
  head: () => ({
    meta: [
      { title: "HTML Sitemap — HalloweenTools" },
      { name: "description", content: "Full HTML sitemap of every tool, article, idea, audience hub and collection on HalloweenTools." },
      { property: "og:title", content: "HTML Sitemap — HalloweenTools" },
      { property: "og:url", content: "/sitemap" },
    ],
    links: [{ rel: "canonical", href: "/sitemap" }],
  }),
  component: HtmlSitemap,
});

function HtmlSitemap() {
  const { data } = useSuspenseQuery(sitemapQuery);
  const ideaSlugs = allIdeaSlugs();
  const ideas = ideaSlugs.map((s) => getIdeaPage(s)).filter((p): p is NonNullable<ReturnType<typeof getIdeaPage>> => p !== null);
  const collections = allCollectionPages();

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Sitemap</span>
        </nav>
        <header>
          <h1 className="font-display text-4xl sm:text-5xl font-bold">
            HTML <span className="text-gradient-primary">Sitemap</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Every page on HalloweenTools, organised for humans. Looking for the crawler feed? See{" "}
            <a href="/sitemap.xml" className="text-primary hover:underline">/sitemap.xml</a>.
          </p>
        </header>

        <Section title="Hubs">
          <List items={[
            { href: "/tools", label: "All Tools" },
            { href: "/categories", label: "Categories" },
            { href: "/collections", label: "Collections" },
            { href: "/ideas", label: "Ideas" },
            { href: "/for", label: "For You" },
            { href: "/blog", label: "Blog" },
            { href: "/authors", label: "Editorial Team" },
            { href: "/search", label: "Search" },
            { href: "/saved", label: "Saved" },
          ]} />
        </Section>

        <Section title={`Tools (${TOOLS.length})`}>
          <List items={TOOLS.map((t) => ({ href: `/tools/${t.slug}`, label: `${t.emoji} ${t.title}` }))} />
        </Section>

        <Section title={`Categories (${CATEGORIES.length})`}>
          <List items={CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: `${c.emoji} ${c.name}` }))} />
        </Section>

        <Section title={`Collections (${collections.length})`}>
          <List items={collections.map((c) => ({ href: `/collections/${c.slug}`, label: `${c.emoji} ${c.h1}` }))} />
        </Section>

        <Section title={`Idea pages (${ideas.length})`}>
          <List items={ideas.map((i) => ({ href: `/ideas/${i.slug}`, label: i.title }))} />
        </Section>

        <Section title={`Audience hubs (${AUDIENCE_PAGES.length})`}>
          <List items={AUDIENCE_PAGES.map((a) => ({ href: `/for/${a.slug}`, label: `${a.emoji} ${a.hero}` }))} />
        </Section>

        <Section title={`Blog articles (${data.articles.length})`}>
          <List items={data.articles.map((a) => ({ href: `/blog/${a.slug}`, label: a.title }))} />
        </Section>

        {data.cats.length > 0 && (
          <Section title={`Blog categories (${data.cats.length})`}>
            <List items={data.cats.map((c) => ({ href: `/blog/category/${c.slug}`, label: c.name }))} />
          </Section>
        )}

        {data.tags.length > 0 && (
          <Section title={`Blog tags (${data.tags.length})`}>
            <List items={data.tags.map((t) => ({ href: `/blog/tag/${t.slug}`, label: `#${t.name}` }))} />
          </Section>
        )}

        <Section title={`Authors (${AUTHORS.length})`}>
          <List items={AUTHORS.map((a) => ({ href: `/authors/${a.slug}`, label: `${a.emoji} ${a.name} — ${a.role}` }))} />
        </Section>

        <Section title="Legal & policy">
          <List items={[
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/editorial-policy", label: "Editorial Policy" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/disclaimer", label: "Disclaimer" },
            { href: "/cookies", label: "Cookie Policy" },
          ]} />
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold mb-4 border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
      {items.map((i) => (
        <li key={i.href}>
          <a href={i.href} className="text-muted-foreground hover:text-primary hover:underline">
            {i.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
