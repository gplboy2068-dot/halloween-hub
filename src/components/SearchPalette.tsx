import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, Clock, TrendingUp, Flame, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import {
  buildFullIndex,
  searchItems,
  groupByKind,
  KIND_LABELS,
  POPULAR_SEARCHES,
  TRENDING_SEARCHES,
  getRecentSearches,
  pushRecentSearch,
  clearRecentSearches,
  type SearchItem,
  type SearchKind,
} from "@/lib/search";
import type { SearchArticle } from "@/lib/search.functions";

type Props = {
  open: boolean;
  onClose: () => void;
  articles: SearchArticle[];
};

const KIND_ORDER: SearchKind[] = ["tool", "article", "idea", "audience", "category", "tag", "page"];

export function SearchPalette({ open, onClose, articles }: Props) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const index = useMemo(() => buildFullIndex(articles), [articles]);
  const results = useMemo(() => searchItems(index, q, 40), [index, q]);
  const grouped = useMemo(() => groupByKind(results), [results]);
  const flat = useMemo(() => {
    const arr: SearchItem[] = [];
    for (const k of KIND_ORDER) for (const it of grouped[k]) arr.push(it);
    return arr;
  }, [grouped]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQ("");
      setCursor(0);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flat[cursor];
        if (item) {
          handleSelect(item);
        } else if (q.trim()) {
          handleSearchAll();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, cursor, q]);

  function handleSelect(item: SearchItem) {
    if (q.trim()) pushRecentSearch(q);
    onClose();
    navigate({ to: item.href });
  }

  function handleSearchAll() {
    const query = q.trim();
    if (!query) return;
    pushRecentSearch(query);
    onClose();
    navigate({ to: "/search", search: { q: query } });
  }

  function runQuery(query: string) {
    setQ(query);
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  if (!open) return null;

  const showEmpty = q.trim().length === 0;
  const showNoResults = !showEmpty && results.length === 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools, articles, ideas, categories…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="p-1 rounded hover:bg-muted"
              aria-label="Clear"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded border border-border bg-background text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {showEmpty && (
            <div className="p-4 space-y-6">
              {recent.length > 0 && (
                <Section
                  icon={<Clock className="h-3.5 w-3.5" />}
                  title="Recent"
                  action={
                    <button
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  }
                >
                  <ChipRow items={recent} onPick={runQuery} />
                </Section>
              )}
              <Section icon={<Flame className="h-3.5 w-3.5" />} title="Popular searches">
                <ChipRow items={POPULAR_SEARCHES} onPick={runQuery} />
              </Section>
              <Section icon={<TrendingUp className="h-3.5 w-3.5" />} title="Trending now">
                <ChipRow items={TRENDING_SEARCHES} onPick={runQuery} />
              </Section>
            </div>
          )}

          {showNoResults && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🕸️</div>
              <p className="text-sm text-muted-foreground">
                Nothing found for <span className="text-foreground font-medium">"{q}"</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Try one of these instead:</p>
              <div className="mt-3">
                <ChipRow items={POPULAR_SEARCHES.slice(0, 6)} onPick={runQuery} />
              </div>
            </div>
          )}

          {!showEmpty && results.length > 0 && (
            <div className="p-2">
              {KIND_ORDER.map((k) => {
                const list = grouped[k];
                if (list.length === 0) return null;
                return (
                  <div key={k} className="py-1">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                      {KIND_LABELS[k]}
                    </div>
                    {list.map((item) => {
                      const idx = flat.indexOf(item);
                      const active = idx === cursor;
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => handleSelect(item)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            active ? "bg-primary/15" : "hover:bg-muted"
                          }`}
                        >
                          <span className="text-lg shrink-0">{item.emoji ?? "•"}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                            )}
                          </div>
                          {active && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <button
                onClick={handleSearchAll}
                className="w-full mt-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg text-left"
              >
                See all results for "{q}" →
              </button>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-border bg-background/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              Open
            </span>
          </div>
          <div className="hidden sm:block">
            <kbd className="px-1.5 py-0.5 font-mono rounded border border-border bg-background">⌘</kbd>{" "}
            <kbd className="px-1.5 py-0.5 font-mono rounded border border-border bg-background">K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
          {icon} {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ChipRow({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          className="px-3 py-1.5 text-xs rounded-full border border-border bg-background/60 hover:border-primary/50 hover:text-primary transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
