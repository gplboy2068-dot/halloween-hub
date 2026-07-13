import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchPalette } from "./SearchPalette";
import { listSearchArticles, type SearchArticle } from "@/lib/search.functions";

type Ctx = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const SearchCtx = createContext<Ctx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: articles = [] } = useQuery<SearchArticle[]>({
    queryKey: ["search-articles"],
    queryFn: () => listSearchArticles(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
        return;
      }
      // "/" opens search when not typing in a field
      if (e.key === "/" && !isOpen) {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && !t?.isContentEditable) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <SearchCtx.Provider value={{ open, close, isOpen }}>
      {children}
      <SearchPalette open={isOpen} onClose={close} articles={articles} />
    </SearchCtx.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (!ctx) {
    // Fallback so components don't crash when provider is absent (SSR shell).
    return { open: () => {}, close: () => {}, isOpen: false } as Ctx;
  }
  return ctx;
}
