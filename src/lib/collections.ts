// Programmatic SEO: tool-collection landing pages.
// URL: /collections/$slug
// Each page targets a long-tail query like:
//   "free halloween tools for teachers"
//   "ai halloween generators"
//   "printable halloween activities"
// and lists a hand-curated subset of TOOLS with unique title, intro, FAQs,
// and structured data (ItemList + FAQPage + BreadcrumbList).
//
// This is a separate family from /ideas/* (idea lists) and /for/* (audience hubs).

import { TOOLS, type ToolCard } from "./site";

export type CollectionPage = {
  slug: string;
  h1: string;
  title: string; // <title>
  description: string; // meta description
  emoji: string;
  intro: string;
  bullets: string[]; // "what makes this list different" points
  toolSlugs: string[]; // curated ordered list
  faqs: { q: string; a: string }[];
};

const t = (slug: string): string => slug; // sugar

// ============================================================
// Modifier collections (theme / attribute)
// ============================================================
const THEME_COLLECTIONS: CollectionPage[] = [
  {
    slug: "free-halloween-tools",
    h1: "Free Halloween Tools",
    title: "27 Free Halloween Tools — No Signup, No Watermark",
    description: "The full catalogue of free Halloween tools on HalloweenTools.com. Generators, makers, planners — all free, all browser-based, no signup.",
    emoji: "🆓",
    intro:
      "Every tool on HalloweenTools.com is 100% free — no credit card, no signup, no watermark. This is the complete catalogue in one place: AI generators for costumes, captions, names and stories; design tools for cards, invites, posters and banners; and printable pumpkin and coloring resources. Bookmark this page — it's the fastest way to jump straight into whatever you need this Halloween.",
    bullets: [
      "No signup required — ever",
      "No watermark on any download",
      "Works on mobile, tablet and desktop",
      "New AI tools added throughout October",
    ],
    toolSlugs: TOOLS.map((tool) => tool.slug),
    faqs: [
      { q: "Are these Halloween tools really free?", a: "Yes — every tool on HalloweenTools.com is free forever, with no signup and no watermark on downloads." },
      { q: "Do I need to install anything?", a: "No. Everything runs in your browser on desktop, tablet or phone." },
      { q: "Can I use the outputs commercially?", a: "Yes — everything you generate is yours to use for personal or commercial projects." },
    ],
  },
  {
    slug: "ai-halloween-generators",
    h1: "AI Halloween Generators",
    title: "AI Halloween Generators — Free & Instant (2026)",
    description: "AI-powered Halloween generators for costumes, captions, scary stories, quotes, wishes and more. Free, instant, no signup.",
    emoji: "🪄",
    intro:
      "AI is the fastest way to nail Halloween content this year — from costume brainstorms to on-trend captions to full scary stories. These generators use large language models under the hood but strip out the friction: no prompts to memorise, no accounts, no paywalls. Just pick the tool, drop in a couple of details, and get results that sound like a human wrote them.",
    bullets: [
      "Powered by modern LLMs — output actually reads well",
      "No prompt engineering required",
      "Regenerate as many times as you want, free",
      "Copy-paste ready for Instagram, TikTok, texts and group chats",
    ],
    toolSlugs: TOOLS.filter((tool) => tool.category === "AI").map((tool) => tool.slug),
    faqs: [
      { q: "Which AI powers these tools?", a: "We use modern large language models via our secure AI Gateway. The interface is tuned for Halloween so you don't need to write prompts." },
      { q: "Is the AI output original?", a: "Yes — every generation is fresh. We don't return pre-written lists." },
      { q: "Is there a usage limit?", a: "There is no per-user limit for casual use. Heavy or automated use may hit rate limits shared across visitors." },
    ],
  },
  {
    slug: "halloween-design-tools",
    h1: "Halloween Design Tools",
    title: "Halloween Design Tools — Cards, Posters, Invites & Banners",
    description: "Free Halloween design makers for cards, invitations, posters, banners, flyers and logos. Browser-based, no Photoshop needed.",
    emoji: "🎨",
    intro:
      "Skip the design software. These Halloween design tools let you produce print-ready cards, invitations, posters, banners, flyers and logos in your browser — with templates already themed for spooky season. Change the copy, adjust the colours, export a high-resolution image. That's the workflow.",
    bullets: [
      "Every template is Halloween-first, not a generic layout with a pumpkin dropped on top",
      "High-resolution export — print at home or send to a print shop",
      "No watermark, no signup",
      "Mobile-friendly editor",
    ],
    toolSlugs: TOOLS.filter((tool) => tool.category === "Design").map((tool) => tool.slug),
    faqs: [
      { q: "What resolution do exports come out at?", a: "High-resolution PNG suitable for both social use and home printing." },
      { q: "Can I upload my own images or fonts?", a: "Basic customisation is supported inline. For advanced brand fonts, download the export and layer in your own editor." },
    ],
  },
  {
    slug: "printable-halloween-tools",
    h1: "Printable Halloween Tools",
    title: "Printable Halloween Tools — Coloring Pages, Stencils & Templates",
    description: "Printable Halloween coloring pages, pumpkin stencils and templates. Free downloads, print-ready on standard paper.",
    emoji: "🖨️",
    intro:
      "Printable Halloween content is having a moment — coloring pages for classrooms, stencils for carving, templates for party favours. Everything here downloads as a print-ready file that works on a home printer with standard paper. Perfect for teachers, parents and hosts who want an offline activity that keeps hands busy.",
    bullets: [
      "Standard A4 / Letter printer paper works",
      "Black-and-white options to save ink",
      "Age-appropriate, classroom-safe designs",
      "New printables added weekly through October",
    ],
    toolSlugs: [
      "coloring-pages-generator",
      "pumpkin-template-generator",
      "pumpkin-carving-generator",
      "pumpkin-face-generator",
      "invitation-maker",
      "halloween-card-maker",
    ],
    faqs: [
      { q: "Do I need special paper to print these?", a: "No — standard printer paper works. Cardstock feels nicer if you have it." },
      { q: "Can I use these in a classroom?", a: "Yes — every printable is age-appropriate by default and free to use in classroom or homeschool settings." },
    ],
  },
  {
    slug: "halloween-social-media-tools",
    h1: "Halloween Social Media Tools",
    title: "Halloween Social Media Tools — Captions, Hashtags, Memes",
    description: "Halloween tools for Instagram, TikTok and Facebook: captions, hashtags, memes, profile pictures and share-ready visuals.",
    emoji: "📱",
    intro:
      "If Halloween lives on your feed, this is your toolkit. Generate captions that don't sound like a template, hashtags tuned for reach this week, memes with your own text, and profile pictures that fit the season. Every tool here is built for creators and casual posters who want to ship a great post in under 60 seconds.",
    bullets: [
      "Captions tuned to how people actually post on Halloween",
      "Hashtag mixes that combine reach + niche",
      "Meme editor with Halloween templates baked in",
      "Instant profile picture generator for October",
    ],
    toolSlugs: [
      "caption-generator",
      "hashtag-generator",
      "meme-generator",
      "ai-meme-image-generator",
      "profile-picture-generator",
      "avatar-generator",
      "sticker-generator",
    ],
    faqs: [
      { q: "Which platforms are the captions written for?", a: "The captions work on Instagram, TikTok, Facebook and Twitter. Pick the vibe (funny, spooky, wholesome) and the tool adapts." },
      { q: "Are the hashtags safe to use?", a: "Yes — we blend high-reach and niche tags to avoid the shadowban risk of banned-tag lists." },
    ],
  },
  {
    slug: "halloween-party-planning-tools",
    h1: "Halloween Party Planning Tools",
    title: "Halloween Party Planning Tools — Free Planners, Invites & Names",
    description: "Free Halloween party planning tools: party planner, invitation maker, party name generator, posters and banners.",
    emoji: "🎉",
    intro:
      "Every part of hosting a Halloween party — the name, the invite, the run-of-show, the decor — has a tool here. Start with the Party Planner to build a full plan (guest count, menu, timeline), then use the maker tools to design the invite, poster and banner in your event's colours. All free, all browser-based, all mobile-friendly for last-minute planning on the go.",
    bullets: [
      "Party plans scale from 4 guests to 100+",
      "Invitation, poster, banner and flyer makers with Halloween templates",
      "Party-name generator when you're stuck",
      "Copy-ready RSVP messages",
    ],
    toolSlugs: [
      "party-planner",
      "party-name-generator",
      "invitation-maker",
      "halloween-card-maker",
      "poster-maker",
      "banner-maker",
      "flyer-maker",
      "message-generator",
    ],
    faqs: [
      { q: "Can I plan a kid's Halloween party with this?", a: "Yes — the Party Planner asks about age and adjusts games, snacks and activities accordingly." },
      { q: "Are the invitations print-ready?", a: "Yes — every invitation exports as a high-resolution PNG that prints cleanly at home or via a print shop." },
    ],
  },
  {
    slug: "halloween-image-generators",
    h1: "Halloween Image Generators",
    title: "Halloween Image Generators — Wallpapers, Stickers, Avatars",
    description: "AI-powered Halloween image generators for wallpapers, stickers, avatars, profile pictures and coloring pages.",
    emoji: "🖼️",
    intro:
      "Original Halloween visuals in seconds — no stock photos, no design software. Generate phone wallpapers, desktop backgrounds, stickers, avatars, profile pictures and even printable coloring pages. Every image is created fresh by AI and yours to download without a watermark.",
    bullets: [
      "Wallpapers sized for iPhone, Android, iPad and desktop",
      "Stickers with transparent backgrounds",
      "Avatars and profile pictures tuned for October",
      "No watermark on any download",
    ],
    toolSlugs: [
      "wallpaper-generator",
      "sticker-generator",
      "avatar-generator",
      "profile-picture-generator",
      "coloring-pages-generator",
      "ai-meme-image-generator",
      "pumpkin-carving-generator",
    ],
    faqs: [
      { q: "Can I use the images commercially?", a: "Yes — the outputs are yours for personal and commercial use." },
      { q: "What resolution do the images generate at?", a: "High resolution — suitable for social posts, phone wallpapers and print." },
    ],
  },
];

// ============================================================
// Audience × modifier collections (long-tail combos)
// ============================================================
type AudienceCombo = {
  slug: string;
  audience: string;
  audienceLower: string;
  emoji: string;
  toolSlugs: string[];
  extraIntro?: string;
};

const AUDIENCE_COMBOS: AudienceCombo[] = [
  {
    slug: "halloween-tools-for-teachers",
    audience: "Teachers",
    audienceLower: "teachers",
    emoji: "🍎",
    toolSlugs: [
      "coloring-pages-generator",
      "pumpkin-template-generator",
      "scary-story-generator",
      "sticker-generator",
      "invitation-maker",
      "name-generator",
      "banner-maker",
      "message-generator",
    ],
    extraIntro:
      "Every tool below has been chosen with classroom rules in mind — non-scary defaults, printable outputs, and copy that stays safe for parent-of-the-class emails.",
  },
  {
    slug: "halloween-tools-for-kids",
    audience: "Kids",
    audienceLower: "kids",
    emoji: "🍬",
    toolSlugs: [
      "coloring-pages-generator",
      "pumpkin-face-generator",
      "pumpkin-template-generator",
      "sticker-generator",
      "avatar-generator",
      "name-generator",
      "halloween-card-maker",
    ],
    extraIntro:
      "Everything here is age-appropriate, printable, and low on scares — perfect for family activities, birthday parties and rainy-day fun in October.",
  },
  {
    slug: "halloween-tools-for-parents",
    audience: "Parents",
    audienceLower: "parents",
    emoji: "🎃",
    toolSlugs: [
      "party-planner",
      "invitation-maker",
      "coloring-pages-generator",
      "pumpkin-carving-generator",
      "halloween-card-maker",
      "costume-generator",
      "name-generator",
    ],
    extraIntro:
      "A parent-tested toolkit for the whole October run: plan the party, design the invite, print the coloring pages, brainstorm the costume, carve the pumpkin.",
  },
  {
    slug: "halloween-tools-for-couples",
    audience: "Couples",
    audienceLower: "couples",
    emoji: "🖤",
    toolSlugs: [
      "costume-generator",
      "caption-generator",
      "profile-picture-generator",
      "message-generator",
      "halloween-card-maker",
      "wallpaper-generator",
    ],
    extraIntro:
      "Coordinated costumes, matching profile pictures, and captions that sell the duo shot. This is the couples' toolkit for a photogenic October.",
  },
  {
    slug: "halloween-tools-for-teens",
    audience: "Teens",
    audienceLower: "teens",
    emoji: "🎃",
    toolSlugs: [
      "costume-generator",
      "hashtag-generator",
      "caption-generator",
      "profile-picture-generator",
      "avatar-generator",
      "meme-generator",
      "sticker-generator",
    ],
    extraIntro:
      "Trend-forward tools tuned for TikTok and Instagram — costume brainstorms, viral caption angles, meme-ready visuals, PFP generators.",
  },
  {
    slug: "halloween-tools-for-work",
    audience: "Work",
    audienceLower: "work",
    emoji: "💼",
    toolSlugs: [
      "party-name-generator",
      "message-generator",
      "caption-generator",
      "banner-maker",
      "invitation-maker",
      "poster-maker",
      "flyer-maker",
    ],
    extraIntro:
      "Office-safe by default: no gore, no controversy, and plenty of copy for that all-hands Slack message you've been putting off.",
  },
  {
    slug: "halloween-tools-for-small-business",
    audience: "Small Business",
    audienceLower: "small business",
    emoji: "🏪",
    toolSlugs: [
      "poster-maker",
      "flyer-maker",
      "banner-maker",
      "logo-maker",
      "halloween-card-maker",
      "invitation-maker",
      "caption-generator",
      "hashtag-generator",
    ],
    extraIntro:
      "Run a Halloween promo without a designer. Posters, flyers, banners and social copy — everything you need to launch a seasonal campaign in an afternoon.",
  },
  {
    slug: "halloween-tools-for-content-creators",
    audience: "Content Creators",
    audienceLower: "content creators",
    emoji: "🎬",
    toolSlugs: [
      "caption-generator",
      "hashtag-generator",
      "ai-prompt-generator",
      "meme-generator",
      "ai-meme-image-generator",
      "scary-story-generator",
      "wallpaper-generator",
      "sticker-generator",
    ],
    extraIntro:
      "Post-ready assets and copy for the whole month of October. Batch a week of content in an hour.",
  },
];

function audienceCombosToPages(): CollectionPage[] {
  return AUDIENCE_COMBOS.map((combo) => ({
    slug: combo.slug,
    h1: `Halloween Tools for ${combo.audience}`,
    title: `Halloween Tools for ${combo.audience} — Free & No Signup`,
    description: `The best free Halloween tools for ${combo.audienceLower}. AI generators, printables, party planning and design — all free, all browser-based.`,
    emoji: combo.emoji,
    intro:
      `Halloween looks different for ${combo.audienceLower}, and generic tools don't cut it. This page pulls together the free HalloweenTools resources that actually fit — pre-filtered so you skip straight to what works. ${combo.extraIntro ?? ""}`.trim(),
    bullets: [
      `Curated specifically for ${combo.audienceLower}`,
      "100% free — no signup, no watermark",
      "Every tool works on mobile",
      "New tools added throughout October",
    ],
    toolSlugs: combo.toolSlugs,
    faqs: [
      { q: `Are these Halloween tools free for ${combo.audienceLower}?`, a: "Yes — every tool on this page is free forever. No account, no watermark, no paywall." },
      { q: "Can I use the outputs commercially?", a: "Yes. Whatever you create is yours to use for personal or commercial projects." },
      { q: "Do these work on mobile?", a: "Yes — every tool is mobile-friendly and works in any modern browser." },
    ],
  }));
}

// ============================================================
// Public API
// ============================================================

let _cache: Map<string, CollectionPage> | null = null;

function buildAll(): CollectionPage[] {
  return [...THEME_COLLECTIONS, ...audienceCombosToPages()];
}

function ensureCache() {
  if (!_cache) _cache = new Map(buildAll().map((p) => [p.slug, p]));
  return _cache;
}

export function getCollectionPage(slug: string): CollectionPage | null {
  return ensureCache().get(slug) ?? null;
}

export function allCollectionSlugs(): string[] {
  return Array.from(ensureCache().keys());
}

export function allCollectionPages(): CollectionPage[] {
  return Array.from(ensureCache().values());
}

export function resolveToolsForCollection(page: CollectionPage): ToolCard[] {
  const bySlug = new Map(TOOLS.map((tool) => [tool.slug, tool]));
  return page.toolSlugs.map((slug) => bySlug.get(slug)).filter((x): x is ToolCard => Boolean(x));
}

// Suppress the unused sugar helper warning.
export const _t = t;
