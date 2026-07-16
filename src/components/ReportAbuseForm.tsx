import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitAbuseReport } from "@/lib/abuse.functions";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "offensive", label: "Offensive content" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "trademark", label: "Trademark violation" },
  { value: "fake-account", label: "Fake account" },
  { value: "illegal", label: "Illegal content" },
  { value: "impersonation", label: "Impersonation" },
  { value: "malware", label: "Malware or phishing" },
  { value: "guidelines", label: "Community guideline violation" },
  { value: "other", label: "Something else" },
] as const;

export function ReportAbuseForm() {
  const submit = useServerFn(submitAbuseReport);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    url: "",
    reason: "spam" as (typeof REASONS)[number]["value"],
    description: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrMsg(null);
    try {
      const res = await submit({
        data: {
          ...form,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      });
      if (res.ok) {
        setState("sent");
        setForm({ name: "", email: "", url: "", reason: "spam", description: "" });
      } else {
        setState("error");
        setErrMsg(res.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      setState("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 p-6 text-sm text-foreground"
      >
        <p className="font-display font-semibold text-base mb-1">Report received.</p>
        <p className="text-muted-foreground">
          Thanks for helping keep HalloweenTools.com safe. A moderator will review your report and take
          action if it violates our policies. You will not always receive a reply, but every submission is
          reviewed.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-semibold hover:border-primary/50"
        >
          Submit another report
        </button>
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 h-10 text-sm outline-none focus:border-primary";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Your name</span>
          <input
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputCls}
            placeholder="Jane Doe"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input
            required
            type="email"
            maxLength={200}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputCls}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">URL of the content</span>
        <input
          required
          type="url"
          maxLength={500}
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          className={inputCls}
          placeholder="https://halloweentools.com/community/..."
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Reason</span>
        <select
          value={form.reason}
          onChange={(e) =>
            setForm((f) => ({ ...f, reason: e.target.value as typeof form.reason }))
          }
          className={inputCls}
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium">Description</span>
        <textarea
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Explain what is wrong with this content, when you noticed it, and any relevant context. If you are reporting a copyright issue, include proof of ownership."
        />
        <span className="mt-1 block text-xs text-muted-foreground">
          {form.description.length}/4000
        </span>
      </label>

      <p className="text-xs text-muted-foreground">
        Evidence uploads (screenshots, files) are coming soon. For now, please paste links to any
        supporting material in the description.
      </p>

      {errMsg && (
        <p role="alert" className="text-sm text-destructive">
          {errMsg}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
