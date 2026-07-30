// Editorial team. Powers /authors, /authors/$slug, byline bios,
// and per-article Person schema for E-E-A-T signals.

export type Author = {
  slug: string;
  name: string;
  role: string;
  emoji: string; // stand-in avatar (no image dependency)
  shortBio: string;
  longBio: string;
  expertise: string[];
  sameAs: string[]; // profile URLs — powers Person `sameAs` schema
  updatedAt: string; // ISO date author profile was last reviewed
};

export const AUTHORS: Author[] = [
  {
    slug: "mira-halloway",
    name: "Mira Halloway",
    role: "Editor-in-Chief",
    emoji: "🕯️",
    shortBio:
      "12+ years covering seasonal culture, DIY, and creator tools. Runs the HalloweenTools editorial desk.",
    longBio:
      "Mira leads editorial at HalloweenTools.com. She's spent more than a decade writing about seasonal culture, party planning, and creative software — previously covering DIY and lifestyle beats for national outlets. Every guide and tool page on the site passes through her review before publishing. Mira sets our sourcing standards, fact-checking policy, and the annual costume-trend tracker that shapes our recommendations.",
    expertise: [
      "Halloween trends & culture",
      "Editorial standards",
      "Content review & fact-checking",
      "Party planning",
    ],
    sameAs: [
      "https://twitter.com/HalloweenTools",
    ],
    updatedAt: "2026-07-01",
  },
  {
    slug: "dev-okafor",
    name: "Dev Okafor",
    role: "Head of AI Tools",
    emoji: "🪄",
    shortBio:
      "Builds and audits every AI generator on HalloweenTools. Focus: prompt design, safety, and output quality.",
    longBio:
      "Dev leads AI tool development at HalloweenTools. He designs and audits the prompt pipelines behind every generator on the site — from costume ideas to scary stories — and is responsible for output quality, safety filters, and the model-selection layer. Dev has 8+ years shipping production AI features and previously led applied-ML teams at consumer software companies.",
    expertise: [
      "LLM prompt engineering",
      "AI safety & content moderation",
      "Generator UX",
      "Model evaluation",
    ],
    sameAs: [],
    updatedAt: "2026-07-01",
  },
  {
    slug: "priya-shah",
    name: "Priya Shah",
    role: "Senior Design Writer",
    emoji: "🎨",
    shortBio:
      "Graphic designer turned writer. Covers every design tool on the site — cards, posters, invites, banners.",
    longBio:
      "Priya is a working graphic designer with a decade of print and digital experience. She writes the tutorials, template libraries, and best-practice guides behind our design tools. Her work informs how we style templates, choose accessible colour palettes, and export print-ready files. Priya reviews every design tool on HalloweenTools annually and updates recommendations to match current print and social specs.",
    expertise: [
      "Print & digital design",
      "Typography",
      "Colour accessibility",
      "Template systems",
    ],
    sameAs: [],
    updatedAt: "2026-07-01",
  },
  {
    slug: "sam-reyes",
    name: "Sam Reyes",
    role: "Kids & Classroom Editor",
    emoji: "🍎",
    shortBio:
      "Former K-6 teacher. Reviews every kid-facing tool, printable, and classroom guide on the site.",
    longBio:
      "Sam taught elementary school for eight years before joining HalloweenTools. They review every kid-facing tool, printable, and classroom guide on the site with two lenses: age-appropriate content and real classroom feasibility. Their sign-off is required before we publish any 'for kids', 'for teachers', or 'for classrooms' page.",
    expertise: [
      "Age-appropriate content",
      "Classroom activities",
      "Elementary curriculum",
      "Family-friendly design",
    ],
    sameAs: [],
    updatedAt: "2026-07-01",
  },
  {
    slug: "casey-larsen",
    name: "Casey Larsen",
    role: "Party & Events Correspondent",
    emoji: "🥳",
    shortBio:
      "Professional event planner. Writes our party planning, hosting, and invitation guides.",
    longBio:
      "Casey has been a professional event planner for 11 years, running everything from 20-person dinner parties to 400-person seasonal galas. On HalloweenTools they own the party-planning surface: the Party Planner tool, the hosting checklists, the invitation and RSVP guides. Every recommendation ships from real events they've run.",
    expertise: [
      "Event planning",
      "Party logistics",
      "Menu design",
      "Guest management",
    ],
    sameAs: [],
    updatedAt: "2026-07-01",
  },
];

export function getAuthor(slug: string): Author | null {
  return AUTHORS.find((a) => a.slug === slug) ?? null;
}

export function allAuthorSlugs(): string[] {
  return AUTHORS.map((a) => a.slug);
}

/** Choose a plausible reviewer for a given topic — used on tool pages. */
export function authorForCategory(category: string): Author {
  const map: Record<string, string> = {
    AI: "dev-okafor",
    "AI Generators": "dev-okafor",
    Design: "priya-shah",
    Party: "casey-larsen",
    Printables: "sam-reyes",
    Pumpkin: "mira-halloway",
    Social: "mira-halloway",
    Images: "priya-shah",
  };
  return getAuthor(map[category] ?? "mira-halloway")!;
}

export function personJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.shortBio,
    knowsAbout: author.expertise,
    url: `/authors/${author.slug}`,
    sameAs: author.sameAs.length ? author.sameAs : undefined,
    worksFor: {
      "@type": "Organization",
      name: "HalloweenTools",
      url: "/",
    },
  };
}
