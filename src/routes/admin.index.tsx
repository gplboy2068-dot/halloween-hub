import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminStats, useEntityList, type ArticleEntity, type ToolEntity } from "@/lib/admin-store";
import { Wrench, FileText, FolderTree, HelpCircle, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const s = useAdminStats();
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");
  const recent = [...tools, ...articles]
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
    .slice(0, 8);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Wrench className="h-5 w-5" />} label="Tools" value={s.toolsCount} sub={`${s.toolsPublished} published · ${s.toolsDrafts} drafts`} tone="primary" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Articles" value={s.articlesCount} sub={`${s.articlesPublished} published · ${s.articlesDrafts} drafts`} tone="accent" />
        <StatCard icon={<FolderTree className="h-5 w-5" />} label="Categories" value={s.categoriesCount} sub="Organizing content" />
        <StatCard icon={<HelpCircle className="h-5 w-5" />} label="FAQs" value={s.faqsCount} sub="Answered questions" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Recent Activity</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="divide-y divide-border">
            {recent.map((r) => {
              const isTool = "emoji" in r;
              const label = (r as ToolEntity).title;
              return (
                <li key={r.id} className="py-3 flex items-center gap-3">
                  <span className="text-xl">{isTool ? (r as ToolEntity).emoji : "📝"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {isTool ? "Tool" : "Article"} · updated {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.status}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">Quick actions</h2>
          <div className="space-y-2">
            <QuickAction to="/admin/tools" label="Manage tools" />
            <QuickAction to="/admin/articles" label="Manage articles" />
            <QuickAction to="/admin/categories" label="Manage categories" />
            <QuickAction to="/admin/faqs" label="Manage FAQs" />
            <QuickAction to="/admin/redirects" label="Manage redirects" />
            <QuickAction to="/admin/settings" label="Site settings" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: number; sub: string; tone?: "primary" | "accent" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone === "primary" ? "bg-primary/15 text-primary" : tone === "accent" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-display font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm">
      <span>{label}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
