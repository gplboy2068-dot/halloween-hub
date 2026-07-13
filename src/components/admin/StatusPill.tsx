import type { Status } from "@/lib/admin-store";

export function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    archived: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${map[status]}`}>
      {status}
    </span>
  );
}
