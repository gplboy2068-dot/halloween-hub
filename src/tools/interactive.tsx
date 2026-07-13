import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ToolShell, Field, selectCls, btnPrimary, pick } from "./shell";

type EyeShape = "triangle" | "circle" | "diamond" | "square" | "star";
type MouthShape = "grin" | "fangs" | "smile" | "scream" | "jagged";

const EYE_SHAPES: EyeShape[] = ["triangle", "circle", "diamond", "square", "star"];
const MOUTH_SHAPES: MouthShape[] = ["grin", "fangs", "smile", "scream", "jagged"];

function Eye({ x, shape }: { x: number; shape: EyeShape }) {
  const cy = 210;
  const s = 40;
  switch (shape) {
    case "triangle":
      return <polygon points={`${x},${cy - s} ${x - s},${cy + s} ${x + s},${cy + s}`} fill="#0a0a0a" />;
    case "circle":
      return <circle cx={x} cy={cy} r={s} fill="#0a0a0a" />;
    case "diamond":
      return <polygon points={`${x},${cy - s} ${x + s},${cy} ${x},${cy + s} ${x - s},${cy}`} fill="#0a0a0a" />;
    case "square":
      return <rect x={x - s} y={cy - s} width={s * 2} height={s * 2} fill="#0a0a0a" />;
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? s : s / 2.4;
        const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
        return `${x + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      }).join(" ");
      return <polygon points={pts} fill="#0a0a0a" />;
    }
  }
}

function Mouth({ shape }: { shape: MouthShape }) {
  switch (shape) {
    case "grin":
      return <path d="M 130 340 Q 300 430 470 340 L 470 380 Q 300 470 130 380 Z" fill="#0a0a0a" />;
    case "fangs":
      return (
        <path
          d="M 130 340 L 200 340 L 210 400 L 240 340 L 280 340 L 290 410 L 320 340 L 360 340 L 370 400 L 400 340 L 470 340 Q 300 470 130 380 Z"
          fill="#0a0a0a"
        />
      );
    case "smile":
      return <path d="M 150 350 Q 300 420 450 350 L 450 370 Q 300 440 150 370 Z" fill="#0a0a0a" />;
    case "scream":
      return <ellipse cx={300} cy={390} rx={70} ry={55} fill="#0a0a0a" />;
    case "jagged":
      return (
        <polygon
          points="130,350 170,410 200,350 240,410 280,350 320,410 360,350 400,410 430,350 470,410 470,340 130,340"
          fill="#0a0a0a"
        />
      );
  }
}

export function PumpkinFaceGenerator() {
  const [left, setLeft] = useState<EyeShape>("triangle");
  const [right, setRight] = useState<EyeShape>("triangle");
  const [mouth, setMouth] = useState<MouthShape>("fangs");
  const [glow, setGlow] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const randomize = () => {
    setLeft(pick(EYE_SHAPES));
    setRight(pick(EYE_SHAPES));
    setMouth(pick(MOUTH_SHAPES));
  };

  const download = () => {
    if (!svgRef.current) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pumpkin-face.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded SVG");
  };

  return (
    <ToolShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-gradient-to-br from-background/80 to-primary/10 p-6 flex items-center justify-center">
          <svg ref={svgRef} viewBox="0 0 600 600" className="w-full max-w-[420px]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="pumpkin-body" cx="0.5" cy="0.45" r="0.6">
                <stop offset="0%" stopColor="#ffa726" />
                <stop offset="100%" stopColor="#d84315" />
              </radialGradient>
              {glow && (
                <radialGradient id="pumpkin-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#ffd54f" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffd54f" stopOpacity="0" />
                </radialGradient>
              )}
            </defs>
            {glow && <circle cx="300" cy="330" r="280" fill="url(#pumpkin-glow)" />}
            {/* Pumpkin body */}
            <ellipse cx="300" cy="340" rx="240" ry="210" fill="url(#pumpkin-body)" />
            <ellipse cx="180" cy="340" rx="80" ry="200" fill="url(#pumpkin-body)" opacity="0.85" />
            <ellipse cx="420" cy="340" rx="80" ry="200" fill="url(#pumpkin-body)" opacity="0.85" />
            {/* Stem */}
            <rect x="285" y="100" width="30" height="50" rx="6" fill="#4e342e" />
            <path d="M 305 105 Q 340 85 360 110 Q 335 115 320 130 Z" fill="#558b2f" />
            {/* Face */}
            <Eye x={220} shape={left} />
            <Eye x={380} shape={right} />
            <Mouth shape={mouth} />
          </svg>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Left Eye">
            <select className={selectCls} value={left} onChange={(e) => setLeft(e.target.value as EyeShape)}>
              {EYE_SHAPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Right Eye">
            <select className={selectCls} value={right} onChange={(e) => setRight(e.target.value as EyeShape)}>
              {EYE_SHAPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Mouth">
            <select className={selectCls} value={mouth} onChange={(e) => setMouth(e.target.value as MouthShape)}>
              {MOUTH_SHAPES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={glow} onChange={(e) => setGlow(e.target.checked)} className="accent-primary" />
            Glowing effect
          </label>
          <button type="button" onClick={randomize} className={btnPrimary}>🎲 Randomize</button>
          <button
            type="button"
            onClick={download}
            className="px-6 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition"
          >
            ⬇️ Download SVG
          </button>
        </div>
      </div>
    </ToolShell>
  );
}

export function PumpkinTemplateGenerator() {
  // Alias: same UI, encourages "printable" framing
  return <PumpkinFaceGenerator />;
}

export function PumpkinCarvingGenerator() {
  return <PumpkinFaceGenerator />;
}

export function MemeGenerator() {
  const [top, setTop] = useState("WHEN THE CANDY BOWL");
  const [bottom, setBottom] = useState("IS EMPTY BY 6PM");
  const [bg, setBg] = useState("🎃");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useMemo(() => () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#3d1c5c");
    grad.addColorStop(1, "#0f0a1e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.font = "300px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bg, W / 2, H / 2);

    ctx.font = "bold 56px 'Impact', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";
    ctx.strokeText(top.toUpperCase(), W / 2, 30, W - 40);
    ctx.fillText(top.toUpperCase(), W / 2, 30, W - 40);
    ctx.textBaseline = "bottom";
    ctx.strokeText(bottom.toUpperCase(), W / 2, H - 30, W - 40);
    ctx.fillText(bottom.toUpperCase(), W / 2, H - 30, W - 40);
  }, [top, bottom, bg]);

  useMemo(() => {
    if (typeof window !== "undefined") setTimeout(draw, 0);
  }, [draw]);

  const download = () => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "halloween-meme.png";
    a.click();
    toast.success("Meme downloaded");
  };

  return (
    <ToolShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-black/40 p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={720}
            className="w-full max-w-[520px] rounded-xl border border-border"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Field label="Top text">
            <input value={top} onChange={(e) => setTop(e.target.value)} onKeyUp={draw} className="w-full px-4 py-2.5 rounded-lg bg-background/60 border border-border text-sm" />
          </Field>
          <Field label="Bottom text">
            <input value={bottom} onChange={(e) => setBottom(e.target.value)} onKeyUp={draw} className="w-full px-4 py-2.5 rounded-lg bg-background/60 border border-border text-sm" />
          </Field>
          <Field label="Background emoji">
            <select className={selectCls} value={bg} onChange={(e) => { setBg(e.target.value); setTimeout(draw, 0); }}>
              {["🎃", "👻", "💀", "🕷️", "🦇", "🧛", "🧟", "🧙‍♀️", "🌙", "⚰️"].map((e) => <option key={e}>{e}</option>)}
            </select>
          </Field>
          <button type="button" onClick={draw} className={btnPrimary}>🔄 Refresh</button>
          <button type="button" onClick={download} className="px-6 py-2.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition">⬇️ Download PNG</button>
        </div>
      </div>
    </ToolShell>
  );
}

import { PARTY_CHECKLIST_TEMPLATES } from "./wordlists";

export function PartyPlanner() {
  const [guests, setGuests] = useState(15);
  const [theme, setTheme] = useState("Classic Haunted");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const budget = useMemo(() => {
    const perGuest = { food: 8, drinks: 5, decor: 3, favors: 2 };
    return {
      food: guests * perGuest.food,
      drinks: guests * perGuest.drinks,
      decor: guests * perGuest.decor,
      favors: guests * perGuest.favors,
      total: guests * (perGuest.food + perGuest.drinks + perGuest.decor + perGuest.favors),
    };
  }, [guests]);

  const totalItems = Object.values(PARTY_CHECKLIST_TEMPLATES).reduce((a, b) => a + b.length, 0);
  const doneItems = Object.values(checked).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <ToolShell>
      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Guests">
          <input type="number" min={1} max={200} value={guests} onChange={(e) => setGuests(+e.target.value || 1)} className="w-full px-4 py-2.5 rounded-lg bg-background/60 border border-border" />
        </Field>
        <Field label="Theme">
          <select className={selectCls} value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option>Classic Haunted</option><option>Vampire Gala</option><option>Witch's Coven</option><option>Zombie Apocalypse</option><option>Kids Friendly</option>
          </select>
        </Field>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Est. budget</div>
          <div className="font-display text-3xl font-bold text-primary mt-1">${budget.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Food ${budget.food} · Drinks ${budget.drinks} · Decor ${budget.decor} · Favors ${budget.favors}</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl font-bold">Checklist</h3>
          <div className="text-sm text-muted-foreground">{doneItems}/{totalItems} · {progress}%</div>
        </div>
        <div className="h-2 rounded-full bg-background/60 overflow-hidden mb-6">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(PARTY_CHECKLIST_TEMPLATES).map(([when, tasks]) => (
            <div key={when} className="rounded-xl border border-border bg-background/40 p-4">
              <h4 className="font-display font-bold text-primary mb-3">{when}</h4>
              <ul className="space-y-2">
                {tasks.map((task) => {
                  const key = `${when}::${task}`;
                  return (
                    <li key={key}>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checked[key]}
                          onChange={(e) => setChecked((c) => ({ ...c, [key]: e.target.checked }))}
                          className="mt-0.5 accent-primary"
                        />
                        <span className={checked[key] ? "line-through text-muted-foreground" : ""}>{task}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
