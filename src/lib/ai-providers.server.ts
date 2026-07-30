// Server-only AI provider fallback chain.
// Order: Lovable AI Gateway → Gemini direct API keys 1..5.
// On 402 (credits exhausted) or 429 (rate limited) at Lovable, fall through to Gemini.
// On 429/quota errors at a Gemini key, try the next key.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Map Lovable model IDs to native Gemini model names.
const GEMINI_MODEL_MAP: Record<string, string> = {
  "google/gemini-2.5-flash": "gemini-2.5-flash",
  "google/gemini-2.5-flash-lite": "gemini-2.5-flash-lite",
  "google/gemini-2.5-pro": "gemini-2.5-pro",
  "google/gemini-2.5-flash-image-preview": "gemini-2.5-flash",
  "google/gemini-2.5-flash-image": "gemini-2.5-flash",
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

let cachedKeys: { gemini?: string; deepseek?: string; runware?: string } | null = null;
let lastCacheTime = 0;

async function getDynamicApiKeys() {
  const now = Date.now();
  if (cachedKeys && now - lastCacheTime < 60_000) {
    return cachedKeys;
  }
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["gemini_api_key", "deepseek_api_key", "runware_api_key"]);

    const keys: { gemini?: string; deepseek?: string; runware?: string } = {};
    (data ?? []).forEach((row: any) => {
      if (row.key === "gemini_api_key" && row.value) keys.gemini = String(row.value).trim();
      if (row.key === "deepseek_api_key" && row.value) keys.deepseek = String(row.value).trim();
      if (row.key === "runware_api_key" && row.value) keys.runware = String(row.value).trim();
    });

    cachedKeys = keys;
    lastCacheTime = now;
    return keys;
  } catch (err) {
    console.error("[ai-fallback] Failed to fetch dynamic API keys:", err);
    return {};
  }
}

// ---------- DeepSeek API ----------
async function callDeepSeekChat(
  apiKey: string,
  model: string,
  opts: {
    messages: ChatMessage[];
    temperature?: number;
    jsonMode?: boolean;
  }
): Promise<{ ok: true; content: string } | { ok: false; status: number; text: string }> {
  const url = "https://api.deepseek.com/v1/chat/completions";
  const body: Record<string, unknown> = {
    model: model === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat",
    messages: opts.messages,
  };
  if (typeof opts.temperature === "number") body.temperature = opts.temperature;
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, status: res.status, text };
  }

  const data = await res.json();
  const content = (data?.choices?.[0]?.message?.content ?? "").trim();
  return { ok: true, content };
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

// ---------- Runware AI (FLUX.1 Schnell) ----------
export async function callRunwareImage(
  apiKey: string,
  prompt: string,
  opts?: { model?: string; width?: number; height?: number }
): Promise<string> {
  const url = "https://api.runware.ai/v1";
  const taskUUID = crypto.randomUUID();
  const modelId = opts?.model === "flux-1-schnell" || !opts?.model ? "runware:100@1" : opts.model;
  const body = [
    {
      taskType: "imageInference",
      taskUUID,
      model: modelId,
      positivePrompt: prompt,
      width: opts?.width || 1024,
      height: opts?.height || 1024,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "PNG",
    },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Runware API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  if (json.error || json.errors) {
    const errMsg = json.error?.message || JSON.stringify(json.errors || json.error);
    throw new Error(`Runware API error: ${errMsg}`);
  }

  const resultItem = json.data?.[0];
  const imageUrl = resultItem?.imageURL || resultItem?.imageDataURI;
  if (!imageUrl) {
    throw new Error("Runware API did not return an image URL");
  }

  return imageUrl;
}

// ---------- Pollinations AI (Zero-Auth Free Fallback) ----------
async function callPollinationsImage(prompt: string): Promise<string> {
  const cleanPrompt = prompt.replace(/[\r\n]+/g, " ").trim();
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Pollinations API returned status ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${base64}`;
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
      // else: fall through.
      console.warn(`[ai-fallback] Lovable AI returned ${res.status}; falling back.`);
    }
  } catch (err) {
    console.warn("[ai-fallback] Lovable AI threw; trying next:", (err as Error).message);
  }

  // Fetch dynamic database API keys
  const dynamicKeys = await getDynamicApiKeys();

  // 2. DeepSeek API (if key is configured in settings or env).
  const deepseekKey = dynamicKeys.deepseek || process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    try {
      console.info("[ai-fallback] Attempting DeepSeek API...");
      const result = await callDeepSeekChat(deepseekKey, "deepseek-chat", {
        messages: opts.messages,
        temperature: opts.temperature,
        jsonMode: opts.jsonMode,
      });
      if (result.ok) {
        return result.content;
      }
      if (!isQuotaOrRate(result.status)) {
        throw new Error(`DeepSeek error (${result.status}): ${result.text.slice(0, 200)}`);
      }
      console.warn(`[ai-fallback] DeepSeek returned quota/rate limit (${result.status}); falling back to Gemini.`);
    } catch (err) {
      console.warn("[ai-fallback] DeepSeek call failed; trying Gemini:", (err as Error).message);
    }
  }

  // 3. Gemini API (using dynamic key + environment keys).
  const geminiKeys = [
    dynamicKeys.gemini,
    ...getGeminiKeys()
  ].filter((k): k is string => !!k && k.trim().length > 0);

  if (geminiKeys.length === 0) throw new AiPaymentError();

  const geminiModel = toGeminiModel(opts.model);
  let lastStatus = 0;
  let lastText = "";
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
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
        throw new Error(`Gemini error (${result.status}): ${result.text.slice(0, 200)}`);
      }
      console.warn(`[ai-fallback] Gemini key #${i + 1} quota/rate limited (${result.status}); trying next.`);
    } catch (err) {
      console.warn(`[ai-fallback] Gemini key #${i + 1} threw:`, (err as Error).message);
    }
  }

  if (lastStatus === 429) throw new AiRateLimitError();
  throw new AiPaymentError();
}

/**
 * Image generation with fallback. Returns a data URL or image URL.
 */
export async function aiImageWithFallback(prompt: string): Promise<string> {
  // 1. Runware AI (FLUX.1 Schnell)
  try {
    const dynamicKeys = await getDynamicApiKeys();
    const runwareKey = dynamicKeys.runware || process.env.RUNWARE_API_KEY;
    if (runwareKey) {
      console.info("[ai-fallback] Generating image via Runware AI (FLUX.1 [schnell])...");
      return await callRunwareImage(runwareKey, prompt, { model: "runware:100@1" });
    }
  } catch (err) {
    console.warn("[ai-fallback] Runware image call failed; falling back to next provider:", (err as Error).message);
  }

  const model = "google/gemini-2.5-flash-image-preview";

  // 2. Lovable AI
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
      } else {
        console.warn(`[ai-fallback] Lovable image returned ${res.status}; trying Gemini/Pollinations.`);
      }
    }
  } catch (err) {
    console.warn("[ai-fallback] Lovable image threw; trying Gemini/Pollinations:", (err as Error).message);
  }

  // 2. Gemini keys
  try {
    const dynamicKeys = await getDynamicApiKeys();
    const geminiKeys = [
      dynamicKeys.gemini,
      ...getGeminiKeys()
    ].filter((k): k is string => !!k && k.trim().length > 0);

    if (geminiKeys.length > 0) {
      const geminiModel = toGeminiModel(model);
      for (let i = 0; i < geminiKeys.length; i++) {
        const key = geminiKeys[i];
        try {
          const result = await callGeminiOnce(key, geminiModel, {
            messages: [{ role: "user", content: prompt }],
            imageMode: true,
          });
          if (result.ok) {
            const url = extractGeminiImage(result.data);
            if (url) return url;
          }
          const statusStr = result.ok ? "no image output" : String(result.status);
          console.warn(`[ai-fallback] Gemini image key #${i + 1} status ${statusStr}; trying next.`);
        } catch (err) {
          console.warn(`[ai-fallback] Gemini image key #${i + 1} threw:`, (err as Error).message);
        }
      }
    }
  } catch (err) {
    console.warn("[ai-fallback] Gemini image step threw:", (err as Error).message);
  }

  // 3. Robust Free Fallback: Pollinations AI (Flux / SDXL high-quality image generation)
  try {
    console.info("[ai-fallback] Generating image via Pollinations AI fallback...");
    return await callPollinationsImage(prompt);
  } catch (err) {
    console.error("[ai-fallback] Pollinations image generation failed:", err);
  }

  throw new AiRateLimitError();
}
