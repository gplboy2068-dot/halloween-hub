import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminListGenerations,
  adminSetHidden,
  adminDeleteGeneration,
} from "@/lib/community-admin.functions";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Trash2, Flag } from "lucide-react";

export const Route = createFileRoute("/admin/community")({
  ssr: false,
  component: CommunityAdmin,
});

function CommunityAdmin() {
  const listFn = useServerFn(adminListGenerations);
  const hideFn = useServerFn(adminSetHidden);
  const delFn = useServerFn(adminDeleteGeneration);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "community"],
    queryFn: () => listFn({ data: { showHidden: true, limit: 100 } }),
  });

  const hideMut = useMutation({
    mutationFn: (v: { id: string; hidden: boolean }) => hideFn({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "community"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "community"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <AdminShell title="Community Feed">
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {error && (
        <p className="text-destructive text-sm">{(error as Error).message}</p>
      )}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.length === 0 && (
            <p className="text-muted-foreground col-span-full text-sm">
              No community generations yet.
            </p>
          )}
          {data.items.map((it) => (
            <div
              key={it.id}
              className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ${
                it.hidden ? "border-destructive/40 opacity-70" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">
                    {it.tool_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {it.author} · {new Date(it.created_at).toLocaleString()}
                  </p>
                </div>
                {it.report_count > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-destructive/15 text-destructive">
                    <Flag className="h-3 w-3" /> {it.report_count}
                  </span>
                )}
              </div>

              {it.kind === "image" && it.image_url ? (
                <img
                  src={it.image_url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-md bg-muted"
                  loading="lazy"
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap line-clamp-6">{it.output}</p>
              )}

              {it.prompt && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  <span className="font-medium">Prompt:</span> {it.prompt}
                </p>
              )}

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
                <button
                  onClick={() => hideMut.mutate({ id: it.id, hidden: !it.hidden })}
                  disabled={hideMut.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
                >
                  {it.hidden ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Unhide
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this generation permanently?")) delMut.mutate(it.id);
                  }}
                  disabled={delMut.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 disabled:opacity-50 ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
