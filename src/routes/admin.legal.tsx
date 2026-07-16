import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListLegalPages } from "@/lib/legal.functions";
import { FileText, CheckCircle2, EyeOff, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/legal")({
  component: LegalListPage,
});

function LegalListPage() {
  const fetchPages = useServerFn(adminListLegalPages);
  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["admin", "legal-pages"],
    queryFn: () => fetchPages(),
  });

  return (
    <AdminShell title="Legal Pages">
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Edit any legal or policy page. Every save creates a version snapshot so you can revert at
        any time. Unpublished pages return a friendly not-available message on the public site.
      </p>

      {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {error && <p className="text-destructive text-sm">Failed to load: {(error as Error).message}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {(pages ?? []).map((p) => (
          <Link
            key={p.slug}
            to="/admin/legal/$slug"
            params={{ slug: p.slug }}
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-display font-bold truncate">{p.title}</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">/{p.slug}</p>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.meta_description}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {p.published ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-500">
                    <CheckCircle2 className="h-3 w-3" /> Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <EyeOff className="h-3 w-3" /> Draft
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">v{p.version}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Updated {new Date(p.updated_at).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1 text-primary font-semibold group-hover:underline">
                <Pencil className="h-3 w-3" /> Edit
              </span>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
