import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { Search as SearchIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import {
  buildFullIndex,
  searchItems,
  groupByKind,
  KIND_LABELS,
  POPULAR_SEARCHES,
  TRENDING_SEARCHES,
  getRecentSearches,
  pushRecentSearch,
  type SearchKind,
} from "@/lib/search";
import { listSearchArticles, type SearchArticle } from "@/lib/search.functions";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

const KIND_ORDER: SearchKind[] = ["tool", "article", "idea", "audience", "category", "tag", "page"];

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  component: SearchPage,
  head: ({ search }) => {
    const q = (search as { q: string }).q;
    const title = q ? `Search: "${q}" — HalloweenTools` : "Search — HalloweenTools";
    return {
      meta: [
        { title },
        { name: "description", content: "Search Halloween tools, articles, ideas, and categories on HalloweenTools." },
        { name: "robots", content: "noindex, follow" },
        { property: "og:title", content: title },
        { property: "og:url", content: "/search" },
      ],
      links: [{ rel: "canonical", href: "/search" }],
    };
  },
});

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(initialQ);
  const [recent] = useState(() => getRecentSearches());

  const { data: articles = [] } = useQuery<SearchArticle[]>({
    queryKey: ["search-articles"],
    queryFn: () => listSearchArticles(),
    staleTime: 5 * 60_000,
  });

  const index = useMemo(() => buildFullIndex(articles), [articles]);
  const results = useMemo(() => searchItems(index, q, 200), [index, q]);
  const grouped = useMemo(() => groupByKind(results), [results]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = q.trim();
    if (clean) pushRecentSearch(clean);
    navigate({ search: { q: clean } });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Search</h1>
        <p className="mt-2 text-muted-foreground">Find tools, articles, ideas and categories.</p>

        <form onSubmit={submit} className="mt-6 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search HalloweenTools…"
            className="w-full h-12 pl-10 pr-4 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </form>

        {q.trim().length === 0 ? (
          <div className="mt-10 space-y-8">
            {recent.length > 0 && (
              <SuggestionBlock title="Recent searches" items={recent} onPick={(v) => { setQ(v); navigate({ search: { q: v } }); }} />
            )}
            <SuggestionBlock title="Popular searches" items={POPULAR_SEARCHES} onPick={(v) => { setQ(v); navigate({ search: { q: v } }); }} />
            <SuggestionBlock title="Trending now" items={TRENDING_SEARCHES} onPick={(v) => { setQ(v); navigate({ search: { q: v } }); }} />
          </div>
        ) : results.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="text-6xl mb-4">🕸️</div>
            <h2 className="font-display text-2xl font-bold">No results for "{q}"</h2>
            <p className="mt-2 text-muted-foreground">Try one of these popular searches instead:</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQ(s); navigate({ search: { q: s } }); }}
                  className="px-4 py-2 text-sm rounded-full border border-border hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} for <span className="text-foreground font-medium">"{q}"</span>
            </p>
            {KIND_ORDER.map((k) => {
              const list = grouped[k];
              if (list.length === 0) return null;
              return (
                <section key={k}>
                  <h2 className="font-display text-xl font-bold mb-4">
                    {KIND_LABELS[k]} <span className="text-muted-foreground text-sm font-normal">({list.length})</span>
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {list.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-2xl shrink-0">{item.emoji ?? "•"}</span>
                        <div className="min-w-0">
                          <div className="font-semibold group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function SuggestionBlock({
  title,
  items,
  onPick,
}: {
  title: string;
  items: string[];
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="px-4 py-2 text-sm rounded-full border border-border bg-card/60 hover:border-primary/50 hover:text-primary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
