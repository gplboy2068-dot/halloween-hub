import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useRecentActivity } from "@/lib/admin-store";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export const Route = createFileRoute("/admin/logs")({
  component: Logs,
});

function Logs() {
  const logs = useRecentActivity();
  const icon = (l: string) =>
    l === "error" ? <AlertCircle className="h-4 w-4 text-destructive" />
    : l === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-400" />
    : <Info className="h-4 w-4 text-muted-foreground" />;
  return (
    <AdminShell title="Audit Logs">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-sm text-muted-foreground">No activity yet.</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5">{icon(l.level)} {l.level}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                <td className="px-4 py-3">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
