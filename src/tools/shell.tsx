import { type ReactNode, useState } from "react";
import { toast } from "sonner";

export function ToolShell({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 rounded-3xl border border-border bg-card/60 backdrop-blur p-6 sm:p-10 shadow-elegant">
      {children}
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setOk(false), 1500);
        } catch {
          toast.error("Copy failed");
        }
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background/60 text-xs font-medium hover:bg-primary/10 hover:border-primary/40 transition"
    >
      {ok ? "✓ Copied" : label}
    </button>
  );
}

export function ResultList({
  items,
  onRegenerate,
  emptyLabel = "Click generate to conjure ideas",
}: {
  items: string[];
  onRegenerate?: () => void;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-10">{emptyLabel}</p>;
  }
  return (
    <div className="mt-6 space-y-2">
      {items.map((item, i) => (
        <div
          key={`${i}-${item}`}
          className="flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-border bg-background/40 hover:border-primary/40 transition group"
        >
          <span className="text-primary font-display text-sm mt-0.5 w-6">{i + 1}.</span>
          <p className="flex-1 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{item}</p>
          <CopyButton text={item} />
        </div>
      ))}
      {onRegenerate && (
        <div className="pt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            className="px-5 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition"
          >
            🎲 Regenerate
          </button>
          <CopyButton text={items.join("\n")} label="Copy all" />
        </div>
      )}
    </div>
  );
}

export function ToolControls({ children }: { children: ReactNode }) {
  return <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex-1 flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full px-4 py-2.5 rounded-lg bg-background/60 border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

export const selectCls = inputCls + " appearance-none cursor-pointer";

export const btnPrimary =
  "px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-glow whitespace-nowrap";

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickN<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}
