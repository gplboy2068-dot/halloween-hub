import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — HalloweenTools" },
      { name: "description", content: "Get in touch with the HalloweenTools team. Feedback, tool requests, partnerships and more." },
      { property: "og:title", content: "Contact HalloweenTools" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Contact</h1>
        <p className="mt-3 text-muted-foreground">Feedback, tool requests, partnerships — we read everything.</p>

        {sent ? (
          <div className="mt-10 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-center">
            <div className="text-4xl">🎃</div>
            <p className="mt-2 font-medium">Thanks — we'll be in touch.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="mt-10 space-y-4"
          >
            <Field label="Name">
              <input required maxLength={100} className="input" />
            </Field>
            <Field label="Email">
              <input type="email" required maxLength={255} className="input" />
            </Field>
            <Field label="Message">
              <textarea required maxLength={2000} rows={6} className="input resize-none" />
            </Field>
            <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary-glow glow-primary">
              Send message
            </button>
          </form>
        )}
      </div>
      <style>{`.input{width:100%;height:44px;padding:0 14px;border-radius:8px;background:var(--color-input);border:1px solid var(--color-border);font-size:14px;color:var(--color-foreground)}textarea.input{height:auto;padding:12px 14px}.input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-primary) 30%,transparent)}`}</style>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
