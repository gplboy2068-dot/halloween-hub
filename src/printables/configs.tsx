import type { PrintableConfig, PrintableState } from "./types";
import { ICON_PATHS } from "./icons";

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
function IconAt({
  state, x, y, size, stroke = false,
}: { state: PrintableState; x: number; y: number; size: number; stroke?: boolean }) {
  const d = ICON_PATHS[state.icon];
  const s = size / 100;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <path
        d={d}
        fill={stroke ? "none" : state.theme.accent}
        stroke={stroke ? state.theme.accent : "none"}
        strokeWidth={stroke ? 3 : 0}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 1. BANNER — one letter per pennant, string across the top          */
/* ------------------------------------------------------------------ */
export const bannerConfig: PrintableConfig = {
  toolSlug: "printable-banner-generator",
  title: "Halloween Banner",
  widthMm: 297,
  heightMm: 105,
  paperSize: "letter",
  orientation: "landscape",
  primaryText: "BOO!",
  variants: [
    { id: "pennant", name: "Pennant Flags" },
    { id: "rectangle", name: "Rectangular Tiles" },
    { id: "scallop", name: "Scalloped Cards" },
  ],
  defaultVariant: "pennant",
  allowIcons: true,
  render: (s) => {
    const letters = s.primaryText.toUpperCase().split("").filter(Boolean);
    const n = Math.max(letters.length, 1);
    const tileW = Math.min(45, 260 / n);
    const gap = 4;
    const totalW = n * tileW + (n - 1) * gap;
    const startX = (297 - totalW) / 2;
    const topY = 15;
    return (
      <>
        {/* string */}
        <path d={`M 10 ${topY} Q ${297 / 2} ${topY + 12}, 287 ${topY}`}
          stroke={s.theme.accent} strokeWidth={0.8} fill="none" strokeDasharray="1.5 1.2" />
        {letters.map((ch, i) => {
          const cx = startX + i * (tileW + gap) + tileW / 2;
          const tileY = topY + 4;
          const h = 70;
          return (
            <g key={i}>
              {s.variant === "pennant" && (
                <polygon
                  points={`${cx - tileW / 2},${tileY} ${cx + tileW / 2},${tileY} ${cx},${tileY + h}`}
                  fill={s.theme.accent} stroke={s.theme.fg} strokeWidth={0.6}
                />
              )}
              {s.variant === "rectangle" && (
                <rect x={cx - tileW / 2} y={tileY} width={tileW} height={h * 0.9}
                  rx={2} fill={s.theme.accent} stroke={s.theme.fg} strokeWidth={0.6} />
              )}
              {s.variant === "scallop" && (
                <path
                  d={`M ${cx - tileW / 2} ${tileY} h ${tileW} v ${h * 0.75}
                       q ${-tileW / 4} 8 ${-tileW / 2} 0
                       q ${-tileW / 4} 8 ${-tileW / 2} 0 z`}
                  fill={s.theme.accent} stroke={s.theme.fg} strokeWidth={0.6}
                />
              )}
              <text
                x={cx} y={tileY + h * 0.5}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily={s.font.css} fontSize={tileW * 0.75}
                fill={s.theme.bg} fontWeight={700}
              >{ch}</text>
              {/* string hole */}
              <circle cx={cx} cy={tileY + 3} r={1} fill={s.theme.bg} />
            </g>
          );
        })}
        {s.secondaryText && (
          <text x={297 / 2} y={95} textAnchor="middle" fontFamily={s.font.css} fontSize={7} fill={s.theme.fg}>
            {s.secondaryText}
          </text>
        )}
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 2. CUPCAKE TOPPER — one 60mm design, tiled 12/sheet on export       */
/* ------------------------------------------------------------------ */
export const cupcakeTopperConfig: PrintableConfig = {
  toolSlug: "cupcake-topper-generator",
  title: "Cupcake Topper",
  widthMm: 60, heightMm: 60,
  paperSize: "letter", orientation: "portrait",
  primaryText: "TREAT",
  variants: [
    { id: "circle", name: "Circle" },
    { id: "square", name: "Square" },
    { id: "scallop", name: "Scalloped" },
    { id: "hex", name: "Hexagon" },
  ],
  defaultVariant: "circle",
  allowIcons: true,
  tilesPerSheet: 12,
  render: (s) => {
    const cx = 30, cy = 30, r = 27;
    let shape: React.ReactNode = null;
    if (s.variant === "circle") shape = <circle cx={cx} cy={cy} r={r} />;
    else if (s.variant === "square") shape = <rect x={3} y={3} width={54} height={54} rx={2} />;
    else if (s.variant === "hex") {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      }).join(" ");
      shape = <polygon points={pts} />;
    } else {
      // scallop
      const bumps = 12;
      const pts: string[] = [];
      for (let i = 0; i < bumps; i++) {
        const a = (Math.PI * 2 * i) / bumps;
        pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
        const a2 = a + Math.PI / bumps;
        pts.push(`${cx + Math.cos(a2) * (r - 3)},${cy + Math.sin(a2) * (r - 3)}`);
      }
      shape = <polygon points={pts.join(" ")} />;
    }
    return (
      <>
        <g fill={s.theme.accent} stroke={s.theme.fg} strokeWidth={0.5}>{shape}</g>
        <IconAt state={s} x={cx} y={cy - 6} size={22} />
        <text x={cx} y={cy + 15} textAnchor="middle" fontFamily={s.font.css} fontSize={9} fill={s.theme.bg} fontWeight={700}>
          {s.primaryText}
        </text>
        {/* Toothpick guide */}
        <line x1={cx} y1={cy + 24} x2={cx} y2={cy + 28} stroke={s.theme.muted} strokeWidth={0.3} strokeDasharray="1 1" />
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 3. GIFT TAG                                                        */
/* ------------------------------------------------------------------ */
export const giftTagConfig: PrintableConfig = {
  toolSlug: "gift-tag-generator",
  title: "Halloween Gift Tag",
  widthMm: 64, heightMm: 89,
  paperSize: "letter", orientation: "portrait",
  primaryText: "To: You",
  secondaryText: "From: Your favorite ghost",
  variants: [
    { id: "gift", name: "Gift Tag" },
    { id: "name", name: "Name Tag" },
    { id: "favor", name: "Party Favor" },
    { id: "teacher", name: "Teacher Gift" },
  ],
  defaultVariant: "gift",
  allowIcons: true,
  tilesPerSheet: 8,
  render: (s) => {
    return (
      <>
        <rect x={2} y={2} width={60} height={85} rx={4} fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={0.6} />
        {/* Hole punch guide */}
        <circle cx={32} cy={8} r={2} fill="none" stroke={s.theme.muted} strokeDasharray="0.5 0.5" strokeWidth={0.3} />
        <IconAt state={s} x={32} y={26} size={22} />
        <text x={32} y={50} textAnchor="middle" fontFamily={s.font.css} fontSize={7} fill={s.theme.fg} fontWeight={700}>
          {s.primaryText.slice(0, 22)}
        </text>
        <text x={32} y={62} textAnchor="middle" fontFamily={s.font.css} fontSize={5} fill={s.theme.fg}>
          {s.secondaryText.slice(0, 30)}
        </text>
        <text x={32} y={80} textAnchor="middle" fontFamily={s.font.css} fontSize={4} fill={s.theme.muted}>
          Happy Halloween
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 4. LABEL                                                           */
/* ------------------------------------------------------------------ */
export const labelConfig: PrintableConfig = {
  toolSlug: "label-generator",
  title: "Halloween Label",
  widthMm: 90, heightMm: 40,
  paperSize: "letter", orientation: "landscape",
  primaryText: "Witch's Brew",
  secondaryText: "Drink at your own risk",
  variants: [
    { id: "candy", name: "Candy Jar" },
    { id: "bottle", name: "Bottle Wrap" },
    { id: "food", name: "Food" },
    { id: "jar", name: "Mason Jar" },
    { id: "decor", name: "Decoration" },
  ],
  defaultVariant: "candy",
  allowIcons: true,
  tilesPerSheet: 6,
  render: (s) => (
    <>
      <rect x={1} y={1} width={88} height={38} rx={3}
        fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={0.8} />
      <rect x={4} y={4} width={82} height={32} rx={2}
        fill="none" stroke={s.theme.accent} strokeWidth={0.3} strokeDasharray="1 1" />
      <IconAt state={s} x={16} y={20} size={16} />
      <text x={82} y={16} textAnchor="end" fontFamily={s.font.css} fontSize={7} fill={s.theme.fg} fontWeight={700}>
        {s.primaryText}
      </text>
      <text x={82} y={26} textAnchor="end" fontFamily={s.font.css} fontSize={3.5} fill={s.theme.fg}>
        {s.secondaryText}
      </text>
      <text x={82} y={33} textAnchor="end" fontFamily={s.font.css} fontSize={2.5} fill={s.theme.muted}>
        HALLOWEEN · {new Date().getFullYear()}
      </text>
    </>
  ),
};

/* ------------------------------------------------------------------ */
/* 5. TREAT BAG TOPPER                                                */
/* ------------------------------------------------------------------ */
export const treatBagConfig: PrintableConfig = {
  toolSlug: "treat-bag-generator",
  title: "Treat Bag Topper",
  widthMm: 100, heightMm: 70,
  paperSize: "letter", orientation: "portrait",
  primaryText: "TRICK OR TREAT",
  secondaryText: "Enjoy your spooky sweets!",
  variants: [
    { id: "topper", name: "Foldable Topper" },
    { id: "label", name: "Bag Label" },
    { id: "candy", name: "Candy Bag" },
    { id: "party", name: "Party Bag" },
  ],
  defaultVariant: "topper",
  allowIcons: true,
  tilesPerSheet: 4,
  render: (s) => (
    <>
      {/* Fold line */}
      <line x1={0} y1={35} x2={100} y2={35} stroke={s.theme.muted} strokeDasharray="1 1" strokeWidth={0.3} />
      <text x={98} y={34} fontSize={2} textAnchor="end" fill={s.theme.muted}>FOLD</text>
      {/* Top half (front) */}
      <rect x={2} y={2} width={96} height={31} rx={2} fill={s.theme.accent} />
      <IconAt state={s} x={20} y={18} size={16} />
      <text x={55} y={16} fontFamily={s.font.css} fontSize={8} fill={s.theme.bg} fontWeight={800}>{s.primaryText}</text>
      <text x={55} y={26} fontFamily={s.font.css} fontSize={4} fill={s.theme.bg}>{s.secondaryText}</text>
      {/* Bottom half (back) */}
      <rect x={2} y={37} width={96} height={31} rx={2} fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={0.6} />
      <text x={50} y={54} textAnchor="middle" fontFamily={s.font.css} fontSize={5} fill={s.theme.fg}>Have a howling good night 🎃</text>
      {/* Punch holes */}
      <circle cx={20} cy={40} r={1.5} fill="none" stroke={s.theme.muted} strokeWidth={0.3} />
      <circle cx={80} cy={40} r={1.5} fill="none" stroke={s.theme.muted} strokeWidth={0.3} />
    </>
  ),
};

/* ------------------------------------------------------------------ */
/* 6. PARTY SIGN                                                      */
/* ------------------------------------------------------------------ */
export const partySignConfig: PrintableConfig = {
  toolSlug: "party-sign-generator",
  title: "Halloween Party Sign",
  widthMm: 215.9, heightMm: 279.4, // Letter portrait
  paperSize: "letter", orientation: "portrait",
  primaryText: "WELCOME",
  secondaryText: "Enter if you dare",
  variants: [
    { id: "welcome", name: "Welcome" },
    { id: "rules", name: "Party Rules" },
    { id: "food", name: "Food Station" },
    { id: "candy", name: "Candy Bar" },
    { id: "photo", name: "Photo Booth" },
    { id: "bathroom", name: "Bathroom" },
    { id: "exit", name: "Exit" },
    { id: "parking", name: "Parking" },
    { id: "custom", name: "Custom Sign" },
  ],
  defaultVariant: "welcome",
  allowIcons: true,
  render: (s) => {
    const w = 215.9, h = 279.4;
    return (
      <>
        <rect x={10} y={10} width={w - 20} height={h - 20} rx={4}
          fill="none" stroke={s.theme.accent} strokeWidth={1.2} />
        <rect x={14} y={14} width={w - 28} height={h - 28} rx={2}
          fill="none" stroke={s.theme.accent} strokeWidth={0.3} strokeDasharray="2 2" />
        <IconAt state={s} x={w / 2} y={80} size={80} />
        <text
          x={w / 2} y={165} textAnchor="middle"
          fontFamily={s.font.css} fontSize={38} fill={s.theme.accent} fontWeight={900}
        >{s.primaryText}</text>
        <line x1={w / 2 - 40} y1={175} x2={w / 2 + 40} y2={175} stroke={s.theme.accent} strokeWidth={0.8} />
        <text x={w / 2} y={195} textAnchor="middle" fontFamily={s.font.css} fontSize={12} fill={s.theme.fg}>
          {s.secondaryText}
        </text>
        <text x={w / 2} y={h - 30} textAnchor="middle" fontFamily={s.font.css} fontSize={7} fill={s.theme.muted}>
          HalloweenTools.com · Free Printable Party Sign
        </text>
      </>
    );
  },
};

export const ALL_PRINTABLES: PrintableConfig[] = [
  bannerConfig, cupcakeTopperConfig, giftTagConfig, labelConfig, treatBagConfig, partySignConfig,
];
