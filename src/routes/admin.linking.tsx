import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useEntityList, type ToolEntity, type ArticleEntity } from "@/lib/admin-store";
import { Link2 } from "lucide-react";

export const Route = createFileRoute("/admin/linking")({
  component: InternalLinking,
});

function InternalLinking() {
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");

  // Build category clusters
  const clusters = Array.from(
    tools.reduce<Map<string, ToolEntity[]>>((m, t) => {
      const arr = m.get(t.category) ?? [];
      arr.push(t);
      m.set(t.category, arr);
      return m;
    }, new Map()).entries(),
  );

  return (
    <AdminShell title="Internal Linking">
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> Topic clusters</h2>
        <p className="mt-1 text-sm text-muted-foreground">Every tool automatically links to 8–12 related tools within its category. Coverage below.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {clusters.map(([category, list]) => (
          <div key={category} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">{category}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${list.length >= 8 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {list.length} tools
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {list.slice(0, 6).map((t) => <li key={t.id} className="truncate">• {t.title}</li>)}
              {list.length > 6 && <li className="text-xs">+ {list.length - 6} more</li>}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold mb-3">Orphan check</h2>
        <p className="text-sm text-muted-foreground">
          {articles.filter((a) => !a.tags || a.tags.length === 0).length} article(s) have no tags — consider adding tags to improve internal linking.
        </p>
      </div>
    </AdminShell>
  );
}
