import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reasonEnum = z.enum([
  "spam",
  "harassment",
  "offensive",
  "copyright",
  "trademark",
  "fake-account",
  "illegal",
  "impersonation",
  "malware",
  "guidelines",
  "other",
]);

const submitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  url: z.string().trim().url("Enter the URL of the content you are reporting").max(500),
  reason: reasonEnum,
  description: z.string().trim().min(20, "Please describe the issue in at least 20 characters").max(4000),
  userAgent: z.string().max(400).optional().nullable(),
});

export const submitAbuseReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("abuse_reports").insert({
      reporter_name: data.name,
      reporter_email: data.email,
      target_url: data.url,
      reason: data.reason,
      description: data.description,
      user_agent: data.userAgent ?? null,
      status: "open",
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
