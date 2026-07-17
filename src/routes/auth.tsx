import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  mode: z.enum(["signin", "signup"]).optional().catch(undefined),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — HalloweenTools" },
      { name: "description", content: "Sign in or create your HalloweenTools account." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AuthPage() {
  const { redirect, mode: initialMode } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      const target = sanitizeRedirect(redirect) ?? "/";
      navigate({ to: target, replace: true });
    }
  }, [session, loading, redirect, navigate]);

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth",
        },
      });
      if (error) {
        toast.error("Google sign-in failed", { description: error.message });
        return;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left hero */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_50%)]" />
        <div className="relative max-w-md">
          <div className="text-6xl mb-6 animate-flicker">🎃</div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Welcome to the <span className="text-gradient-primary">coven</span>.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Save your favorite spellcraft tools, unlock premium Halloween AI, and manage your bewitching content.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["AI-powered costume & story generators", "Save & sync your creations", "Early access to seasonal drops"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <span>←</span> Back to site
          </Link>

          <h2 className="font-display text-3xl font-bold">
            {mode === "signup" ? "Join the haunt" : mode === "forgot" ? "Reset your password" : "Sign in"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Create your HalloweenTools account."
              : mode === "forgot"
              ? "We'll email you a reset link."
              : "Welcome back, mortal."}
          </p>

          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={busy}
                className="mt-6 w-full h-11 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <Input
                icon={<Sparkles className="h-4 w-4" />}
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            )}
            <Input
              icon={<Mail className="h-4 w-4" />}
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mode !== "forgot" && (
              <Input
                icon={<Lock className="h-4 w-4" />}
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-glow transition-colors disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground text-center space-y-2">
            {mode === "signin" && (
              <>
                <button onClick={() => setMode("forgot")} className="hover:text-foreground">Forgot password?</button>
                <div>
                  New here?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                    Create an account
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </div>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("signin")} className="hover:text-foreground">
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function sanitizeRedirect(input?: string): string | null {
  if (!input) return null;
  if (!input.startsWith("/") || input.startsWith("//")) return null;
  return input;
}

function Input({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
