import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { createGeneration, shareGenerationImage } from "@/lib/generations.functions";
import { submitToCommunity } from "@/lib/community.functions";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORIES } from "@/lib/site";

type BaseProps = {
  toolSlug: string;
  toolTitle: string;
  prompt?: string;
  className?: string;
};

function ShareDialog({
  open,
  onClose,
  onSubmit,
  defaultTitle,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: { title: string; description: string; category: string; tags: string[] }) => void;
  defaultTitle: string;
  loading: boolean;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]?.name ?? "");
  const [tagsRaw, setTagsRaw] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-2xl font-bold">Share to Community</h3>
        <p className="text-sm text-muted-foreground mt-1">Your creation will be publicly discoverable.</p>
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
              placeholder="A catchy title"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
              placeholder="What inspired this?"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.name}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tags (comma)</span>
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                placeholder="spooky, cute, kids"
              />
            </label>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={loading || title.trim().length < 3}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                description: description.trim(),
                category,
                tags: tagsRaw
                  .split(",")
                  .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  .filter(Boolean)
                  .slice(0, 8),
              })
            }
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Checking with AI…" : "Publish 🎃"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShareGenerationButton({
  toolSlug,
  toolTitle,
  output,
  prompt,
  kind = "text",
  className,
}: BaseProps & { output: string; kind?: "text" | "image" | "long" }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const submitFn = useServerFn(submitToCommunity);
  // legacy quick share (kept for backward-compat callers)
  const _legacy = useServerFn(createGeneration);
  void _legacy;

  const cls =
    className ??
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background/60 text-xs font-medium hover:bg-primary/10 hover:border-primary/40 transition disabled:opacity-60";

  if (!session) {
    return (
      <Link to="/auth" className={cls} title="Sign in to share to the community feed">
        🔒 Share
      </Link>
    );
  }

  const submit = async (v: { title: string; description: string; category: string; tags: string[] }) => {
    setLoading(true);
    try {
      const res = await submitFn({
        data: {
          toolSlug,
          toolTitle,
          output,
          prompt,
          kind,
          title: v.title,
          description: v.description || undefined,
          category: v.category,
          tags: v.tags,
        },
      });
      setDialog(false);
      if (!res.allowed) {
        toast.error(`Blocked by moderation: ${res.reason ?? "not allowed"}`);
        return;
      }
      setShared(true);
      toast.success("Published to Community!");
      navigate({ to: "/community/$slug", params: { slug: res.slug! } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDialog(true)}
        disabled={shared}
        className={cls}
      >
        {shared ? "✓ Shared" : "🌍 Share"}
      </button>
      <ShareDialog
        open={dialog}
        onClose={() => !loading && setDialog(false)}
        onSubmit={submit}
        defaultTitle={toolTitle}
        loading={loading}
      />
    </>
  );
}

export function ShareImageButton({
  toolSlug,
  toolTitle,
  dataUrl,
  prompt,
  className,
}: BaseProps & { dataUrl: string }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const uploadFn = useServerFn(shareGenerationImage);
  const submitMetaFn = useServerFn(submitToCommunity);

  const cls =
    className ??
    "px-6 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition disabled:opacity-60";

  if (!session) {
    return (
      <Link to="/auth" className={cls} title="Sign in to share to the community feed">
        🔒 Share to feed
      </Link>
    );
  }

  void submitMetaFn;
  const submit = async (v: { title: string; description: string; category: string; tags: string[] }) => {
    setLoading(true);
    try {
      const res = await uploadFn({
        data: {
          toolSlug,
          toolTitle,
          dataUrl,
          prompt,
          title: v.title,
          description: v.description || undefined,
          category: v.category,
          tags: v.tags,
        },
      });
      setDialog(false);
      setShared(true);
      toast.success("Published to Community!");
      if (res.slug) navigate({ to: "/community/$slug", params: { slug: res.slug } });
      else navigate({ to: "/community" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setDialog(true)} disabled={shared} className={cls}>
        {shared ? "✓ Shared" : "🌍 Share to feed"}
      </button>
      <ShareDialog
        open={dialog}
        onClose={() => !loading && setDialog(false)}
        onSubmit={submit}
        defaultTitle={toolTitle}
        loading={loading}
      />
    </>
  );
}
