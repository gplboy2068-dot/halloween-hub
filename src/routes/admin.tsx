import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminGate,
  head: () => ({
    meta: [
      { title: "Admin — HalloweenTools" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminGate() {
  const { session, loading, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const claim = useServerFn(claimFirstAdmin);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: "/admin" }, replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    async function handleClaim() {
      setClaiming(true);
      try {
        const result = await claim();
        if (result.ok) {
          toast.success("You are now the site admin. Refreshing…");
          setTimeout(() => window.location.reload(), 400);
        } else {
          toast.error(result.reason ?? "Unable to claim admin.");
        }
      } catch (e: any) {
        toast.error(e.message ?? "Something went wrong");
      } finally {
        setClaiming(false);
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center border border-border rounded-xl bg-card p-8">
          <div className="text-5xl mb-4 animate-flicker">🕯️</div>
          <ShieldAlert className="h-10 w-10 mx-auto text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-mono text-foreground">{user?.email}</span>, but this account has no admin role.
          </p>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="mt-6 w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-glow disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
          >
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
            Claim admin (first user only)
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            This button only works if no admin exists yet.
          </p>

          <Link
            to="/"
            className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
