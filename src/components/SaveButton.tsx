import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { isSaved, toggleSaved, onSavedChange, type SavedItem } from "@/lib/saved";
import { track } from "@/lib/analytics";

/**
 * Bookmark toggle. Client-only render (returns null pre-hydration
 * to avoid mismatch).
 */
export function SaveButton({
  item,
  variant = "icon",
  className = "",
}: {
  item: Omit<SavedItem, "addedAt">;
  variant?: "icon" | "pill";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isSaved(item.kind, item.slug));
    return onSavedChange(() => setSaved(isSaved(item.kind, item.slug)));
  }, [item.kind, item.slug]);

  if (!mounted) return null;

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleSaved(item);
    setSaved(now);
    track("save_toggle", { kind: item.kind, slug: item.slug, saved: now });
  };

  if (variant === "pill") {
    return (
      <button
        onClick={handle}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-semibold transition-colors ${
          saved
            ? "bg-primary/15 border-primary/40 text-primary"
            : "border-border hover:border-primary/50 hover:text-primary"
        } ${className}`}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
        saved
          ? "bg-primary/15 border-primary/40 text-primary"
          : "border-border/60 bg-background/60 text-muted-foreground hover:text-primary hover:border-primary/40"
      } ${className}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
