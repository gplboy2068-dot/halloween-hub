import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useEntityList, type ToolEntity, type ArticleEntity } from "@/lib/admin-store";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/seo")({
  component: SEO,
});

function SEO() {
  const tools = useEntityList<ToolEntity>("tools");
  const articles = useEntityList<ArticleEntity>("articles");

  const audit = [
    ...tools.map((t) => ({
      type: "Tool" as const,
      title: t.title,
      slug: `/tools/${t.slug}`,
      seoTitle: t.seoTitle ?? t.title,
      seoDescription: t.seoDescription ?? t.description,
      issues: [
        !t.seoTitle && "Missing custom SEO title",
        !t.seoDescription && "Missing custom SEO description",
        (t.description?.length ?? 0) < 50 && "Description too short",
      ].filter(Boolean) as string[],
    })),
    ...articles.map((a) => ({
      type: "Article" as const,
      title: a.title,
      slug: `/blog/${a.slug}`,
      seoTitle: a.title,
      seoDescription: a.excerpt,
      issues: [
        (a.excerpt?.length ?? 0) < 80 && "Excerpt too short for SERP",
      ].filter(Boolean) as string[],
    })),
  ];

  const ok = audit.filter((r) => r.issues.length === 0).length;
  const withIssues = audit.length - ok;

  return (
    <AdminShell title="SEO Audit">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <SEOStat label="Pages audited" value={audit.length} />
        <SEOStat label="Passing" value={ok} tone="ok" />
        <SEOStat label="Needs attention" value={withIssues} tone="warn" />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Page</th>
              <th className="px-4 py-3 text-left">Meta title</th>
              <th className="px-4 py-3 text-left">Meta description</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((row, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.title}</div>
                  <div className="text-xs text-muted-foreground">{row.type} · {row.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{row.seoTitle?.slice(0, 60)}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{row.seoDescription?.slice(0, 100)}</td>
                <td className="px-4 py-3">
                  {row.issues.length === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> OK</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="h-3.5 w-3.5" /> {row.issues[0]}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function SEOStat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  const cls = tone === "ok" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-display font-bold ${cls}`}>{value}</p>
    </div>
  );
}
