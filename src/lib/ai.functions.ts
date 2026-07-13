import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

class RateLimitError extends Error {
  code = "rate_limit" as const;
  constructor() {
    super("Too many requests. Please wait a moment and try again.");
  }
}
class PaymentError extends Error {
  code = "payment_required" as const;
  constructor() {
    super("AI credits exhausted. Please add credits in Settings → Workspace → Usage.");
  }
}

async function callGateway(body: Record<string, unknown>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new RateLimitError();
  if (res.status === 402) throw new PaymentError();
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<{
    choices: Array<{ message: { content?: string | null; images?: Array<{ image_url: { url: string } }> } }>;
  }>;
}

/**
 * Generate multiple short text items (one per line) via Lovable AI.
 * Returns a bounded array of strings, cleaned up.
 */
export const aiGenerateText = createServerFn({ method: "POST" })
  .inputValidator((input: { system: string; prompt: string; count?: number; model?: string }) =>
    z
      .object({
        system: z.string().min(1).max(2000),
        prompt: z.string().min(1).max(2000),
        count: z.number().int().min(1).max(20).default(6),
        model: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = data.model ?? "google/gemini-2.5-flash";
    const json = await callGateway({
      model,
      messages: [
        {
          role: "system",
          content:
            data.system +
            `\n\nReturn EXACTLY ${data.count} results, one per line. No numbering, no bullets, no markdown, no preamble. Just the results, plain text.`,
        },
        { role: "user", content: data.prompt },
      ],
      temperature: 0.9,
    });
    const raw = json.choices?.[0]?.message?.content ?? "";
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, data.count);
    return { items: lines };
  });

/**
 * Generate long-form text (a single string) — for stories, articles, essays.
 */
export const aiGenerateLongText = createServerFn({ method: "POST" })
  .inputValidator((input: { system: string; prompt: string; model?: string }) =>
    z
      .object({
        system: z.string().min(1).max(2000),
        prompt: z.string().min(1).max(4000),
        model: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const json = await callGateway({
      model: data.model ?? "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: data.system },
        { role: "user", content: data.prompt },
      ],
      temperature: 0.85,
    });
    return { text: (json.choices?.[0]?.message?.content ?? "").trim() };
  });

/**
 * Generate an image via Lovable AI (Gemini image). Returns a base64 data URL.
 */
export const aiGenerateImage = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string }) =>
    z.object({ prompt: z.string().min(3).max(1500) }).parse(input),
  )
  .handler(async ({ data }) => {
    const json = await callGateway({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [{ role: "user", content: data.prompt }],
      modalities: ["image", "text"],
    });
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
    if (!url) throw new Error("AI did not return an image. Try a different prompt.");
    return { imageUrl: url };
  });
