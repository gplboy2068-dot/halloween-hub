import { useState } from "react";
import { ToolShell, ToolControls, Field, ResultList, inputCls, selectCls, btnPrimary, pick, pickN } from "./shell";
import * as W from "./wordlists";

export function NameGenerator() {
  const [style, setStyle] = useState("Classic");
  const [count, setCount] = useState(8);
  const [items, setItems] = useState<string[]>([]);

  const generate = () => {
    const out = Array.from({ length: count }, () => {
      if (style === "Classic") return `${pick(W.NAMES_FIRST)} ${pick(W.NAMES_LAST)}`;
      if (style === "Witchy") return `${pick(["Morgana", "Selene", "Circe", "Hecate", "Nyx", "Zelda", "Ophelia"])} the ${pick(W.ADJECTIVES)}`;
      if (style === "Monster") return `${pick(W.ADJECTIVES)} ${pick(W.NOUNS)}`;
      return `${pick(W.NAMES_FIRST)} "${pick(W.ADJECTIVES)}" ${pick(W.NAMES_LAST)}`;
    });
    setItems(out);
  };

  return (
    <ToolShell>
      <ToolControls>
        <Field label="Style">
          <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value)}>
            <option>Classic</option>
            <option>Witchy</option>
            <option>Monster</option>
            <option>Nickname</option>
          </select>
        </Field>
        <Field label="How many">
          <input type="number" min={1} max={30} className={inputCls} value={count} onChange={(e) => setCount(Math.min(30, Math.max(1, +e.target.value || 1)))} />
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}>🎲 Generate</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function CaptionGenerator() {
  const [vibe, setVibe] = useState("Any");
  const [items, setItems] = useState<string[]>([]);
  const generate = () => setItems(pickN(W.CAPTIONS_TEMPLATES, 8));
  void vibe;
  return (
    <ToolShell>
      <ToolControls>
        <Field label="Vibe">
          <select className={selectCls} value={vibe} onChange={(e) => setVibe(e.target.value)}>
            <option>Any</option><option>Funny</option><option>Cute</option><option>Spooky</option><option>Aesthetic</option>
          </select>
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}>✍️ Generate captions</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function QuoteGenerator() {
  const [items, setItems] = useState<string[]>([]);
  const generate = () => setItems(pickN(W.QUOTES, 6));
  return (
    <ToolShell>
      <ToolControls>
        <button type="button" onClick={generate} className={btnPrimary}>💀 Summon quotes</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function WishGenerator() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const base = pickN(W.WISHES, 5);
    setItems(name ? base.map((w) => `Dear ${name}, ${w.charAt(0).toLowerCase()}${w.slice(1)}`) : base);
  };
  return (
    <ToolShell>
      <ToolControls>
        <Field label="Recipient (optional)">
          <input className={inputCls} placeholder="e.g. Emma" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}>🌙 Generate wishes</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function MessageGenerator() {
  const [style, setStyle] = useState<(typeof W.MESSAGE_STYLES)[number]>("Sweet");
  const [items, setItems] = useState<string[]>([]);

  const templates: Record<string, string[]> = {
    Funny: [
      "Roses are red, blood is too, I bought too much candy, want some? 🍬",
      "I'd tell you a Halloween joke, but it's too spooktacular for text.",
      "You're the treat in my trick-or-treat 🎃",
    ],
    Sweet: [
      "Thinking of you this Halloween — hope it's full of joy and just enough scares. 🖤",
      "You make every season magical, but especially this one. 👻",
      "Sending pumpkin-spice-flavored love your way. 🎃",
    ],
    Spooky: [
      "Something wicked is coming… and it's going to be a great party. 🕷️",
      "The veil is thin tonight. I felt you across it. 🌙",
      "The shadows whisper your name. Answer them. 💀",
    ],
    Romantic: [
      "You haunt my thoughts in the best way. 🖤",
      "You're the moon in my darkest October night. 🌙",
      "I'd survive a horror movie with you. Probably. 🧛",
    ],
    Formal: [
      "Wishing you a safe and joyful Halloween. Warm regards.",
      "May your Halloween celebrations be memorable and merry.",
      "Best wishes for a wonderful All Hallows' Eve.",
    ],
  };

  const generate = () => setItems(pickN(templates[style], 3));

  return (
    <ToolShell>
      <ToolControls>
        <Field label="Tone">
          <select className={selectCls} value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
            {W.MESSAGE_STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}>✉️ Generate</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function HashtagGenerator() {
  const [topic, setTopic] = useState("costume");
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const core = pickN(W.HASHTAGS_CORE, 20);
    const topicTags = topic
      ? [topic.replace(/\s+/g, ""), `${topic.replace(/\s+/g, "")}Halloween`, `Halloween${topic.replace(/\s+/g, "")}`]
      : [];
    const all = [...topicTags, ...core].slice(0, 25).map((t) => `#${t}`);
    setItems([all.join(" ")]);
  };
  return (
    <ToolShell>
      <ToolControls>
        <Field label="Topic">
          <input className={inputCls} placeholder="e.g. costume, party, makeup" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}># Generate hashtags</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} emptyLabel="Enter a topic and hit generate" />
    </ToolShell>
  );
}

export function AIPromptGenerator() {
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const out = Array.from({ length: 5 }, () => {
      const s = pick(W.AI_PROMPT_SUBJECTS);
      const st = pick(W.AI_PROMPT_STYLES);
      const mood = pick(["ethereal", "menacing", "melancholic", "playful", "surreal"]);
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}, ${mood} mood, ${st}`;
    });
    setItems(out);
  };
  return (
    <ToolShell>
      <ToolControls>
        <button type="button" onClick={generate} className={btnPrimary}>🪄 Generate AI prompts</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function PartyNameGenerator() {
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const out = Array.from({ length: 8 }, () => pick(W.PARTY_NAME_TEMPLATES)(pick(W.ADJECTIVES), pick(W.NOUNS)));
    setItems(out);
  };
  return (
    <ToolShell>
      <ToolControls>
        <button type="button" onClick={generate} className={btnPrimary}>🎉 Name my party</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function CostumeGenerator() {
  const [gender, setGender] = useState("Any");
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const out = Array.from({ length: 5 }, () => {
      const base = pick(W.COSTUME_ELEMENTS.base);
      const twist = pick(W.COSTUME_ELEMENTS.twist);
      const acc = pick(W.COSTUME_ELEMENTS.accessory);
      return `${twist} ${base} — finish with ${acc}.`;
    });
    setItems(out);
  };
  void gender;
  return (
    <ToolShell>
      <ToolControls>
        <Field label="For">
          <select className={selectCls} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>Any</option><option>Adult</option><option>Kids</option><option>Couples</option><option>Group</option>
          </select>
        </Field>
        <button type="button" onClick={generate} className={btnPrimary}>🧙 Generate costumes</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} />
    </ToolShell>
  );
}

export function ScaryStoryGenerator() {
  const [items, setItems] = useState<string[]>([]);
  const generate = () => {
    const setting = pick(["an abandoned lighthouse", "a boarded-up motel", "grandma's attic", "the last house on Elm Street", "a subway station at 3 AM"]);
    const character = pick(["a curious teenager", "an off-duty nurse", "twin sisters", "a night watchman", "a lost trick-or-treater"]);
    const twist = pick(["the mirror showed no reflection", "the door had never been there before", "the voice was her own", "the photographs were of the future", "the clock ticked backwards"]);
    const ending = pick(["No one has heard from them since.", "They swore never to speak of it. Almost.", "The house waits for the next visitor.", "It happens every October 31st. Without fail.", "The lights came back on. Everyone was smiling. Everyone."]);
    setItems([
      `It began in ${setting}. ${character.charAt(0).toUpperCase()}${character.slice(1)} noticed something strange: ${twist}. What happened next isn't in any newspaper. ${ending}`,
    ]);
  };
  return (
    <ToolShell>
      <ToolControls>
        <button type="button" onClick={generate} className={btnPrimary}>📖 Tell me a story</button>
      </ToolControls>
      <ResultList items={items} onRegenerate={items.length ? generate : undefined} emptyLabel="Dare you press the button?" />
    </ToolShell>
  );
}
