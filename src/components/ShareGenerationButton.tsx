import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { createGeneration } from "@/lib/generations.functions";
import { useAuth } from "@/hooks/use-auth";

export function ShareGenerationButton({
  toolSlug,
  toolTitle,
  output,
  prompt,
  kind = "text",
  className,
}: {
  toolSlug: string;
  toolTitle: string;
  output: string;
  prompt?: string;
  kind?: "text" | "image" | "long";
  className?: string;
}) {
  const { session } = useAuth();
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);
  const shareFn = useServerFn(createGeneration);

  if (!session) {
    return (
      <Link
        to="/auth"
        className={
          className ??
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background/60 text-xs font-medium hover:bg-primary/10 hover:border-primary/40 transition"
        }
        title="Sign in to share to the community feed"
      >
        🔒 Share
      </Link>
    );
  }

  const share = async () => {
    setLoading(true);
    try {
      await shareFn({ data: { toolSlug, toolTitle, output, prompt, kind } });
      setShared(true);
      toast.success("Shared to community feed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      disabled={loading || shared}
      className={
        className ??
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background/60 text-xs font-medium hover:bg-primary/10 hover:border-primary/40 transition disabled:opacity-60"
      }
    >
      {shared ? "✓ Shared" : loading ? "Sharing…" : "🌍 Share"}
    </button>
  );
}
