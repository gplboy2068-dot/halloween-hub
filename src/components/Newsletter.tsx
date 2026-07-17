import { useState } from "react";
import { track } from "@/lib/analytics";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-hero p-8 sm:p-12 text-center">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-spooky)" }} />
        <div className="relative">
          <span className="text-4xl animate-float inline-block">👻</span>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold">
            Join the <span className="text-gradient-primary">Coven</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Weekly Halloween tools, printables & AI drops. No spam, unsubscribe anytime.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/80">
            <span className="inline-flex items-center gap-1">🕯️ 4,200+ readers</span>
            <span>·</span>
            <span>1-click unsubscribe</span>
            <span>·</span>
            <span>No spam, ever</span>
          </div>
          {ok ? (
            <p className="mt-6 text-primary font-medium">🎃 You're in! Check your inbox.</p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (email.includes("@")) {
                  track("newsletter_submit", { source: "inline", email_domain: email.split("@")[1] ?? "" });
                  try {
                    const { supabase } = await import("@/integrations/supabase/client");
                    await supabase.from("newsletter_subscribers").insert({
                      email: email.trim(),
                      source: "inline",
                      confirmed: true,
                    });
                  } catch (err) {
                    console.error("Failed to save newsletter subscriber:", err);
                  }
                  setOk(true);
                }
              }}
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="flex-1 h-11 px-4 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary-glow transition-colors glow-primary"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

