# Halloween Printable Generator System — Build Plan

Ship a production-ready printable system across 6 tools with a shared editor, live preview, multi-format export, admin management, and SEO. Reuses existing HalloweenTools design tokens (orange/purple/black), the tools registry pattern, `LegalDoc`-style long-form content, and the admin shell.

## 1. Shared foundation (`src/printables/`)

Reusable, so every generator is thin config.

- `types.ts` — `PrintableTemplate`, `PrintableTheme`, `IconAsset`, `FontOption`, `PaperSize` (A4/Letter × portrait/landscape), `PrintableDoc` (layers: text, icon, shape, image), history stacks.
- `themes.ts` — curated palettes: Classic Orange, Purple Witch, Blood Moon, Pastel Boo, Monochrome Ink, Neon Rave. Each = bg, fg, accent, muted, font stack.
- `fonts.ts` — Google font pairs (Creepster, Nosifer, Bangers, Fredoka, Special Elegant, IM Fell). Loaded via `<link>` in `__root.tsx` head (Tailwind v4 rule).
- `icons.tsx` — inline SVG library: pumpkin, ghost, bat, witch, spider, cauldron, skull, candy, moon, tombstone, cat, web. Each an exportable React component + raw SVG string for export.
- `editor/PrintableEditor.tsx` — canvas + right-side controls. Uses HTML/SVG (not `<canvas>`) so text is crisp at any DPI.
  - Live preview via CSS `transform: scale()` matching selected paper size at 96dpi.
  - Zoom slider, undo/redo (history array + pointer), reset.
  - Panels: Theme, Colors, Fonts, Icons, Text, Layout, Paper.
- `editor/exporters.ts`
  - **SVG**: serialize the preview `<svg>` node.
  - **PNG/JPG**: rasterize SVG via `<img>` + offscreen canvas at print DPI (300).
  - **PDF**: `pdf-lib` — embed the SVG-rendered PNG onto A4/Letter page with correct mm sizing, or draw text/shapes vector-native for text-heavy tags/labels. Install `pdf-lib`.
  - **Print**: `window.print()` with a scoped `@media print` stylesheet.
- `editor/ShareBar.tsx` — reuses existing `ShareGenerationButton` pattern.
- `PrintableToolPage.tsx` — page shell: Breadcrumbs, H1, editor, then long-form SEO sections + FAQ + related.

## 2. The 6 generators (`src/printables/tools/`)

Each is ~80 lines of config wired into the shared editor: default layers, allowed shapes, size presets, theme defaults, FAQ set.

1. `banner.tsx` — pennant strip layout, per-letter tiles, string cutting guides.
2. `cupcake-topper.tsx` — 2" circles / squares / scalloped, grid of 12 per sheet.
3. `gift-tag.tsx` — 2.5×3.5" tags with hole marker, custom message, name field.
4. `label.tsx` — sizes: candy, bottle wrap, jar, mason, small food.
5. `treat-bag.tsx` — foldable topper + bag-front label, dieline guide.
6. `party-sign.tsx` — 8.5×11 poster; presets: Welcome, Rules, Candy Bar, Photo Booth, Bathroom, Exit, Parking, Directional, Custom.

Register in `src/tools/registry.ts` and add to `TOOLS` list in `src/lib/site.ts` under a new `Printables` category (so they auto-appear in `/tools`, `/categories`, sitemap, search).

## 3. Routes

Slugs (added under existing `/tools/$slug` — no new route file needed; registry handles it):
`printable-banner-generator`, `cupcake-topper-generator`, `gift-tag-generator`, `label-generator`, `treat-bag-generator`, `party-sign-generator`.

Each pulls SEO content (600–1000 words, "What this does / Benefits / How to use / Best use cases / Printing tips / Customization tips / FAQ / Related") from `src/lib/tool-content.ts` extensions.

## 4. SEO

- `SoftwareApplication` + `WebPage` + `BreadcrumbList` + `FAQPage` + `ImageObject` JSON-LD injected via existing `head()` pattern in `tools.$slug.tsx`.
- `head()` sets title, description, og:title, og:description, og:image (leaf-only), twitter:card, canonical.
- 12 FAQs per tool.
- Internal linking: related printables + related non-printable tools (from `src/lib/related.ts`) + related blog articles + category link + footer.
- Sitemap: extends via `TOOLS` list automatically; verify `sitemap[.]xml.ts` picks new slugs. Add to `public/llms.txt`.

## 5. Admin

New DB table `printable_templates` (title, slug, tool_slug, theme, doc_json, is_featured, sort). Managed via existing `EntityForm`/`EntityTable` pattern by extending `src/lib/entity-configs.ts`. Admin can pre-seed template presets shown as a "Start from template" strip inside the editor.

RLS: public read for `is_featured=true`, admin-only write via `has_role(uid, 'admin')`. GRANTs to anon (select), authenticated, service_role.

## 6. Design

Reuses tokens in `src/styles.css` (no changes). Orange/purple/black accents. Rounded 2xl cards, `shadow-elegant`, existing `ToolShell`. Editor panel: sticky right rail on desktop, bottom sheet on mobile.

## 7. Performance

- SVG-based preview (no heavy canvas lib).
- `pdf-lib` and rasterizer loaded lazily via dynamic `import()` on first export click.
- Fonts loaded once at root; icons are inline React components (tree-shakable).
- Editor state is local (no server round-trips).

## Technical section

**New files** (~15):
- `src/printables/types.ts`, `themes.ts`, `fonts.ts`, `icons.tsx`
- `src/printables/editor/PrintableEditor.tsx`, `exporters.ts`, `useHistory.ts`, `PrintPreview.tsx`
- `src/printables/PrintableToolPage.tsx`, `content.ts` (SEO copy + FAQ per slug)
- `src/printables/tools/{banner,cupcake-topper,gift-tag,label,treat-bag,party-sign}.tsx`

**Edited files**:
- `src/tools/registry.ts` — register 6 new slugs.
- `src/lib/site.ts` — 6 entries in `TOOLS`, new `printables` category.
- `src/lib/tool-content.ts` — long-form SEO blocks.
- `src/routes/tools.$slug.tsx` — inject FAQ/SoftwareApplication JSON-LD when slug is printable.
- `public/llms.txt` — add new slugs.
- `src/lib/entity-configs.ts` + admin routes pick up `printable_templates` automatically.

**Dependencies**: `bun add pdf-lib`.

**Migration**: `printable_templates` table with GRANTs + RLS + updated_at trigger.

**Non-goals (deferred, per your "future-ready" notes)**: logo upload, QR codes, crop marks. UI affordances present but disabled.

Shall I proceed with implementation?
