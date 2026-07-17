import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { track } from "@/lib/analytics";

const KEY = "ht_exit_intent_dismissed_v1";

/**
 * Fires once per session on desktop mouseleave-to-top, or after 45s
 * on any device. Dismiss persists across sessions for 14 days.
 */
export function ExitIntent() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let armed = true;
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const ts = Number(raw);
      if (Number.isFinite(ts) && Date.now() - ts < 14 * 24 * 3600 * 1000) return;
    }

    const trigger = () => {
      if (!armed) return;
      armed = false;
      setOpen(true);
      track("exit_intent_shown", {});
    };

    const canHover = window.matchMedia("(hover: hover)").matches;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    if (canHover) document.addEventListener("mouseleave", onLeave);
    const timer = window.setTimeout(trigger, 45_000);

    return () => {
      document.removeEventListener("mouseleave", onLeave);
      window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl"
      >
        <button
          aria-label="Close"
          onClick={dismiss}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-5xl text-center">🎃</div>
        <h2 id="exit-intent-title" className="mt-3 text-center font-display text-2xl font-bold">
          Before you vanish…
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Get the weekly Halloween drop — new tools, printables & AI recipes. Free, no spam.
        </p>
        {done ? (
          <p className="mt-6 text-center text-primary font-medium">🕯️ You're in. Check your inbox.</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (email.includes("@")) {
                track("exit_intent_submit", { email_domain: email.split("@")[1] ?? "" });
                try {
                  const { supabase } = await import("@/integrations/supabase/client");
                  await supabase.from("newsletter_subscribers").insert({
                    email: email.trim(),
                    source: "exit_intent",
                    confirmed: true,
                  });
                } catch (err) {
                  console.error("Failed to save exit intent subscriber:", err);
                }
                setDone(true);
                window.localStorage.setItem(KEY, String(Date.now()));
              }
            }}
            className="mt-5 flex flex-col gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-11 px-4 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary-glow transition-colors glow-primary"
            >
              Join the coven
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="mt-1 text-xs text-muted-foreground hover:text-foreground"
            >
              No thanks
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
