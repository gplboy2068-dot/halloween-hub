import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminGetLegalPage,
  adminSaveLegalPage,
  adminListLegalVersions,
  adminRevertLegalVersion,
  type LegalPage,
} from "@/lib/legal.functions";
import { Save, ArrowLeft, ExternalLink, History, RotateCcw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/legal/$slug")({
  component: LegalEditor,
});

function LegalEditor() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();
  const fetchPage = useServerFn(adminGetLegalPage);
  const fetchVersions = useServerFn(adminListLegalVersions);
  const save = useServerFn(adminSaveLegalPage);
  const revert = useServerFn(adminRevertLegalVersion);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "legal-page", slug],
    queryFn: () => fetchPage({ data: { slug } }),
  });

  const versionsQ = useQuery({
    queryKey: ["admin", "legal-versions", slug],
    queryFn: () => fetchVersions({ data: { slug } }),
  });

  const [form, setForm] = useState<LegalPage | null>(null);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form) return;
      await save({
        data: {
          slug: form.slug,
          title: form.title,
          lead: form.lead,
          meta_title: form.meta_title,
          meta_description: form.meta_description,
          content: form.content,
          published: form.published,
        },
      });
    },
    onSuccess: () => {
      toast.success("Saved. Previous version archived.");
      qc.invalidateQueries({ queryKey: ["admin", "legal-page", slug] });
      qc.invalidateQueries({ queryKey: ["admin", "legal-versions", slug] });
      qc.invalidateQueries({ queryKey: ["admin", "legal-pages"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const revertMutation = useMutation({
    mutationFn: async (versionId: string) => revert({ data: { versionId } }),
    onSuccess: () => {
      toast.success("Reverted to previous version");
      qc.invalidateQueries({ queryKey: ["admin", "legal-page", slug] });
      qc.invalidateQueries({ queryKey: ["admin", "legal-versions", slug] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Revert failed"),
  });

  if (isLoading) {
    return (
      <AdminShell title="Legal — loading">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </AdminShell>
    );
  }
  if (error) {
    return (
      <AdminShell title="Legal — error">
        <p className="text-destructive text-sm">{(error as Error).message}</p>
      </AdminShell>
    );
  }
  if (!form) {
    return (
      <AdminShell title="Not found">
        <p className="text-muted-foreground text-sm">No page found for slug "{slug}".</p>
      </AdminShell>
    );
  }

  const update = <K extends keyof LegalPage>(k: K, v: LegalPage[K]) => setForm({ ...form, [k]: v });

  return (
    <AdminShell
      title={`Legal · ${form.title}`}
      actions={
        <>
          <Link
            to="/admin/legal"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <a
            href={`/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View
          </a>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow disabled:opacity-50 glow-primary"
          >
            {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Section title="Page">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug (read-only)">
                <input value={form.slug} disabled className="input" />
              </Field>
              <Field label="Status">
                <label className="inline-flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => update("published", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{form.published ? "Published" : "Draft"}</span>
                  <span className="text-xs text-muted-foreground">· v{form.version}</span>
                </label>
              </Field>
            </div>
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="input"
                maxLength={200}
              />
            </Field>
            <Field label="Lead (optional)">
              <textarea
                value={form.lead ?? ""}
                onChange={(e) => update("lead", e.target.value || null)}
                rows={2}
                maxLength={500}
                className="input"
              />
            </Field>
          </Section>

          <Section title="SEO">
            <Field label="Meta title (≤ 60 chars recommended)">
              <input
                value={form.meta_title}
                onChange={(e) => update("meta_title", e.target.value)}
                maxLength={200}
                className="input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{form.meta_title.length} characters</p>
            </Field>
            <Field label="Meta description (≤ 160 chars recommended)">
              <textarea
                value={form.meta_description}
                onChange={(e) => update("meta_description", e.target.value)}
                rows={3}
                maxLength={400}
                className="input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{form.meta_description.length} characters</p>
            </Field>
          </Section>

          <Section title="Content (HTML)">
            <p className="text-xs text-muted-foreground mb-2">
              Use <code className="text-primary">&lt;h2&gt;</code> for main sections (auto Table of Contents),
              <code className="text-primary"> &lt;h3&gt;</code> for subsections, plus <code className="text-primary">&lt;p&gt;</code>,
              <code className="text-primary"> &lt;ul&gt;</code>, <code className="text-primary">&lt;a&gt;</code>, <code className="text-primary">&lt;strong&gt;</code>.
            </p>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              rows={28}
              className="input font-mono text-xs leading-relaxed"
            />
          </Section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display font-bold text-sm">Version history</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Every save creates a snapshot. Revert restores the content and archives the current
              version.
            </p>
            <ul className="space-y-2 max-h-[600px] overflow-y-auto">
              {(versionsQ.data ?? []).map((v) => (
                <li key={v.id} className="rounded-md border border-border p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">v{v.version}</span>
                    <button
                      onClick={() => revertMutation.mutate(v.id)}
                      disabled={revertMutation.isPending}
                      className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
                    >
                      <RotateCcw className="h-3 w-3" /> Revert
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground mt-1 line-clamp-1">{v.title}</p>
                </li>
              ))}
              {versionsQ.data && versionsQ.data.length === 0 && (
                <li className="text-muted-foreground text-xs">No prior versions yet.</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
      <style>{`.input{width:100%;min-height:40px;padding:8px 12px;border-radius:8px;background:var(--color-input);border:1px solid var(--color-border);font-size:14px;color:var(--color-foreground)}textarea.input{resize:vertical}.input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-primary) 30%,transparent)}`}</style>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
