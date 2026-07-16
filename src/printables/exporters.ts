import type { PaperSize, Orientation } from "./types";
import { PAPER_MM } from "./types";

/** Serialize an in-DOM svg node into standalone svg XML with computed styles inlined. */
export function svgToString(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  return new XMLSerializer().serializeToString(clone);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadSvg(svg: SVGSVGElement, filename: string) {
  const xml = svgToString(svg);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>${xml}`], { type: "image/svg+xml" });
  downloadBlob(blob, filename);
}

/** Rasterize an SVG element to a PNG/JPG blob at print DPI. */
export async function rasterizeSvg(
  svg: SVGSVGElement,
  { format = "png", dpi = 300, background }: { format?: "png" | "jpg"; dpi?: number; background?: string } = {},
): Promise<Blob> {
  const vb = svg.viewBox.baseVal;
  const widthMm = vb.width;
  const heightMm = vb.height;
  const pxPerMm = dpi / 25.4;
  const w = Math.round(widthMm * pxPerMm);
  const h = Math.round(heightMm * pxPerMm);

  const xml = svgToString(svg);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG image load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (background || format === "jpg") {
      ctx.fillStyle = background ?? "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        format === "jpg" ? "image/jpeg" : "image/png",
        format === "jpg" ? 0.92 : undefined,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadPng(svg: SVGSVGElement, filename: string) {
  const b = await rasterizeSvg(svg, { format: "png" });
  downloadBlob(b, filename);
}
export async function downloadJpg(svg: SVGSVGElement, filename: string) {
  const b = await rasterizeSvg(svg, { format: "jpg", background: "#ffffff" });
  downloadBlob(b, filename);
}

/**
 * Export a print-ready PDF. Uses pdf-lib (lazy-loaded).
 * If tilesPerSheet > 1, arranges the SVG in a grid on a single sheet
 * (great for cupcake toppers, tags, labels).
 */
export async function downloadPdf(
  svg: SVGSVGElement,
  filename: string,
  {
    paperSize = "letter",
    orientation = "portrait",
    tilesPerSheet = 1,
    background = "#ffffff",
  }: {
    paperSize?: PaperSize;
    orientation?: Orientation;
    tilesPerSheet?: number;
    background?: string;
  } = {},
) {
  const { PDFDocument } = await import("pdf-lib");
  // Rasterize once at print DPI.
  const png = await rasterizeSvg(svg, { format: "png", dpi: 300, background });
  const bytes = new Uint8Array(await png.arrayBuffer());

  const pdf = await PDFDocument.create();
  const paper = PAPER_MM[paperSize];
  const landscape = orientation === "landscape";
  const pageW = (landscape ? paper.h : paper.w) * 2.834645669; // mm -> pt
  const pageH = (landscape ? paper.w : paper.h) * 2.834645669;

  const page = pdf.addPage([pageW, pageH]);
  const img = await pdf.embedPng(bytes);

  // Compute grid.
  const cols = Math.max(1, Math.round(Math.sqrt(tilesPerSheet)));
  const rows = Math.max(1, Math.ceil(tilesPerSheet / cols));
  const marginPt = 20;
  const usableW = pageW - marginPt * 2;
  const usableH = pageH - marginPt * 2;

  if (tilesPerSheet <= 1) {
    // Fit the artwork with equal margins, preserving aspect ratio.
    const scale = Math.min(usableW / img.width, usableH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    page.drawImage(img, {
      x: (pageW - w) / 2,
      y: (pageH - h) / 2,
      width: w,
      height: h,
    });
  } else {
    const cellW = usableW / cols;
    const cellH = usableH / rows;
    const scale = Math.min(cellW / img.width, cellH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    for (let i = 0; i < tilesPerSheet; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = marginPt + c * cellW + (cellW - w) / 2;
      const y = pageH - marginPt - (r + 1) * cellH + (cellH - h) / 2;
      page.drawImage(img, { x, y, width: w, height: h });
    }
  }

  const out = await pdf.save();
  downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), filename);
}
