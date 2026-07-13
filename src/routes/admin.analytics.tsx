import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminStats } from "@/lib/admin-store";
import { TrendingUp, Users, Eye, MousePointerClick } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

function Analytics() {
  const s = useAdminStats();
  return (
    <AdminShell title="Analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Eye />} label="Pageviews (7d)" value="—" hint="Connect analytics in Phase 3" />
        <Stat icon={<Users />} label="Unique visitors" value="—" hint="Connect analytics in Phase 3" />
        <Stat icon={<MousePointerClick />} label="Tool uses" value="—" hint="Connect analytics in Phase 3" />
        <Stat icon={<TrendingUp />} label="Published content" value={String(s.toolsPublished + s.articlesPublished)} hint={`${s.toolsCount + s.articlesCount} total`} />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="mt-3 font-medium">Live analytics activate in Phase 3</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          Once the database is wired, this dashboard streams real traffic, top pages, referrers, and tool usage from Lovable Cloud.
        </p>
      </div>
    </AdminShell>
  );
}

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <p className="mt-4 text-2xl font-display font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}
