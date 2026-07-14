import { useState, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Trash2, Upload, X, Loader2, ImagePlus } from "lucide-react";
import type { BaseEntity, Status, CategoryEntity } from "@/lib/admin-store";
import { useEntityList } from "@/lib/admin-store";
import { InternalLinkPicker } from "@/components/admin/InternalLinkPicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "datetime" | "slug" | "category" | "internal-links" | "image" | "image-insert";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  help?: string;
  targetKey?: string; // for internal-links / image-insert: which field to insert markdown into
};

export function EntityForm<T extends BaseEntity & Record<string, unknown>>({
  title,
  backHref,
  initial,
  fields,
  onSave,
  onDelete,
  extraSidebar,
}: {
  title: string;
  backHref: string;
  initial: Partial<T>;
  fields: Field[];
  onSave: (values: Partial<T>) => void;
  onDelete?: () => void;
  extraSidebar?: ReactNode;
}) {
  const [values, setValues] = useState<Partial<T>>(initial);

  const set = <K extends keyof T>(k: K, v: T[K]) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(values); }}
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="lg:col-span-2 space-y-6">
        <Link to={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h2 className="font-display text-2xl font-bold">{title}</h2>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          {fields.map((f) => {
            if (f.type === "internal-links") {
              const targetKey = (f.targetKey ?? "content") as keyof T;
              return (
                <InternalLinkPicker
                  key={f.key}
                  currentSlug={values.slug as string | undefined}
                  onInsert={(md) => {
                    const current = (values[targetKey] as string) ?? "";
                    const next = current ? `${current}\n\n${md}` : md;
                    set(targetKey, next as T[keyof T]);
                  }}
                />
              );
            }
            if (f.type === "image-insert") {
              const targetKey = (f.targetKey ?? "content") as keyof T;
              return (
                <ImageUploader
                  key={f.key}
                  label={f.label}
                  help={f.help}
                  mode="insert"
                  onInsert={(url) => {
                    const current = (values[targetKey] as string) ?? "";
                    const md = `![](${url})`;
                    const next = current ? `${current}\n\n${md}` : md;
                    set(targetKey, next as T[keyof T]);
                  }}
                />
              );
            }
            if (f.type === "image") {
              return (
                <ImageUploader
                  key={f.key}
                  label={f.label}
                  help={f.help}
                  mode="single"
                  value={(values[f.key] as string) ?? ""}
                  onChange={(url) => set(f.key as keyof T, url as T[keyof T])}
                />
              );
            }
            return (
              <FormField key={f.key} field={f} value={values[f.key] as never} onChange={(v) => set(f.key as keyof T, v as T[keyof T])} />
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold mb-4">Publish</h3>
          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Status</label>
          <select
            value={(values.status as Status) ?? "draft"}
            onChange={(e) => set("status" as keyof T, e.target.value as T[keyof T])}
            className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm mb-3"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {(values.status as Status) === "scheduled" && (
            <>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Schedule for</label>
              <input
                type="datetime-local"
                value={(values.scheduledFor as string ?? "").slice(0, 16)}
                onChange={(e) => set("scheduledFor" as keyof T, new Date(e.target.value).toISOString() as T[keyof T])}
                className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm mb-3"
              />
            </>
          )}
          <button type="submit" className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow inline-flex items-center justify-center gap-2 glow-primary">
            <Save className="h-4 w-4" /> Save
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => { if (confirm("Delete this item?")) onDelete(); }}
              className="mt-2 w-full h-10 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>

        {extraSidebar}

        {initial.id && (
          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground space-y-1">
            <p><span className="font-semibold text-foreground">ID:</span> {initial.id as string}</p>
            {initial.createdAt && <p><span className="font-semibold text-foreground">Created:</span> {new Date(initial.createdAt as string).toLocaleString()}</p>}
            {initial.updatedAt && <p><span className="font-semibold text-foreground">Updated:</span> {new Date(initial.updatedAt as string).toLocaleString()}</p>}
          </div>
        )}
      </aside>
    </form>
  );
}

function FormField({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const common = "w-full h-10 px-3 rounded-lg bg-input border border-border text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
  const categories = useEntityList<CategoryEntity>(field.type === "category" ? "categories" : "");
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
        {field.label}{field.required && <span className="text-destructive"> *</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={6}
          className={common + " h-auto py-2.5 resize-y"}
        />
      ) : field.type === "select" ? (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={common}>
          <option value="">— Select —</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === "category" ? (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} className={common}>
          <option value="">— Select category —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-primary h-4 w-4" />
          <span className="text-sm">{field.placeholder ?? "Yes"}</span>
        </label>
      ) : field.type === "number" ? (
        <input type="number" value={(value as number) ?? 0} onChange={(e) => onChange(Number(e.target.value))} className={common} />
      ) : (
        <input type={field.type === "datetime" ? "datetime-local" : "text"} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={common} />
      )}
      {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

type ImageUploaderProps =
  | { mode: "single"; label: string; help?: string; value: string; onChange: (url: string) => void; onInsert?: undefined }
  | { mode: "insert"; label: string; help?: string; onInsert: (url: string) => void; value?: undefined; onChange?: undefined };

function ImageUploader(props: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("article-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (error) throw error;
      const url = `/api/public/article-image/${path}`;
      if (props.mode === "single") props.onChange(url);
      else props.onInsert(url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{props.label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {props.mode === "single" && props.value ? (
        <div className="flex items-start gap-3">
          <img src={props.value} alt="" className="h-24 w-24 object-cover rounded-lg border border-border" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="h-9 px-3 rounded-lg bg-secondary text-secondary-foreground text-sm inline-flex items-center gap-2 hover:bg-secondary/80 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Replace
            </button>
            <button
              type="button"
              onClick={() => props.onChange("")}
              className="h-9 px-3 rounded-lg border border-border text-sm inline-flex items-center gap-2 hover:bg-muted"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary-glow disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : props.mode === "insert" ? <ImagePlus className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : props.mode === "insert" ? "Upload & insert image" : "Upload image"}
        </button>
      )}
      {props.help && <p className="mt-1 text-xs text-muted-foreground">{props.help}</p>}
    </div>
  );
}
