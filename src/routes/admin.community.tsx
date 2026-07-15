import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminListGenerations,
  adminSetHidden,
  adminSetEditorPick,
  adminDeleteGeneration,
  type AdminFilter,
} from "@/lib/community-admin.functions";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Trash2, Flag, Star, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/community")({
  ssr: false,
  component: CommunityAdmin,
});

const FILTERS: { key: AdminFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reported", label: "Reported" },
  { key: "hidden", label: "Hidden" },
  { key: "editor_picks", label: "Editor's Picks" },
];

function CommunityAdmin() {
  const [filter, setFilter] = useState<AdminFilter>("all");
  const listFn = useServerFn(adminListGenerations);
  const hideFn = useServerFn(adminSetHidden);
  const pickFn = useServerFn(adminSetEditorPick);
  const delFn = useServerFn(adminDeleteGeneration);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "community", filter],
    queryFn: () => listFn({ data: { filter, limit: 100 } }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "community"] });

  const hideMut = useMutation({
    mutationFn: (v: { id: string; hidden: boolean }) => hideFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const pickMut = useMutation({
    mutationFn: (v: { id: string; editor_pick: boolean }) => pickFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <AdminShell title="Community Moderation">
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm border transition ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-sm">No posts match this filter.</p>
          )}
          {data.items.map((it) => (
            <div
              key={it.id}
              className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ${
                it.hidden ? "border-destructive/40 opacity-70" : it.editor_pick ? "border-primary/60" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">{it.tool_title}</p>
                  <p className="text-xs text-muted-foreground">
                    by {it.author} · {new Date(it.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {it.editor_pick && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">
                      <Star className="h-3 w-3" />
                    </span>
                  )}
                  {it.report_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-destructive/15 text-destructive">
                      <Flag className="h-3 w-3" /> {it.report_count}
                    </span>
                  )}
                </div>
              </div>

              {it.title && <p className="text-sm font-semibold line-clamp-2">{it.title}</p>}

              {it.kind === "image" && it.image_url ? (
                <img src={it.image_url} alt="" className="w-full aspect-square object-cover rounded-md bg-muted" loading="lazy" />
              ) : (
                <p className="text-sm whitespace-pre-wrap line-clamp-6">{it.output}</p>
              )}

              {it.prompt && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  <span className="font-medium">Prompt:</span> {it.prompt}
                </p>
              )}

              {it.moderation_reason && (
                <p className="text-xs text-destructive line-clamp-2">
                  <span className="font-medium">Mod:</span> {it.moderation_reason}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border flex-wrap">
                <button
                  onClick={() => pickMut.mutate({ id: it.id, editor_pick: !it.editor_pick })}
                  disabled={pickMut.isPending}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs disabled:opacity-50 ${
                    it.editor_pick ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  }`}
                  title="Toggle Editor's Pick"
                >
                  <Star className="h-3.5 w-3.5" /> {it.editor_pick ? "Unpick" : "Pick"}
                </button>
                <button
                  onClick={() => hideMut.mutate({ id: it.id, hidden: !it.hidden })}
                  disabled={hideMut.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
                >
                  {it.hidden ? (<><Eye className="h-3.5 w-3.5" /> Unhide</>) : (<><EyeOff className="h-3.5 w-3.5" /> Hide</>)}
                </button>
                {it.slug && (
                  <Link
                    to="/community/$slug"
                    params={{ slug: it.slug }}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => { if (confirm("Delete permanently?")) delMut.mutate(it.id); }}
                  disabled={delMut.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
