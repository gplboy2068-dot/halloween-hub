export const SITE = {
  name: "HalloweenTools",
  domain: "HalloweenTools.com",
  tagline: "The internet's biggest Halloween toolkit",
  description:
    "Free Halloween tools, AI generators, printables, wishes, quotes, pumpkin templates, and party ideas. Everything you need for a spooky season.",
};

export const NAV_LINKS = [
  { to: "/tools", label: "Tools" },
  { to: "/ideas", label: "Ideas" },
  { to: "/for", label: "For You" },
  { to: "/categories", label: "Categories" },
  { to: "/community", label: "Community" },
  { to: "/blog", label: "Blog" },
] as const;

export type ToolCard = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
};

export const TOOLS: ToolCard[] = [
  { slug: "halloween-card-maker", title: "Halloween Card Maker", description: "Design spooky greeting cards in seconds.", emoji: "🎃", category: "Design", featured: true, popular: true },
  { slug: "invitation-maker", title: "Invitation Maker", description: "Craft party invitations guests can't resist.", emoji: "💌", category: "Design", featured: true },
  { slug: "poster-maker", title: "Poster Maker", description: "Bold Halloween posters for any event.", emoji: "🖼️", category: "Design", popular: true },
  { slug: "banner-maker", title: "Banner Maker", description: "Web & social banners with a Halloween twist.", emoji: "🏴", category: "Design" },
  { slug: "flyer-maker", title: "Flyer Maker", description: "Print-ready flyers for parties and events.", emoji: "📄", category: "Design" },
  { slug: "logo-maker", title: "Logo Maker", description: "Instant Halloween-themed logos.", emoji: "👻", category: "Design" },
  { slug: "costume-generator", title: "Costume Generator", description: "AI-powered costume ideas tailored to you.", emoji: "🧙", category: "AI", featured: true, isNew: true },
  { slug: "name-generator", title: "Name Generator", description: "Spooky names for characters, pets, parties.", emoji: "🪦", category: "AI", popular: true },
  { slug: "caption-generator", title: "Caption Generator", description: "Instagram-ready Halloween captions.", emoji: "📝", category: "AI" },
  { slug: "quote-generator", title: "Quote Generator", description: "Chilling quotes for cards and posts.", emoji: "💀", category: "Wishes & Quotes" },
  { slug: "wish-generator", title: "Wish Generator", description: "Send heartfelt Halloween wishes.", emoji: "🌙", category: "Wishes & Quotes", featured: true },
  { slug: "message-generator", title: "Message Generator", description: "Custom Halloween messages.", emoji: "✉️", category: "Wishes & Quotes" },
  { slug: "party-planner", title: "Party Planner", description: "Plan the ultimate Halloween bash.", emoji: "🥳", category: "Party", featured: true },
  { slug: "party-name-generator", title: "Party Name Generator", description: "Name your Halloween party.", emoji: "🎉", category: "Party" },
  { slug: "pumpkin-carving-generator", title: "Pumpkin Carving Generator", description: "AI-generated carving patterns.", emoji: "🎃", category: "Pumpkin", popular: true, isNew: true },
  { slug: "pumpkin-template-generator", title: "Pumpkin Template Generator", description: "Printable pumpkin stencils.", emoji: "🕸️", category: "Pumpkin" },
  { slug: "pumpkin-face-generator", title: "Pumpkin Face Generator", description: "Design custom pumpkin faces.", emoji: "😈", category: "Pumpkin" },
  { slug: "wallpaper-generator", title: "Wallpaper Generator", description: "Halloween wallpapers for every device.", emoji: "📱", category: "Images" },
  { slug: "coloring-pages-generator", title: "Coloring Pages Generator", description: "Printable Halloween coloring pages.", emoji: "🖍️", category: "Printables" },
  { slug: "hashtag-generator", title: "Hashtag Generator", description: "Trending Halloween hashtags.", emoji: "#️⃣", category: "Social" },
  { slug: "ai-prompt-generator", title: "AI Prompt Generator", description: "Spooky prompts for AI art & writing.", emoji: "🪄", category: "AI" },
  { slug: "sticker-generator", title: "Sticker Generator", description: "Halloween stickers on demand.", emoji: "🩸", category: "Images" },
  { slug: "profile-picture-generator", title: "Profile Picture Generator", description: "Halloween-themed PFPs.", emoji: "🧛", category: "Images" },
  { slug: "avatar-generator", title: "Avatar Generator", description: "Custom Halloween avatars.", emoji: "🧟", category: "Images" },
  { slug: "scary-story-generator", title: "Scary Story Generator", description: "AI-crafted horror stories.", emoji: "📖", category: "AI", isNew: true },
  { slug: "meme-generator", title: "Meme Generator", description: "Halloween memes in one click.", emoji: "😂", category: "Social" },

  // Printable design tools
  { slug: "printable-banner-generator", title: "Printable Banner Generator", description: "Design a Halloween banner with custom letters, icons and colors — print-ready.", emoji: "🏳️", category: "Printables", featured: true, isNew: true },
  { slug: "cupcake-topper-generator", title: "Cupcake Topper Generator", description: "Print 12 spooky cupcake toppers per sheet in circle, square, hex or scalloped shapes.", emoji: "🧁", category: "Printables", isNew: true },
  { slug: "gift-tag-generator", title: "Gift Tag Generator", description: "Halloween gift, name and party-favor tags with custom messages.", emoji: "🎁", category: "Printables", isNew: true },
  { slug: "label-generator", title: "Label Generator", description: "Candy, bottle, jar and food labels in editable Halloween themes.", emoji: "🏷️", category: "Printables", popular: true, isNew: true },
  { slug: "treat-bag-generator", title: "Treat Bag Generator", description: "Foldable treat-bag toppers and party bag labels for trick-or-treaters.", emoji: "🍭", category: "Printables", isNew: true },
  { slug: "party-sign-generator", title: "Party Sign Generator", description: "Welcome, bathroom, candy-bar, exit and photo-booth signs — print in Letter or A4.", emoji: "📜", category: "Printables", isNew: true },
  { slug: "candy-bar-wrapper-generator", title: "Candy Bar Wrapper Generator", description: "Personalized Halloween candy bar wrappers sized for standard 1.55oz chocolate bars — party favors in minutes.", emoji: "🍫", category: "Printables", featured: true, isNew: true },
  { slug: "envelope-liner-generator", title: "Envelope Liner Generator", description: "Halloween envelope liners and sticker seals to pair with your invitations — A7 and A2 sizes.", emoji: "📮", category: "Printables", isNew: true },
  { slug: "halloween-ticket-generator", title: "Halloween Ticket Generator", description: "Perforated event, raffle, VIP and Admit One tickets with tear-off stubs — 5 per sheet.", emoji: "🎟️", category: "Printables", popular: true, isNew: true },
  { slug: "award-certificate-generator", title: "Costume Award Certificate Generator", description: "Best Costume, Scariest, Funniest and group awards — landscape Letter certificates ready to hand out.", emoji: "🏆", category: "Printables", isNew: true },
];

export const CATEGORIES = [
  { slug: "design", name: "Design", emoji: "🎨", description: "Cards, posters, flyers & more" },
  { slug: "ai", name: "AI Generators", emoji: "🪄", description: "Names, captions, stories" },
  { slug: "printables", name: "Printables", emoji: "🖨️", description: "Banners, tags, labels, signs" },
  { slug: "pumpkin", name: "Pumpkin", emoji: "🎃", description: "Templates, stencils, faces" },
  { slug: "party", name: "Party", emoji: "🥳", description: "Planners & invitations" },
  { slug: "images", name: "Images", emoji: "🖼️", description: "Wallpapers & stickers" },
  { slug: "social", name: "Social", emoji: "📱", description: "Captions, hashtags, memes" },
  { slug: "wishes", name: "Wishes & Quotes", emoji: "🌙", description: "Messages that spark joy" },
];

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  updatedAt: string;
};

export const ARTICLES: Article[] = [
  { slug: "best-halloween-costume-ideas-2026", title: "50 Best Halloween Costume Ideas for 2026", excerpt: "From classic to trending — costume inspiration for every age and budget.", category: "Ideas", readingTime: 9, updatedAt: "2026-07-01" },
  { slug: "pumpkin-carving-guide", title: "The Ultimate Pumpkin Carving Guide", excerpt: "Tools, techniques, safety, and 20 free templates.", category: "Pumpkin", readingTime: 12, updatedAt: "2026-06-28" },
  { slug: "halloween-party-planning-checklist", title: "Halloween Party Planning Checklist", excerpt: "The step-by-step guide to hosting the party of the year.", category: "Party", readingTime: 8, updatedAt: "2026-06-20" },
  { slug: "history-of-halloween", title: "The Real History of Halloween", excerpt: "From Samhain to today — how the world's spookiest holiday evolved.", category: "History", readingTime: 11, updatedAt: "2026-05-14" },
  { slug: "halloween-safety-tips-kids", title: "Halloween Safety Tips for Kids", excerpt: "Trick-or-treating safely — a parent's guide.", category: "Safety", readingTime: 6, updatedAt: "2026-06-02" },
  { slug: "diy-halloween-decorations", title: "25 DIY Halloween Decorations You'll Love", excerpt: "Budget-friendly decor ideas anyone can make.", category: "DIY", readingTime: 10, updatedAt: "2026-06-11" },
];
