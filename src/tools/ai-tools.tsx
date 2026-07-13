import { useState } from "react";
import { AITextListTool, AILongTextTool, AIImageTool } from "./ai-shell";
import { Field, inputCls, selectCls } from "./shell";

// ============= TEXT TOOLS =============

export function AICostumeGenerator() {
  const [who, setWho] = useState("adult");
  const [vibe, setVibe] = useState("Funny");
  const [budget, setBudget] = useState("Any");
  return (
    <AITextListTool
      count={6}
      cta="🧙 Generate costume ideas"
      system="You are a creative Halloween costume designer. Suggest imaginative, buildable costume ideas. Each idea should be ONE line: a punchy name + a 6-10 word description of key pieces. Mix classic and unexpected takes. Avoid offensive stereotypes."
      buildPrompt={() =>
        `Generate ${6} Halloween costume ideas for a ${who}. Vibe: ${vibe}. Budget: ${budget}.`
      }
    >
      <Field label="For">
        <select className={selectCls} value={who} onChange={(e) => setWho(e.target.value)}>
          <option value="adult">Adult</option>
          <option value="kid">Kid</option>
          <option value="couple">Couple</option>
          <option value="group">Group / Family</option>
          <option value="pet">Pet</option>
        </select>
      </Field>
      <Field label="Vibe">
        <select className={selectCls} value={vibe} onChange={(e) => setVibe(e.target.value)}>
          {["Funny", "Scary", "Cute", "Iconic", "Pop culture 2026", "DIY", "Sexy", "Punny"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </Field>
      <Field label="Budget">
        <select className={selectCls} value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option>Any</option><option>Under $25</option><option>$25–$75</option><option>$75+</option>
        </select>
      </Field>
    </AITextListTool>
  );
}

export function AIScaryStoryGenerator() {
  const [topic, setTopic] = useState("a haunted attic");
  const [intensity, setIntensity] = useState("PG-13");
  return (
    <AILongTextTool
      cta="📖 Tell me the story"
      system="You are a master horror storyteller in the vein of Shirley Jackson and Neil Gaiman. Write a short, atmospheric horror story of 220–320 words. Use sensory detail, restrained pacing, and a chilling final line. No gore beyond what the intensity rating allows. Do not include a title."
      buildPrompt={() => `Topic: ${topic}. Intensity: ${intensity}.`}
    >
      <Field label="Topic / setting">
        <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. a lighthouse, a family heirloom" />
      </Field>
      <Field label="Intensity">
        <select className={selectCls} value={intensity} onChange={(e) => setIntensity(e.target.value)}>
          <option>Kid-friendly</option><option>PG-13</option><option>R (adults)</option>
        </select>
      </Field>
    </AILongTextTool>
  );
}

export function AICaptionGenerator() {
  const [topic, setTopic] = useState("my costume");
  const [vibe, setVibe] = useState("Funny");
  const [emojis, setEmojis] = useState(true);
  return (
    <AITextListTool
      count={8}
      cta="✍️ Generate captions"
      system={`You are a witty social media copywriter. Write short (under 120 chars) Halloween Instagram/TikTok captions. Each caption stands alone. ${emojis ? "Include 1-2 fitting emojis per caption." : "Do NOT use emojis."}`}
      buildPrompt={() => `Topic: ${topic}. Vibe: ${vibe}.`}
    >
      <Field label="What's the post about?">
        <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. my witch costume, our haunted house" />
      </Field>
      <Field label="Vibe">
        <select className={selectCls} value={vibe} onChange={(e) => setVibe(e.target.value)}>
          {["Funny", "Cute", "Spooky", "Aesthetic", "Flirty", "Sarcastic"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </Field>
      <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
        <input type="checkbox" checked={emojis} onChange={(e) => setEmojis(e.target.checked)} className="accent-primary" />
        Emojis
      </label>
    </AITextListTool>
  );
}

export function AIMessageGenerator() {
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Sweet");
  const [context, setContext] = useState("");
  return (
    <AITextListTool
      count={4}
      cta="✉️ Generate messages"
      system="You are writing personal Halloween messages a real person would send. 1–3 sentences each. Warm, specific, on-brief. Never generic."
      buildPrompt={() =>
        `Write ${4} Halloween messages to ${recipient || "someone"}. Tone: ${tone}. ${context ? `Context: ${context}` : ""}`.trim()
      }
    >
      <Field label="Recipient">
        <input className={inputCls} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. mom, best friend, coworkers" />
      </Field>
      <Field label="Tone">
        <select className={selectCls} value={tone} onChange={(e) => setTone(e.target.value)}>
          {["Sweet", "Funny", "Spooky", "Romantic", "Professional"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </Field>
      <Field label="Anything else? (optional)">
        <input className={inputCls} value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. their first Halloween in a new city" />
      </Field>
    </AITextListTool>
  );
}

export function AIWishGenerator() {
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Warm");
  return (
    <AITextListTool
      count={5}
      cta="🌙 Generate wishes"
      system="You write heartfelt Halloween wishes for greeting cards and messages. 1–2 sentences each, poetic but grounded. Never cheesy."
      buildPrompt={() => `Halloween wishes ${recipient ? `for ${recipient}` : ""}. Tone: ${tone}.`}
    >
      <Field label="Recipient (optional)">
        <input className={inputCls} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Emma, colleagues" />
      </Field>
      <Field label="Tone">
        <select className={selectCls} value={tone} onChange={(e) => setTone(e.target.value)}>
          {["Warm", "Spooky", "Funny", "Poetic", "Kids"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </Field>
    </AITextListTool>
  );
}

export function AIQuoteGenerator() {
  const [theme, setTheme] = useState("shadows and moonlight");
  return (
    <AITextListTool
      count={6}
      cta="💀 Summon quotes"
      system="You craft original short Halloween quotes (aphorisms) — no author attributions, no plagiarism. 1 sentence each, evocative and quotable."
      buildPrompt={() => `Theme: ${theme}`}
    >
      <Field label="Theme">
        <input className={inputCls} value={theme} onChange={(e) => setTheme(e.target.value)} />
      </Field>
    </AITextListTool>
  );
}

export function AIPromptGenerator() {
  const [subject, setSubject] = useState("haunted pumpkin patch");
  const [medium, setMedium] = useState("digital art");
  return (
    <AITextListTool
      count={6}
      cta="🪄 Generate AI art prompts"
      system="You are a prompt engineer for image AI (Midjourney/DALL-E/Stable Diffusion). Write dense, comma-separated prompts: subject, composition, lighting, mood, style, artist references, technical params. One prompt per line."
      buildPrompt={() => `Subject: ${subject}. Medium: ${medium}. Halloween theme.`}
    >
      <Field label="Subject">
        <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label="Medium">
        <select className={selectCls} value={medium} onChange={(e) => setMedium(e.target.value)}>
          {["digital art", "photograph", "oil painting", "watercolor", "3D render", "pixel art", "anime", "poster"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </Field>
    </AITextListTool>
  );
}

export function AIHashtagGenerator() {
  const [topic, setTopic] = useState("costume");
  return (
    <AITextListTool
      count={30}
      cta="# Generate hashtags"
      system="You generate a mix of high-volume, mid-volume, and niche Instagram/TikTok hashtags for Halloween content. Return each hashtag on its own line, with the # prefix. No spaces inside a tag."
      buildPrompt={() => `Halloween topic: ${topic}. Give 30 hashtags: 10 broad, 10 mid-niche, 10 hyper-niche.`}
    >
      <Field label="Topic">
        <input className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. costume, party, makeup, decor" />
      </Field>
    </AITextListTool>
  );
}

export function AIPartyNameGenerator() {
  const [theme, setTheme] = useState("vampire gala");
  return (
    <AITextListTool
      count={8}
      cta="🎉 Name my party"
      system="You name Halloween parties. Each name is 2–6 words, catchy, printable on an invite. Mix elegant, punny, and dramatic."
      buildPrompt={() => `Theme: ${theme}`}
    >
      <Field label="Theme">
        <input className={inputCls} value={theme} onChange={(e) => setTheme(e.target.value)} />
      </Field>
    </AITextListTool>
  );
}

// ============= IMAGE TOOLS =============

export function AIPumpkinCarvingGenerator() {
  const [subject, setSubject] = useState("a screaming ghost");
  const [style, setStyle] = useState("classic silhouette");
  return (
    <AIImageTool
      cta="🎃 Generate carving pattern"
      filename="pumpkin-pattern"
      system="Generate a HIGH-CONTRAST black-and-white pumpkin carving stencil. Pure black shapes on pure white background. Bold, connected shapes suitable for cutting out. No gray, no gradients, no text."
      buildPrompt={() => `Subject: ${subject}. Style: ${style}. Suitable for printing and carving on a pumpkin.`}
    >
      <Field label="Subject">
        <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. a witch on a broom" />
      </Field>
      <Field label="Style">
        <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>classic silhouette</option><option>intricate detail</option><option>geometric</option><option>cartoon</option>
        </select>
      </Field>
    </AIImageTool>
  );
}

export function AIWallpaperGenerator() {
  const [scene, setScene] = useState("full moon over a haunted forest");
  const [device, setDevice] = useState("phone");
  return (
    <AIImageTool
      cta="📱 Generate wallpaper"
      filename="halloween-wallpaper"
      aspect="aspect-[9/16]"
      system="Generate a stunning Halloween wallpaper. Cinematic, high resolution, moody atmosphere. Rich blacks, deep purples, glowing accents. No text, no watermarks."
      buildPrompt={() => `Scene: ${scene}. Format: ${device === "phone" ? "vertical 9:16 portrait" : "horizontal 16:9 landscape"}.`}
    >
      <Field label="Scene">
        <input className={inputCls} value={scene} onChange={(e) => setScene(e.target.value)} />
      </Field>
      <Field label="Device">
        <select className={selectCls} value={device} onChange={(e) => setDevice(e.target.value)}>
          <option value="phone">Phone (portrait)</option>
          <option value="desktop">Desktop (landscape)</option>
        </select>
      </Field>
    </AIImageTool>
  );
}

export function AIStickerGenerator() {
  const [subject, setSubject] = useState("cute ghost with a bow");
  return (
    <AIImageTool
      cta="🩸 Generate sticker"
      filename="halloween-sticker"
      system="Generate a die-cut sticker illustration on a clean white background. Bold outlines, saturated colors, kawaii-cute Halloween aesthetic. Centered subject, plenty of margin. No text."
      buildPrompt={() => `Sticker of: ${subject}.`}
    >
      <Field label="Sticker subject">
        <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIProfilePictureGenerator() {
  const [desc, setDesc] = useState("elegant vampire with red eyes");
  return (
    <AIImageTool
      cta="🧛 Generate profile pic"
      filename="halloween-pfp"
      system="Generate a stylized Halloween profile picture. Character portrait, head and shoulders, centered. Cinematic lighting, painterly detail. No text, no logo, no watermark."
      buildPrompt={() => `Character: ${desc}.`}
    >
      <Field label="Describe your character">
        <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIAvatarGenerator() {
  const [desc, setDesc] = useState("witch with silver hair and a black cat");
  const [style, setStyle] = useState("anime");
  return (
    <AIImageTool
      cta="🧟 Generate avatar"
      filename="halloween-avatar"
      system="Generate a stylized character avatar for use as a profile picture. Centered, head-and-shoulders, cohesive style, plain gradient or vignette background."
      buildPrompt={() => `Style: ${style}. Character: ${desc}. Halloween theme.`}
    >
      <Field label="Character">
        <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Field>
      <Field label="Style">
        <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>anime</option><option>pixar-style 3D</option><option>watercolor</option><option>comic book</option><option>photorealistic</option>
        </select>
      </Field>
    </AIImageTool>
  );
}

export function AIColoringPagesGenerator() {
  const [subject, setSubject] = useState("a friendly ghost trick-or-treating");
  return (
    <AIImageTool
      cta="🖍️ Generate coloring page"
      filename="coloring-page"
      system="Generate a printable kids' coloring page. PURE black outlines on WHITE background. No shading, no gray, no color, no gradients. Thick, kid-friendly lines. Clear enclosed regions for coloring. No text."
      buildPrompt={() => `Coloring page of: ${subject}. Simple, cheerful, age 5–10.`}
    >
      <Field label="What to color">
        <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. a haunted castle with bats" />
      </Field>
    </AIImageTool>
  );
}

export function AIMemeImageGenerator() {
  const [scene, setScene] = useState("a cat wearing a witch hat looking judgmental");
  return (
    <AIImageTool
      cta="😂 Generate meme image"
      filename="halloween-meme"
      system="Generate a Halloween meme-ready image. Clear central subject, expressive, room at top and bottom for meme text. Photo or cartoon depending on the request."
      buildPrompt={() => `Scene: ${scene}.`}
    >
      <Field label="Scene">
        <input className={inputCls} value={scene} onChange={(e) => setScene(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AILogoMaker() {
  const [name, setName] = useState("Blackthorn Manor");
  const [style, setStyle] = useState("gothic elegant");
  return (
    <AIImageTool
      cta="👻 Generate logo"
      filename="halloween-logo"
      system="Generate a clean Halloween-themed vector-style logo. Icon + wordmark. Solid dark background. Legible typography. High contrast. Centered."
      buildPrompt={() => `Brand name: "${name}". Style: ${style}. Halloween aesthetic.`}
    >
      <Field label="Brand name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Style">
        <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>gothic elegant</option><option>playful cartoon</option><option>vintage horror</option><option>modern minimal</option>
        </select>
      </Field>
    </AIImageTool>
  );
}

export function AIPosterMaker() {
  const [event, setEvent] = useState("Midnight Masquerade — Oct 31, 9PM");
  return (
    <AIImageTool
      cta="🖼️ Generate poster"
      filename="halloween-poster"
      aspect="aspect-[3/4]"
      system="Generate a striking Halloween event poster. Dramatic composition, atmospheric background, room for title. Cinematic lighting. Include the event title text prominently and legibly in the design."
      buildPrompt={() => `Event: "${event}".`}
    >
      <Field label="Event title & details">
        <input className={inputCls} value={event} onChange={(e) => setEvent(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AICardMaker() {
  const [message, setMessage] = useState("Happy Halloween, Mom!");
  const [style, setStyle] = useState("cute cartoon");
  return (
    <AIImageTool
      cta="🎃 Generate card"
      filename="halloween-card"
      aspect="aspect-[4/5]"
      system="Generate a Halloween greeting card front. Include the message in beautiful legible typography, integrated with the illustration. Portrait orientation."
      buildPrompt={() => `Message: "${message}". Style: ${style}.`}
    >
      <Field label="Message">
        <input className={inputCls} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      <Field label="Style">
        <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>cute cartoon</option><option>elegant gothic</option><option>vintage</option><option>kids</option><option>photo-real</option>
        </select>
      </Field>
    </AIImageTool>
  );
}

export function AIInvitationMaker() {
  const [details, setDetails] = useState("You're invited to Sarah's Halloween Bash · Oct 30, 8PM · 123 Elm St");
  return (
    <AIImageTool
      cta="💌 Generate invitation"
      filename="halloween-invitation"
      aspect="aspect-[4/5]"
      system="Generate a beautifully designed Halloween party invitation. Portrait orientation. Include all provided event details as legible integrated typography. Atmospheric background art."
      buildPrompt={() => `Invitation details: "${details}".`}
    >
      <Field label="Invitation details">
        <input className={inputCls} value={details} onChange={(e) => setDetails(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIBannerMaker() {
  const [text, setText] = useState("Happy Halloween 2026");
  return (
    <AIImageTool
      cta="🏴 Generate banner"
      filename="halloween-banner"
      aspect="aspect-[16/6]"
      system="Generate a wide Halloween banner (landscape). Include the text prominently. Suitable for social media header or website banner."
      buildPrompt={() => `Banner text: "${text}".`}
    >
      <Field label="Banner text">
        <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIFlyerMaker() {
  const [details, setDetails] = useState("Haunted House Tour · Every Weekend in October · Tickets $15");
  return (
    <AIImageTool
      cta="📄 Generate flyer"
      filename="halloween-flyer"
      aspect="aspect-[3/4]"
      system="Generate a print-ready Halloween flyer. Portrait orientation. Prominent title, event details, atmospheric imagery. Clean, print-safe margins."
      buildPrompt={() => `Flyer details: "${details}".`}
    >
      <Field label="Flyer details">
        <input className={inputCls} value={details} onChange={(e) => setDetails(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIPumpkinFaceAI() {
  const [expression, setExpression] = useState("mischievous smile");
  return (
    <AIImageTool
      cta="😈 Generate pumpkin face"
      filename="pumpkin-face"
      system="Generate a jack-o'-lantern with a glowing carved face. Orange pumpkin, black carved features glowing with warm inner light. Dark background. Photorealistic."
      buildPrompt={() => `Expression: ${expression}.`}
    >
      <Field label="Expression">
        <input className={inputCls} value={expression} onChange={(e) => setExpression(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}

export function AIPumpkinTemplateAI() {
  const [subject, setSubject] = useState("a spooky owl");
  return (
    <AIImageTool
      cta="🕸️ Generate template"
      filename="pumpkin-template"
      system="Generate a printable pumpkin carving TEMPLATE. Pure black shapes on pure white background. High contrast. Bold connected regions suitable for cutting. Include subtle registration marks in the corners. No text."
      buildPrompt={() => `Template of: ${subject}.`}
    >
      <Field label="Template subject">
        <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
    </AIImageTool>
  );
}
