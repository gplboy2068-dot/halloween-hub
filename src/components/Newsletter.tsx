import { useState } from "react";

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
          {ok ? (
            <p className="mt-6 text-primary font-medium">🎃 You're in! Check your inbox.</p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setOk(true); }}
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
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
