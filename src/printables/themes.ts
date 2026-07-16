import type { PrintableTheme, PrintableFont } from "./types";

export const PRINTABLE_THEMES: PrintableTheme[] = [
  { id: "classic-orange", name: "Classic Orange", bg: "#101010", fg: "#ffb64d", accent: "#ff7a1a", muted: "#3a2612", font: "'Creepster', system-ui, serif" },
  { id: "purple-witch", name: "Purple Witch", bg: "#180a2e", fg: "#f4e2ff", accent: "#a35bff", muted: "#3a1f66", font: "'Nosifer', system-ui, serif" },
  { id: "blood-moon", name: "Blood Moon", bg: "#1a0505", fg: "#ffe4b5", accent: "#c1121f", muted: "#4a0f1a", font: "'Bangers', system-ui, sans-serif" },
  { id: "pastel-boo", name: "Pastel Boo", bg: "#fff4e8", fg: "#3b1f42", accent: "#ff8fab", muted: "#f5cbd6", font: "'Fredoka', system-ui, sans-serif" },
  { id: "monochrome-ink", name: "Monochrome Ink", bg: "#f5f2ea", fg: "#111111", accent: "#111111", muted: "#c9c2b0", font: "'IM Fell English', Georgia, serif" },
  { id: "neon-rave", name: "Neon Rave", bg: "#050014", fg: "#f0f3ff", accent: "#39ff14", muted: "#1b0f4a", font: "'Bangers', system-ui, sans-serif" },
];

export const PRINTABLE_FONTS: PrintableFont[] = [
  { id: "creepster", name: "Creepster (Horror)", css: "'Creepster', system-ui, serif" },
  { id: "nosifer", name: "Nosifer (Bloody)", css: "'Nosifer', system-ui, serif" },
  { id: "bangers", name: "Bangers (Comic)", css: "'Bangers', system-ui, sans-serif" },
  { id: "fredoka", name: "Fredoka (Rounded)", css: "'Fredoka', system-ui, sans-serif" },
  { id: "imfell", name: "IM Fell English (Vintage)", css: "'IM Fell English', Georgia, serif" },
  { id: "special-elite", name: "Special Elite (Typewriter)", css: "'Special Elite', ui-monospace, monospace" },
];

export function getTheme(id: string) {
  return PRINTABLE_THEMES.find((t) => t.id === id) ?? PRINTABLE_THEMES[0];
}
export function getFont(id: string) {
  return PRINTABLE_FONTS.find((f) => f.id === id) ?? PRINTABLE_FONTS[0];
}
