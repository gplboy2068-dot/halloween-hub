import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/analytics.functions";
import { TrendingUp, Users, Eye, MousePointerClick } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

function Analytics() {
  const [days, setDays] = useState(7);
  const { data, isLoading, error, refetch, isFetching } = useQuery<AnalyticsSummary>({
    queryKey: ["admin", "analytics", days],
    queryFn: () => getAnalyticsSummary({ data: { days } }),
    staleTime: 60_000,
  });

  return (
    <AdminShell title="Analytics">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          {[1, 7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 h-9 rounded-lg text-xs font-semibold border ${
                days === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {d === 1 ? "Today" : `Last ${d}d`}
            </button>
          ))}
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 h-9 rounded-lg text-xs font-semibold border border-border hover:border-primary/50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Eye />} label="Pageviews" value={fmt(data?.totals.pageviews)} hint={`${days}d`} />
        <Stat icon={<Users />} label="Sessions" value={fmt(data?.totals.sessions)} hint={`${days}d`} />
        <Stat icon={<MousePointerClick />} label="Events" value={fmt(data?.totals.events)} hint={`${days}d`} />
        <Stat icon={<TrendingUp />} label="Top searches" value={fmt(data?.topSearches.length)} hint="unique queries" />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load analytics: {String((error as Error).message)}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TopList title="Top pages" rows={data?.topPaths.map((r) => ({ label: r.path, count: r.count })) ?? []} loading={isLoading} />
        <TopList title="Top events" rows={data?.topEvents.map((r) => ({ label: r.event, count: r.count })) ?? []} loading={isLoading} />
        <TopList title="Top search queries" rows={data?.topSearches.map((r) => ({ label: r.q, count: r.count })) ?? []} loading={isLoading} />
        <TopList title="Top tool usage" rows={data?.topToolUses.map((r) => ({ label: r.slug, count: r.count })) ?? []} loading={isLoading} />
      </div>

      {data && data.daily.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-4">Daily activity</h2>
          <div className="flex items-end gap-1 h-32">
            {data.daily.map((d) => {
              const max = Math.max(...data.daily.map((x) => x.pageviews), 1);
              const h = Math.max(2, (d.pageviews / max) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.pageviews} pv`}>
                  <div className="w-full bg-primary/70 rounded-t" style={{ height: `${h}%` }} />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{data.daily[0]?.day}</span>
            <span>{data.daily[data.daily.length - 1]?.day}</span>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function fmt(n: number | undefined) {
  if (n == null) return "—";
  return n.toLocaleString();
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

function TopList({ title, rows, loading }: { title: string; rows: { label: string; count: number }[]; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display font-semibold mb-3">{title}</h3>
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between text-sm gap-3">
              <span className="truncate text-muted-foreground">{r.label}</span>
              <span className="font-mono text-xs text-foreground/80">{r.count.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
