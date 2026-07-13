import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useKV } from "@/lib/admin-store";
import { Save } from "lucide-react";
import { useState } from "react";

type Settings = {
  siteName: string;
  tagline: string;
  description: string;
  twitter: string;
  supportEmail: string;
  adsenseId: string;
  gaId: string;
};

const DEFAULTS: Settings = {
  siteName: "HalloweenTools",
  tagline: "The internet's biggest Halloween toolkit",
  description: "Free Halloween tools, AI generators, printables, wishes, quotes, pumpkin templates, and party ideas.",
  twitter: "@HalloweenTools",
  supportEmail: "hello@halloweentools.com",
  adsenseId: "",
  gaId: "",
};

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [saved, setSaved] = useKV<Settings>("site-settings", DEFAULTS);
  const [form, setForm] = useState<Settings>(saved);
  const [ok, setOk] = useState(false);

  return (
    <AdminShell title="Settings">
      <form
        onSubmit={(e) => { e.preventDefault(); setSaved(form); setOk(true); setTimeout(() => setOk(false), 2000); }}
        className="max-w-3xl space-y-6"
      >
        <Section title="Site identity">
          <Input label="Site name" value={form.siteName} onChange={(v) => setForm({ ...form, siteName: v })} />
          <Input label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <Input label="Meta description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        </Section>

        <Section title="Social">
          <Input label="Twitter handle" value={form.twitter} onChange={(v) => setForm({ ...form, twitter: v })} />
          <Input label="Support email" value={form.supportEmail} onChange={(v) => setForm({ ...form, supportEmail: v })} />
        </Section>

        <Section title="Monetization (optional)">
          <Input label="Google AdSense ID" value={form.adsenseId} onChange={(v) => setForm({ ...form, adsenseId: v })} placeholder="ca-pub-XXXXXXXXXX" />
          <Input label="Google Analytics ID" value={form.gaId} onChange={(v) => setForm({ ...form, gaId: v })} placeholder="G-XXXXXXXXXX" />
        </Section>

        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-glow glow-primary">
            <Save className="h-4 w-4" /> Save settings
          </button>
          {ok && <span className="text-sm text-emerald-400">Saved</span>}
        </div>
      </form>
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

function Input({ label, value, onChange, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm resize-y" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm" />
      )}
    </label>
  );
}
