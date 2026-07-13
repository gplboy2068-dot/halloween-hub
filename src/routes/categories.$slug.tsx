import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES, TOOLS } from "@/lib/site";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return cat;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.name} — Halloween Tools & Ideas` },
        { name: "description", content: `${loaderData.description}. Free Halloween ${loaderData.name.toLowerCase()} tools & inspiration.` },
        { property: "og:title", content: `${loaderData.name} — HalloweenTools` },
        { property: "og:url", content: `/categories/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/categories/${params.slug}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Category not found</h1>
        <Link to="/categories" className="mt-6 inline-flex px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold">
          All categories
        </Link>
      </div>
    </PageShell>
  ),
});

function CategoryPage() {
  const cat = Route.useLoaderData();
  const tools = TOOLS.filter((t) => t.category.toLowerCase() === cat.name.toLowerCase());

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/categories" className="hover:text-primary">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{cat.name}</span>
        </nav>
        <div className="text-5xl">{cat.emoji}</div>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold">{cat.name}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">{cat.description}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </div>
    </PageShell>
  );
}
