import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { PrintableConfig, PrintableState, IconId } from "./types";
import { PAPER_MM } from "./types";
import { PRINTABLE_THEMES, PRINTABLE_FONTS, getTheme, getFont } from "./themes";
import { ICON_LIST } from "./icons";
import { downloadJpg, downloadPdf, downloadPng, downloadSvg } from "./exporters";

function useHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = (next: T | ((p: T) => T)) => {
    setPast((p) => [...p.slice(-40), present]);
    setPresent((cur) => (typeof next === "function" ? (next as (p: T) => T)(cur) : next));
    setFuture([]);
  };
  const undo = () => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [present, ...f].slice(0, 40));
      setPresent(prev);
      return p.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, present]);
      setPresent(next);
      return f.slice(1);
    });
  };
  const reset = () => {
    setPast([]);
    setFuture([]);
    setPresent(initial);
  };
  return { state: present, set, undo, redo, reset, canUndo: past.length > 0, canRedo: future.length > 0 };
}

export function PrintableEditor({ config }: { config: PrintableConfig }) {
  const initial: PrintableState = {
    theme: PRINTABLE_THEMES[0],
    font: PRINTABLE_FONTS[0],
    primaryText: config.primaryText,
    secondaryText: config.secondaryText ?? "",
    variant: config.defaultVariant,
    icon: "pumpkin",
    paperSize: config.paperSize,
    orientation: config.orientation,
  };
  const { state, set, undo, redo, reset, canUndo, canRedo } = useHistory(initial);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filename = useMemo(
    () => `${config.toolSlug}-${state.primaryText.slice(0, 24).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "halloween"}`,
    [config.toolSlug, state.primaryText],
  );

  const doExport = async (kind: "png" | "jpg" | "svg" | "pdf") => {
    if (!svgRef.current) return;
    setExporting(kind);
    try {
      if (kind === "svg") downloadSvg(svgRef.current, `${filename}.svg`);
      else if (kind === "png") await downloadPng(svgRef.current, `${filename}.png`);
      else if (kind === "jpg") await downloadJpg(svgRef.current, `${filename}.jpg`);
      else if (kind === "pdf")
        await downloadPdf(svgRef.current, `${filename}.pdf`, {
          paperSize: state.paperSize,
          orientation: state.orientation,
          tilesPerSheet: config.tilesPerSheet ?? 1,
          background: state.theme.bg,
        });
      toast.success(`Downloaded ${kind.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toast.error(`Export failed: ${(e as Error).message}`);
    } finally {
      setExporting(null);
    }
  };

  const doPrint = () => {
    if (!svgRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return toast.error("Popup blocked");
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    win.document.write(`<!doctype html><html><head><title>${filename}</title>
      <style>@page{size:${state.paperSize} ${state.orientation};margin:10mm}
      body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}
      svg{max-width:100%;max-height:100vh}</style></head>
      <body>${xml}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}<\/script></body></html>`);
    win.document.close();
  };

  const doShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* PREVIEW */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4 sm:p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={!canUndo} className={btnGhost}>↶ Undo</button>
            <button onClick={redo} disabled={!canRedo} className={btnGhost}>↷ Redo</button>
            <button onClick={reset} className={btnGhost}>⟲ Reset</button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Zoom</span>
            <input
              type="range" min={0.4} max={2} step={0.05}
              value={zoom} onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
            />
            <span className="w-10 text-right tabular-nums">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div className="rounded-xl bg-[repeating-conic-gradient(#0002_0deg_25%,#0001_25%_50%)] p-4 overflow-auto flex items-center justify-center min-h-[420px]">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
            <PrintableSvg ref={svgRef} config={config} state={state} />
          </div>
        </div>

        {/* Export bar */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => doExport("pdf")} disabled={exporting !== null} className={btnPrimarySm}>
            {exporting === "pdf" ? "…" : "⬇ PDF"}
          </button>
          <button onClick={() => doExport("png")} disabled={exporting !== null} className={btnSecondarySm}>PNG</button>
          <button onClick={() => doExport("jpg")} disabled={exporting !== null} className={btnSecondarySm}>JPG</button>
          <button onClick={() => doExport("svg")} disabled={exporting !== null} className={btnSecondarySm}>SVG</button>
          <button onClick={doPrint} className={btnSecondarySm}>🖨 Print</button>
          <button onClick={doShare} className={btnSecondarySm}>🔗 Share</button>
        </div>
      </div>

      {/* CONTROLS */}
      <aside className="rounded-3xl border border-border bg-card/60 backdrop-blur p-5 space-y-5">
        <Section title="Text">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Primary</label>
          <input
            className={inputCls} value={state.primaryText}
            onChange={(e) => set({ ...state, primaryText: e.target.value })}
          />
          {config.secondaryText !== undefined && (
            <>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">Secondary</label>
              <input
                className={inputCls} value={state.secondaryText}
                onChange={(e) => set({ ...state, secondaryText: e.target.value })}
              />
            </>
          )}
        </Section>

        <Section title="Style">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Variant</label>
          <select
            className={inputCls}
            value={state.variant}
            onChange={(e) => set({ ...state, variant: e.target.value })}
          >
            {config.variants.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {PRINTABLE_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => set({ ...state, theme: t, font: getFont(state.font.id) })}
                aria-label={t.name}
                className={`rounded-lg h-10 border-2 transition ${state.theme.id === t.id ? "border-primary" : "border-transparent"}`}
                style={{ background: `linear-gradient(135deg, ${t.bg} 40%, ${t.accent})` }}
                title={t.name}
              />
            ))}
          </div>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">Font</label>
          <select className={inputCls} value={state.font.id} onChange={(e) => set({ ...state, font: getFont(e.target.value) })}>
            {PRINTABLE_FONTS.map((f) => <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>{f.name}</option>)}
          </select>

          <label className="block text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">Accent color</label>
          <input
            type="color" value={state.theme.accent}
            onChange={(e) => set({ ...state, theme: { ...state.theme, accent: e.target.value } })}
            className="w-full h-10 rounded-lg border border-border bg-transparent"
          />
        </Section>

        {config.allowIcons && (
          <Section title="Halloween icon">
            <div className="grid grid-cols-6 gap-2">
              {ICON_LIST.map((i) => (
                <button
                  key={i.id}
                  onClick={() => set({ ...state, icon: i.id as IconId })}
                  className={`aspect-square rounded-lg border text-lg ${state.icon === i.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                  title={i.label}
                >
                  {i.emoji}
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Print">
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Paper</label>
          <select className={inputCls} value={state.paperSize} onChange={(e) => set({ ...state, paperSize: e.target.value as "letter" | "a4" })}>
            <option value="letter">US Letter (8.5×11")</option>
            <option value="a4">A4 (210×297mm)</option>
          </select>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">Orientation</label>
          <select className={inputCls} value={state.orientation} onChange={(e) => set({ ...state, orientation: e.target.value as "portrait" | "landscape" })}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
          <p className="mt-3 text-xs text-muted-foreground">
            Files export at 300 DPI, print-ready with a {PAPER_MM[state.paperSize].w}×{PAPER_MM[state.paperSize].h}mm page.
          </p>
        </Section>
      </aside>
    </div>
  );
}

const PrintableSvg = ({
  config, state, ref,
}: {
  config: PrintableConfig;
  state: PrintableState;
  ref: React.RefObject<SVGSVGElement | null>;
}) => {
  // Load font stylesheets once at first render (client-side).
  useEffect(() => {
    const id = "printable-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Bangers&family=Fredoka:wght@400;600&family=IM+Fell+English:ital@0;1&family=Special+Elite&display=swap";
    document.head.appendChild(link);
  }, []);

  const previewMaxWidth = 640; // px preview cap
  const scale = previewMaxWidth / config.widthMm;
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${config.widthMm} ${config.heightMm}`}
      width={config.widthMm * scale}
      height={config.heightMm * scale}
      style={{ background: state.theme.bg, borderRadius: 8, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {config.render(state)}
    </svg>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest text-primary mb-2">{title}</h3>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-background/60 border border-border text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";
const btnGhost = "px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-background/40 hover:bg-primary/10 hover:border-primary/40 transition disabled:opacity-40 disabled:cursor-not-allowed";
const btnPrimarySm = "px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-glow disabled:opacity-50";
const btnSecondarySm = "px-4 py-2 rounded-lg border border-border bg-background/60 text-sm font-medium hover:bg-primary/10 hover:border-primary/40 transition disabled:opacity-50";
