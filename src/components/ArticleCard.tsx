import { Link } from "@tanstack/react-router";
import type { ArticleListItem } from "@/lib/blog.functions";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function ArticleCard({ article, featured = false }: { article: ArticleListItem; featured?: boolean }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className={`group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/60 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 ${
        featured ? "md:col-span-2 lg:col-span-2" : ""
      }`}
    >
      {article.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center">
          <span className="text-6xl opacity-40">🎃</span>
        </div>
      )}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold">
          {article.category && (
            <span className="text-primary">{article.category.name}</span>
          )}
          {article.featured && (
            <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground">Featured</span>
          )}
        </div>
        <h3 className={`mt-2 font-display font-semibold group-hover:text-primary transition-colors ${featured ? "text-2xl" : "text-lg"}`}>
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.readTimeMin} min read</span>
          {article.publishedAt && (
            <>
              <span>·</span>
              <span>{formatDate(article.publishedAt)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
