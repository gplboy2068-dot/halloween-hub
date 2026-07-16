import type { ToolCard } from "@/lib/site";

export type HowToStep = { name: string; text: string };
export type Faq = { q: string; a: string };
export type Benefit = { title: string; description: string; emoji: string };
export type Mistake = { title: string; description: string };
export type ToolContent = {
  /** Short lede shown right under the tool interface. */
  intro: string;
  /** Long-form "About This Tool" (150-200 words, unique per tool). */
  about: string;
  features: { title: string; description: string; emoji: string }[];
  benefits: Benefit[];
  howTo: HowToStep[];
  useCases: { title: string; description: string; emoji: string }[];
  tips: string[];
  mistakes: Mistake[];
  faqs: Faq[];
  /** Slug of a tool to recommend in the final CTA. */
  ctaSlug?: string;
};

// ---------------------------------------------------------------------------
// Per-slug "About" copy — each block is written specifically for that tool.
// 150-220 words each, US English, no duplication across tools.
// ---------------------------------------------------------------------------
const ABOUT: Record<string, string> = {
  "halloween-card-maker":
    "The Halloween Card Maker is a browser-based design studio built for one thing: greeting cards that actually look like Halloween. Instead of forcing you to bend a generic template around a pumpkin clip-art, every layout starts from a spooky-season aesthetic — ink-black backgrounds, moody purples, dripping typography, and illustrated motifs like bats, ghosts, cats, cauldrons and haunted houses. You can build a printable 5×7 card for the fridge, a folded quarter-fold for the mailbox, or a square digital version to text to a friend, all from the same editor. It's meant for people who want a personal, hand-crafted feel without opening Photoshop or paying for a design app. Parents making cards with kids, teachers sending season greetings home, small businesses thanking customers, and creators sending 'Happy Halloween' to their audience all use it every October. Because it runs entirely in your browser and exports high-resolution PNGs with no watermark, you can iterate as many times as you need, save a design for next year, or send the same file to a print shop for a batch run.",
  "invitation-maker":
    "The Invitation Maker is a specialized Halloween invitation designer that focuses on the details a generic invite tool ignores: costume-required call-outs, BYOB or potluck lines, RSVP-by dates, adults-only versus kid-friendly labeling, and 'trick-or-treat then party' timing splits. You pick a vibe — haunted mansion, kids' pumpkin party, witchy cocktail night, spooky first birthday, corporate Halloween happy hour — and the tool builds a matching layout you can fill in. It's designed for people who send digital invites over text and email but still want them to feel considered, not templated. Each invitation exports as a print-ready PNG or a square social-friendly version, so the same design works for the fridge, group chats, an Instagram story, and a paper handout at school pickup. Because you can regenerate as many times as you want, you can send different variants to different guest groups (kids at 4, adults at 8) without redoing the work from scratch.",
  "poster-maker":
    "The Poster Maker builds bold, eye-catching Halloween posters for anything you need to promote — a costume contest, haunted house, bar crawl, church trunk-or-treat, school fundraiser, or a movie night on the porch. The templates lean into the visual language people already associate with October: heavy display type, high-contrast color, torn paper and grunge textures, and iconography that reads from across a room. You can size the same design for a printed 11×17, a tabloid handout, an A3 window poster, or a vertical social-story format. The goal is to remove the awkwardness of trying to make 'promo material' in a general design app that doesn't understand seasonal context — you get a poster that actually looks like Halloween without needing a designer or a subscription. Every export is high-resolution, watermark-free, and safe to print at a copy shop.",
  "banner-maker":
    "The Banner Maker turns your Halloween message into a wide-format graphic sized for the places banners actually live: a website hero, a Facebook cover, a YouTube channel art strip, an email header, a Zoom background, and physical vinyl banners for parties and shopfronts. Because the aspect ratios are so specific — 1584×396 for LinkedIn, 2560×1440 for YouTube, 1500×500 for X, 820×312 for Facebook — most 'banner tools' end up cropping the important part off. This one bakes those ratios in, then applies a Halloween treatment: fog, bats crossing the moon, jack-o'-lantern rows, cobweb corners, and haunted skylines. You can regenerate variants, swap the tagline, and export a clean file for every platform in one session, so your whole Halloween brand refresh takes minutes instead of an afternoon.",
  "flyer-maker":
    "The Flyer Maker produces print-ready Halloween flyers in the sizes people actually print — US Letter, A4, half-letter, and quarter-page — for events that need physical hand-outs. It's built for the small-scale organizers: a neighborhood potluck, a school PTA event, a church harvest festival, a community-center costume contest, a boutique fitness studio's Halloween class. The templates cover the info people forget on a first pass: date, time, address, parking, dress code, age range, cost, and RSVP method. You can print black-and-white to save ink or full-color for a copy shop run, and each flyer exports at 300 DPI so text stays crisp when it goes on a bulletin board. The tool intentionally avoids the over-designed 'client agency' look — it produces flyers that read at a glance from a coffee-shop cork board.",
  "logo-maker":
    "The Logo Maker generates instant Halloween-themed logos for pop-up bakeries, seasonal Etsy shops, haunted attractions, October-only podcasts, streamers running a spooky marathon, and small businesses that want a limited-time seasonal mark. Instead of asking you to hand-pick fonts and shapes, you describe the vibe — witchy, cute, retro-horror, elegant gothic, kid-friendly — and the tool assembles a wordmark, an icon, and a stacked lockup you can use across your profile picture, header, and merch. Files export as transparent-background PNGs so you can drop them onto any background. It's not meant to replace a brand identity project; it's meant to give you something clean and specific for the four weeks a year when 'Halloween' is your entire brand.",
  "costume-generator":
    "The AI Costume Generator turns a short description of you — your interests, the group you're going with, your budget, your comfort level — into personalized costume ideas that actually match. It's the tool for the person still panicking about what to wear on October 30th, or a couple who wants a pairing that isn't the same 'plug and socket' joke everyone else picked, or a group of five friends who need a theme where everyone gets a good role, not just the ringleader. The generator mixes pop-culture references, classic archetypes, and DIY-friendly ideas so at least one option is buildable from things you already own. Because you can run it as many times as you want with no signup, you can iterate: run once for solo ideas, once for couples, once for group themes, then pick your favorite from the shortlist.",
  "name-generator":
    "The Halloween Name Generator produces spooky, atmospheric names for characters in a story, pets adopted in October, party personas, D&D and TTRPG villains, streamer avatars, haunted-house cast members, and the ghost you swear lives in your apartment. Instead of pulling from a static list, it varies output by tone — creepy, gothic, whimsical, witchy, monstrous, Victorian — and by name shape — first name only, full name, title-and-name, nickname. Writers use it for NaNoWriMo prep, teachers use it for reading-comprehension exercises, tabletop groups use it for one-shots, and content creators use it to name recurring bits. Every run generates a fresh batch, so you can keep going until something clicks.",
  "caption-generator":
    "The Halloween Caption Generator writes ready-to-post captions for Instagram, TikTok, Facebook, and X, calibrated for the way people actually caption in October — one-liner puns, longer 'this-costume-took-three-weeks' stories, moody aesthetic captions for a foggy-forest photo dump, or 'guess who I am' costume reveals. You pick the mood — funny, spooky, wholesome, edgy, romantic — and the format — short, medium, or long — and get a batch you can copy and paste. It's for creators, small brands, and regular people who want something better than 'Happy Halloween 🎃' under a good photo. Pair it with the Hashtag Generator and you have a full post in under two minutes.",
  "quote-generator":
    "The Halloween Quote Generator produces short, quotable lines for greeting cards, party signage, social posts, chalkboards, tombstone props, and journal entries. Instead of the same recycled 'Trick or treat, smell my feet' rotation, it generates fresh material across styles — witty and modern, gothic and literary, Poe-adjacent Victorian, kid-friendly cute, cinematic slasher-movie tagline. Teachers use it for classroom decor, event planners use it for signage, greeting-card makers use it for card interiors, and social managers use it for daily October posts. Every quote is short enough to fit on a card, a story overlay, or a printed sign, and every run is fresh so you don't recycle the same line as your neighbor.",
  "wish-generator":
    "The Halloween Wish Generator writes warm, personal Halloween wishes for family, friends, coworkers, clients, and customers. Not everyone wants 'boo!' — some people want a real message to send with a card, a thoughtful client email that acknowledges the season, or a wholesome family text that isn't tone-deaf. The tool covers the range: playful wishes for kids and cousins, sincere wishes for grandparents, professional wishes for a customer list, and creative wishes for a partner or crush. You pick who it's for and the tone, and get a message you can send as-is or lightly edit. Because Halloween wishes vary more than most seasonal greetings, generating a batch and picking the right one is faster than trying to write one from scratch.",
  "message-generator":
    "The Halloween Message Generator writes short and medium-length Halloween messages for texts, group chats, DMs, sticky notes tucked in lunchboxes, RSVP replies, and neighborly 'happy Halloween' drop-ins. It's the middle ground between a one-line caption and a full wish — enough to feel considered, short enough that people actually read it. You pick the relationship (friend, partner, coworker, child, parent, client) and the tone, and the tool builds a message you can copy in. It's the fastest way to send fifteen personal Halloween texts on October 31st without them all sounding identical.",
  "party-planner":
    "The Halloween Party Planner turns 'I want to throw a Halloween party' into an actual plan: a headcount-scaled shopping list, a menu with easy make-ahead options, a decor checklist that matches your vibe, a game and activity lineup for your guest mix, and a run-of-show timeline that tells you what to do two weeks before, three days before, and one hour before people arrive. It's built for the person hosting for the first time, and for the veteran host who wants to stop reinventing the wheel every October. You describe your party — adults only or mixed ages, casual or costume-required, cocktails or potluck, 8 guests or 80 — and the plan scales to match. Because Halloween parties have more moving parts than most (costumes, kid timing, trick-or-treat overlap, decor that takes real setup), a plan you can print and follow is worth more than a Pinterest board of ideas.",
  "party-name-generator":
    "The Halloween Party Name Generator names your party so the invite, the group chat, the hashtag, and the story overlay all have a hook. 'Halloween Party at Sarah's' rarely sells; 'Sarah's Séance & Signature Cocktails' does. The tool generates names across styles — witty puns, elegant gothic ('The Midnight Salon'), kid-friendly ('Little Monsters Bash'), scary-serious ('Chapter 3: The Descent') — and formats — one-word, tagline, title-and-subtitle. Event planners, small businesses running a Halloween promo, and hosts throwing an annual party all use it to give the night an identity that carries through the invites, the signage, and the recap post.",
  "pumpkin-carving-generator":
    "The AI Pumpkin Carving Generator turns a description — 'a cat arching its back on a fence', 'a friendly ghost holding candy', 'the Millennium Falcon' — into a printable stencil you can carve tonight. It's built for people who love the idea of a custom jack-o'-lantern but don't want to freehand it and can't find the exact design they want in a stencil pack. The generator balances two things printed stencils usually don't: how detailed the design can be given the pumpkin's curvature, and how structurally sound the cut-outs will be once you're carving. You get a printout with clear lines to poke and cut, plus optional shading regions to scrape thin instead of cut through. Families use it for pumpkin night, competitive carvers use it for porch showpieces, and content creators use it for reveal videos.",
  "pumpkin-template-generator":
    "The Pumpkin Template Generator is a library-plus-generator hybrid: pick from a large set of curated printable stencils, or generate a new one from a prompt. It covers the categories people search for every October — cats, bats, witches, spiders, haunted houses, movie characters, sports logos, cute kid designs, and typography ('BOO', a family name, an address) — and outputs at the correct scale for standard 8–10 inch pumpkins. Every template prints on regular home-printer paper, at 100% scale, ready to tape onto the pumpkin and transfer. If you've ever downloaded a stencil that turned out to be a Pinterest image at 300px, this fixes that: everything here is print-resolution and carve-tested for line thickness.",
  "pumpkin-face-generator":
    "The Pumpkin Face Generator focuses on the faces themselves — eyes, nose, mouth combinations — so you can design a jack-o'-lantern with a specific expression without freehanding. You choose a mood — classic goofy, screaming, smirking, sleepy, cute, terrifying — and the tool assembles a face from parts that fit together at real pumpkin proportions. It's popular with parents carving with kids (you can dial cuteness up), competitive carvers who want a base expression to build details around, and small businesses making a matching lineup of porch pumpkins. Export a printable face stencil or save a reference image to freehand from.",
  "wallpaper-generator":
    "The Halloween Wallpaper Generator creates original phone and desktop wallpapers sized correctly for every screen — iPhone Pro Max, Android tall, iPad, MacBook, ultrawide, and 4K desktop. Instead of the same 'orange gradient with a pumpkin' file circulating on every wallpaper app, the generator produces varied styles: moody photorealistic scenes, illustrated storybook art, minimalist single-icon backgrounds, dark-mode-friendly typography wallpapers, and cottagecore autumn-into-Halloween moods. You can generate a new lockscreen every day of October if you want, and every download is high-resolution and watermark-free.",
  "coloring-pages-generator":
    "The Halloween Coloring Pages Generator prints activity sheets that keep kids busy while parents cook, decorate, or answer the door on Halloween night. Teachers use it for classroom parties, PTA volunteers use it for goodie bags, church programs use it for kids' ministry, and parents use it for rainy afternoons. Every page is line-only (perfect for crayons, markers, or colored pencils), sized to Letter or A4, and rated for approximate age — big shapes for preschool, more detail for elementary, and intricate mandalas for older kids and adults. You can generate a themed set — pumpkins, monsters, witches, black cats, haunted houses — or a mixed pack.",
  "hashtag-generator":
    "The Halloween Hashtag Generator builds hashtag sets for Instagram, TikTok, Threads, and Pinterest that actually help your post reach the right audience — a mix of high-volume seasonal tags, medium-volume niche tags, and small-community tags where you can still land in the top posts. It's tuned for the categories people post most in October — costumes, makeup, decor, pumpkin carving, party recaps, home tours, small-business promos, and kids' Halloween. Instead of pasting the same 30 tags on every post (which platforms increasingly penalize), you get a fresh, post-specific mix. Creators, small brands, and event pages use it to stop guessing at tag strategy for four weeks a year.",
  "ai-prompt-generator":
    "The Halloween AI Prompt Generator writes prompts for AI art tools (Midjourney, DALL·E, Stable Diffusion, Nano Banana, Flux), AI video tools, and AI writing tools — all tuned for Halloween aesthetics. Instead of typing 'a spooky house' and getting a generic result, you get structured, descriptive prompts with lighting, camera, mood, style-reference, and negative-prompt guidance baked in. Artists, hobbyists, and content creators use it as a shortcut to good outputs; teachers use it for creative-writing prompts; TTRPG game masters use it to generate one-shot setting descriptions. Every run produces a fresh batch across styles — cinematic, illustrated, photoreal, retro-horror, cozy — so you can experiment quickly.",
  "sticker-generator":
    "The Halloween Sticker Generator creates transparent-background stickers you can drop into Instagram stories, WhatsApp chats, iMessage, Notion pages, planners, and print-at-home sticker sheets. Every sticker is generated fresh at high resolution with a clean die-cut edge, so it looks intentional wherever you paste it. You can spin up a themed set — cute ghosts, retro slasher stickers, cottagecore autumn stickers, kid-friendly pumpkins — or a one-off for a single project. Because the output is PNG with transparency, it composites cleanly onto any background without a white halo.",
  "profile-picture-generator":
    "The Halloween Profile Picture Generator makes seasonal PFPs for Instagram, X, Discord, Slack, LinkedIn, and gaming platforms. It covers the range of what people actually swap to in October: cute cartoon avatars, moody portrait-style shots, monster and vampire versions of yourself, ghost silhouettes, illustrated cameos, and initial-based icons with Halloween treatment. Exports are square and pre-cropped to standard PFP dimensions, so what you preview is exactly what appears in a circle avatar. Because you can regenerate freely, you can try five directions before you commit to the one you'll wear for four weeks.",
  "avatar-generator":
    "The Halloween Avatar Generator builds full-body and portrait avatars with a spooky-season treatment — for gaming profiles, Discord servers, VTubing overlays, streamer scenes, tabletop character portraits, and website 'about' pages. You describe the base (age range, style, mood) and the Halloween layer (witch, vampire, mummy, cursed astronaut, whatever), and get a matched set of poses and close-ups. Streamers use it for scene alerts, TTRPG players use it for one-shot characters, and creators use it for a full-October brand refresh across every platform.",
  "scary-story-generator":
    "The Scary Story Generator writes original short horror — flash fiction, campfire tales, bedtime-safe kid stories, and longer 'creepy pasta' style narratives — with tunable intensity. You pick the audience (kids, teens, adults), the length (60 seconds, 5 minutes, 15 minutes to read aloud), and the sub-genre (haunted-house classic, cosmic, folk horror, urban legend, cozy-eerie), and get a story with a real setup, escalation, and payoff. Teachers use it for reading exercises, parents use it for sleepover night, camp counselors use it for the last night of camp, and podcasters use it as story-of-the-day material. Every story is generated fresh, so you never get the same one twice.",
  "meme-generator":
    "The Halloween Meme Generator creates image macros, reaction memes, and template-based memes with October captions written for you. Instead of hunting for a template, dragging into an image editor, and trying to write funny copy at 11pm, you describe the situation ('me handing out full-size candy bars', 'when someone asks if you're too old to trick-or-treat') and get a finished, share-ready meme. It's built for group chats, story reposts, brand social calendars, and the person in your friend group who's the designated meme sender.",
  "printable-banner-generator":
    "The Printable Banner Generator turns a phrase like BOO, TRICK OR TREAT, or a child's name into a wide-format Halloween banner you can print at home and string across a doorway, mantel, classroom wall, or party arch. Every letter is placed on its own pennant, rectangle, or scalloped card so you cut, punch, and thread onto twine in minutes — no design software, no ordering online, no waiting for shipping. Six themed palettes cover the range of Halloween aesthetics (classic orange, purple witch, blood moon, pastel boo, monochrome ink, neon rave), and six display fonts (Creepster, Nosifer, Bangers, Fredoka, IM Fell English, Special Elite) let you dial the tone from cute to genuinely scary. Teachers use it for classroom door displays, parents use it for kids' Halloween parties, small businesses use it for shopfront windows, and event planners use it for reception backdrops. Files export as high-resolution PDF at exact Letter or A4 dimensions with 300 DPI, plus PNG, JPG, and SVG for digital reuse. Because everything runs in your browser and nothing is stored, you can regenerate ten variations in one sitting and only print the winner.",
  "cupcake-topper-generator":
    "The Cupcake Topper Generator prints twelve 2-inch Halloween cupcake toppers on a single sheet, in circle, square, hexagon, or scalloped shapes, ready to cut and glue onto a toothpick. It's the missing piece for anyone hosting a Halloween birthday, a school bake sale, a church harvest event, or an office cupcake decorating contest. Instead of buying pre-made toppers that come in one boring pumpkin design, you design your own — pick an icon (ghost, pumpkin, spider, cauldron, witch), add a short message ('BOO', a name, an age, 'TREAT'), and match your palette to the party theme. The tool renders the toppers at exact 60mm size so what you see on screen is what you cut on paper. Print on regular cardstock or plain paper, cut around the outline with scissors, and tape a toothpick to the back — the whole set of twelve takes less than fifteen minutes to make. Every download is watermark-free and vector-crisp, so if you want to send the SVG to a Cricut for die-cutting, that works too.",
  "gift-tag-generator":
    "The Gift Tag Generator produces printable Halloween tags for wrapped gifts, party favors, teacher appreciation treats, candy bags, and hostess presents. Eight tags fit on a single sheet, each sized to the classic 2.5×3.5 inch tag with a hole-punch guide in the corner. You choose the variant — gift tag, name tag, party favor, or teacher gift — and the layout adjusts: gift tags get a large To/From area, name tags feature the name prominently, favor tags include a short thank-you line, and teacher gift tags are formatted to fit inside a mug or on a jar of candy. Six Halloween themes, six fonts, and a Halloween icon of your choice complete the design. The output PDF prints on plain paper or cardstock at exact dimensions, so you punch, thread twine or ribbon, and attach — no measuring, no cropping, no trial and error. Because the tags are ready in seconds and every download is free, you can iterate three or four times before you commit ink to paper.",
  "label-generator":
    "The Label Generator creates printable Halloween labels for candy jars, drink bottles, mason jars, food platters, and decoration containers. It solves the problem of parties where every dish and pitcher looks the same — a well-designed label ('Witch's Brew' on the punch, 'Toxic Slime' on the guacamole, 'Zombie Fingers' on the sausages) is what turns a snack table into a themed spread. You pick a size preset (candy, bottle wrap, mason jar, food, decoration), a Halloween theme, and a font, then type the label copy — up to two lines. The tool renders six labels per sheet at 90×40mm so you print on adhesive label paper or plain paper with tape and immediately have a coordinated set. Every export is 300 DPI print-ready in PDF, PNG, JPG, or SVG (for die-cutters like Cricut and Silhouette). Because the tool is designed for real print use, spacing, contrast, and font sizes are all calibrated to be legible from across a party table — not just on a phone screen.",
  "treat-bag-generator":
    "The Treat Bag Generator prints foldable toppers and labels for Halloween candy bags, treat sacks, and party favor bags. The topper design folds over the mouth of a plain paper or plastic bag and staples in place, turning a generic bag into a themed party favor. You choose the variant (foldable topper, bag label, candy bag graphic, or party bag design), enter a message ('Trick or Treat', a child's name, a class-wide thank-you), and pick an icon plus theme. The output prints four toppers per sheet at 100×70mm with a clear fold guide and stapling guide, so you don't have to eyeball the crease. Teachers use it for class parties (thirty toppers in ten minutes), parents use it for trick-or-treaters to grab from a bowl, and party hosts use it as coordinated favor packaging that photographs well. High-resolution PDF, PNG, JPG, and SVG are all one-click downloads.",
  "party-sign-generator":
    "The Party Sign Generator prints full 8.5×11 (or A4) Halloween signs for events, homes, offices, and businesses. Nine sign presets cover the situations parties actually need: Welcome, Party Rules, Food Station, Candy Bar, Photo Booth, Bathroom, Exit, Parking, and Custom. Instead of writing '↑ Bathroom this way' on a piece of paper with a Sharpie, you generate a matching, themed, printable sign in fifteen seconds. Every sign uses the same theme system as the rest of the printable suite (six palettes, six fonts, twelve icons) so a whole event can share a coordinated visual language — Welcome at the door, Directional signs to the food, Candy Bar over the treat station, Bathroom in the hallway, Exit near the door. Files export as print-ready PDF at exact page dimensions plus PNG, JPG, and SVG. Because the sign scales cleanly, you can print at Letter size for a party wall or send the same PDF to a print shop for a large poster or foam board. No signup, no watermark — the sign is yours to print, tape, laminate, or reuse across multiple years.",
};

// ---------------------------------------------------------------------------
// Category templates — expanded content used when a slug doesn't have its
// own override. Content interpolates the tool title/category to stay unique.
// ---------------------------------------------------------------------------
const CATEGORY_TEMPLATES: Record<string, (t: ToolCard) => Omit<ToolContent, "about" | "intro">> = {
  AI: (t) => ({
    features: [
      { emoji: "⚡", title: "Instant results", description: `The ${t.title} returns finished output in under five seconds — no queue, no rendering wait, no email confirmation.` },
      { emoji: "🎯", title: "Personalized to you", description: "The model conditions on your inputs rather than pulling from a static list, so two people running the same tool almost never get identical results." },
      { emoji: "🆓", title: "Free forever", description: "There is no signup, credit card, or watermark. Every generation costs you nothing and stays yours to use." },
      { emoji: "♻️", title: "Unlimited regenerations", description: "Not feeling the first batch? Run it again — and again — until something clicks. There is no daily cap." },
    ],
    benefits: [
      { emoji: "⏱️", title: "Saves hours of brainstorming", description: `Instead of scrolling Pinterest for ideas that don't quite fit, the ${t.title} builds around your specific inputs. What normally takes an evening of open-tab research collapses into a two-minute session.` },
      { emoji: "🎁", title: "No signup, no login, no email", description: "You never hit a paywall or a 'create an account to continue' interruption. Open the page, generate, use the result — the way free tools used to work before every site started gating outputs." },
      { emoji: "📱", title: "Works on your phone in a hurry", description: "The tool is mobile-first, so you can generate at a bus stop, on the couch during a movie, or the morning of a Halloween party when you realized you forgot something." },
      { emoji: "🧠", title: "Uses modern AI, not a keyword lookup", description: "Under the hood the tool calls a current-generation model, so outputs feel written and considered rather than assembled from a template you can immediately spot." },
      { emoji: "🔄", title: "Explore many directions fast", description: "Because each run is fresh, you can burn through ten stylistic directions in the time it would take to hand-write one. Cherry-pick the best lines from different batches." },
      { emoji: "🎨", title: "Style controls, not just topics", description: "You are not stuck with one voice. Ask for funny, spooky, moody, wholesome, or edgy and the output actually shifts — the tool is tuned to respect tone." },
      { emoji: "🖨️", title: "Copy or export in one tap", description: "Outputs are structured for immediate use: a copy button, a share sheet, and where relevant a downloadable file. Nothing to reformat before pasting." },
      { emoji: "🔒", title: "Nothing is saved unless you share it", description: "Generations do not train a public model or appear in a public feed unless you explicitly hit share. Private by default." },
      { emoji: "🌍", title: "Cross-audience friendly", description: "Kids, teens, adults, coworkers, in-laws — the tool has audience presets so you don't accidentally send an edgy caption to your grandmother." },
      { emoji: "🚫", title: "No watermark, no attribution required", description: "You do not have to credit the tool anywhere. Use outputs on socials, on client work, on merch — they are yours." },
    ],
    howTo: [
      { name: "Open the tool", text: `Land on the ${t.title} page. No signup screen, no email gate, no cookie wall — the tool is immediately usable at the top of this page.` },
      { name: "Describe what you want", text: "Fill in the short input fields. The more specific you are — audience, tone, context, references — the better the first run will be." },
      { name: "Pick a tone or style", text: "Use the dropdowns to steer the output. Funny, spooky, wholesome, gothic, moody — pick the one that fits how you want the result to feel." },
      { name: "Hit generate", text: "The model responds in a few seconds. You will usually see multiple options rather than a single answer, so you can pick a favorite." },
      { name: "Read the batch", text: "Skim the results. Look for a line, name, or idea that surprises you — that is usually the one worth using." },
      { name: "Copy what you want to keep", text: "Tap the copy icon next to a result to send it to your clipboard. Paste it straight into your app of choice." },
      { name: "Regenerate for more options", text: "Not there yet? Hit generate again with the same inputs, or tweak one field, and get a completely new batch." },
      { name: "Share it (optional)", text: "If you love a result, hit the community share button to post it to the public Halloween feed and inspire other people." },
    ],
    useCases: [
      { emoji: "📱", title: "Instagram + TikTok content", description: "Captions, hooks, bios, and story overlays for October posts." },
      { emoji: "🎉", title: "Halloween parties", description: "Invitation copy, group-chat call-outs, signage, and RSVP replies." },
      { emoji: "✍️", title: "Creators & writers", description: "Beat writer's block on spooky-season content, blog posts, and newsletters." },
      { emoji: "🏫", title: "Classroom & teachers", description: "Age-appropriate prompts, reading exercises, and homeroom decor copy." },
      { emoji: "👨‍👩‍👧", title: "Parents", description: "Ideas for kid parties, class treats, and the note in the lunchbox." },
      { emoji: "💼", title: "Small businesses", description: "Product descriptions, promo copy, and Halloween email subject lines." },
      { emoji: "🖨️", title: "Printables", description: "Text for cards, signs, tags, and door hangers." },
      { emoji: "📌", title: "Pinterest", description: "Pin descriptions and board titles tuned for October discovery." },
      { emoji: "📨", title: "Event invitations", description: "Copy for evites, mailers, and shared calendar events." },
      { emoji: "🎨", title: "Creative projects", description: "Character names, story hooks, prompt starters, and RPG session prep." },
    ],
    tips: [
      "Be specific with inputs. 'Costume ideas for a 6-year-old obsessed with sharks' beats 'kid costume ideas' every time.",
      "Run the tool three or four times and mix favorite fragments from different batches. The best final result is rarely from a single run.",
      "Pair complementary tools. A caption from the Caption Generator + tags from the Hashtag Generator is a full post in under two minutes.",
      "Use tone controls hard. Same inputs at 'funny' vs 'spooky' produce meaningfully different results — worth trying both.",
      "Keep the good ones. Copy favorites into a Notes app draft so you have an October content bank ready to schedule.",
      "Iterate one field at a time. Change only the audience or only the tone between runs so you can see what each control actually does.",
    ],
    mistakes: [
      { title: "Giving one-word inputs", description: "The tool works from the details you give it. 'Halloween' alone tells it almost nothing. Add audience, tone, context, and one or two references and outputs jump in quality immediately." },
      { title: "Taking the first result as final", description: "The first run is a temperature check, not the answer. Almost every good user hits generate three to five times before copying anything." },
      { title: "Fighting the wrong tone", description: "If outputs feel off, you probably have the tone dial in the wrong spot. Switch from 'funny' to 'wholesome' (or vice versa) before rewriting inputs from scratch." },
      { title: "Copy-pasting long output verbatim", description: "For longer outputs, the highest-value edit is usually a five-second personal tweak — a name, an inside joke, a specific date. It makes AI copy read like you." },
      { title: "Forgetting mobile is fine", description: "Some people assume the tool needs a desktop. It doesn't — it's designed mobile-first and often faster to run on a phone." },
      { title: "Skipping the share button", description: "Sharing your favorite output to the feed helps other people discover the tool and gives you a durable link back to your generation. It's opt-in and takes one tap." },
    ],
    faqs: [
      { q: `Is the ${t.title} really free?`, a: "Yes. Every generation is free with no signup, no credit card, no watermark, and no daily generation cap. You never see a paywall inside the tool." },
      { q: "Do I need to create an account?", a: "No. The tool is usable the moment you land on this page. Accounts only exist so you can save favorites and share to the community feed — they're optional." },
      { q: "Can I use the results commercially?", a: "Yes. Outputs are yours to use for personal or commercial projects — client work, product listings, merch, whatever. No attribution required." },
      { q: "Does it work on mobile?", a: "Yes, fully. The interface is designed mobile-first and works on iOS Safari, Android Chrome, and any modern phone browser." },
      { q: `How is this different from just using ChatGPT?`, a: `The ${t.title} is tuned for Halloween specifically — the prompts, tone dials, and output structure are optimized for spooky-season content. General AI chat requires you to write the prompt yourself, and quality drops fast when you're rushing.` },
      { q: "Are my generations stored?", a: "Generations aren't saved to a public feed unless you explicitly tap the share button. Your inputs and results aren't used to train a public model." },
      { q: "Why do I get different results each time?", a: "The underlying model is non-deterministic on purpose — running the same inputs multiple times gives you variations to pick from rather than one 'correct' answer." },
      { q: "Can I ask for a specific style or vibe?", a: "Yes. Use the tone/style controls, or add descriptors directly to your inputs — 'gothic', 'kid-friendly', 'Poe-style', 'TikTok voice' all work." },
      { q: "What if I don't like any of the results?", a: "Change one input field and regenerate. Even a small change (audience age, tone, one reference) reshuffles the output space significantly." },
      { q: "Is there a limit to how many times I can use it?", a: "There's a reasonable rate limit to keep the tool fast for everyone, but for normal use you'll never hit it. Regenerate as many times as you need." },
    ],
  }),
  Design: (t) => ({
    features: [
      { emoji: "🎨", title: "Halloween-first templates", description: "Every template is designed for spooky season — not a generic layout with a pumpkin sticker slapped on. Typography, color, and iconography all read as October at a glance." },
      { emoji: "✏️", title: "Full inline customization", description: "Edit copy, dates, names, colors, and layout right on the canvas. What you see is what exports." },
      { emoji: "📥", title: "High-resolution export", description: `The ${t.title} outputs a print-ready PNG (300 DPI) with no watermark, so files are safe for home printers, copy shops, and social posting alike.` },
      { emoji: "📱", title: "Any device", description: "Design from desktop, tablet, or phone. The editor adapts and gestures work — you can pinch-zoom, drag, and edit on a small screen." },
    ],
    benefits: [
      { emoji: "⏱️", title: "From idea to finished design in five minutes", description: `Because the ${t.title} starts from Halloween-native templates, you skip the 'building a background from scratch' step that eats the first hour in a general design app.` },
      { emoji: "🖨️", title: "Print-ready by default", description: "Every export is 300 DPI at real print dimensions. You can send the file straight to a home printer, Staples, or a print-on-demand shop without a format conversion step." },
      { emoji: "🎨", title: "Designed by people who care about Halloween", description: "The templates use color palettes and typography that read as spooky-season without being cliché. Orange-and-black is one option among many — you also get deep purples, moody teals, blood reds, and moonlit blues." },
      { emoji: "🆓", title: "No subscription and no watermark", description: "You don't hit an export paywall at the end. Nothing is stamped. You aren't asked to upgrade to remove branding." },
      { emoji: "📱", title: "Sized for print and social in one file", description: "Where relevant, the same design exports at multiple ratios (Letter for print, 1080×1080 for feed, 1080×1920 for stories) so one edit propagates everywhere." },
      { emoji: "🧑‍🎨", title: "No design experience needed", description: "Every editable element is labeled. You don't need to know what 'kerning' or 'leading' is — the controls speak plain English." },
      { emoji: "🔁", title: "Iterate as many times as you want", description: "There is no penalty for running through five variations before you commit. Try a spooky version, a cute version, and an elegant version — then pick." },
      { emoji: "💾", title: "Save designs for next year", description: "Sign in and every design you make is saved to your account. Next October you can duplicate last year's flyer, change the date, and be done." },
      { emoji: "🚫", title: "No AI slop, no stock-photo hunt", description: "You never end up with a design that has that AI-generated 'wonky fingers, weird pumpkin' look, and you don't have to license a stock image." },
      { emoji: "🖼️", title: "Reusable across the season", description: "A card design can be resized for a poster, a poster for a story overlay. The library scales with you across your October needs." },
    ],
    howTo: [
      { name: "Pick a template", text: `Scroll the ${t.title} template row and pick a starting design that's closest to the vibe you want. Every template is fully editable — treat it as a jumping-off point, not a fixed layout.` },
      { name: "Edit the main text", text: "Click any text element and type over it. Dates, names, event titles, dress code, RSVP line — all editable." },
      { name: "Adjust colors", text: "Use the color palette on the side to shift the whole design's mood. Deeper black for gothic, lime green for kid-friendly, red for horror movie." },
      { name: "Swap fonts if needed", text: "Every template ships with a paired font set that already works together. Change the display font from a curated list — the pairings stay legible." },
      { name: "Add or remove elements", text: "Drop in a bat, a pumpkin, a moon, or an extra text block from the sidebar. Delete anything you don't need with the delete key." },
      { name: "Preview at final size", text: "Toggle print vs digital preview to see exactly how the design will look on paper vs on a phone screen." },
      { name: "Export the file", text: "Hit download. You'll get a high-resolution PNG (and where relevant, additional social ratios in the same export) ready to print, post, or send." },
      { name: "Share it to the feed (optional)", text: "If you're proud of the design, one tap posts a preview to the public community feed with a share and download button." },
    ],
    useCases: [
      { emoji: "🏠", title: "Home Halloween parties", description: "Invites, welcome signs, drink menus, and door signs for adults-only or family parties." },
      { emoji: "🏫", title: "Schools & PTA", description: "Costume-contest posters, potluck sign-ups, and classroom door decor." },
      { emoji: "💼", title: "Small business promos", description: "Bar-and-restaurant menus, salon promos, and shop-window signage." },
      { emoji: "⛪", title: "Church trunk-or-treats", description: "Flyers, table signs, and hand-outs for community events." },
      { emoji: "🎉", title: "Corporate Halloween", description: "Costume-contest sign-ups, happy-hour invites, and Slack banner graphics." },
      { emoji: "📢", title: "Community events", description: "Neighborhood trunk-or-treats, block parties, and charity nights." },
      { emoji: "📱", title: "Instagram & TikTok", description: "Story overlays, feed posts, and Reels covers." },
      { emoji: "📌", title: "Pinterest", description: "Pin-optimized vertical designs for the seasonal boards people search in October." },
      { emoji: "💌", title: "Personal cards", description: "Cards for kids, in-laws, teachers, coworkers, and clients." },
      { emoji: "🖨️", title: "Print-at-home projects", description: "Wall art, place cards, and party favors printed on Letter or A4 paper." },
    ],
    tips: [
      "Keep headlines short — big, bold text reads better than long sentences, especially on phones and from across a room.",
      "Use one accent color plus a dark background for maximum spooky contrast. Orange, purple, or lime green all work.",
      "Add a QR code linking to an RSVP form. It saves you chasing replies in a group chat.",
      "Include the address on the design itself. Guests screenshot invites — a design with the venue on it is more useful than the caption underneath.",
      "Test-print on a home printer before you order a bulk run. Colors can look different on paper than on-screen.",
      "For social, always export both a square (feed) and vertical (story) version. You'll use both.",
    ],
    mistakes: [
      { title: "Cramming in every detail", description: "A card or flyer with eight lines of small text gets skimmed and put down. Keep the front to the essential info (what, when, where) and put anything else on the back or a linked RSVP page." },
      { title: "Using low-contrast colors", description: "Orange text on a red background disappears under warm light. Stick to strong contrast pairs — dark background with bright text — especially for print." },
      { title: "Forgetting the RSVP method", description: "The number one missing element on homemade invites. Add a phone number, email, or QR code — otherwise you get no replies and can't plan food and drink." },
      { title: "Mixing four fonts", description: "The templates ship with a paired set for a reason. Stick to the two included fonts unless you know what you're doing." },
      { title: "Exporting too small", description: "For a printed piece, always use the print preset. A screen-resolution export looks fuzzy on paper." },
      { title: "Not sizing for the platform", description: "A square feed design doesn't work as a story. A vertical story doesn't work as a poster. Use the platform preset that matches where it's going." },
    ],
    faqs: [
      { q: `Is the ${t.title} really free?`, a: "Yes. Every design and every export is free — no watermark, no subscription, and no email required for a basic export." },
      { q: "Can I print what I design?", a: "Yes. Exports are 300 DPI print-ready PNGs. They print cleanly on home printers, at Staples or FedEx, and at print-on-demand services." },
      { q: "Do I own what I create?", a: "You own the finished design. Use it personally or commercially — for cards, client work, merch, party promo — no attribution required." },
      { q: "Does it work on mobile?", a: "Yes. The editor is responsive and touch-friendly. Editing on a phone is slightly more fiddly than on a laptop but fully functional." },
      { q: "Can I upload my own photos?", a: "Yes — uploaded images are stored temporarily for your editing session and never used elsewhere." },
      { q: "Can I save a design and edit it later?", a: "If you're signed in, designs are saved to your account. If you're not, complete the export before you close the tab." },
      { q: "What sizes can I export?", a: "Print sizes include US Letter, A4, 5×7, 4×6, and 11×17. Social sizes include 1080×1080 (feed) and 1080×1920 (story)." },
      { q: "Will my design look the same when printed?", a: "Very close. Home printer color calibration varies — for a critical run, test one page before printing a batch." },
      { q: "Can I remove the branding from the exports?", a: "There is no branding on the exports. Nothing about the tool appears on your final file." },
      { q: `Can I use ${t.title} designs on merch, T-shirts, or sale items?`, a: "Yes. You own the finished design and can put it on merch you sell. The underlying template style stays a template, so building a whole business around one specific template isn't ideal — but any single design is fair game." },
    ],
  }),
  Pumpkin: (t) => ({
    features: [
      { emoji: "🎃", title: "Printable stencils", description: `Every design from the ${t.title} exports as a clean, print-ready PDF or PNG at the right scale for a real pumpkin.` },
      { emoji: "🔰", title: "Beginner to advanced", description: "Simple silhouettes for first-time carvers, all the way up to detailed shaded designs for competitive pumpkin nights." },
      { emoji: "⚡", title: "Fast", description: "From 'I want a design' to a taped-to-your-pumpkin printout in under two minutes." },
      { emoji: "🆓", title: "100% free", description: "No signup, no watermark, no paywall to unlock 'premium' templates." },
    ],
    benefits: [
      { emoji: "🖨️", title: "Prints at correct scale", description: `The ${t.title} outputs at real-world pumpkin scale, not Pinterest thumbnail scale. When you print at 100% on Letter or A4, the design fits an 8-10 inch pumpkin without resizing.` },
      { emoji: "🎯", title: "Carve-tested line thickness", description: "Every design keeps enough 'connective' material between cuts that your pumpkin doesn't collapse mid-carve. It sounds obvious until you've had a face cave in." },
      { emoji: "👶", title: "Kid-safe options", description: "Simpler designs are age-labeled so you can hand a stencil to a 6-year-old with a plastic tool without stress." },
      { emoji: "🏆", title: "Showpiece options", description: "For competitive carvers, the tool also generates detailed multi-depth designs with shaded regions to scrape thin, not cut through." },
      { emoji: "📄", title: "One-page printouts", description: "Every stencil fits on a single sheet of paper. No taping two pages together, no scaling calculations." },
      { emoji: "🔁", title: "Regenerate freely", description: "If a design isn't quite right, you can prompt for variations instead of hunting for a new template pack." },
      { emoji: "🖼️", title: "Custom prompts, not just a menu", description: "Type what you want — a specific character, a phrase, a pet's name — and get a stencil built for it." },
      { emoji: "🎨", title: "Multiple aesthetic modes", description: "Classic goofy jack-o'-lantern, elegant silhouette, spooky detailed, cute cartoon — the mode shifts the style." },
      { emoji: "📤", title: "Save for next year", description: "Signed-in users can save stencils. October comes back fast." },
      { emoji: "🚫", title: "No watermark on the printout", description: "The stencil is clean — no site branding printed across the middle of your carve line." },
    ],
    howTo: [
      { name: "Describe your pumpkin", text: `Pick a style — cute, scary, funny, classic, cinematic — or type a custom prompt into the ${t.title}. Be specific: 'a cat mid-leap over a moon' beats 'cat'.` },
      { name: "Generate the design", text: "The tool creates a carve-ready stencil in a few seconds. You'll see the design at its final print scale." },
      { name: "Adjust if needed", text: "Not right? Regenerate for a fresh take, or tweak the style controls (level of detail, cuteness, spookiness)." },
      { name: "Print at 100% scale", text: "Print the stencil at actual size on plain Letter or A4 paper. Don't 'fit to page' — that shrinks the design and throws off proportions." },
      { name: "Prep your pumpkin", text: "Cut the top open at an angle so the lid can't fall in. Scoop out seeds and thin the front wall to about one inch thick so cutting is easier." },
      { name: "Tape the stencil on", text: "Tape the printout to the front of the pumpkin. For curved pumpkins, make small vertical cuts around the edges of the paper so it lies flat." },
      { name: "Transfer the outline", text: "Poke through the paper along every cut line with a thumbtack, a pumpkin-carving poker, or the tip of a paring knife. Space the pokes about 1/8 inch apart." },
      { name: "Carve and light", text: "Remove the paper and follow the poke marks with a small serrated pumpkin knife. Cut the smallest interior details first and the outer edge last. Drop in a battery tea light or an LED puck — real candles are a fire risk indoors." },
    ],
    useCases: [
      { emoji: "👨‍👩‍👧", title: "Family pumpkin night", description: "Kid-safe designs everyone can carve at the kitchen table." },
      { emoji: "🏆", title: "Neighborhood contests", description: "Showpiece stencils for the porch competition." },
      { emoji: "📸", title: "Content creators", description: "Photogenic pumpkins for Instagram, TikTok, and Reels reveal videos." },
      { emoji: "🏫", title: "Classrooms", description: "Age-appropriate class carving projects and math-of-Halloween lessons." },
      { emoji: "💼", title: "Small business", description: "Themed pumpkin lineup for a storefront window." },
      { emoji: "⛪", title: "Church events", description: "Trunk-or-treat pumpkin displays and pumpkin-patch decor." },
      { emoji: "🎉", title: "Party centerpieces", description: "Matching pumpkin sets for adult dinner parties or kid parties." },
      { emoji: "🎥", title: "Movie-night porches", description: "Character pumpkins that fit an outdoor Halloween movie theme." },
      { emoji: "🚸", title: "Kid-first designs", description: "Simple, non-scary pumpkins for a toddler-friendly stoop." },
      { emoji: "🌙", title: "Late-October decor", description: "Longer-lasting foam pumpkin carves you can use across multiple years." },
    ],
    tips: [
      "Always print at 100% scale. If the stencil is tiny on paper, the pumpkin design will be tiny too.",
      "Use a poking tool (or a thumbtack) to transfer the outline before you cut anything. Freehand cutting from the printout doesn't work.",
      "Carve the smallest details first and the outer edge last. Removing the outer edge early makes the pumpkin flex and crack finer details.",
      "Thin the inside of the pumpkin's front wall to about an inch. Carving through 3 inches of pumpkin wall is what usually breaks kids' arms (and stencils).",
      "For shaded designs, scrape the surface with a spoon or a linoleum tool instead of cutting all the way through. Backlight the pumpkin to see the effect.",
      "Use a battery LED tea light indoors. A real flame near a paper-tape residue is a fire risk and the plastic ones last all week.",
    ],
    mistakes: [
      { title: "Printing 'fit to page'", description: "Almost every print dialog defaults to 'fit to page', which quietly scales your stencil down. Always choose 100% or 'actual size' — or the pumpkin comes out cramped." },
      { title: "Cutting the lid straight down", description: "A straight-down cut lets the lid fall through into the pumpkin. Angle the knife inward as you cut the top so the lid rests on a lip." },
      { title: "Skipping the poking step", description: "Trying to freehand from a paper stencil taped to a curved pumpkin never lines up. The pokes are what actually transfer the design." },
      { title: "Carving thick walls", description: "If you skip thinning the interior wall, cutting fine detail through 3 inches of raw pumpkin is exhausting and cracks lines." },
      { title: "Using a chef's knife", description: "Big knives make big cuts. Use a small serrated pumpkin knife or an X-Acto for detail work." },
      { title: "Lighting with a real candle indoors", description: "The paper residue from stencil tape catches, and the plastic lid melts. Battery LEDs are safer and last the whole week." },
    ],
    faqs: [
      { q: `Are ${t.title} stencils really free to print?`, a: "Yes. Download and print as many as you want. No watermark, no daily limit, no signup wall on printing." },
      { q: "What pumpkin size do the stencils fit?", a: "The default output is scaled for a standard 8-10 inch tall pumpkin printed at 100%. For smaller pumpkins, use your print dialog to scale down to 75% or 50%." },
      { q: "How do I transfer the design to the pumpkin?", a: "Tape the printout to the pumpkin (make small slits at the edges for curved surfaces), then poke every line with a thumbtack or a pumpkin-carving poker. Remove the paper and follow the pokes with your knife." },
      { q: "Are the designs safe for kids to carve?", a: "The simpler designs are kid-friendly with adult supervision. Adults should always handle the knife work; kids can help design and scoop." },
      { q: "Can I use the stencils for foam pumpkins?", a: "Yes. Foam pumpkins carve easier than real ones and last across years. Use the same transfer method — poke the outline first." },
      { q: "Can I use the printouts commercially — for a pumpkin patch or a business?", a: "Yes. There's no license restriction. Use them for a pop-up pumpkin patch, a school fundraiser, or a small business display." },
      { q: "What if my printer doesn't support 100% scale?", a: "Most home printers do — the setting is called 'Actual Size', '100%', or the opposite of 'Fit to Page'. If yours can't, print to PDF first and scale in Preview or Adobe Reader." },
      { q: "How long does a carved pumpkin last?", a: "Three to seven days depending on temperature. Coat the cut edges with petroleum jelly and store in a cool spot overnight to extend it." },
      { q: `Can I request a specific character or name in the ${t.title}?`, a: "Yes. Type it into the prompt. The tool will build a stencil around a name, initials, a pet, or a specific object." },
      { q: "Do you have templates for tiny pumpkins?", a: "Yes — set the scale to 50% at print time, or request a 'mini pumpkin' style in the prompt." },
    ],
  }),
  Party: (t) => ({
    features: [
      { emoji: "📋", title: "End-to-end planning", description: `The ${t.title} covers guest count, menu, decor, activities, music, and a run-of-show timeline in one place — not a dozen tabs.` },
      { emoji: "🎯", title: "Scales to your party", description: "Plans scale automatically from an 8-person cocktail night to an 80-guest costume bash. Food quantities, drink quantities, and activity picks all adjust." },
      { emoji: "⏱️", title: "Timeline included", description: "You know exactly what to do two weeks, three days, and one hour before guests arrive. No more 'what did I forget'." },
      { emoji: "🆓", title: "Free forever", description: "No signup, no credit card, no premium tier." },
    ],
    benefits: [
      { emoji: "🧮", title: "Guest-count-scaled quantities", description: `The ${t.title} calculates food, drink, and supply quantities from your headcount instead of leaving 'buy enough' up to your guess. Cuts food waste and last-minute grocery runs.` },
      { emoji: "📅", title: "Reverse-planned timeline", description: "The plan starts from party time and works backward. You know what to prep 14 days out, 7 days out, 24 hours out, and 1 hour out — no more scrambling at 5pm." },
      { emoji: "🍕", title: "Make-ahead menu bias", description: "Recipes prioritize things that keep or freeze, so you're not chained to the kitchen while guests arrive." },
      { emoji: "🎃", title: "Halloween-specific decor", description: "The decor list understands what actually works in October — real vs LED candles, fog machine placement, pumpkin lifespan, spider-web application — instead of a generic 'buy string lights' checklist." },
      { emoji: "🎮", title: "Age-mixed activity plans", description: "Where a party is family or mixed-age, the activity lineup times kid activities before adult ones and includes a hand-off point when kids head to bed." },
      { emoji: "💰", title: "Budget-aware", description: "The plan bends around your budget. Low-budget plans skew potluck and DIY; higher budgets include catering and rental notes." },
      { emoji: "🎵", title: "Playlist starter", description: "You get a Halloween-appropriate music arc — welcome, dinner, dance, wind-down — with example tracks per section." },
      { emoji: "🖨️", title: "Print-friendly checklist", description: "The whole plan is printable. Some hosts print the timeline and stick it to the fridge." },
      { emoji: "🔁", title: "Re-runnable each year", description: "The plan you built this year is a template for next year — swap the theme and adjust the count." },
      { emoji: "🚫", title: "No signup to view the plan", description: "You don't have to make an account to see your generated plan. Copy or print it directly." },
    ],
    howTo: [
      { name: "Describe your party", text: `Open the ${t.title} and enter your basics: how many guests, adults-only or mixed ages, vibe (chill dinner, dance party, kid-friendly), budget range, and how long the party runs.` },
      { name: "Pick your theme", text: "Choose a theme (classic haunted house, witchy dinner, kids' pumpkin party, cocktail séance, movie-night) or type a custom one." },
      { name: "Generate the plan", text: "The tool builds a full plan: menu, drinks, decor, activities, playlist, and a timeline." },
      { name: "Review the shopping list", text: "The shopping list is quantities-first. Skim it and mark what you already own so you're not double-buying." },
      { name: "Adjust anything you want", text: "Swap a recipe you don't like, cut an activity that won't fit, drop the budget on decor. Every section is editable." },
      { name: "Prep in the recommended order", text: "Follow the timeline from the earliest section (2 weeks out) forward. Prepping in the right order is what keeps day-of stress low." },
      { name: "Print the run-of-show", text: "Print the day-of timeline and stick it somewhere visible. During the party you'll thank yourself." },
      { name: "Save the plan for next year", text: "Sign in to save the plan, so next October you can duplicate and tweak instead of starting over." },
    ],
    useCases: [
      { emoji: "🏠", title: "Home Halloween parties", description: "Adults-only cocktail nights, kid parties, and mixed-age family gatherings." },
      { emoji: "💼", title: "Office parties", description: "Costume contests, potlucks, and workplace happy hours." },
      { emoji: "🏫", title: "Classroom parties", description: "Age-appropriate games, snacks, and activities for elementary and preschool." },
      { emoji: "⛪", title: "Church trunk-or-treats", description: "Community events with games, food stations, and safe-scare zones." },
      { emoji: "🏘️", title: "Neighborhood block parties", description: "Multi-family porch parties and street events." },
      { emoji: "🎃", title: "Pumpkin carving nights", description: "Small hosted pumpkin-carving parties with food and drinks." },
      { emoji: "👻", title: "Kids' sleepovers", description: "Age-appropriate scary movies, activities, and snack plans." },
      { emoji: "🍷", title: "Adult dinner parties", description: "Themed multi-course dinners with cocktail pairings." },
      { emoji: "💃", title: "Costume dance nights", description: "Dance-focused parties with a playlist arc and a costume contest slot." },
      { emoji: "🎥", title: "Movie-night parties", description: "Backyard-projector setups with themed snacks and blankets." },
    ],
    tips: [
      "Confirm RSVPs five days before. This locks in food and drink counts and gives you time to shop on the weekend.",
      "Prep decor and the playlist the day before, not the day of. Day-of should only be perishable food and last-minute setup.",
      "Leave a 30-minute buffer at the start of the party. Guests always run late.",
      "For mixed-age parties, put kid activities in the first hour and adult activities after 8pm.",
      "Fog machines run out fast. Buy twice the fluid you think you need and place the machine low (fog rises when heated but pools near the floor).",
      "Have one non-alcoholic 'signature drink' that looks as good as the cocktail. It's the difference between guests feeling included and feeling like an afterthought.",
    ],
    mistakes: [
      { title: "Buying decor first, food last", description: "The single most common host mistake. Decor takes a fraction of your budget and can be prepped weeks out. Food and drinks are the day-of scramble." },
      { title: "Over-catering", description: "First-time hosts double their portions and end up with three lasagnas. Trust the plan's per-person quantities." },
      { title: "Forgetting sober guests", description: "A great alcohol-free 'signature drink' turns a Halloween party from awkward-for-non-drinkers into welcoming for everyone." },
      { title: "Skipping the run-of-show", description: "Winging it at parties over 20 people always ends with dessert forgotten in the fridge. Print the timeline." },
      { title: "One music playlist for everything", description: "A great party has a music arc — welcome, dinner, peak dance, wind-down. Prepping four short playlists beats one long one." },
      { title: "Under-lighting", description: "Halloween parties can go from 'atmospheric' to 'literally cannot see the snacks'. Add battery LED candles to food and drink stations." },
    ],
    faqs: [
      { q: "How many guests can it plan for?", a: "Anywhere from 4 to 100+. The plan scales to your headcount, and the shopping list adjusts quantities accordingly." },
      { q: "Does it include a shopping list?", a: "Yes — a full shopping list for food, drinks, decor, and supplies with quantities calculated from your guest count." },
      { q: `Can the ${t.title} do kid parties?`, a: "Yes. Enable the kid mode or set the audience to 'kids' or 'mixed-age', and the activity picks, menu, and timing all shift accordingly." },
      { q: "Does it recommend recipes?", a: "The menu includes suggested recipes with make-ahead notes. Most link out to standard recipes you can find quickly." },
      { q: "Can I export or print the plan?", a: "Yes — the plan is printable, and signed-in users can save it to their account." },
      { q: "What about costume contests?", a: "The activity module includes a costume-contest option with category suggestions ('Best DIY', 'Scariest', 'Best Couple') and voting logistics." },
      { q: "Does it plan the timing around trick-or-treaters?", a: "Yes, for parties on Halloween night. It builds in the 6-8pm trick-or-treat window so you're not stuck answering the door mid-activity." },
      { q: "Can I run a Halloween party on a low budget?", a: "Yes. Set a low budget and the plan skews potluck, DIY decor, and simpler recipes. It still feels like a real party." },
      { q: "Is there a playlist recommendation?", a: "Yes — you get a themed playlist arc with example tracks. Copy the list into Spotify or Apple Music." },
      { q: "Can I plan for a specific dietary need?", a: "Yes. Enter allergens or dietary requirements (vegetarian, gluten-free, nut allergy) and the menu adapts." },
    ],
  }),
  Images: (t) => ({
    features: [
      { emoji: "🖼️", title: "Original AI artwork", description: `Every image from the ${t.title} is generated fresh — never a reused stock photo. Two people running the same prompt get different results.` },
      { emoji: "📱", title: "Sized for every screen", description: "Presets for iPhone, Android, iPad, MacBook, ultrawide, and 4K — plus square and vertical social ratios." },
      { emoji: "🆓", title: "Free to download", description: "No watermark, no signup, no export paywall." },
      { emoji: "♻️", title: "Regenerate anytime", description: "Don't love it? Run it again. Unlimited generations." },
    ],
    benefits: [
      { emoji: "🎨", title: "Halloween-tuned prompts", description: `The ${t.title} steers prompts toward spooky-season aesthetics automatically — fog, moonlight, jack-o'-lanterns, moody palettes — so you don't have to write art-direction prose to get a good result.` },
      { emoji: "📐", title: "Correct aspect ratios", description: "You pick the target platform (lock screen, Instagram story, Facebook cover, YouTube thumbnail) and the tool generates at the right ratio the first time — no cropping later." },
      { emoji: "🎭", title: "Multiple aesthetic modes", description: "Photorealistic, illustrated, cartoon, cottagecore, retro-horror, cinematic — the same subject looks completely different across modes." },
      { emoji: "🖨️", title: "Print-resolution downloads", description: "Downloads are high-res enough to print. Some users use them for posters, framed art, or printed cards." },
      { emoji: "🚫", title: "No watermark ever", description: "The tool never stamps outputs — not on free downloads, not on any downloads. Every file is clean." },
      { emoji: "🕒", title: "Fast generation", description: "Under 15 seconds per image on average, so you can iterate through directions quickly." },
      { emoji: "🔁", title: "Prompt variations", description: "The tool exposes a 'more like this' option so you can lock a direction and get subtle variations, not full re-rolls." },
      { emoji: "📱", title: "Mobile-first UI", description: "You can generate, preview, and save-to-phone directly from your phone browser." },
      { emoji: "🎯", title: "No manual prompt engineering", description: "Style, mood, and subject controls do the prompt engineering for you. Beginners get good results without learning Midjourney syntax." },
      { emoji: "💾", title: "Save favorites", description: "Signed-in users can save favorite outputs to reuse or reference later." },
    ],
    howTo: [
      { name: "Describe what you want", text: `Enter a subject, a mood, and a color palette into the ${t.title}. The more specific, the better — 'moody purple graveyard at dusk with fog' beats 'graveyard'.` },
      { name: "Pick a style", text: "Choose photoreal, illustrated, cartoon, cinematic, retro-horror, or another mode. This has the biggest effect on the output." },
      { name: "Set the size", text: "Pick the target format (phone wallpaper, desktop wallpaper, Instagram post, story, YouTube thumbnail, print). Aspect ratio auto-adjusts." },
      { name: "Generate", text: "The AI creates your image in a few seconds. You'll usually see a small batch of variations, not a single result." },
      { name: "Compare and pick a favorite", text: "Look through the batch. Zoom in to check details before committing." },
      { name: "Iterate if needed", text: "Not there yet? Use 'more like this' to lock the direction, or tweak the prompt and regenerate for a bigger shift." },
      { name: "Download the high-res file", text: "Tap download. The full-resolution PNG saves to your device with no watermark." },
      { name: "Use it or share it", text: "Set it as a wallpaper, post it, print it, or share it to the community feed for other users to see and download." },
    ],
    useCases: [
      { emoji: "📱", title: "Phone wallpapers", description: "A new spooky lock screen every day of October." },
      { emoji: "💻", title: "Desktop backgrounds", description: "Home-office spooky-season refresh for your monitor." },
      { emoji: "📢", title: "Social posts", description: "Instagram feed, story overlays, and TikTok cover images." },
      { emoji: "📌", title: "Pinterest pins", description: "Vertical images optimized for pin-friendly search." },
      { emoji: "🎥", title: "YouTube thumbnails", description: "Vibrant Halloween-themed thumbnails that pop in a feed." },
      { emoji: "🖼️", title: "Framed prints", description: "Wall-art quality PNGs you can send to a print-on-demand shop." },
      { emoji: "🎪", title: "Event graphics", description: "Backdrops for haunted houses, escape rooms, and pop-up events." },
      { emoji: "📇", title: "Blog headers", description: "Featured images for October blog posts and newsletters." },
      { emoji: "🎁", title: "Digital gifts", description: "Custom images to text to friends and family on Halloween." },
      { emoji: "🎮", title: "Streamer overlays", description: "Twitch/YouTube overlay art for a Halloween-themed stream." },
    ],
    tips: [
      "Describe mood and lighting, not just objects. 'Moody purple graveyard at dusk' beats 'graveyard' every time.",
      "Regenerate three to five times and pick the best. Outputs vary and the first run is rarely the best.",
      "Use 'more like this' when you find a direction you like. It gives you variations rather than starting over.",
      "For phone wallpapers, leave visual space at the top and bottom for clock and app icons.",
      "For social posts, generate at the platform's exact aspect ratio — square for feed, 9:16 for stories/Reels.",
      "Save prompts that produce great results. You can reuse the same prompt with small tweaks for a whole series.",
    ],
    mistakes: [
      { title: "One-word prompts", description: "'Halloween' isn't a prompt, it's a keyword. Add subject, mood, color, and style descriptors — you'll get dramatically better results." },
      { title: "Taking the first output as final", description: "AI image outputs vary. Always look at three to five generations before committing." },
      { title: "Wrong aspect ratio for the platform", description: "A square image gets cropped ugly on a phone lock screen. Always pick the right target format first." },
      { title: "Fighting the model", description: "If a prompt keeps returning off-brief results, the fix is usually a totally different phrasing, not adding more adjectives to the same one." },
      { title: "Skipping the download resolution check", description: "Some users grab a preview thumbnail instead of the full download. Always tap the download button, not save-image from the preview." },
      { title: "Not saving what works", description: "Great prompts are hard to reverse-engineer later. Save prompts to a notes doc so you can reuse them next year." },
    ],
    faqs: [
      { q: "Can I use the images commercially?", a: "Yes — every output is yours to use for personal or commercial projects. Merch, client work, printed art, all fair game." },
      { q: "Are the images watermarked?", a: "No. Every download is clean and unstamped." },
      { q: `What resolution does the ${t.title} export?`, a: "The default is high-resolution (typically 1024–2048px on the long edge), and print sizes go higher. Enough for phone/desktop wallpapers and standard prints." },
      { q: "Do the same inputs always give the same image?", a: "No. Every generation is fresh — same prompt twice usually gives two different images, which is intentional for creative iteration." },
      { q: "Can I edit or refine an image?", a: "Not in-tool. Download and use any image editor (Photoshop, Photopea, Canva) for touch-ups." },
      { q: "Do the images have people's real faces?", a: "No. All figures are AI-generated composites — no real person is depicted." },
      { q: "Can I request specific characters or franchises?", a: "The tool can produce works in the style of a genre (Victorian horror, 80s slasher, cottagecore witchy) but avoids identifying specific copyrighted characters by name in outputs meant for commercial use." },
      { q: "How long do generations take?", a: "Usually 5–15 seconds, sometimes longer during peak season demand." },
      { q: "What happens if I don't like the output?", a: "Regenerate. There's no cap and no cost per run. Adjust the prompt or the style toggle for a new direction." },
      { q: "Can I download multiple sizes?", a: "You pick the target size before generating. To get a different ratio, regenerate at that ratio." },
    ],
  }),
  Printables: (t) => ({
    features: [
      { emoji: "🖨️", title: "Print-ready files", description: `Every ${t.title} output is a one-click print on any home printer at real page sizes (Letter or A4).` },
      { emoji: "👶", title: "Kid-safe by default", description: "Age-appropriate designs and themes; nothing surprising in a preschool goodie bag." },
      { emoji: "🆓", title: "Free downloads", description: "No signup wall, no watermark, no daily limit." },
      { emoji: "♾️", title: "Endless variations", description: "Regenerate as often as you like for a fresh sheet." },
    ],
    benefits: [
      { emoji: "🖨️", title: "Real print resolution", description: `The ${t.title} outputs at 300 DPI so lines stay crisp on paper, not blurry like a screen-grabbed Pinterest image.` },
      { emoji: "📄", title: "Standard paper sizes", description: "Letter and A4 by default. No custom paper, no oversize printer, no trimming required." },
      { emoji: "🖤", title: "Print black-and-white or color", description: "Every printable is designed to work in grayscale for ink savings — coloring pages, in particular, are meant to be printed black-and-white anyway." },
      { emoji: "🎨", title: "Themed sets", description: "Generate a matching set (pumpkins, monsters, cats, haunted houses) so a whole classroom or a whole goodie-bag drop feels coordinated." },
      { emoji: "🏫", title: "Classroom-safe content", description: "Difficulty and imagery are age-tunable, so preschool pages don't accidentally include something too scary." },
      { emoji: "💰", title: "Zero cost per copy", description: "Once printed, you own the file. Print 30 for a class party or 3 for a rainy afternoon — same price (free)." },
      { emoji: "🔁", title: "Regenerate for variety", description: "Same theme, different design, one tap. Kids who finish fast can get a new page." },
      { emoji: "✏️", title: "Reusable across ages", description: "The 'simple' setting works for preschool; the 'detailed' setting works for adults who like intricate coloring." },
      { emoji: "🚫", title: "No watermark", description: "Nothing is stamped across your printable. The page is yours." },
      { emoji: "📥", title: "Instant download", description: "No email required, no export queue. Click, download, print." },
    ],
    howTo: [
      { name: "Pick a category", text: `Choose the ${t.title} category — pumpkins, monsters, witches, black cats, haunted houses, mandalas — or type a custom theme.` },
      { name: "Set difficulty and age", text: "Pick 'simple' for preschool, 'medium' for elementary, 'detailed' for older kids and adults." },
      { name: "Generate the printable", text: "The tool builds a print-ready page in a few seconds." },
      { name: "Preview at real size", text: "Check the preview to make sure the design fills the page the way you expect." },
      { name: "Regenerate if needed", text: "Not right? Regenerate for a fresh design at the same difficulty." },
      { name: "Download the file", text: "Tap download to save the PDF or PNG to your device." },
      { name: "Print on standard paper", text: "Use Letter or A4 paper. Home printers work fine — no special paper required." },
      { name: "Distribute (or laminate for reuse)", text: "Hand out at parties, tuck into goodie bags, or laminate for wipe-clean reusable activities." },
    ],
    useCases: [
      { emoji: "🏫", title: "Classroom activities", description: "Group activities for preschool through elementary." },
      { emoji: "🎉", title: "Party favors", description: "Activity sheets tucked into goodie bags." },
      { emoji: "🏠", title: "Rainy-day fun", description: "Quiet-time activities at home during October." },
      { emoji: "⛪", title: "Church programs", description: "Kids' ministry Halloween or Harvest programs." },
      { emoji: "🏥", title: "Waiting rooms", description: "Kid-distraction printouts for dental offices and pediatric clinics." },
      { emoji: "👨‍👩‍👧", title: "Grandparent visits", description: "Print-a-page-a-day for weekend visits." },
      { emoji: "🎃", title: "Trick-or-treat alternatives", description: "Coloring pages for houses that don't want to hand out candy." },
      { emoji: "📚", title: "Library programs", description: "Kids' Halloween story-hour activity handouts." },
      { emoji: "🧠", title: "Homeschool", description: "Themed October worksheet material." },
      { emoji: "🎨", title: "Adult coloring", description: "Intricate designs for adults who color to relax." },
    ],
    tips: [
      "Print black-and-white to save ink — coloring is more fun on plain paper anyway.",
      "Laminate a few sheets for wipe-clean reuse with dry-erase markers.",
      "Print a mixed pack (simple + medium + detailed) so kids of different ages have options.",
      "For classroom use, print 10% extra. Kids will drop, tear, or 'want a new one because they messed up'.",
      "Use cardstock for wall-decoration coloring pages — they don't curl and they hold color better.",
      "Bundle a printable with a small pack of crayons for a $1 goodie-bag win.",
    ],
    mistakes: [
      { title: "Printing at 'best photo' quality", description: "For coloring pages, 'draft' or 'normal' quality is fine and saves ink. Photo-quality is overkill." },
      { title: "Using printer paper for wall art", description: "For anything you want to display, use cardstock. Regular paper wrinkles when kids color heavily." },
      { title: "Forgetting age labels", description: "Handing a detailed mandala to a 4-year-old ends in tears. Match difficulty to age." },
      { title: "Buying scented markers", description: "They bleed through pages and stain tables. Regular crayons or colored pencils are safer for group activities." },
      { title: "Printing one at a time", description: "For a party, batch print. Waiting for the printer at 4pm is a stress you don't need." },
      { title: "Overlooking scissors safety", description: "Some printables involve cutting. Kid scissors only for anyone under 8." },
    ],
    faqs: [
      { q: "Do I need special paper?", a: "No. Standard printer paper works. Cardstock feels nicer and holds crayon better if you have it." },
      { q: "Are these classroom-safe?", a: "Yes. Designs are age-appropriate and default to non-scary. You can dial up the spookiness with the style toggle." },
      { q: `Can I print the ${t.title} pages in bulk?`, a: "Yes. Home printers can do 20-30 at a time comfortably; for bigger runs, save to PDF and send to a copy shop." },
      { q: "Are the files free to distribute?", a: "For personal, classroom, and community use, yes — as many copies as you need. For selling them as-is (undecorated coloring books), please generate original derivatives instead." },
      { q: "What if my printer doesn't have color ink?", a: "All coloring pages are line art and print perfectly in black-and-white." },
      { q: "Can I download as PDF?", a: "Yes — the download option is a print-ready PDF (or PNG where relevant)." },
      { q: "What ages are the printables for?", a: "The 'simple' setting is preschool-friendly (3-5), 'medium' is elementary (6-10), and 'detailed' works for older kids and adults." },
      { q: "Can I customize the printable with a name?", a: "Yes. Some printable types accept a name field that appears on the page — great for personalized goodie bags." },
      { q: "Do you have Halloween worksheets, not just coloring?", a: "Yes — the tool can output word searches, mazes, connect-the-dots, and simple math sheets with a Halloween theme." },
      { q: "Are the printables safe for religious/church contexts?", a: "Yes. Set the tone to 'harvest' or 'friendly' for non-scary imagery suitable for church programs." },
    ],
  }),
  Social: (t) => ({
    features: [
      { emoji: "🔥", title: "On-trend copy", description: `The ${t.title} writes in the language people actually use in October — not last-decade meme captions or corporate 'happy Halloween' voice.` },
      { emoji: "⚡", title: "Instant", description: "Generated in under five seconds." },
      { emoji: "🎯", title: "Platform-aware", description: "Tone shifts for Instagram, TikTok, X, Facebook, and Pinterest." },
      { emoji: "🆓", title: "Free forever", description: "Unlimited generations, no signup, no watermark." },
    ],
    benefits: [
      { emoji: "🗣️", title: "Writes like a person, not a brand", description: `The ${t.title} avoids the 'corporate Halloween social manager' voice. Outputs sound like something a human would actually caption.` },
      { emoji: "📱", title: "Platform-native", description: "Instagram captions can be long and story-forward. TikTok hooks are punchy. Twitter/X is a one-liner. Pinterest is descriptive. The tool respects those differences." },
      { emoji: "🎭", title: "Tone dials", description: "Funny, spooky, wholesome, edgy, romantic, cinematic. You pick the mood, the tool respects it." },
      { emoji: "🏷️", title: "Hashtag-compatible", description: "Outputs pair cleanly with the Hashtag Generator for a complete post workflow." },
      { emoji: "⏱️", title: "Beats writer's block", description: "You get a batch of usable starting points instead of staring at a blinking cursor at 11pm." },
      { emoji: "📸", title: "Photo-context aware", description: "You can describe the photo ('costume selfie', 'pumpkin close-up', 'porch shot at night') and captions match the visual mood." },
      { emoji: "🔁", title: "Unlimited runs", description: "Generate ten batches for the same photo and mix the best line from each." },
      { emoji: "🌍", title: "Audience-appropriate", description: "You can specify 'friends only', 'brand-safe for work', or 'creator/edgy' and outputs shift accordingly." },
      { emoji: "🚫", title: "No plagiarism risk", description: "Every generation is fresh, not lifted from another creator's caption you saw once." },
      { emoji: "💾", title: "Save your favorites", description: "Signed-in users can save go-to captions for reuse throughout the season." },
    ],
    howTo: [
      { name: "Describe the post", text: `Tell the ${t.title} what the photo or video is: a costume selfie, a carved pumpkin, a party recap, a moody porch shot.` },
      { name: "Pick a vibe", text: "Funny, spooky, wholesome, edgy, romantic — the vibe is the single biggest lever on output style." },
      { name: "Pick a platform", text: "Instagram, TikTok, X, Facebook, or Pinterest. Length and voice adjust automatically." },
      { name: "Set a length preference", text: "Short one-liner, medium, or long storytelling caption. Choose what fits your posting style." },
      { name: "Generate a batch", text: "The tool returns a batch of options — usually 5–10 — rather than a single answer." },
      { name: "Read the batch out loud", text: "The lines that sound like something you'd actually say are the ones to use. Skip anything that sounds like a brand." },
      { name: "Copy your favorite", text: "Tap copy on the winner, or mix your favorite phrases across two or three outputs." },
      { name: "Add hashtags and post", text: "Pair with the Hashtag Generator, or type your own tags, and publish." },
    ],
    useCases: [
      { emoji: "📸", title: "Costume photos", description: "Captions for fit pics and reveal shots." },
      { emoji: "🎃", title: "Pumpkin posts", description: "Copy for carving reveals and porch shots." },
      { emoji: "🥳", title: "Party recaps", description: "Post-party carousels and Reels captions." },
      { emoji: "🍭", title: "Trick-or-treat posts", description: "Kid-costume-and-candy story overlays." },
      { emoji: "🧙‍♀️", title: "Makeup looks", description: "Captions for elaborate SFX or beauty Halloween makeup posts." },
      { emoji: "🎥", title: "TikTok hooks", description: "First-line hooks that stop the scroll." },
      { emoji: "🏪", title: "Small-brand promos", description: "October product launches and limited-run drops." },
      { emoji: "🎨", title: "Creator content", description: "Captions for creators posting daily October content." },
      { emoji: "📌", title: "Pinterest pins", description: "Description text tuned for Pinterest's longer, keyword-rich format." },
      { emoji: "💬", title: "Threads / X", description: "One-liner posts and reply-bait for Halloween timelines." },
    ],
    tips: [
      "Run the tool two or three times and mix lines from different batches. The best final caption is usually a hybrid.",
      "Pair captions with the Hashtag Generator for a full post-in-one-minute workflow.",
      "Add one specific detail to any generated caption before posting — a name, a location, a joke your friends will get. It makes AI copy read as yours.",
      "Save go-to captions in a Notes doc. Even the best generator has a rare hit; keep the hits.",
      "For carousels, use a punchy line-one on the first slide and save the long story for the caption body.",
      "Read every caption out loud once. If it doesn't sound like you talking, edit or regenerate.",
    ],
    mistakes: [
      { title: "Using the same voice for every platform", description: "A caption that reads well on Instagram feels overwritten on X and underwritten on Pinterest. Match the tool's platform setting to where you're posting." },
      { title: "Posting the raw output verbatim", description: "Even great generated copy improves with one personal tweak. Never post the very first line without adding a detail of your own." },
      { title: "Ignoring the vibe control", description: "If the tool feels off, it's usually because you're at 'funny' when you wanted 'wholesome'. Swap the dial before rewriting the prompt." },
      { title: "Over-hashtagging", description: "30 tags on every post is 2018 advice. 8-12 well-chosen tags perform better on today's algorithms." },
      { title: "Skipping the hook", description: "The first line of a caption is what determines whether people expand it. Make the hook count." },
      { title: "Using tone-deaf humor", description: "Halloween lets you be edgy, but read anything explicitly dark out loud before posting. Not every audience is on for it." },
    ],
    faqs: [
      { q: "Do you save what I generate?", a: "No. Generations aren't stored on a public feed unless you explicitly hit share. Your inputs aren't used to train a public model." },
      { q: "Can I request a specific style?", a: "Yes. Tell it 'funny', 'spooky', 'wholesome', 'edgy', or 'cinematic' and the tone shifts." },
      { q: `Can I use ${t.title} output on brand accounts?`, a: "Yes. Outputs are yours to use commercially — brand social, ads, marketing copy — no attribution required." },
      { q: "What if it keeps giving me the same feel?", a: "Change the vibe or the platform setting, not just the prompt. Same prompt at a different vibe is a completely different output space." },
      { q: "Does it work on mobile?", a: "Yes — the tool is mobile-first, and 90% of users generate on their phone." },
      { q: "Can I paste in a photo for context?", a: "You describe the photo in text ('costume selfie, close-up, moody purple light') and the caption is written around that description." },
      { q: "How long can captions be?", a: "You pick short (one-liner), medium (2-3 sentences), or long (storytelling paragraph). Instagram supports up to 2,200 characters — the long option targets around 200-400." },
      { q: "Can it write hashtags too?", a: "Not this specific tool — but pair it with the Halloween Hashtag Generator for a full workflow." },
      { q: "Will it generate NSFW content?", a: "No. Outputs are brand-safe and platform-safe by default. Adult humor is limited to mild, socially-acceptable Halloween edginess." },
      { q: "How is this different from ChatGPT?", a: "It's tuned specifically for Halloween posts, with pre-built platform and vibe controls. You get a great caption in one tap; with ChatGPT you'd have to write and refine the prompt yourself." },
    ],
  }),
  "Wishes & Quotes": (t) => ({
    features: [
      { emoji: "💌", title: "Warm, thoughtful voice", description: `The ${t.title} writes wishes and quotes that sound personal — not the recycled 'Have a boo-tiful day' rotation.` },
      { emoji: "🎭", title: "Every tone", description: "Funny, wholesome, gothic, romantic, professional. Every relationship gets an appropriate voice." },
      { emoji: "📱", title: "Copy in one tap", description: "Every generated wish or quote copies to your clipboard instantly for texts, cards, or posts." },
      { emoji: "🆓", title: "Free with no signup", description: "Unlimited generations, nothing gated." },
    ],
    benefits: [
      { emoji: "❤️", title: "Sounds like something you'd write", description: `The ${t.title} avoids stock greeting-card phrasing. Outputs read as considered rather than filler.` },
      { emoji: "👥", title: "Recipient-tuned", description: "You pick who it's for (family, friend, partner, coworker, client, kid) and the tone and length adjust to match." },
      { emoji: "📏", title: "Length control", description: "One-liner for texts, medium for cards, long for a heartfelt note. Pick what fits." },
      { emoji: "🎨", title: "Style variety", description: "Playful, sincere, spooky, funny, poetic, professional — the same relationship can produce five very different vibes." },
      { emoji: "📇", title: "Card-ready output", description: "Wishes are formatted to drop straight into a printed or digital card without reformatting." },
      { emoji: "💬", title: "Text-message-native", description: "Short options are sized for actual SMS and iMessage, not artificially trimmed poems." },
      { emoji: "🌐", title: "Culturally-aware", description: "Options can skew secular, harvest-focused, or classic Halloween depending on preference." },
      { emoji: "🔁", title: "Unlimited retries", description: "Nothing lands? Regenerate — outputs vary widely across runs." },
      { emoji: "💾", title: "Save your favorites", description: "Keep a stash of great lines to reuse for cards, texts, and social posts throughout October." },
      { emoji: "🚫", title: "No cliché overload", description: "The tool actively avoids overused phrases so your message doesn't sound identical to your neighbor's." },
    ],
    howTo: [
      { name: "Pick the recipient", text: `In the ${t.title}, choose who the message is for: friend, family, partner, coworker, client, or kid.` },
      { name: "Pick the tone", text: "Funny, sincere, wholesome, spooky, professional, romantic, or poetic. This is the biggest lever on the output." },
      { name: "Pick the length", text: "Short (SMS), medium (card), or long (heartfelt note or email)." },
      { name: "Generate a batch", text: "The tool returns several options. Reading a batch is faster than trying to write one from scratch." },
      { name: "Scan for a favorite", text: "Look for a line that sounds like something you'd actually say. That's the one." },
      { name: "Personalize with one detail", text: "Add a name, a shared inside reference, or a specific date. That one edit turns 'AI wish' into 'from me'." },
      { name: "Copy and send", text: "Tap copy, paste into a text, an email, or a card. Done." },
      { name: "Save the good ones", text: "Signed-in users can save favorite lines for reuse next October or across multiple recipients." },
    ],
    useCases: [
      { emoji: "💌", title: "Greeting cards", description: "Card interior text for printed or digital Halloween cards." },
      { emoji: "📱", title: "Text messages", description: "Personal Halloween texts for family and friends." },
      { emoji: "📧", title: "Client emails", description: "Professional, brand-safe Halloween greetings for a customer list." },
      { emoji: "💼", title: "Coworker cards", description: "Office-appropriate wishes that still feel personal." },
      { emoji: "🎁", title: "Gift tags", description: "Short lines for tags on Halloween treats and hostess gifts." },
      { emoji: "💒", title: "Wedding programs (October)", description: "Halloween-adjacent wishes for October weddings and anniversaries." },
      { emoji: "👨‍👩‍👧", title: "Family notes", description: "Sweet wishes for kids' lunchboxes and grandparents' cards." },
      { emoji: "❤️", title: "Partner texts", description: "Romantic Halloween-themed love notes." },
      { emoji: "📢", title: "Social captions", description: "Wishes reformatted as caption text for October posts." },
      { emoji: "🏫", title: "Teacher-to-parent", description: "Class-wide Halloween messages sent home in newsletters." },
    ],
    tips: [
      "Always add one personal detail — a name, a shared reference, a specific date. It's the difference between generic and heartfelt.",
      "For office cards, keep the tone professional but warm. Skip anything explicitly spooky or dark.",
      "Match length to medium. Long wishes belong in cards; short ones belong in text messages.",
      "Read every wish out loud once. If it doesn't sound like you, edit or regenerate.",
      "Save great lines. Some wishes become annual traditions if you keep them.",
      "For grief-adjacent recipients (recent loss), skip the 'spooky' tone and stay on 'warm' — Halloween can be a hard week.",
    ],
    mistakes: [
      { title: "Sending the raw output verbatim", description: "Even a great line reads generic without one personal tweak. Take five seconds to add a detail." },
      { title: "Using spooky humor for professional contexts", description: "'Boo!' works for family. It doesn't work for a client email. Match tone to relationship." },
      { title: "One wish for everyone", description: "Copy-pasting the same wish to 30 recipients feels lazy when someone compares notes. Regenerate per person, or at least per group." },
      { title: "Sending scary content to grief-adjacent recipients", description: "For anyone recently bereaved, the 'spooky' tone can land wrong. Default to wholesome and warm." },
      { title: "Overwriting simple messages", description: "Not every wish needs three paragraphs. A one-line 'thinking of you this Halloween' is often perfect." },
      { title: "Skipping the recipient control", description: "The recipient setting shifts the whole output. A wish for 'partner' vs 'coworker' is completely different — set it before you generate." },
    ],
    faqs: [
      { q: `Is the ${t.title} free?`, a: "Yes, entirely — no signup, no daily cap, no watermark." },
      { q: "Can I use the wishes commercially?", a: "Yes. Use them in client emails, printed cards for sale, or any commercial context." },
      { q: "Can I ask for a specific recipient?", a: "Yes. You can specify 'grandmother', 'boss', 'best friend', 'child', 'partner', 'client', or type a custom relationship." },
      { q: "How long can a wish or quote be?", a: "You choose short (SMS-ready), medium (card-ready), or long (heartfelt letter). All lengths are supported." },
      { q: "Are the wishes original?", a: "Yes. Each is generated fresh, not pulled from a static library, so you won't see the same wish elsewhere." },
      { q: "Can it write religious/faith-based wishes?", a: "Yes. Set the tone to 'harvest' or specify a faith context in the prompt and the tool will adjust." },
      { q: "What if I don't want any 'spooky' theme?", a: "Set tone to 'wholesome' or 'harvest' and the output stays warm without spooky imagery." },
      { q: "Can I generate in another language?", a: "Currently the tool is optimized for US English. Other languages work but with reduced quality." },
      { q: "Are the wishes appropriate for kids?", a: "Yes. Set recipient to 'child' or tone to 'wholesome' for age-appropriate output." },
      { q: "How do I use these on a physical card?", a: "Copy the wish, paste it into your Halloween Card Maker design or a card-printing app, and print or send digitally." },
    ],
  }),
};

// ---------------------------------------------------------------------------
// Per-slug overrides for extra personalization (intro / benefits / faqs).
// ---------------------------------------------------------------------------
const OVERRIDES: Partial<Record<string, Partial<ToolContent>>> = {
  "costume-generator": {
    intro:
      "Stuck on what to be for Halloween? The AI Costume Generator turns a few details about you into personalized costume ideas — from clever couples looks to last-minute solo wins — in seconds.",
    ctaSlug: "caption-generator",
  },
  "pumpkin-carving-generator": {
    intro:
      "Design a jack-o'-lantern that actually looks the way you imagined. Describe a vibe — cute, scary, funny, elegant — and the Pumpkin Carving Generator returns a printable stencil you can carve tonight.",
    ctaSlug: "pumpkin-template-generator",
  },
  "party-planner": {
    intro:
      "The Party Planner turns 'I want to throw a Halloween party' into a full playbook: guest count, menu, decor, playlist and a run-of-show timeline you can actually follow.",
    ctaSlug: "party-name-generator",
  },
  "caption-generator": { ctaSlug: "hashtag-generator" },
  "hashtag-generator": { ctaSlug: "caption-generator" },
  "invitation-maker": { ctaSlug: "party-planner" },
  "poster-maker": { ctaSlug: "flyer-maker" },
  "banner-maker": { ctaSlug: "poster-maker" },
  "flyer-maker": { ctaSlug: "poster-maker" },
  "logo-maker": { ctaSlug: "banner-maker" },
  "wish-generator": { ctaSlug: "message-generator" },
  "quote-generator": { ctaSlug: "wish-generator" },
  "message-generator": { ctaSlug: "wish-generator" },
  "wallpaper-generator": { ctaSlug: "sticker-generator" },
  "sticker-generator": { ctaSlug: "profile-picture-generator" },
  "profile-picture-generator": { ctaSlug: "avatar-generator" },
  "avatar-generator": { ctaSlug: "profile-picture-generator" },
  "scary-story-generator": { ctaSlug: "quote-generator" },
  "meme-generator": { ctaSlug: "caption-generator" },
  "pumpkin-template-generator": { ctaSlug: "pumpkin-carving-generator" },
  "pumpkin-face-generator": { ctaSlug: "pumpkin-carving-generator" },
  "coloring-pages-generator": { ctaSlug: "pumpkin-template-generator" },
  "name-generator": { ctaSlug: "scary-story-generator" },
  "party-name-generator": { ctaSlug: "party-planner" },
  "ai-prompt-generator": { ctaSlug: "wallpaper-generator" },
};

// Fallback if a category isn't found in the template map.
const DEFAULT_TEMPLATE = CATEGORY_TEMPLATES.AI;

function defaultIntro(t: ToolCard): string {
  return `${t.title} is a free Halloween tool that turns a few quick inputs into fresh, on-theme results in seconds. No signup, no watermark, no learning curve — just pick, generate and use.`;
}

export function getToolContent(tool: ToolCard): ToolContent {
  const template = (CATEGORY_TEMPLATES[tool.category] ?? DEFAULT_TEMPLATE)(tool);
  const override = OVERRIDES[tool.slug];
  const about = ABOUT[tool.slug] ?? `${tool.description} ${defaultIntro(tool)}`;
  return {
    intro: override?.intro ?? defaultIntro(tool),
    about,
    features: override?.features ?? template.features,
    benefits: override?.benefits ?? template.benefits,
    howTo: override?.howTo ?? template.howTo,
    useCases: override?.useCases ?? template.useCases,
    tips: override?.tips ?? template.tips,
    mistakes: override?.mistakes ?? template.mistakes,
    faqs: override?.faqs ?? template.faqs,
    ctaSlug: override?.ctaSlug,
  };
}

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------
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

export function webPageJsonLd(tool: ToolCard, content: ToolContent, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${tool.title} — Free Halloween Tool`,
    description: content.about.slice(0, 300),
    url,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", name: "HalloweenTools", url: "/" },
    about: { "@type": "Thing", name: tool.category },
    primaryImageOfPage: undefined,
  };
}
