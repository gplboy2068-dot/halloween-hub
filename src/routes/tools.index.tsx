import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndex,
  head: () => ({
    meta: [
      { title: "All Halloween Tools — HalloweenTools" },
      { name: "description", content: "Browse every free Halloween tool: card makers, AI generators, pumpkin templates, party planners and more." },
      { property: "og:title", content: "All Halloween Tools — HalloweenTools" },
      { property: "og:description", content: "Every free Halloween tool in one place." },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
});

function ToolsIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      if (cat !== "all" && t.category.toLowerCase() !== cat) return false;
      if (q && !`${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">All <span className="text-gradient-primary">Tools</span></h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Every Halloween tool we've built. Free forever, no signup required.</p>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…"
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={cat === "all"} onClick={() => setCat("all")}>All</FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c.slug} active={cat === c.name.toLowerCase()} onClick={() => setCat(c.name.toLowerCase())}>
                {c.emoji} {c.name}
              </FilterChip>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{filtered.length} tool{filtered.length !== 1 && "s"}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </div>
    </PageShell>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 h-11 rounded-lg text-sm font-medium border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}
