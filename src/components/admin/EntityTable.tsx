import { useMemo, useState, type ReactNode } from "react";
import { Search, Trash2, Eye, EyeOff, Archive, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { bulkDelete, bulkUpdate, type BaseEntity, type Status } from "@/lib/admin-store";
import { StatusPill } from "./StatusPill";

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function EntityTable<T extends BaseEntity>({
  entity,
  rows,
  columns,
  filterKey,
  editHref,
  primaryLabel = "Name",
}: {
  entity: string;
  rows: T[];
  columns: Column<T>[];
  filterKey?: keyof T;
  editHref: (row: T) => string;
  primaryLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const hay = JSON.stringify(r).toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [rows, q, statusFilter]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const doBulk = (action: "publish" | "draft" | "archive" | "delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${ids.length} item(s)?`)) return;
      bulkDelete(entity, ids);
    } else {
      const status: Status = action === "publish" ? "published" : action === "draft" ? "draft" : "archived";
      bulkUpdate(entity, ids, { status, ...(status === "published" ? { publishedAt: new Date().toISOString() } : {}) });
    }
    setSelected(new Set());
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${entity}…`}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="h-10 px-3 rounded-lg bg-input border border-border text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="px-4 py-2.5 border-b border-border bg-primary/5 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <BulkBtn onClick={() => doBulk("publish")} icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Publish</BulkBtn>
          <BulkBtn onClick={() => doBulk("draft")} icon={<EyeOff className="h-3.5 w-3.5" />}>Unpublish</BulkBtn>
          <BulkBtn onClick={() => doBulk("archive")} icon={<Archive className="h-3.5 w-3.5" />}>Archive</BulkBtn>
          <BulkBtn onClick={() => doBulk("delete")} icon={<Trash2 className="h-3.5 w-3.5" />} destructive>Delete</BulkBtn>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-primary" />
              </th>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-left font-semibold ${c.className ?? ""}`}>{c.label}</th>
              ))}
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No {entity} yet.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)} className="accent-primary" />
                </td>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>{c.render(row)}</td>
                ))}
                <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Link to={editHref(row)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Edit <MoreHorizontal className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>{filtered.length} of {rows.length}</span>
        <span>{primaryLabel}</span>
      </div>
    </div>
  );
}

function BulkBtn({ onClick, icon, children, destructive }: { onClick: () => void; icon: ReactNode; children: ReactNode; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium border ${
        destructive
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-border hover:bg-muted"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
