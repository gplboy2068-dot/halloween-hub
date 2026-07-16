export type PaperSize = "letter" | "a4";
export type Orientation = "portrait" | "landscape";

export const PAPER_MM: Record<PaperSize, { w: number; h: number }> = {
  letter: { w: 215.9, h: 279.4 },
  a4: { w: 210, h: 297 },
};

export type PrintableTheme = {
  id: string;
  name: string;
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  font: string; // css font-family
};

export type PrintableFont = {
  id: string;
  name: string;
  css: string;
};

export type IconId =
  | "pumpkin"
  | "ghost"
  | "bat"
  | "witch"
  | "spider"
  | "cauldron"
  | "skull"
  | "candy"
  | "moon"
  | "tomb"
  | "cat"
  | "web";

export type PrintableConfig = {
  toolSlug: string;
  title: string; // for exports
  /** SVG viewBox width in mm (unit-of-truth). */
  widthMm: number;
  heightMm: number;
  paperSize: PaperSize;
  orientation: Orientation;
  /** Default primary text. */
  primaryText: string;
  secondaryText?: string;
  /** Preset shape variants specific to the tool. */
  variants: { id: string; name: string }[];
  defaultVariant: string;
  /** Whether to show icon picker. */
  allowIcons: boolean;
  /** Render function drawing the printable inside a fixed-size SVG. */
  render: (state: PrintableState) => React.ReactNode;
  /** How many tiles to arrange on a print sheet (for tags/toppers/labels). */
  tilesPerSheet?: number;
};

export type PrintableState = {
  theme: PrintableTheme;
  font: PrintableFont;
  primaryText: string;
  secondaryText: string;
  variant: string;
  icon: IconId;
  paperSize: PaperSize;
  orientation: Orientation;
};
