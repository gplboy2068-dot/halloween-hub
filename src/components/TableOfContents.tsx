import type { TocEntry } from "@/lib/internal-linking";

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length < 3) return null; // don't clutter short posts
  return (
    <aside className="my-10 rounded-2xl border border-border bg-card/40 p-5">
      <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
        On this page
      </p>
      <ol className="space-y-1.5 text-sm">
        {toc.map((t) => (
          <li key={t.id} className={t.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${t.id}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
