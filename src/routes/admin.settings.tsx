import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useSaveSettings, useSiteSettings } from "@/lib/admin-store";
import { Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Settings = {
  siteName: string;
  tagline: string;
  description: string;
  twitter: string;
  supportEmail: string;
  adsenseId: string;
  gaId: string;
  gemini_api_key: string;
  deepseek_api_key: string;
  runware_api_key: string;
};

const DEFAULTS: Settings = {
  siteName: "HalloweenTools",
  tagline: "The internet's biggest Halloween toolkit",
  description: "Free Halloween tools, AI generators, printables, wishes, quotes, pumpkin templates, and party ideas.",
  twitter: "@HalloweenTools",
  supportEmail: "hello@halloweentools.com",
  adsenseId: "",
  gaId: "",
  gemini_api_key: "",
  deepseek_api_key: "",
  runware_api_key: "",
};

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const saved = useSiteSettings<Settings>(DEFAULTS);
  const save = useSaveSettings();
  const [form, setForm] = useState<Settings>(saved);
  useEffect(() => setForm(saved), [saved]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save.mutateAsync(form);
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save");
    }
  }

  return (
    <AdminShell title="Settings">
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <Section title="Site identity">
          <Input label="Site name" value={form.siteName} onChange={(v) => setForm({ ...form, siteName: v })} />
          <Input label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <Input label="Meta description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
        </Section>
        <Section title="AI Configuration">
          <Input
            label="Runware API Key (FLUX.1 Schnell)"
            value={form.runware_api_key || ""}
            onChange={(v) => setForm({ ...form, runware_api_key: v })}
            placeholder="Runware Platform API Key"
            type="password"
          />
          <Input
            label="Gemini API Key"
            value={form.gemini_api_key || ""}
            onChange={(v) => setForm({ ...form, gemini_api_key: v })}
            placeholder="AI Studio API Key"
            type="password"
          />
          <Input
            label="DeepSeek API Key"
            value={form.deepseek_api_key || ""}
            onChange={(v) => setForm({ ...form, deepseek_api_key: v })}
            placeholder="DeepSeek Platform API Key"
            type="password"
          />
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
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-glow disabled:opacity-50 glow-primary"
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save settings
          </button>
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

function Input({ label, value, onChange, textarea, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg bg-input border border-border text-sm resize-y" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm" />
      )}
    </label>
  );
}
