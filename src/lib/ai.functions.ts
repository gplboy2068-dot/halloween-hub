import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  aiChatWithFallback,
  aiImageWithFallback,
  AiPaymentError,
  AiRateLimitError,
} from "./ai-providers.server";

/**
 * Generate multiple short text items (one per line).
 * Uses Lovable AI first, falls back to Gemini direct keys.
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
    const raw = await aiChatWithFallback({
      model,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            data.system +
            `\n\nReturn EXACTLY ${data.count} results, one per line. No numbering, no bullets, no markdown, no preamble. Just the results, plain text.`,
        },
        { role: "user", content: data.prompt },
      ],
    });
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, data.count);
    return { items: lines };
  });

/**
 * Generate long-form text.
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
    const text = await aiChatWithFallback({
      model: data.model ?? "google/gemini-2.5-flash",
      temperature: 0.85,
      messages: [
        { role: "system", content: data.system },
        { role: "user", content: data.prompt },
      ],
    });
    return { text: text.trim() };
  });

/**
 * Generate an image. Returns a base64 data URL.
 */
export const aiGenerateImage = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string }) =>
    z.object({ prompt: z.string().min(3).max(1500) }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const imageUrl = await aiImageWithFallback(data.prompt);
      return { imageUrl };
    } catch (err) {
      if (err instanceof AiRateLimitError || err instanceof AiPaymentError) {
        throw err;
      }
      throw err;
    }
  });
