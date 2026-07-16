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

/* ------------------------------------------------------------------ */
/* 7. CANDY BAR WRAPPER — standard 1.55oz Hershey size                */
/*    Full flat wrapper ~ 5.75" x 5.5" = 146 x 140 mm                 */
/* ------------------------------------------------------------------ */
export const candyBarWrapperConfig: PrintableConfig = {
  toolSlug: "candy-bar-wrapper-generator",
  title: "Halloween Candy Bar Wrapper",
  widthMm: 146,
  heightMm: 140,
  paperSize: "letter",
  orientation: "portrait",
  primaryText: "TRICK OR TREAT",
  secondaryText: "Happy Halloween",
  variants: [
    { id: "classic", name: "Classic Wrapper" },
    { id: "kids", name: "Kids Party" },
    { id: "spooky", name: "Spooky Deluxe" },
    { id: "thankyou", name: "Thank You Favor" },
  ],
  defaultVariant: "classic",
  allowIcons: true,
  tilesPerSheet: 2,
  render: (s) => {
    const w = 146, h = 140;
    // Back panel (top ~35mm)
    // Wrap-around center label (middle ~70mm) — main design
    // Front panel (bottom ~35mm) — flipped
    return (
      <>
        {/* background */}
        <rect x={0} y={0} width={w} height={h} fill={s.theme.bg} />
        {/* back panel */}
        <rect x={0} y={0} width={w} height={35} fill={s.theme.bg} stroke={s.theme.muted} strokeWidth={0.3} strokeDasharray="1 1" />
        <text x={w / 2} y={20} textAnchor="middle" fontFamily={s.font.css} fontSize={5} fill={s.theme.muted}>
          Nutrition: 100% pure Halloween magic
        </text>
        {/* fold lines */}
        <line x1={0} y1={35} x2={w} y2={35} stroke={s.theme.muted} strokeDasharray="2 1.5" strokeWidth={0.3} />
        <line x1={0} y1={105} x2={w} y2={105} stroke={s.theme.muted} strokeDasharray="2 1.5" strokeWidth={0.3} />
        <text x={w - 2} y={34} textAnchor="end" fontSize={2} fill={s.theme.muted}>FOLD</text>
        <text x={w - 2} y={104} textAnchor="end" fontSize={2} fill={s.theme.muted}>FOLD</text>

        {/* center label — the main visible panel */}
        <rect x={0} y={35} width={w} height={70} fill={s.theme.accent} />
        <rect x={6} y={41} width={w - 12} height={58} rx={2}
          fill="none" stroke={s.theme.bg} strokeWidth={0.6} strokeDasharray="2 1" />
        <IconAt state={s} x={w / 2} y={58} size={22} />
        <text x={w / 2} y={82} textAnchor="middle"
          fontFamily={s.font.css} fontSize={12} fill={s.theme.bg} fontWeight={900}>
          {s.primaryText.slice(0, 22)}
        </text>
        <text x={w / 2} y={93} textAnchor="middle"
          fontFamily={s.font.css} fontSize={5} fill={s.theme.bg}>
          {s.secondaryText.slice(0, 40)}
        </text>

        {/* front panel */}
        <rect x={0} y={105} width={w} height={35} fill={s.theme.bg} stroke={s.theme.muted} strokeWidth={0.3} strokeDasharray="1 1" />
        <text x={w / 2} y={125} textAnchor="middle" fontFamily={s.font.css} fontSize={6} fill={s.theme.fg}>
          HalloweenTools.com
        </text>
        {/* crop marks */}
        <line x1={0} y1={0} x2={4} y2={0} stroke={s.theme.fg} strokeWidth={0.3} />
        <line x1={w - 4} y1={0} x2={w} y2={0} stroke={s.theme.fg} strokeWidth={0.3} />
        <line x1={0} y1={h} x2={4} y2={h} stroke={s.theme.fg} strokeWidth={0.3} />
        <line x1={w - 4} y1={h} x2={w} y2={h} stroke={s.theme.fg} strokeWidth={0.3} />
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 8. ENVELOPE LINER — A7 (5x7 invite) liner                          */
/*    A7 envelope ~ 133x184mm; liner insert ~ 130x175mm with V-flap   */
/* ------------------------------------------------------------------ */
export const envelopeLinerConfig: PrintableConfig = {
  toolSlug: "envelope-liner-generator",
  title: "Halloween Envelope Liner",
  widthMm: 130,
  heightMm: 175,
  paperSize: "letter",
  orientation: "portrait",
  primaryText: "You're Invited",
  secondaryText: "Halloween Night",
  variants: [
    { id: "liner-a7", name: "A7 Liner (5×7)" },
    { id: "liner-a2", name: "A2 Liner (4.25×5.5)" },
    { id: "envelope", name: "Full Envelope" },
    { id: "seal", name: "Sticker Seals" },
  ],
  defaultVariant: "liner-a7",
  allowIcons: true,
  render: (s) => {
    const w = 130, h = 175;
    // V-flap shape at top for envelope liner
    const flapY = 55;
    return (
      <>
        {/* liner outline — V-flap top */}
        <path
          d={`M 2 ${flapY} L ${w / 2} 4 L ${w - 2} ${flapY} L ${w - 2} ${h - 2} L 2 ${h - 2} Z`}
          fill={s.theme.bg}
          stroke={s.theme.accent}
          strokeWidth={0.6}
        />
        {/* inner cut guide */}
        <path
          d={`M 6 ${flapY + 2} L ${w / 2} 8 L ${w - 6} ${flapY + 2} L ${w - 6} ${h - 6} L 6 ${h - 6} Z`}
          fill="none"
          stroke={s.theme.muted}
          strokeWidth={0.3}
          strokeDasharray="1 1"
        />
        {/* fold line at flap base */}
        <line x1={2} y1={flapY} x2={w - 2} y2={flapY}
          stroke={s.theme.muted} strokeDasharray="2 1.5" strokeWidth={0.3} />
        <text x={w - 4} y={flapY - 1} textAnchor="end" fontSize={2} fill={s.theme.muted}>FOLD</text>

        {/* pattern in the flap */}
        <g opacity={0.6}>
          <IconAt state={s} x={w / 2} y={32} size={18} />
        </g>

        {/* main liner interior — repeating pattern */}
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => {
            const x = 18 + c * 32;
            const y = 75 + r * 22;
            return <IconAt key={`${r}-${c}`} state={s} x={x} y={y} size={10} />;
          }),
        )}

        {/* accent stripe */}
        <rect x={6} y={h - 30} width={w - 12} height={12} fill={s.theme.accent} rx={1} />
        <text x={w / 2} y={h - 22} textAnchor="middle"
          fontFamily={s.font.css} fontSize={6} fill={s.theme.bg} fontWeight={700}>
          {s.primaryText.slice(0, 30)}
        </text>
        <text x={w / 2} y={h - 10} textAnchor="middle"
          fontFamily={s.font.css} fontSize={4} fill={s.theme.fg}>
          {s.secondaryText.slice(0, 40)}
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 9. HALLOWEEN TICKET — 6"x2" perforated ticket with stub            */
/* ------------------------------------------------------------------ */
export const ticketConfig: PrintableConfig = {
  toolSlug: "halloween-ticket-generator",
  title: "Halloween Ticket",
  widthMm: 152,
  heightMm: 51,
  paperSize: "letter",
  orientation: "portrait",
  primaryText: "MONSTER MASH",
  secondaryText: "Oct 31 · 8:00 PM",
  variants: [
    { id: "event", name: "Event Ticket" },
    { id: "raffle", name: "Raffle Ticket" },
    { id: "vip", name: "VIP Pass" },
    { id: "admit", name: "Admit One" },
  ],
  defaultVariant: "event",
  allowIcons: true,
  tilesPerSheet: 5,
  render: (s) => {
    const w = 152, h = 51;
    const stubW = 38;
    const perfX = w - stubW;
    // perforation dots
    const perfDots = Array.from({ length: 25 }, (_, i) => (
      <circle key={i} cx={perfX} cy={2 + i * 2} r={0.4} fill={s.theme.bg} />
    ));
    return (
      <>
        {/* outer border */}
        <rect x={1} y={1} width={w - 2} height={h - 2} rx={3}
          fill={s.theme.accent} stroke={s.theme.fg} strokeWidth={0.4} />
        {/* inner frame */}
        <rect x={4} y={4} width={w - 8} height={h - 8} rx={2}
          fill="none" stroke={s.theme.bg} strokeWidth={0.4} strokeDasharray="2 1" />

        {/* main body */}
        <IconAt state={s} x={16} y={h / 2} size={22} />
        <text x={32} y={20} fontFamily={s.font.css} fontSize={11} fill={s.theme.bg} fontWeight={900}>
          {s.primaryText.slice(0, 22)}
        </text>
        <text x={32} y={30} fontFamily={s.font.css} fontSize={5} fill={s.theme.bg}>
          {s.secondaryText.slice(0, 40)}
        </text>
        <text x={32} y={40} fontFamily={s.font.css} fontSize={3.5} fill={s.theme.bg} opacity={0.9}>
          {s.variant === "vip" ? "VIP ACCESS · ALL ACCESS" :
           s.variant === "raffle" ? "KEEP THIS STUB · WINNER DRAWN OCT 31" :
           s.variant === "admit" ? "ADMIT ONE · NON-REFUNDABLE" :
           "ADMIT ONE · HALLOWEEN NIGHT"}
        </text>

        {/* perforation */}
        <line x1={perfX} y1={2} x2={perfX} y2={h - 2}
          stroke={s.theme.bg} strokeDasharray="1 1" strokeWidth={0.3} />
        {perfDots}

        {/* stub */}
        <text x={perfX + stubW / 2} y={12} textAnchor="middle"
          fontFamily={s.font.css} fontSize={3} fill={s.theme.bg} opacity={0.85}>
          KEEP STUB
        </text>
        <text x={perfX + stubW / 2} y={25} textAnchor="middle"
          fontFamily={s.font.css} fontSize={7} fill={s.theme.bg} fontWeight={900}>
          {s.variant === "raffle" ? "No.001" : "ADMIT"}
        </text>
        <text x={perfX + stubW / 2} y={35} textAnchor="middle"
          fontFamily={s.font.css} fontSize={7} fill={s.theme.bg} fontWeight={900}>
          {s.variant === "raffle" ? "" : "ONE"}
        </text>
        <text x={perfX + stubW / 2} y={44} textAnchor="middle"
          fontFamily={s.font.css} fontSize={2.5} fill={s.theme.bg} opacity={0.85}>
          HalloweenTools.com
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 10. COSTUME CONTEST AWARD CERTIFICATE — Letter landscape           */
/* ------------------------------------------------------------------ */
export const awardCertificateConfig: PrintableConfig = {
  toolSlug: "award-certificate-generator",
  title: "Halloween Costume Award Certificate",
  widthMm: 279.4,
  heightMm: 215.9,
  paperSize: "letter",
  orientation: "landscape",
  primaryText: "Jane Doe",
  secondaryText: "Best Costume 2026",
  variants: [
    { id: "best", name: "Best Costume" },
    { id: "scariest", name: "Scariest Costume" },
    { id: "funniest", name: "Funniest Costume" },
    { id: "group", name: "Best Group" },
    { id: "kids", name: "Best Kid Costume" },
    { id: "diy", name: "Best DIY" },
    { id: "custom", name: "Custom Award" },
  ],
  defaultVariant: "best",
  allowIcons: true,
  render: (s) => {
    const w = 279.4, h = 215.9;
    // decorative corner flourish (icon)
    const cornerIcons = [
      { x: 24, y: 24 },
      { x: w - 24, y: 24 },
      { x: 24, y: h - 24 },
      { x: w - 24, y: h - 24 },
    ];
    return (
      <>
        {/* outer border */}
        <rect x={8} y={8} width={w - 16} height={h - 16} rx={2}
          fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={2} />
        <rect x={14} y={14} width={w - 28} height={h - 28} rx={1}
          fill="none" stroke={s.theme.accent} strokeWidth={0.5} strokeDasharray="2 2" />
        <rect x={20} y={20} width={w - 40} height={h - 40} rx={1}
          fill="none" stroke={s.theme.accent} strokeWidth={0.3} />

        {/* corner motifs */}
        {cornerIcons.map((p, i) => (
          <g key={i} opacity={0.6}><IconAt state={s} x={p.x} y={p.y} size={16} /></g>
        ))}

        {/* seal / ribbon on the left */}
        <g transform={`translate(${w / 2 - 18}, ${h - 60})`}>
          <circle cx={0} cy={0} r={14} fill={s.theme.accent} />
          <circle cx={0} cy={0} r={10} fill="none" stroke={s.theme.bg} strokeWidth={0.6} />
          <text x={0} y={2} textAnchor="middle" fontFamily={s.font.css}
            fontSize={5} fill={s.theme.bg} fontWeight={900}>2026</text>
          <polygon points={`-8,12 -12,26 -4,22 0,28 4,22 12,26 8,12`} fill={s.theme.accent} />
        </g>

        {/* header */}
        <text x={w / 2} y={44} textAnchor="middle" fontFamily={s.font.css}
          fontSize={9} fill={s.theme.muted} letterSpacing="4">
          HALLOWEEN COSTUME CONTEST
        </text>
        <line x1={w / 2 - 60} y1={50} x2={w / 2 + 60} y2={50}
          stroke={s.theme.accent} strokeWidth={0.5} />

        {/* main award title */}
        <text x={w / 2} y={72} textAnchor="middle" fontFamily={s.font.css}
          fontSize={22} fill={s.theme.accent} fontWeight={900}>
          Certificate of Award
        </text>

        {/* "presented to" */}
        <text x={w / 2} y={92} textAnchor="middle" fontFamily={s.font.css}
          fontSize={7} fill={s.theme.muted} letterSpacing="2">
          THIS AWARD IS PRESENTED TO
        </text>

        {/* recipient name */}
        <text x={w / 2} y={116} textAnchor="middle" fontFamily={s.font.css}
          fontSize={26} fill={s.theme.fg} fontWeight={900}>
          {s.primaryText.slice(0, 30)}
        </text>
        <line x1={w / 2 - 80} y1={124} x2={w / 2 + 80} y2={124}
          stroke={s.theme.fg} strokeWidth={0.4} />

        {/* category */}
        <text x={w / 2} y={140} textAnchor="middle" fontFamily={s.font.css}
          fontSize={9} fill={s.theme.muted}>
          for winning the category of
        </text>
        <text x={w / 2} y={156} textAnchor="middle" fontFamily={s.font.css}
          fontSize={14} fill={s.theme.accent} fontWeight={700}>
          {s.secondaryText.slice(0, 40)}
        </text>

        {/* signature lines */}
        <line x1={40} y1={h - 32} x2={100} y2={h - 32} stroke={s.theme.fg} strokeWidth={0.4} />
        <text x={70} y={h - 26} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.muted}>Date</text>

        <line x1={w - 100} y1={h - 32} x2={w - 40} y2={h - 32} stroke={s.theme.fg} strokeWidth={0.4} />
        <text x={w - 70} y={h - 26} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.muted}>Host Signature</text>

        <text x={w / 2} y={h - 22} textAnchor="middle" fontFamily={s.font.css}
          fontSize={3.5} fill={s.theme.muted}>
          HalloweenTools.com · Free Printable Award
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 11. HALLOWEEN BINGO CARD — auto-shuffled 5x5 grid                  */
/* ------------------------------------------------------------------ */
const BINGO_POOL = [
  "Pumpkin","Ghost","Bat","Witch","Spider","Cauldron","Skull","Candy","Moon","Tomb",
  "Black Cat","Web","Broom","Mummy","Vampire","Zombie","Werewolf","Cobweb","Coffin","Cape",
  "Fog","Owl","Potion","Wand","Crow","Scarecrow","Haunted House","Candy Corn","Fangs","Cauldron",
  "Boo","Trick","Treat","Lantern","Frankenstein",
];
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rng = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const bingoCardConfig: PrintableConfig = {
  toolSlug: "halloween-bingo-generator",
  title: "Halloween Bingo Card",
  widthMm: 190, heightMm: 240,
  paperSize: "letter", orientation: "portrait",
  primaryText: "HALLOWEEN BINGO",
  secondaryText: "First to five in a row wins a treat!",
  variants: [
    { id: "classic", name: "Classic 5×5" },
    { id: "kids", name: "Kids Party" },
    { id: "words", name: "Words Only" },
    { id: "icons", name: "Icons Only" },
  ],
  defaultVariant: "classic",
  allowIcons: true,
  render: (s) => {
    const w = 190, h = 240;
    const words = (s.secondaryText.split(",").map(x => x.trim()).filter(Boolean).length >= 24
      ? s.secondaryText.split(",").map(x => x.trim()).filter(Boolean)
      : BINGO_POOL);
    const shuffled = seededShuffle(words, s.primaryText + s.variant + s.icon);
    const cells: string[] = [];
    for (let i = 0; i < 25; i++) {
      if (i === 12) cells.push("FREE");
      else cells.push(shuffled[i % shuffled.length]);
    }
    const gridX = 10, gridY = 60, gridW = w - 20, cell = gridW / 5;
    return (
      <>
        <rect x={4} y={4} width={w - 8} height={h - 8} rx={3}
          fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={1.2} />
        <text x={w / 2} y={26} textAnchor="middle" fontFamily={s.font.css} fontSize={14}
          fill={s.theme.accent} fontWeight={900}>{s.primaryText.slice(0, 30)}</text>
        {/* B I N G O header */}
        {"BINGO".split("").map((ch, i) => (
          <g key={ch}>
            <rect x={gridX + i * cell + 1} y={gridY - 12} width={cell - 2} height={10} rx={1}
              fill={s.theme.accent} />
            <text x={gridX + i * cell + cell / 2} y={gridY - 4} textAnchor="middle"
              fontFamily={s.font.css} fontSize={7} fill={s.theme.bg} fontWeight={900}>{ch}</text>
          </g>
        ))}
        {/* grid */}
        {Array.from({ length: 25 }).map((_, i) => {
          const r = Math.floor(i / 5), c = i % 5;
          const x = gridX + c * cell, y = gridY + r * cell;
          const isFree = i === 12;
          const label = cells[i];
          return (
            <g key={i}>
              <rect x={x} y={y} width={cell} height={cell}
                fill={isFree ? s.theme.accent : s.theme.bg}
                stroke={s.theme.fg} strokeWidth={0.4} />
              {(s.variant === "icons" || (s.variant !== "words" && !isFree)) && (
                <g opacity={s.variant === "icons" ? 1 : 0.35}>
                  <IconAt state={s} x={x + cell / 2} y={y + cell / 2 - (s.variant === "icons" ? 0 : 2)} size={cell * (s.variant === "icons" ? 0.6 : 0.55)} />
                </g>
              )}
              {s.variant !== "icons" && (
                <text x={x + cell / 2} y={y + cell - 4} textAnchor="middle"
                  fontFamily={s.font.css} fontSize={cell * 0.11}
                  fill={isFree ? s.theme.bg : s.theme.fg} fontWeight={isFree ? 900 : 600}>
                  {label.slice(0, 14)}
                </text>
              )}
            </g>
          );
        })}
        <text x={w / 2} y={h - 12} textAnchor="middle" fontFamily={s.font.css}
          fontSize={5} fill={s.theme.muted}>
          {s.secondaryText.length > 0 && s.secondaryText.split(",").length < 24
            ? s.secondaryText.slice(0, 80)
            : "First to five in a row wins a treat!"} · HalloweenTools.com
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 12. COUNTDOWN TO HALLOWEEN — 31-day advent calendar                */
/* ------------------------------------------------------------------ */
export const countdownCalendarConfig: PrintableConfig = {
  toolSlug: "halloween-countdown-printable",
  title: "Halloween Countdown Calendar",
  widthMm: 215.9, heightMm: 279.4,
  paperSize: "letter", orientation: "portrait",
  primaryText: "COUNTDOWN TO HALLOWEEN",
  secondaryText: "Cross off a day. Feel the spookiness grow.",
  variants: [
    { id: "advent", name: "Advent Grid" },
    { id: "activities", name: "Daily Activities" },
    { id: "kids", name: "Kids Countdown" },
    { id: "minimal", name: "Minimal" },
  ],
  defaultVariant: "advent",
  allowIcons: true,
  render: (s) => {
    const w = 215.9, h = 279.4;
    const startX = 15, startY = 90, cols = 5, cell = (w - startX * 2) / cols;
    return (
      <>
        <rect x={6} y={6} width={w - 12} height={h - 12} rx={3}
          fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={1.2} />
        <IconAt state={s} x={w / 2} y={40} size={30} />
        <text x={w / 2} y={68} textAnchor="middle" fontFamily={s.font.css}
          fontSize={14} fill={s.theme.accent} fontWeight={900}>
          {s.primaryText.slice(0, 34)}
        </text>
        <text x={w / 2} y={78} textAnchor="middle" fontFamily={s.font.css}
          fontSize={5} fill={s.theme.muted}>{s.secondaryText.slice(0, 70)}</text>
        {Array.from({ length: 31 }).map((_, i) => {
          const day = i + 1;
          const r = Math.floor(i / cols), c = i % cols;
          const x = startX + c * cell, y = startY + r * cell;
          const isHalloween = day === 31;
          return (
            <g key={i}>
              <rect x={x + 1} y={y + 1} width={cell - 2} height={cell - 2} rx={2}
                fill={isHalloween ? s.theme.accent : s.theme.bg}
                stroke={s.theme.accent} strokeWidth={0.6} />
              <text x={x + cell / 2} y={y + cell / 2 + 2} textAnchor="middle"
                fontFamily={s.font.css} fontSize={cell * 0.35}
                fill={isHalloween ? s.theme.bg : s.theme.fg} fontWeight={800}>
                {day}
              </text>
              {isHalloween && (
                <text x={x + cell / 2} y={y + cell - 3} textAnchor="middle"
                  fontFamily={s.font.css} fontSize={3} fill={s.theme.bg} fontWeight={700}>
                  🎃 BOO!
                </text>
              )}
            </g>
          );
        })}
        <text x={w / 2} y={h - 10} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.muted}>
          Cross off a box each day of October · HalloweenTools.com
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 13. TRICK-OR-TREAT DOOR SIGN / POSTER                              */
/* ------------------------------------------------------------------ */
export const trickOrTreatSignConfig: PrintableConfig = {
  toolSlug: "trick-or-treat-poster-generator",
  title: "Trick-or-Treat Door Sign",
  widthMm: 215.9, heightMm: 279.4,
  paperSize: "letter", orientation: "portrait",
  primaryText: "OUT OF CANDY",
  secondaryText: "Help yourself — one per ghoul, please!",
  variants: [
    { id: "out", name: "Out of Candy" },
    { id: "help", name: "Help Yourself" },
    { id: "welcome", name: "Welcome Trick-or-Treaters" },
    { id: "closed", name: "Sorry, Closed" },
    { id: "allergy", name: "Allergy-Friendly Stop" },
    { id: "kids", name: "Kids Only" },
    { id: "teal", name: "Teal Pumpkin Project" },
  ],
  defaultVariant: "out",
  allowIcons: true,
  render: (s) => {
    const w = 215.9, h = 279.4;
    return (
      <>
        <rect x={0} y={0} width={w} height={h} fill={s.theme.bg} />
        <rect x={10} y={10} width={w - 20} height={h - 20} rx={4}
          fill="none" stroke={s.theme.accent} strokeWidth={1.5} />
        <rect x={16} y={16} width={w - 32} height={h - 32} rx={2}
          fill="none" stroke={s.theme.accent} strokeWidth={0.3} strokeDasharray="3 2" />
        <IconAt state={s} x={w / 2} y={70} size={70} />
        <text x={w / 2} y={140} textAnchor="middle" fontFamily={s.font.css}
          fontSize={30} fill={s.theme.accent} fontWeight={900}>
          {s.primaryText.slice(0, 24)}
        </text>
        <line x1={w / 2 - 45} y1={150} x2={w / 2 + 45} y2={150}
          stroke={s.theme.accent} strokeWidth={0.8} />
        <text x={w / 2} y={172} textAnchor="middle" fontFamily={s.font.css}
          fontSize={11} fill={s.theme.fg}>
          {s.secondaryText.slice(0, 40)}
        </text>
        {s.variant === "teal" && (
          <text x={w / 2} y={195} textAnchor="middle" fontFamily={s.font.css}
            fontSize={7} fill={s.theme.muted}>
            Non-food treats available — allergy-friendly stop 💙
          </text>
        )}
        <g transform={`translate(${w / 2}, ${h - 60})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={s.font.css}
            fontSize={6} fill={s.theme.muted} letterSpacing="2">
            HAPPY HALLOWEEN
          </text>
        </g>
        <text x={w / 2} y={h - 18} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.muted}>
          Free printable door sign · HalloweenTools.com
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 14. PUMPKIN GUESSING GAME SHEET                                    */
/* ------------------------------------------------------------------ */
export const pumpkinGuessConfig: PrintableConfig = {
  toolSlug: "pumpkin-guessing-game-generator",
  title: "Pumpkin Guessing Game Sheet",
  widthMm: 215.9, heightMm: 279.4,
  paperSize: "letter", orientation: "portrait",
  primaryText: "GUESS THE PUMPKIN'S WEIGHT",
  secondaryText: "Closest guess wins the pumpkin!",
  variants: [
    { id: "weight", name: "Guess the Weight" },
    { id: "seeds", name: "Guess the Seeds" },
    { id: "candy", name: "Guess the Candy Count" },
    { id: "circumference", name: "Guess the Circumference" },
  ],
  defaultVariant: "weight",
  allowIcons: true,
  render: (s) => {
    const w = 215.9, h = 279.4;
    const unit =
      s.variant === "weight" ? "lbs" :
      s.variant === "seeds" ? "seeds" :
      s.variant === "candy" ? "candies" : "inches";
    const rows = 20;
    const rowY0 = 100, rowH = (h - rowY0 - 30) / rows;
    return (
      <>
        <rect x={6} y={6} width={w - 12} height={h - 12} rx={3}
          fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={1.2} />
        <IconAt state={s} x={30} y={34} size={22} />
        <IconAt state={s} x={w - 30} y={34} size={22} />
        <text x={w / 2} y={38} textAnchor="middle" fontFamily={s.font.css}
          fontSize={13} fill={s.theme.accent} fontWeight={900}>
          {s.primaryText.slice(0, 34)}
        </text>
        <text x={w / 2} y={52} textAnchor="middle" fontFamily={s.font.css}
          fontSize={6} fill={s.theme.fg}>
          {s.secondaryText.slice(0, 70)}
        </text>
        <text x={w / 2} y={62} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4.5} fill={s.theme.muted}>
          Write your name and your best guess in {unit}. Closest without going over wins!
        </text>
        {/* header row */}
        <rect x={12} y={rowY0 - 10} width={w - 24} height={9}
          fill={s.theme.accent} />
        <text x={20} y={rowY0 - 3} fontFamily={s.font.css} fontSize={5}
          fill={s.theme.bg} fontWeight={800}>#</text>
        <text x={40} y={rowY0 - 3} fontFamily={s.font.css} fontSize={5}
          fill={s.theme.bg} fontWeight={800}>NAME</text>
        <text x={w - 60} y={rowY0 - 3} fontFamily={s.font.css} fontSize={5}
          fill={s.theme.bg} fontWeight={800}>GUESS ({unit})</text>
        {Array.from({ length: rows }).map((_, i) => {
          const y = rowY0 + i * rowH;
          return (
            <g key={i}>
              <line x1={12} y1={y + rowH} x2={w - 12} y2={y + rowH}
                stroke={s.theme.muted} strokeWidth={0.3} />
              <line x1={30} y1={y} x2={30} y2={y + rowH}
                stroke={s.theme.muted} strokeWidth={0.3} />
              <line x1={w - 70} y1={y} x2={w - 70} y2={y + rowH}
                stroke={s.theme.muted} strokeWidth={0.3} />
              <text x={20} y={y + rowH * 0.65} textAnchor="middle"
                fontFamily={s.font.css} fontSize={4.5} fill={s.theme.muted}>
                {i + 1}
              </text>
            </g>
          );
        })}
        <text x={w / 2} y={h - 12} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.muted}>
          Free printable party game · HalloweenTools.com
        </text>
      </>
    );
  },
};

/* ------------------------------------------------------------------ */
/* 15. SCAVENGER HUNT CARD                                            */
/* ------------------------------------------------------------------ */
const SCAVENGER_ITEMS = [
  "A carved pumpkin","A house with orange lights","A black cat","A spider web",
  "A skeleton","A ghost decoration","A witch costume","A superhero costume",
  "A princess costume","A pirate","A house with fog","A tombstone",
  "A bat decoration","A jack-o'-lantern smiling","A full-size candy bar","A neighbor's dog in costume",
  "Purple string lights","A haunted mailbox","Candy corn","A scarecrow",
];
export const scavengerHuntConfig: PrintableConfig = {
  toolSlug: "halloween-scavenger-hunt-generator",
  title: "Halloween Scavenger Hunt Card",
  widthMm: 140, heightMm: 200,
  paperSize: "letter", orientation: "portrait",
  primaryText: "HALLOWEEN SCAVENGER HUNT",
  secondaryText: "Check each spooky sight you find tonight!",
  variants: [
    { id: "trick-or-treat", name: "Trick-or-Treat Hunt" },
    { id: "neighborhood", name: "Neighborhood Hunt" },
    { id: "classroom", name: "Classroom Hunt" },
    { id: "party", name: "Party Hunt" },
  ],
  defaultVariant: "trick-or-treat",
  allowIcons: true,
  tilesPerSheet: 2,
  render: (s) => {
    const w = 140, h = 200;
    const userItems = s.secondaryText
      .split("\n").map(x => x.trim()).filter(Boolean);
    const items = userItems.length >= 8
      ? userItems.slice(0, 14)
      : seededShuffle(SCAVENGER_ITEMS, s.primaryText + s.variant).slice(0, 14);
    const listY0 = 55;
    const rowH = (h - listY0 - 18) / items.length;
    return (
      <>
        <rect x={3} y={3} width={w - 6} height={h - 6} rx={3}
          fill={s.theme.bg} stroke={s.theme.accent} strokeWidth={1} />
        <IconAt state={s} x={14} y={20} size={16} />
        <IconAt state={s} x={w - 14} y={20} size={16} />
        <text x={w / 2} y={22} textAnchor="middle" fontFamily={s.font.css}
          fontSize={9} fill={s.theme.accent} fontWeight={900}>
          {s.primaryText.slice(0, 30)}
        </text>
        <text x={w / 2} y={32} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4.5} fill={s.theme.muted}>
          {userItems.length >= 8
            ? "Check each item you find:"
            : "Check each spooky sight you find tonight!"}
        </text>
        <line x1={20} y1={40} x2={w - 20} y2={40}
          stroke={s.theme.accent} strokeWidth={0.4} />
        {items.map((it, i) => {
          const y = listY0 + i * rowH;
          return (
            <g key={i}>
              <rect x={10} y={y} width={5} height={5} rx={0.5}
                fill="none" stroke={s.theme.fg} strokeWidth={0.5} />
              <text x={20} y={y + 4.5} fontFamily={s.font.css} fontSize={5}
                fill={s.theme.fg}>{it.slice(0, 40)}</text>
            </g>
          );
        })}
        <rect x={10} y={h - 14} width={w - 20} height={8} rx={1}
          fill={s.theme.accent} />
        <text x={w / 2} y={h - 8} textAnchor="middle" fontFamily={s.font.css}
          fontSize={4} fill={s.theme.bg} fontWeight={700}>
          HalloweenTools.com · Free Printable
        </text>
      </>
    );
  },
};

export const ALL_PRINTABLES: PrintableConfig[] = [
  bannerConfig, cupcakeTopperConfig, giftTagConfig, labelConfig, treatBagConfig, partySignConfig,
  candyBarWrapperConfig, envelopeLinerConfig, ticketConfig, awardCertificateConfig,
  bingoCardConfig, countdownCalendarConfig, trickOrTreatSignConfig, pumpkinGuessConfig, scavengerHuntConfig,
];
