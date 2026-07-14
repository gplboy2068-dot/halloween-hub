import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

type MediaItem = { id: string; name: string; url: string; size: string; type: string };

export const Route = createFileRoute("/admin/media")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);

  return (
    <AdminShell
      title="Media Library"
      actions={
        <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow cursor-pointer glow-primary">
          <Upload className="h-4 w-4" /> Upload
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              const next = files.map((f) => ({
                id: Math.random().toString(36).slice(2),
                name: f.name,
                url: URL.createObjectURL(f),
                size: `${(f.size / 1024).toFixed(1)} KB`,
                type: f.type,
              }));
              setItems((prev) => [...next, ...prev]);
            }}
          />
        </label>
      }
    >
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 font-medium">No media yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload images to use across tools, articles, and OG tags.</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((it) => (
            <div key={it.id} className="group rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-square bg-muted">
                <img src={it.url} alt={it.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{it.name}</p>
                <p className="text-[10px] text-muted-foreground">{it.size}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Local preview only. Persistent uploads land in Phase 3 with Lovable Cloud storage.
      </p>
    </AdminShell>
  );
}
