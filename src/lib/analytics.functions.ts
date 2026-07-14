import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string().min(1).max(80),
  path: z.string().max(500).optional().nullable(),
  props: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  ts: z.number().optional(),
});

const ingestSchema = z.object({
  events: z.array(eventSchema).min(1).max(30),
  session_id: z.string().max(80).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  user_agent: z.string().max(500).optional().nullable(),
});

/**
 * Public ingest endpoint — anonymous OK. Uses service_role to bypass
 * RLS on inserts (client never reads).
 */
export const ingestEvents = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ingestSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = data.events.map((e) => ({
      event: e.event,
      path: e.path ?? null,
      props: e.props ?? {},
      session_id: data.session_id ?? null,
      referrer: data.referrer ?? null,
      user_agent: data.user_agent ?? null,
    }));
    const { error } = await supabaseAdmin.from("analytics_events").insert(rows);
    if (error) return { ok: false, error: error.message };
    return { ok: true, count: rows.length };
  });

const rangeSchema = z.object({
  days: z.number().int().min(1).max(90).default(7),
});

export type AnalyticsSummary = {
  totals: { events: number; sessions: number; pageviews: number };
  topEvents: { event: string; count: number }[];
  topPaths: { path: string; count: number }[];
  topSearches: { q: string; count: number }[];
  topToolUses: { slug: string; count: number }[];
  daily: { day: string; pageviews: number; events: number }[];
};

/** Admin-only aggregate summary of the last N days. */
export const getAnalyticsSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rangeSchema.parse(data))
  .handler(async ({ data, context }): Promise<AnalyticsSummary> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) {
      return {
        totals: { events: 0, sessions: 0, pageviews: 0 },
        topEvents: [], topPaths: [], topSearches: [], topToolUses: [], daily: [],
      };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - data.days * 86400_000).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("analytics_events")
      .select("event, path, props, session_id, created_at")
      .gte("created_at", since)
      .limit(50_000);

    if (error || !rows) {
      return {
        totals: { events: 0, sessions: 0, pageviews: 0 },
        topEvents: [], topPaths: [], topSearches: [], topToolUses: [], daily: [],
      };
    }

    const evCount = new Map<string, number>();
    const pathCount = new Map<string, number>();
    const searches = new Map<string, number>();
    const toolUses = new Map<string, number>();
    const sessions = new Set<string>();
    const daily = new Map<string, { pageviews: number; events: number }>();
    let pv = 0;

    for (const r of rows as Array<{ event: string; path: string | null; props: Record<string, unknown>; session_id: string | null; created_at: string }>) {
      evCount.set(r.event, (evCount.get(r.event) ?? 0) + 1);
      if (r.session_id) sessions.add(r.session_id);
      const day = r.created_at.slice(0, 10);
      const d = daily.get(day) ?? { pageviews: 0, events: 0 };
      d.events++;
      if (r.event === "pageview") {
        pv++;
        d.pageviews++;
        if (r.path) pathCount.set(r.path, (pathCount.get(r.path) ?? 0) + 1);
      }
      daily.set(day, d);
      if (r.event === "search" && typeof r.props?.q === "string") {
        const q = (r.props.q as string).trim().toLowerCase();
        if (q) searches.set(q, (searches.get(q) ?? 0) + 1);
      }
      if (r.event === "tool_use" && typeof r.props?.slug === "string") {
        const s = r.props.slug as string;
        toolUses.set(s, (toolUses.get(s) ?? 0) + 1);
      }
    }

    const top = (m: Map<string, number>, n = 15) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);

    return {
      totals: { events: rows.length, sessions: sessions.size, pageviews: pv },
      topEvents: top(evCount).map(([event, count]) => ({ event, count })),
      topPaths: top(pathCount).map(([path, count]) => ({ path, count })),
      topSearches: top(searches, 20).map(([q, count]) => ({ q, count })),
      topToolUses: top(toolUses).map(([slug, count]) => ({ slug, count })),
      daily: Array.from(daily.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, v]) => ({ day, ...v })),
    };
  });
