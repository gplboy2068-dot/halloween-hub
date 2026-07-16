import type { IconId } from "./types";

/**
 * All icons render inside a 100x100 viewBox and use `currentColor` so
 * the parent SVG can theme them via `color=...` or the `fill` attribute.
 */
export const ICON_PATHS: Record<IconId, string> = {
  pumpkin:
    "M50 20c-3-7-9-10-14-8 4 2 6 6 6 10-8-4-20-1-26 8-8 12-5 34 6 46 10 11 26 12 34 12s24-1 34-12c11-12 14-34 6-46-6-9-18-12-26-8 0-4 2-8 6-10-5-2-11 1-14 8z",
  ghost:
    "M50 10c-18 0-30 14-30 32v42c0 3 4 5 6 2l6-6 8 6 8-6 8 6 8-6 6 6c2 3 6 1 6-2V42C80 24 68 10 50 10zM40 40a5 5 0 110 10 5 5 0 010-10zm20 0a5 5 0 110 10 5 5 0 010-10z",
  bat:
    "M50 40l-4-6-8 2-10-8-6 4 4 10-10 6 8 6-4 10 12-2 6 8 12-8 6 8 12-2-4-10 8-6-10-6 4-10-6-4-10 8-8-2z",
  witch:
    "M20 80l30-60 8 20 8-6 4 12 20 4-20 8-6 12z",
  spider:
    "M50 40a12 12 0 100 24 12 12 0 000-24zM32 50l-16-6M32 60l-14 8M68 50l16-6M68 60l14 8M42 34l-8-16M58 34l8-16M42 68l-8 16M58 68l8 16",
  cauldron:
    "M20 55h60l-4 25c-1 6-6 10-12 10H36c-6 0-11-4-12-10zM15 50h70v6H15zM40 45c-2-6 2-10 5-10s5 4 5 8",
  skull:
    "M50 15c-20 0-32 14-32 32 0 10 4 18 10 22v10c0 3 3 5 6 5h32c3 0 6-2 6-5V69c6-4 10-12 10-22 0-18-12-32-32-32zM38 40a6 6 0 110 12 6 6 0 010-12zm24 0a6 6 0 110 12 6 6 0 010-12zM44 60l6 8 6-8z",
  candy:
    "M20 50l10-8c4-3 10-3 14 0l20 16c4 3 10 3 14 0l10-8-8 20-14-6-20 6-14-6z",
  moon:
    "M60 15C40 15 25 32 25 52s15 37 35 37c8 0 15-2 21-6-20-2-35-19-35-38S46 9 66 7c-2-1-4 8-6 8z",
  tomb:
    "M25 85V45c0-14 11-25 25-25s25 11 25 25v40zM35 55h30M35 65h30",
  cat:
    "M30 45l6-20 12 12h4l12-12 6 20-4 30c-1 8-7 12-14 12h-8c-7 0-13-4-14-12zM40 55a3 3 0 110 6 3 3 0 010-6zm20 0a3 3 0 110 6 3 3 0 010-6z",
  web:
    "M50 10v80M10 50h80M20 20l60 60M80 20L20 80",
};

export const ICON_LIST: { id: IconId; label: string; emoji: string }[] = [
  { id: "pumpkin", label: "Pumpkin", emoji: "🎃" },
  { id: "ghost", label: "Ghost", emoji: "👻" },
  { id: "bat", label: "Bat", emoji: "🦇" },
  { id: "witch", label: "Witch", emoji: "🧙" },
  { id: "spider", label: "Spider", emoji: "🕷️" },
  { id: "cauldron", label: "Cauldron", emoji: "🍯" },
  { id: "skull", label: "Skull", emoji: "💀" },
  { id: "candy", label: "Candy", emoji: "🍬" },
  { id: "moon", label: "Moon", emoji: "🌙" },
  { id: "tomb", label: "Tomb", emoji: "🪦" },
  { id: "cat", label: "Black Cat", emoji: "🐈‍⬛" },
  { id: "web", label: "Web", emoji: "🕸️" },
];

export function IconSvg({
  id,
  color = "currentColor",
  stroke = false,
}: {
  id: IconId;
  color?: string;
  stroke?: boolean;
}) {
  const d = ICON_PATHS[id];
  return (
    <path
      d={d}
      fill={stroke ? "none" : color}
      stroke={stroke ? color : "none"}
      strokeWidth={stroke ? 3 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
