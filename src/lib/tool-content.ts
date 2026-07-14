import type { ToolCard } from "@/lib/site";

export type HowToStep = { name: string; text: string };
export type Faq = { q: string; a: string };
export type ToolContent = {
  intro: string;
  features: { title: string; description: string; emoji: string }[];
  howTo: HowToStep[];
  useCases: { title: string; description: string; emoji: string }[];
  tips: string[];
  faqs: Faq[];
};

/** Per-slug overrides (optional). Anything omitted falls back to the category template. */
const OVERRIDES: Partial<Record<string, Partial<ToolContent>>> = {
  "costume-generator": {
    intro:
      "Stuck on what to be for Halloween? The AI Costume Generator turns a few details about you into personalized costume ideas — from clever couples looks to last-minute solo wins — in seconds.",
    faqs: [
      { q: "Is the costume generator really free?", a: "Yes — every idea, every time. No sign-up, no credit card, no watermark." },
      { q: "Can I use it for kids or couples?", a: "Absolutely. Tell it who the costume is for (age, group size, style) and it tailors the ideas to match." },
      { q: "Are the ideas original?", a: "The AI mixes trending themes, pop culture and classics, then personalises them to your inputs — so no two runs look the same." },
    ],
  },
  "pumpkin-carving-generator": {
    intro:
      "Design a jack-o'-lantern that actually looks the way you imagined. Describe a vibe — cute, scary, funny, elegant — and the Pumpkin Carving Generator returns a printable stencil you can carve tonight.",
  },
  "party-planner": {
    intro:
      "The Party Planner turns 'I want to throw a Halloween party' into a full playbook: guest count, menu, decor, playlist and a run-of-show timeline you can actually follow.",
  },
};

const CATEGORY_TEMPLATES: Record<string, (t: ToolCard) => ToolContent> = {
  AI: (t) => ({
    intro: `${t.title} is a free AI-powered Halloween tool that turns a few quick inputs into fresh, on-theme results in seconds. No signup, no watermark, no learning curve — just pick, generate, and use.`,
    features: [
      { emoji: "⚡", title: "Instant results", description: "Ideas generated in under 5 seconds — no waiting, no queue." },
      { emoji: "🎯", title: "Personalised", description: "Tailored to your style, audience and vibe — not generic filler." },
      { emoji: "🆓", title: "Free forever", description: "No signup, no credit card, no watermark — ever." },
      { emoji: "♻️", title: "Regenerate anytime", description: "Don't love it? Hit generate again for a fresh batch." },
    ],
    howTo: [
      { name: "Enter your details", text: `Fill in a few quick options that describe what you want from the ${t.title.toLowerCase()}.` },
      { name: "Generate", text: "Click the generate button — our AI does the heavy lifting in seconds." },
      { name: "Copy or regenerate", text: "Love it? Copy the result. Want more options? Hit generate again as many times as you want." },
    ],
    useCases: [
      { emoji: "📱", title: "Social content", description: "Instagram captions, TikTok hooks, group chat replies." },
      { emoji: "🎉", title: "Party prep", description: "Invites, signage, group text blasts, RSVP replies." },
      { emoji: "✍️", title: "Creators & writers", description: "Beat writer's block for spooky season content." },
      { emoji: "🏫", title: "Classroom & family", description: "Kid-friendly ideas for teachers, parents and group activities." },
    ],
    tips: [
      "Be specific with your inputs — the more detail you give, the sharper the output.",
      "Run it 3-4 times and cherry-pick your favourite line from each batch.",
      "Pair it with other HalloweenTools (like the Caption or Hashtag Generator) for a full social post.",
    ],
    faqs: [
      { q: `Is the ${t.title} free?`, a: "Yes. Every generation is free — no signup, no credit card, no watermark." },
      { q: "Do I need an account?", a: "No. Open the page, generate, and go. Nothing to install, nothing to log into." },
      { q: "Can I use the results commercially?", a: "Yes — the outputs are yours to use for personal or commercial projects." },
      { q: "Does it work on mobile?", a: "Fully. The tool is mobile-first and works on any modern phone browser." },
    ],
  }),
  Design: (t) => ({
    intro: `${t.title} lets you design a beautiful, on-theme Halloween ${t.title.replace(" Maker", "").toLowerCase()} right in your browser — no Photoshop, no downloads. Pick a template, tweak the text, export and share.`,
    features: [
      { emoji: "🎨", title: "Halloween-first templates", description: "Every template is designed for spooky season — not a generic layout with a pumpkin slapped on." },
      { emoji: "✏️", title: "Full customisation", description: "Change text, colours, fonts and layout in real time." },
      { emoji: "📥", title: "High-res export", description: "Download print-ready PNGs — no watermark, no signup." },
      { emoji: "📱", title: "Works on any device", description: "Design on desktop, tablet or phone — the editor adapts." },
    ],
    howTo: [
      { name: "Pick a template", text: "Choose a starting design from the Halloween-themed presets." },
      { name: "Edit your text", text: "Update the copy, dates, names and any details you want to change." },
      { name: "Style it", text: "Adjust colours, fonts and layout until it feels right." },
      { name: "Download", text: "Export a high-resolution image ready to print or share online." },
    ],
    useCases: [
      { emoji: "🎉", title: "Halloween parties", description: "Home parties, work events, kid parties and neighbourhood bashes." },
      { emoji: "🏫", title: "Schools & classrooms", description: "Class parties, PTA events, costume contests." },
      { emoji: "💼", title: "Small business", description: "Bars, cafes, salons and shops running a Halloween promo." },
      { emoji: "📢", title: "Community events", description: "Trunk-or-treats, church events, charity nights." },
    ],
    tips: [
      "Keep headlines short — big, bold text reads best on phones.",
      "Use one accent colour (orange, purple or lime) plus a dark background for max spooky contrast.",
      "Add a QR code or short URL for RSVPs — it saves you chasing replies.",
    ],
    faqs: [
      { q: `Is the ${t.title} free?`, a: "Yes — every design, every export, no watermark, no signup." },
      { q: "Can I print what I design?", a: "Yes. Exports are high-resolution and print-ready for home printers and print shops." },
      { q: "Do I own what I create?", a: "You own your design and can use it for personal or commercial projects." },
      { q: "Does it work on mobile?", a: "Yes — the editor is fully responsive on phones and tablets." },
    ],
  }),
  Pumpkin: (t) => ({
    intro: `${t.title} helps you go from 'I want to carve a pumpkin' to a finished, printable stencil in minutes — even if you've never carved before.`,
    features: [
      { emoji: "🎃", title: "Printable stencils", description: "Every design exports as a clean, print-ready template." },
      { emoji: "🔰", title: "Beginner-friendly", description: "Simple silhouettes for first-timers, detailed shading for pros." },
      { emoji: "⚡", title: "Fast", description: "From idea to printable in under a minute." },
      { emoji: "🆓", title: "100% free", description: "No signup, no watermark, no paywall." },
    ],
    howTo: [
      { name: "Describe your pumpkin", text: "Pick a style — cute, scary, funny, classic — or type your own idea." },
      { name: "Generate the design", text: "The tool creates a carve-ready stencil in seconds." },
      { name: "Print and transfer", text: "Print at 100% scale, tape to your pumpkin, and poke the outline." },
      { name: "Carve and light", text: "Follow the outline with a carving knife, then drop in a tea light." },
    ],
    useCases: [
      { emoji: "👨‍👩‍👧", title: "Family pumpkin night", description: "Simple designs kids can carve safely with supervision." },
      { emoji: "🏆", title: "Carving contests", description: "Detailed, showpiece stencils that win the porch competition." },
      { emoji: "📸", title: "Content creators", description: "Photogenic pumpkins for Instagram, TikTok and Reels." },
      { emoji: "🏫", title: "Classrooms", description: "Class-friendly designs for group carving activities." },
    ],
    tips: [
      "Print at 100% scale — if the stencil is tiny on paper, the pumpkin design will be tiny too.",
      "Use a poking tool (or thumbtack) to transfer the outline before cutting.",
      "Carve the smallest details first and the outer edge last — it keeps the pumpkin sturdy.",
    ],
    faqs: [
      { q: "Are the stencils really free to print?", a: "Yes — download and print as many as you like, no watermark." },
      { q: "How do I transfer the design to the pumpkin?", a: "Tape the printout to the pumpkin and poke the outline with a thumbtack or pumpkin-carving poker." },
      { q: "Are the designs safe for kids?", a: "Simpler designs are kid-friendly with supervision. Adults should handle the knife work." },
    ],
  }),
  Party: (t) => ({
    intro: `${t.title} takes the guesswork out of Halloween hosting — from headcount to menu to a run-of-show timeline you can actually follow.`,
    features: [
      { emoji: "📋", title: "End-to-end planning", description: "Guest list, menu, decor, activities and timing — all in one place." },
      { emoji: "🎯", title: "Personalised", description: "Plans scale to your party size, budget and vibe." },
      { emoji: "⏱️", title: "Timeline included", description: "Know exactly what to do 2 weeks, 3 days and 1 hour before guests arrive." },
      { emoji: "🆓", title: "Free forever", description: "No signup, no credit card." },
    ],
    howTo: [
      { name: "Tell us about your party", text: "Guest count, vibe, budget and location — that's it." },
      { name: "Get your plan", text: "The tool builds a full plan: menu, decor, activities and a timeline." },
      { name: "Customise and run it", text: "Tweak anything you want, then use the timeline on the day." },
    ],
    useCases: [
      { emoji: "🏠", title: "Home parties", description: "Adult parties, kid parties, mixed-age family gatherings." },
      { emoji: "💼", title: "Office parties", description: "Halloween at work — costume contests, potlucks, happy hours." },
      { emoji: "🏫", title: "Classroom parties", description: "Age-appropriate games, snacks and activities." },
    ],
    tips: [
      "Confirm RSVPs 5 days before — it locks in your food and drink counts.",
      "Prep decor and playlists the day before, not the day of.",
      "Leave a 30-minute buffer at the start — guests always run late.",
    ],
    faqs: [
      { q: "How many guests does it plan for?", a: "Anywhere from 4 to 100+. The plan scales to your headcount." },
      { q: "Does it include a shopping list?", a: "Yes — food, drinks and decor lists come with the plan." },
    ],
  }),
  Images: (t) => ({
    intro: `${t.title} generates original Halloween-themed imagery you can save, share and use — no design skills, no stock-photo hunting.`,
    features: [
      { emoji: "🖼️", title: "Original artwork", description: "Every image is generated fresh — never reused stock." },
      { emoji: "📱", title: "Sized for every screen", description: "Phones, tablets, desktops and social feeds." },
      { emoji: "🆓", title: "Free to download", description: "No watermark, no signup, no paywall." },
      { emoji: "♻️", title: "Regenerate anytime", description: "Don't love it? Try again — as many times as you like." },
    ],
    howTo: [
      { name: "Describe what you want", text: "Style, mood, colours, subject — the more detail, the better." },
      { name: "Generate", text: "The AI creates your image in seconds." },
      { name: "Download and use", text: "Save the high-resolution file and use it anywhere." },
    ],
    useCases: [
      { emoji: "📱", title: "Phone wallpapers", description: "A new spooky lockscreen every day of October." },
      { emoji: "📢", title: "Social posts", description: "Post-ready visuals for Instagram, TikTok and Facebook." },
      { emoji: "💻", title: "Desktop backgrounds", description: "Deck out your work-from-home setup for the season." },
    ],
    tips: [
      "Describe mood and colour, not just objects — 'moody purple graveyard at dusk' beats 'graveyard'.",
      "Regenerate 3-5 times and pick the best — outputs vary each run.",
    ],
    faqs: [
      { q: "Can I use the images commercially?", a: "Yes — outputs are yours to use for personal and commercial projects." },
      { q: "Are the images watermarked?", a: "No. Every download is clean." },
    ],
  }),
  Printables: (t) => ({
    intro: `${t.title} gives you printable Halloween activities that keep kids busy, decorate the classroom, and save you a trip to the store.`,
    features: [
      { emoji: "🖨️", title: "Print-ready", description: "One-click print on any home printer." },
      { emoji: "👶", title: "Kid-safe", description: "Age-appropriate designs and themes." },
      { emoji: "🆓", title: "Free downloads", description: "No signup, no watermark." },
      { emoji: "♾️", title: "Endless variations", description: "Regenerate as often as you like." },
    ],
    howTo: [
      { name: "Choose a style", text: "Pick a theme, difficulty and age range." },
      { name: "Generate the printable", text: "The tool creates a print-ready page in seconds." },
      { name: "Print at home", text: "Standard A4 or Letter paper works fine." },
    ],
    useCases: [
      { emoji: "🏫", title: "Classrooms", description: "Group activities for elementary and preschool." },
      { emoji: "🎉", title: "Party favours", description: "Activity sheets for kid-party goodie bags." },
      { emoji: "🏠", title: "Rainy-day fun", description: "Quiet-time activities at home." },
    ],
    tips: [
      "Print in black and white to save ink — colouring is more fun for kids anyway.",
      "Laminate a few for wipe-clean reuse.",
    ],
    faqs: [
      { q: "Do I need special paper?", a: "No — standard printer paper works. Cardstock feels nicer if you have it." },
      { q: "Are these classroom-safe?", a: "Yes — designs are age-appropriate and non-scary by default." },
    ],
  }),
  Social: (t) => ({
    intro: `${t.title} turns 'I need to post something for Halloween' into ready-to-copy content that actually gets likes.`,
    features: [
      { emoji: "🔥", title: "On-trend copy", description: "Language that matches how people actually talk on socials right now." },
      { emoji: "⚡", title: "Instant", description: "Generated in under 5 seconds." },
      { emoji: "🎯", title: "Platform-aware", description: "Tone shifts for Instagram, TikTok, Twitter and Facebook." },
      { emoji: "🆓", title: "Free forever", description: "Unlimited generations, no signup." },
    ],
    howTo: [
      { name: "Pick your vibe", text: "Funny, spooky, wholesome, edgy — pick what fits your post." },
      { name: "Generate", text: "Get a batch of options in seconds." },
      { name: "Copy and post", text: "Tap to copy, paste into your app, done." },
    ],
    useCases: [
      { emoji: "📸", title: "Costume photos", description: "Captions for your Halloween fit pics." },
      { emoji: "🎃", title: "Pumpkin posts", description: "Copy for carving reveals and porch shots." },
      { emoji: "🥳", title: "Party recaps", description: "Post-party carousels and Reels." },
    ],
    tips: [
      "Run it 2-3 times and mix lines from different batches for the best result.",
      "Pair captions with the Hashtag Generator for a full-post-in-one-minute workflow.",
    ],
    faqs: [
      { q: "Do you save what I generate?", a: "No — we don't store your generations. Every run is fresh." },
      { q: "Can I request a specific style?", a: "Yes — tell it 'funny', 'spooky', 'wholesome' etc. and it adapts." },
    ],
  }),
};

const DEFAULT_TEMPLATE = CATEGORY_TEMPLATES.AI;

export function getToolContent(tool: ToolCard): ToolContent {
  const template = CATEGORY_TEMPLATES[tool.category] ?? DEFAULT_TEMPLATE;
  const base = template(tool);
  const override = OVERRIDES[tool.slug];
  if (!override) return base;
  return {
    intro: override.intro ?? base.intro,
    features: override.features ?? base.features,
    howTo: override.howTo ?? base.howTo,
    useCases: override.useCases ?? base.useCases,
    tips: override.tips ?? base.tips,
    faqs: override.faqs ?? base.faqs,
  };
}

export function howToJsonLd(tool: ToolCard, content: ToolContent) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use the ${tool.title}`,
    description: content.intro,
    step: content.howTo.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqJsonLd(content: ToolContent) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
