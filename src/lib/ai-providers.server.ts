// Server-only AI provider fallback chain.
// Order: Lovable AI Gateway → Gemini direct API keys 1..5.
// On 402 (credits exhausted) or 429 (rate limited) at Lovable, fall through to Gemini.
// On 429/quota errors at a Gemini key, try the next key.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Map Lovable model IDs to native Gemini model names (AI Studio free tier).
// Note: gemini-2.5-flash is deprecated for new AI Studio users; use *-latest aliases.
const GEMINI_MODEL_MAP: Record<string, string> = {
  "google/gemini-2.5-flash": "gemini-flash-latest",
  "google/gemini-2.5-flash-lite": "gemini-flash-lite-latest",
  "google/gemini-2.5-pro": "gemini-flash-latest",
  "google/gemini-2.5-flash-image-preview": "gemini-2.5-flash-image",
  "google/gemini-2.5-flash-image": "gemini-2.5-flash-image",
};

function toGeminiModel(lovableModel: string): string {
  return GEMINI_MODEL_MAP[lovableModel] ?? lovableModel.replace(/^google\//, "");
}


function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
  ].filter((k): k is string => !!k && k.trim().length > 0);
}

function isQuotaOrRate(status: number): boolean {
  return status === 429 || status === 402 || status === 403;
}

// ---------- Lovable AI Gateway ----------
async function callLovableChat(body: Record<string, unknown>): Promise<Response | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  const res = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  return res;
}

// ---------- Gemini native ----------
type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { code?: number; message?: string; status?: string };
};

async function callGeminiOnce(
  apiKey: string,
  model: string,
  opts: {
    messages: ChatMessage[];
    temperature?: number;
    jsonMode?: boolean;
    imageMode?: boolean;
  },
): Promise<{ ok: true; data: GeminiResponse } | { ok: false; status: number; text: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemText = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const nonSystem = opts.messages.filter((m) => m.role !== "system");
  const contents = nonSystem.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const generationConfig: Record<string, unknown> = {};
  if (typeof opts.temperature === "number") generationConfig.temperature = opts.temperature;
  if (opts.jsonMode) generationConfig.responseMimeType = "application/json";
  if (opts.imageMode) generationConfig.responseModalities = ["IMAGE", "TEXT"];

  const body: Record<string, unknown> = { contents };
  if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };
  if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, text };
  }
  return { ok: true, data: (await res.json()) as GeminiResponse };
}

function extractGeminiText(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractGeminiImage(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) {
      const mime = p.inlineData.mimeType || "image/png";
      return `data:${mime};base64,${p.inlineData.data}`;
    }
  }
  return null;
}

// ---------- Public API ----------

export class AiRateLimitError extends Error {
  code = "rate_limit" as const;
  constructor() {
    super("All AI providers are rate-limited. Please wait a moment and try again.");
  }
}
export class AiPaymentError extends Error {
  code = "payment_required" as const;
  constructor() {
    super("AI credits exhausted on all providers.");
  }
}

export interface ChatOptions {
  model: string; // e.g. "google/gemini-2.5-flash"
  messages: ChatMessage[];
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * Chat completion with automatic fallback: Lovable AI → Gemini keys 1..5.
 * Returns the plain text content.
 */
export async function aiChatWithFallback(opts: ChatOptions): Promise<string> {
  // 1. Lovable AI first.
  try {
    const lovableBody: Record<string, unknown> = {
      model: opts.model,
      messages: opts.messages,
    };
    if (typeof opts.temperature === "number") lovableBody.temperature = opts.temperature;
    if (opts.jsonMode) lovableBody.response_format = { type: "json_object" };

    const res = await callLovableChat(lovableBody);
    if (res) {
      if (res.ok) {
        const j = (await res.json()) as {
          choices?: Array<{ message?: { content?: string | null } }>;
        };
        return (j.choices?.[0]?.message?.content ?? "").trim();
      }
      // Non-recoverable Lovable errors → surface immediately, unless quota/rate.
      if (!isQuotaOrRate(res.status)) {
        const text = await res.text().catch(() => "");
        throw new Error(`Lovable AI error (${res.status}): ${text.slice(0, 200)}`);
      }
      // else: fall through to Gemini.
      console.warn(`[ai-fallback] Lovable AI returned ${res.status}; falling back to Gemini.`);
    }
  } catch (err) {
    // Network error: try Gemini too.
    console.warn("[ai-fallback] Lovable AI threw; trying Gemini:", (err as Error).message);
  }

  // 2. Gemini direct with each key.
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new AiPaymentError();

  const geminiModel = toGeminiModel(opts.model);
  let lastStatus = 0;
  let lastText = "";
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const result = await callGeminiOnce(key, geminiModel, {
        messages: opts.messages,
        temperature: opts.temperature,
        jsonMode: opts.jsonMode,
      });
      if (result.ok) {
        return extractGeminiText(result.data);
      }
      lastStatus = result.status;
      lastText = result.text;
      if (!isQuotaOrRate(result.status)) {
        // Terminal error on this key — try next only if it looks quota-ish; otherwise throw.
        throw new Error(`Gemini error (${result.status}): ${result.text.slice(0, 200)}`);
      }
      console.warn(`[ai-fallback] Gemini key #${i + 1} quota/rate limited (${result.status}); trying next.`);
    } catch (err) {
      console.warn(`[ai-fallback] Gemini key #${i + 1} threw:`, (err as Error).message);
      // continue to next key
    }
  }

  if (lastStatus === 429) throw new AiRateLimitError();
  throw new AiPaymentError();
}

/**
 * Image generation with fallback. Returns a data URL.
 */
export async function aiImageWithFallback(prompt: string): Promise<string> {
  const model = "google/gemini-2.5-flash-image-preview";

  // 1. Lovable AI
  try {
    const res = await callLovableChat({
      model,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    });
    if (res) {
      if (res.ok) {
        const j = (await res.json()) as {
          choices?: Array<{
            message?: { images?: Array<{ image_url?: { url?: string } }> };
          }>;
        };
        const url = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
      } else if (!isQuotaOrRate(res.status)) {
        const text = await res.text().catch(() => "");
        throw new Error(`Lovable AI image error (${res.status}): ${text.slice(0, 200)}`);
      } else {
        console.warn(`[ai-fallback] Lovable image returned ${res.status}; falling back to Gemini.`);
      }
    }
  } catch (err) {
    console.warn("[ai-fallback] Lovable image threw; trying Gemini:", (err as Error).message);
  }

  // 2. Gemini keys
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new AiPaymentError();

  const geminiModel = toGeminiModel(model);
  let lastStatus = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const result = await callGeminiOnce(key, geminiModel, {
        messages: [{ role: "user", content: prompt }],
        imageMode: true,
      });
      if (result.ok) {
        const url = extractGeminiImage(result.data);
        if (url) return url;
        // If ok but no image, treat as terminal.
        throw new Error("Gemini did not return an image.");
      }
      lastStatus = result.status;
      if (!isQuotaOrRate(result.status)) {
        throw new Error(`Gemini image error (${result.status}): ${result.text.slice(0, 200)}`);
      }
      console.warn(`[ai-fallback] Gemini image key #${i + 1} quota/rate (${result.status}); trying next.`);
    } catch (err) {
      console.warn(`[ai-fallback] Gemini image key #${i + 1} threw:`, (err as Error).message);
    }
  }

  if (lastStatus === 429) throw new AiRateLimitError();
  throw new AiPaymentError();
}
