// Programmatic SEO data + resolver.
// Two page families:
//   /ideas/$slug   -> long-tail idea list pages (costume ideas for X, decoration ideas for Y)
//   /for/$slug     -> audience hub pages (halloween for kids, teachers, couples...)
//
// Every combination below produces one indexable URL with unique title/meta,
// unique intro, unique list items, related tools, FAQ, and internal links.

import { TOOLS } from "./site";

// ============= /ideas/$slug =============

export type IdeaCategory = {
  key: string;
  noun: string; // "costume", "makeup", "decoration"
  emoji: string;
  intro: (audience: string, style: string) => string;
  items: (audience: string, style: string) => string[];
  relatedToolSlugs: string[];
};

export const AUDIENCES = [
  "kids", "toddlers", "teens", "adults", "couples", "groups", "families",
  "pets", "dogs", "cats", "seniors", "coworkers", "teachers", "students",
] as const;

export const STYLES = [
  "easy", "scary", "funny", "cute", "diy", "last-minute", "cheap", "elegant",
  "creative", "traditional", "modern", "spooky",
] as const;

export const IDEA_CATEGORIES: IdeaCategory[] = [
  {
    key: "costume-ideas",
    noun: "costume",
    emoji: "🧙",
    intro: (aud, style) =>
      `Looking for ${style} Halloween costume ideas for ${aud}? You're in the right cauldron. We've rounded up ${style} outfits that ${aud} actually want to wear — from throwbacks to trending picks — with tips on what to pair, where to shop, and how to DIY when the budget is tight. Every idea below is battle-tested for Halloween 2026 and works whether you're going trick-or-treating, hitting a party, or just posting for the 'gram.`,
    items: (aud, style) => [
      `${cap(style)} Vampire — a fresh spin on the classic, perfect for ${aud}`,
      `${cap(style)} Witch — with modern accessories that photograph well`,
      `Ghost with a Twist — ${style} take on the sheet costume, ${aud} edition`,
      `Pop-Culture Character — an on-trend ${style} pick recognizable to any crowd`,
      `Zombie Prom — makeup-heavy but wardrobe-simple, ${style} energy`,
      `Skeleton Chic — bodysuits + accents, works ${style} for ${aud}`,
      `Retro '80s Horror — nostalgic and ${style}`,
      `Fairytale Villain — dramatic, ${style}, screams "main character"`,
      `Devil Deluxe — subtle horns, ${style} styling`,
      `Grim Reaper Reimagined — cloak + statement piece, ${style} for ${aud}`,
      `Werewolf Rockstar — leather + prosthetics, ${style}`,
      `Cyberpunk Ghoul — LEDs and ${style} face paint`,
      `Fortune Teller — flowy layers, ${style} for ${aud}`,
      `Haunted Doll — porcelain makeup, ${style}`,
      `Movie-Villain Cosplay — pick one you love, execute it ${style}`,
    ],
    relatedToolSlugs: ["costume-generator", "avatar-generator", "profile-picture-generator", "meme-generator"],
  },
  {
    key: "makeup-ideas",
    noun: "makeup",
    emoji: "💄",
    intro: (aud, style) =>
      `Halloween makeup is where costumes come alive. Whether you're new to face paint or a seasoned SFX artist, these ${style} Halloween makeup ideas for ${aud} range from 10-minute glow-ups to full transformations. We highlight what products you need, what to skip, and how to make each look last through a full night of dancing, eating, and photos.`,
    items: (aud, style) => [
      `${cap(style)} Skeleton Face — the base for a hundred variations`,
      `Cracked-Porcelain Doll — ${style}, viral on TikTok`,
      `Deer with Antlers — floral + ${style}, softer aesthetic`,
      `Glam Vampire — dramatic contouring, ${style}`,
      `Half-Face Skull — cheat code for ${aud} short on time`,
      `Zombie Bride — pale + drippy, ${style}`,
      `Pop-Art Comic — bold outlines, ${style}`,
      `Cheshire Cat — vivid purples, ${style}`,
      `Fallen Angel — soft grunge, ${style}`,
      `Wounded Warrior — SFX cuts and bruises, ${style}`,
      `Neon Skeleton — UV paint, ${style} nightclub-ready`,
      `Butterfly Fae — jewels + gradient, ${style}`,
      `Corpse Bride — pale grey + blues, ${style}`,
      `Two-Face — one glam, one ghoul, ${style}`,
      `Space Alien — chrome + prosthetics, ${style}`,
    ],
    relatedToolSlugs: ["caption-generator", "hashtag-generator", "profile-picture-generator"],
  },
  {
    key: "decoration-ideas",
    noun: "decoration",
    emoji: "🕸️",
    intro: (aud, style) =>
      `Great Halloween decor doesn't need a Hollywood budget. These ${style} decoration ideas for ${aud} lean on lighting, layering, and clever swaps — the kind of tricks that make guests actually stop and take pictures. Mix a few of the ideas below and you'll have a room that photographs like a movie set.`,
    items: (_aud, style) => [
      `${cap(style)} entrance archway with hanging cobwebs and orange lights`,
      `Floating candles above the dining table (${style} DIY)`,
      `A "spellbook" library table with dusty spines and potion bottles`,
      `Glowing eyes in the shrubs — ${style} outdoor moment`,
      `Ghost curtain from cheesecloth — ${style} and reusable year after year`,
      `Pumpkin trail from mailbox to door, ${style} styled`,
      `Silhouette window cutouts of witches and cats — ${style}`,
      `Fog + uplighting the porch in purple/orange — ${style}`,
      `Apothecary shelf with hand-labeled potion bottles`,
      `Photo-booth corner with a frame prop and props table`,
      `Skeleton "family portraits" replacing your real ones — ${style}`,
      `Spider swarm crawling up one wall — ${style}`,
      `Tombstone garden in the front yard with LED candles`,
      `Bubbling cauldron with dry ice as a bar station`,
      `String-light constellation ceiling for the party area`,
    ],
    relatedToolSlugs: ["party-planner", "wallpaper-generator", "sticker-generator"],
  },
  {
    key: "food-ideas",
    noun: "food",
    emoji: "🍬",
    intro: (aud, style) =>
      `Halloween food should be fun to eat AND fun to photograph. These ${style} food ideas for ${aud} nail both. From apps to dessert to drinks, everything on this list can be made ahead so you actually get to enjoy your own party. Bookmark this — you'll thank yourself in October.`,
    items: (aud, _style) => [
      `Mummy hot dogs wrapped in crescent dough (${aud} love these)`,
      `Witch-finger breadsticks with almond "nails"`,
      `Jack-o'-lantern stuffed peppers`,
      `Spiderweb dip — 7-layer with a sour-cream web`,
      `Meringue ghost cookies`,
      `Blood-orange sangria (or non-alcoholic version)`,
      `Charcuterie board styled as a graveyard`,
      `Pumpkin soup shooters`,
      `Candy-apple bar — DIY with three coating options`,
      `Eyeball deviled eggs`,
      `Mac & cheese in mini pumpkins`,
      `Chocolate-dipped strawberry ghosts`,
      `Sushi "worms in dirt" for adventurous ${aud}`,
      `Poison-apple caramel apples with edible glitter`,
      `Pumpkin cheesecake bites`,
    ],
    relatedToolSlugs: ["party-planner", "invitation-maker"],
  },
  {
    key: "party-ideas",
    noun: "party",
    emoji: "🎉",
    intro: (aud, style) =>
      `The best Halloween parties feel like walking into a movie. These ${style} party ideas for ${aud} cover the whole arc: the theme, the moments that photograph, the games, the food beats, and the send-off. Pick five, mix them, and you've got an unforgettable night on the calendar.`,
    items: (aud, _style) => [
      `Pick ONE strong theme (haunted circus, vampire gala, film-noir) and lean in`,
      `Send a themed digital invite 3 weeks out — RSVPs matter for food`,
      `Curate a 3-hour playlist that shifts from spooky to danceable`,
      `Set up a signature drink with a theatrical garnish`,
      `Host a costume contest with SPECIFIC categories (funniest, best DIY, best duo)`,
      `Add a photo booth — even a corner with a bedsheet backdrop works`,
      `Run one interactive game: murder mystery, tarot readings, or trivia`,
      `Serve food buffet-style on labeled trays for the "menu" aesthetic`,
      `Dim ALL overhead lights; use lamps, candles, string lights only`,
      `Have a fog moment (dry ice or a $30 fog machine)`,
      `Prep candy bags as favors for ${aud} to take home`,
      `Assign a "designated storyteller" for a ghost-story break`,
      `Post-party thank-you: send a Halloween e-card the next day`,
    ],
    relatedToolSlugs: ["party-planner", "party-name-generator", "invitation-maker", "poster-maker"],
  },
  {
    key: "pumpkin-carving-ideas",
    noun: "pumpkin carving",
    emoji: "🎃",
    intro: (aud, style) =>
      `Ditch the triangle-eyes routine. These ${style} pumpkin carving ideas for ${aud} range from beginner-friendly (10 minutes with a Sharpie and a knife) to advanced multi-layer stencils. Each idea includes what tools you'll need, difficulty level, and how long it lasts before turning.`,
    items: (_aud, style) => [
      `${cap(style)} classic jack-o'-lantern — nail the fundamentals`,
      `Bat silhouettes flying across the pumpkin's face`,
      `Haunted-house cutout with a candle inside`,
      `Skull with jaw hinge — advanced but showstopping`,
      `Cat-in-the-moon silhouette`,
      `Cinderella-carriage pumpkin — statement piece`,
      `Cascading spider web across a white pumpkin`,
      `Portrait carving of a celebrity or family member (${style})`,
      `Text carving: your family name or a phrase`,
      `Constellation carving — pinpricks for stars, ${style}`,
      `3D relief carving without cutting through`,
      `Multiple pumpkins forming one scene (a graveyard, a coven)`,
      `Layered stencil with ${style} details`,
      `Painted-only pumpkin for younger ${aud}`,
      `Tiered pumpkin stack with a face on each`,
    ],
    relatedToolSlugs: ["pumpkin-carving-generator", "pumpkin-template-generator", "pumpkin-face-generator"],
  },
];

// ============= /for/$slug =============

export type AudiencePage = {
  slug: string;
  audience: string;
  emoji: string;
  hero: string;
  intro: string;
  sections: { heading: string; points: string[] }[];
  featuredToolSlugs: string[];
  ideaSlugs: string[]; // links into /ideas/*
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const AUDIENCE_PAGES: AudiencePage[] = [
  {
    slug: "halloween-for-kids",
    audience: "Kids",
    emoji: "🍬",
    hero: "Halloween for Kids",
    intro:
      "Kid-friendly Halloween is the sweetest gig in October. We've curated costume ideas, safe treats, easy crafts, and screen-free games that keep energy high without pushing the scare factor. Bookmark this page — every link below is chosen with 3–12 year olds in mind.",
    sections: [
      {
        heading: "Costume picks that WON'T stress you out",
        points: [
          "Store-bought base + one handmade accessory beats a full DIY",
          "Costumes with pants + a top layer travel better than one-piece jumpsuits",
          "Test the mask/face paint 3 days ahead — kids react differently to textures",
          "Have a warm base layer ready — October nights get cold",
        ],
      },
      {
        heading: "Party games that actually work",
        points: [
          "Pumpkin bowling with mini pumpkins and toilet-paper-roll pins",
          "Mummy wrap: teams of 3, one roll of TP, fastest full mummy wins",
          "Guess-the-goo bags (cooked spaghetti = brains)",
          "Musical monsters — like musical chairs with monster stomps",
        ],
      },
    ],
    featuredToolSlugs: ["coloring-pages-generator", "pumpkin-carving-generator", "sticker-generator", "avatar-generator"],
    ideaSlugs: ["costume-ideas-for-kids", "party-ideas-for-kids", "makeup-ideas-easy", "pumpkin-carving-ideas-easy"],
  },
  {
    slug: "halloween-for-couples",
    audience: "Couples",
    emoji: "🖤",
    hero: "Halloween for Couples",
    intro:
      "Couples' Halloween is the softball layup of the year — one great duo costume plus a themed night in beats any single-person outfit. This page has costume matchups (from iconic to punny), date-night ideas, and one-night party plans so the two of you can look coordinated without looking cheesy.",
    sections: [
      {
        heading: "The rule of coordinated, not identical",
        points: [
          "Pick a shared world (film, era, color story), not literally matching outfits",
          "One character carries the punchline, the other carries the setup",
          "Assign roles: who does the makeup, who does the photos, who does snacks",
        ],
      },
      {
        heading: "Date-night blueprint",
        points: [
          "Movie double feature: one classic, one new",
          "Themed cocktail + charcuterie for two",
          "Neighborhood decor walk before settling in",
          "Photo set at home with a phone tripod — you'll want the pictures next year",
        ],
      },
    ],
    featuredToolSlugs: ["costume-generator", "caption-generator", "profile-picture-generator", "message-generator"],
    ideaSlugs: ["costume-ideas-for-couples", "food-ideas-elegant", "makeup-ideas-cute", "party-ideas-cozy"],
  },
  {
    slug: "halloween-for-adults",
    audience: "Adults",
    emoji: "🧛",
    hero: "Halloween for Adults",
    intro:
      "Grown-up Halloween is having a moment. Whether you're planning a house party, going bar-crawling, or hosting a curated dinner, this page has costume references, cocktail formulas, decor styling, and playlist notes tuned for adults who want atmosphere over Amazon-in-a-bag.",
    sections: [
      {
        heading: "Style over shock",
        points: [
          "One elevated piece (a great cape, a real leather harness, a killer wig) carries the whole costume",
          "Skip mass-market — one weekend of thrift-store hunting = an unforgettable fit",
          "Set a dress code on the invite so guests know the vibe",
        ],
      },
      {
        heading: "The bar station",
        points: [
          "Two signature cocktails > full bar. One clear, one dark",
          "Batch everything except the garnish",
          "Non-alcoholic version of both — required, not optional",
        ],
      },
    ],
    featuredToolSlugs: ["party-planner", "poster-maker", "invitation-maker", "banner-maker"],
    ideaSlugs: ["costume-ideas-for-adults", "party-ideas-elegant", "food-ideas-elegant", "decoration-ideas-modern"],
  },
  {
    slug: "halloween-for-work",
    audience: "Work / Office",
    emoji: "💼",
    hero: "Halloween at Work",
    intro:
      "Office Halloween is the tightrope walk of costume culture: fun enough to be memorable, safe enough for HR. This page collects work-appropriate costume ideas, remote-team activities, and no-food-mess desk decor that adds spooky flair without inviting a formal complaint.",
    sections: [
      {
        heading: "Safe costume categories",
        points: [
          "Punny costumes (cereal killer, Netflix and chill)",
          "Movie characters everyone recognizes",
          "Themed teams — coordinate with a group so nobody stands out awkwardly",
          "Avoid gore, cultural imitation, and anything requiring a fake weapon",
        ],
      },
      {
        heading: "Remote-team activities",
        points: [
          "Zoom costume parade + a virtual prize",
          "Group scary-story writing prompt (5 min per person)",
          "Themed background contest",
          "Send everyone a small candy delivery via a mailer service",
        ],
      },
    ],
    featuredToolSlugs: ["party-name-generator", "message-generator", "caption-generator", "banner-maker"],
    ideaSlugs: ["costume-ideas-for-coworkers", "party-ideas-office", "food-ideas-easy", "decoration-ideas-cheap"],
  },
  {
    slug: "halloween-for-teachers",
    audience: "Teachers",
    emoji: "🍎",
    hero: "Halloween for Teachers",
    intro:
      "Classroom Halloween is high energy, high supervision, and high joy. This page pulls together lesson-adjacent activities, printable classroom decor, non-scary costume ideas, and quick-turnaround crafts sized for K-8. Everything here has been chosen to hold up in a real classroom, not just a Pinterest board.",
    sections: [
      {
        heading: "Costumes that pass the parent-email test",
        points: [
          "Book characters (Where the Wild Things Are, Harry Potter)",
          "Historical figures with a Halloween twist",
          "Punny professor costume (\"Doctor Strange curriculum\")",
          "Avoid masks — students need to see your face",
        ],
      },
      {
        heading: "Classroom activities that map to the curriculum",
        points: [
          "Pumpkin math: estimate seeds, measure, graph",
          "Halloween-themed writing prompts (5-sentence horror stories)",
          "Science: chemical reactions with baking-soda cauldrons",
          "Reading circle around a classic like Goosebumps",
        ],
      },
    ],
    featuredToolSlugs: ["coloring-pages-generator", "pumpkin-carving-generator", "scary-story-generator", "sticker-generator"],
    ideaSlugs: ["costume-ideas-for-teachers", "party-ideas-classroom", "decoration-ideas-easy", "food-ideas-easy"],
  },
  {
    slug: "halloween-for-teens",
    audience: "Teens",
    emoji: "🎃",
    hero: "Halloween for Teens",
    intro:
      "Teen Halloween is where the internet trends live. This page tracks what's viral on TikTok this season, group-costume ideas that actually photograph, and party plans that don't require anyone's parents. Everything is tuned for ages 13-19.",
    sections: [
      {
        heading: "What's trending in 2026",
        points: [
          "Dark academia group costumes",
          "\"Cracked porcelain\" makeup — 10-min transformation",
          "Retro Y2K horror aesthetic",
          "Duo-based punny costumes",
        ],
      },
      {
        heading: "Content-first party moves",
        points: [
          "Assign one person the DP role — better photos beat a bigger guest list",
          "Have a lighting corner set up (ring light + string lights)",
          "Curate 3 photo spots, not 10 — depth over breadth",
          "Post-party photo drop the next morning",
        ],
      },
    ],
    featuredToolSlugs: ["costume-generator", "hashtag-generator", "caption-generator", "profile-picture-generator"],
    ideaSlugs: ["costume-ideas-for-teens", "makeup-ideas-trending", "party-ideas-trendy", "food-ideas-easy"],
  },
  {
    slug: "halloween-for-pets",
    audience: "Pets",
    emoji: "🐾",
    hero: "Halloween for Pets",
    intro:
      "Pets should have opinions about their Halloween costumes — and this page respects that. We cover comfort-first costume design, safety-checked treats, and photo tips that get your dog or cat looking like a movie star without the tantrum. Skip anything constricting; look for velcro closures and breathable fabric.",
    sections: [
      {
        heading: "Fit + comfort rules",
        points: [
          "Nothing over the eyes or covering the mouth",
          "Fabric should be lightweight and non-shedding",
          "Do a 10-minute try-on 2 days before to gauge reaction",
          "Bring the costume off at any sign of stress",
        ],
      },
      {
        heading: "Photo tips",
        points: [
          "Bribe with treats, not commands",
          "Shoot fast — pets don't hold poses",
          "Natural light beats every ring light",
          "One good photo > ten mediocre ones",
        ],
      },
    ],
    featuredToolSlugs: ["profile-picture-generator", "avatar-generator", "caption-generator", "sticker-generator"],
    ideaSlugs: ["costume-ideas-for-pets", "costume-ideas-for-dogs", "costume-ideas-for-cats"],
  },
];

// ---------- Slug resolver for /ideas/$slug ----------

export type IdeaPage = {
  slug: string;
  category: IdeaCategory;
  audience: string;
  style: string;
  title: string;
  description: string;
};

// Build a compact set of "high-signal" combos rather than the cartesian product.
// This keeps the sitemap dense but not junk.
export function buildIdeaPages(): IdeaPage[] {
  const combos: IdeaPage[] = [];
  for (const cat of IDEA_CATEGORIES) {
    // per-audience pages: {cat.key}-for-{aud}
    for (const aud of AUDIENCES) {
      const slug = `${cat.key}-for-${aud}`;
      combos.push({
        slug,
        category: cat,
        audience: aud,
        style: "creative",
        title: `${cap(cat.noun)} Ideas for ${cap(aud)} (Halloween 2026)`,
        description: `Curated ${cat.noun} ideas for ${aud} this Halloween. Handpicked, on-trend for 2026, and easy to pull off.`,
      });
    }
    // per-style pages: {cat.key}-{style}
    for (const style of STYLES) {
      const slug = `${cat.key}-${style}`;
      combos.push({
        slug,
        category: cat,
        audience: "everyone",
        style,
        title: `${cap(style)} ${cap(cat.noun)} Ideas for Halloween 2026`,
        description: `${cap(style)} Halloween ${cat.noun} ideas that actually look good. Curated for 2026 with real photos, tutorials, and shopping tips.`,
      });
    }
  }
  return combos;
}

let _cache: Map<string, IdeaPage> | null = null;
export function getIdeaPage(slug: string): IdeaPage | null {
  if (!_cache) {
    _cache = new Map(buildIdeaPages().map((p) => [p.slug, p]));
  }
  return _cache.get(slug) ?? null;
}

export function allIdeaSlugs(): string[] {
  if (!_cache) _cache = new Map(buildIdeaPages().map((p) => [p.slug, p]));
  return Array.from(_cache.keys());
}

export function getAudiencePage(slug: string): AudiencePage | null {
  return AUDIENCE_PAGES.find((p) => p.slug === slug) ?? null;
}

export function resolveToolsForIdea(page: IdeaPage) {
  return TOOLS.filter((t) => page.category.relatedToolSlugs.includes(t.slug));
}

export function resolveToolsForAudience(page: AudiencePage) {
  return TOOLS.filter((t) => page.featuredToolSlugs.includes(t.slug));
}
