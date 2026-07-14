import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { aiGenerateText, aiGenerateImage, aiGenerateLongText } from "@/lib/ai.functions";
import { ToolShell, ToolControls, ResultList, CopyButton, btnPrimary } from "./shell";
import { ShareGenerationButton, ShareImageButton } from "@/components/ShareGenerationButton";
import { TOOLS } from "@/lib/site";

function useToolMeta() {
  // best-effort: read the current /tools/$slug param; falls back gracefully off-route
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params?.slug ?? "";
  const tool = TOOLS.find((t) => t.slug === slug);
  return { slug, title: tool?.title ?? slug };
}

function handleError(err: unknown) {
  const msg = err instanceof Error ? err.message : "Something went wrong.";
  toast.error(msg);
}


/**
 * AI text list tool: user fills a form, we call aiGenerateText, results appear.
 */
export function AITextListTool({
  system,
  buildPrompt,
  count = 6,
  cta = "🪄 Generate with AI",
  children,
  emptyLabel,
}: {
  system: string;
  buildPrompt: () => string;
  count?: number;
  cta?: string;
  emptyLabel?: string;
  children?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const runFn = useServerFn(aiGenerateText);
  const meta = useToolMeta();

  const run = async () => {
    setLoading(true);
    try {
      const prompt = buildPrompt();
      setLastPrompt(prompt);
      const res = await runFn({ data: { system, prompt, count } });
      setItems(res.items);
      if (res.items.length === 0) toast.error("No results — try tweaking your input.");
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell>
      <ToolControls>
        {children}
        <button type="button" onClick={run} disabled={loading} className={btnPrimary + " disabled:opacity-60"}>
          {loading ? "Conjuring…" : cta}
        </button>
      </ToolControls>
      <ResultList
        items={items}
        onRegenerate={items.length ? run : undefined}
        emptyLabel={emptyLabel}
        share={meta.slug ? { toolSlug: meta.slug, toolTitle: meta.title, prompt: lastPrompt } : undefined}
      />
    </ToolShell>
  );
}


/**
 * AI long-form text (single result, e.g. a story).
 */
export function AILongTextTool({
  system,
  buildPrompt,
  cta = "📖 Generate",
  children,
}: {
  system: string;
  buildPrompt: () => string;
  cta?: string;
  children?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const runFn = useServerFn(aiGenerateLongText);
  const meta = useToolMeta();

  const run = async () => {
    setLoading(true);
    try {
      const prompt = buildPrompt();
      setLastPrompt(prompt);
      const res = await runFn({ data: { system, prompt } });
      setText(res.text);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell>
      <ToolControls>
        {children}
        <button type="button" onClick={run} disabled={loading} className={btnPrimary + " disabled:opacity-60"}>
          {loading ? "Writing…" : cta}
        </button>
      </ToolControls>
      {text ? (
        <div className="mt-6 rounded-xl border border-border bg-background/40 p-5 sm:p-7 relative">
          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{text}</p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <CopyButton text={text} label="Copy" />
            {meta.slug && (
              <ShareGenerationButton
                toolSlug={meta.slug}
                toolTitle={meta.title}
                output={text}
                prompt={lastPrompt}
                kind="long"
              />
            )}
            <button type="button" onClick={run} className="px-4 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition">
              🎲 New version
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">Fill the form and hit generate.</p>
      )}
    </ToolShell>
  );
}


/**
 * AI image tool: prompt → data URL preview → download.
 */
export function AIImageTool({
  system,
  buildPrompt,
  cta = "🎨 Generate image",
  aspect = "aspect-square",
  filename = "halloween",
  children,
}: {
  system: string;
  buildPrompt: () => string;
  cta?: string;
  aspect?: string;
  filename?: string;
  children?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const runFn = useServerFn(aiGenerateImage);
  const meta = useToolMeta();

  const run = async () => {
    setLoading(true);
    try {
      const prompt = `${system}\n\n${buildPrompt()}`;
      setLastPrompt(prompt);
      const res = await runFn({ data: { prompt } });
      setImageUrl(res.imageUrl);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };


  const download = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${filename}-${Date.now()}.png`;
    a.click();
  };

  return (
    <ToolShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className={`rounded-2xl bg-black/40 p-4 flex items-center justify-center ${aspect} w-full max-w-[560px] mx-auto lg:mx-0 relative overflow-hidden`}>
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm">Conjuring pixels… (10–20s)</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Generated Halloween artwork" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <p className="text-muted-foreground text-sm text-center px-4">Your AI-generated image will appear here.</p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {children}
          <button type="button" onClick={run} disabled={loading} className={btnPrimary + " disabled:opacity-60"}>
            {loading ? "Generating…" : cta}
          </button>
          {imageUrl && (
            <>
              <button type="button" onClick={download} className="px-6 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition">
                ⬇️ Download PNG
              </button>
              {meta.slug && (
                <ShareImageButton
                  toolSlug={meta.slug}
                  toolTitle={meta.title}
                  dataUrl={imageUrl}
                  prompt={lastPrompt}
                />
              )}
              <button type="button" onClick={run} className="px-6 py-2.5 rounded-lg border border-border bg-background/60 text-sm font-medium hover:border-primary/40 transition">
                🎲 Regenerate
              </button>
            </>
          )}

        </div>
      </div>
    </ToolShell>
  );
}
