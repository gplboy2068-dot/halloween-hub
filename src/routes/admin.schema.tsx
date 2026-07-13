import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useState } from "react";

const TYPES = [
  "Organization", "WebSite", "WebPage", "Article", "SoftwareApplication",
  "FAQPage", "BreadcrumbList", "Product", "HowTo",
];

export const Route = createFileRoute("/admin/schema")({
  component: Schema,
});

function Schema() {
  const [type, setType] = useState("Article");
  const [name, setName] = useState("Halloween Card Maker");
  const [desc, setDesc] = useState("Free tool to design Halloween cards.");
  const [url, setUrl] = useState("https://halloweentools.com/tools/halloween-card-maker");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description: desc,
    url,
    ...(type === "SoftwareApplication" ? { applicationCategory: "DesignApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } } : {}),
  };
  const text = JSON.stringify(jsonLd, null, 2);

  return (
    <AdminShell title="Schema Builder">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Schema type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm resize-y" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Generated JSON-LD</h3>
            <button
              onClick={() => navigator.clipboard?.writeText(text)}
              className="h-8 px-3 rounded-md text-xs font-medium border border-border hover:bg-muted"
            >Copy</button>
          </div>
          <pre className="text-xs bg-background/60 rounded-lg p-4 overflow-x-auto border border-border">{text}</pre>
        </div>
      </div>
    </AdminShell>
  );
}
