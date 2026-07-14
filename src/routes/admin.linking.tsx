import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useEntityList, type ToolEntity, type ArticleEntity } from "@/lib/admin-store";
import { findOrphans, type NodeKind } from "@/lib/orphans";
import { Link2, AlertTriangle, Compass } from "lucide-react";

export const Route = createFileRoute("/admin/linking")({
  component: InternalLinking,
});

const KIND_LABEL: Record<NodeKind, string> = {
  tool: "Tool",
  idea: "Idea page",
  audience: "Audience hub",
  collection: "Collection",
  category: "Category",
};

function InternalLinking() {
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");
  const graph = useMemo(() => findOrphans(), []);

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
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Compass />} label="Nodes tracked" value={String(graph.total)} hint="static content graph" />
        <Stat icon={<AlertTriangle />} label="Orphans (0 inbound)" value={String(graph.orphans.length)} hint="need linking" tone={graph.orphans.length > 0 ? "warn" : "ok"} />
        <Stat icon={<Link2 />} label="Weak nodes (<3)" value={String(graph.weak.length)} hint="link at least 3 sources" />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" /> Orphaned pages
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pages with zero incoming links from other content. Add them to a collection, audience hub, or category cluster.
        </p>
        {graph.orphans.length === 0 ? (
          <p className="mt-4 text-sm text-emerald-400">🎉 No orphans — every page has at least one internal link.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60 text-sm">
            {graph.orphans.slice(0, 30).map((o) => (
              <li key={o.href} className="py-2 flex items-center justify-between gap-3">
                <a href={o.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {o.title}
                </a>
                <span className="text-xs text-muted-foreground shrink-0">{KIND_LABEL[o.kind]} · {o.href}</span>
              </li>
            ))}
            {graph.orphans.length > 30 && (
              <li className="py-2 text-xs text-muted-foreground">+ {graph.orphans.length - 30} more</li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" /> Topic clusters
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every tool automatically links to sibling tools in its category. Coverage below.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {clusters.map(([category, list]) => (
            <div key={category} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold">{category}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${list.length >= 8 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                  {list.length} tools
                </span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {list.slice(0, 6).map((t) => <li key={t.id} className="truncate">• {t.title}</li>)}
                {list.length > 6 && <li className="text-xs">+ {list.length - 6} more</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold mb-1">Untagged articles</h2>
        <p className="text-sm text-muted-foreground">
          {articles.filter((a) => !a.tags || a.tags.length === 0).length} article(s) have no tags — add tags to improve internal linking and topic clustering.
        </p>
      </div>
    </AdminShell>
  );
}

function Stat({ icon, label, value, hint, tone = "default" }: { icon: React.ReactNode; label: string; value: string; hint: string; tone?: "default" | "ok" | "warn" }) {
  const toneCls = tone === "warn" ? "text-amber-400" : tone === "ok" ? "text-emerald-400" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ${toneCls}`}>{icon}</div>
      <p className="mt-4 text-2xl font-display font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}
