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
  totals: {
    events: number;
    sessions: number;
    pageviews: number;
    uniqueVisitors: number;
  };
  engagement: {
    bounceRate: number;         // 0..1  (sessions with 1 pageview / sessions)
    avgSessionSec: number;      // avg session duration in seconds
    avgTimeOnPageSec: number;   // avg dwell per pageview
    pagesPerSession: number;
  };
  topEvents: { event: string; count: number }[];
  topPaths: { path: string; count: number; avgSec: number }[];
  topSearches: { q: string; count: number }[];
  topToolUses: { slug: string; count: number; avgSec: number; totalSec: number }[];
  daily: { day: string; pageviews: number; events: number; sessions: number }[];
};

/** Admin-only aggregate summary of the last N days. */
export const getAnalyticsSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rangeSchema.parse(data))
  .handler(async ({ data, context }): Promise<AnalyticsSummary> => {
    const empty: AnalyticsSummary = {
      totals: { events: 0, sessions: 0, pageviews: 0, uniqueVisitors: 0 },
      engagement: { bounceRate: 0, avgSessionSec: 0, avgTimeOnPageSec: 0, pagesPerSession: 0 },
      topEvents: [], topPaths: [], topSearches: [], topToolUses: [], daily: [],
    };
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return empty;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - data.days * 86400_000).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("analytics_events")
      .select("event, path, props, session_id, user_id, created_at")
      .gte("created_at", since)
      .limit(100_000);

    if (error || !rows) return empty;

    type Row = {
      event: string;
      path: string | null;
      props: Record<string, unknown> | null;
      session_id: string | null;
      user_id: string | null;
      created_at: string;
    };

    const evCount = new Map<string, number>();
    const searches = new Map<string, number>();
    const daily = new Map<string, { pageviews: number; events: number; sessionSet: Set<string> }>();

    // Per-path aggregates
    const pathViews = new Map<string, number>();
    const pathTimeMs = new Map<string, { total: number; n: number }>();

    // Per-tool aggregates (from /tools/:slug pageviews + page_time)
    const toolUseCount = new Map<string, number>();
    const toolTimeMs = new Map<string, { total: number; n: number }>();

    // Session-level aggregates
    const sessionStats = new Map<
      string,
      { first: number; last: number; pageviews: number }
    >();
    const visitors = new Set<string>();

    let totalPageTimeMs = 0;
    let pageTimeSamples = 0;
    let pv = 0;

    const toolSlugFromPath = (p: string | null): string | null => {
      if (!p) return null;
      const m = p.match(/^\/tools\/([^/?#]+)/);
      return m ? m[1] : null;
    };

    for (const r of rows as Row[]) {
      evCount.set(r.event, (evCount.get(r.event) ?? 0) + 1);
      const ts = new Date(r.created_at).getTime();
      const day = r.created_at.slice(0, 10);
      const d = daily.get(day) ?? { pageviews: 0, events: 0, sessionSet: new Set<string>() };
      d.events++;
      if (r.session_id) d.sessionSet.add(r.session_id);
      daily.set(day, d);

      if (r.session_id) {
        const s = sessionStats.get(r.session_id) ?? { first: ts, last: ts, pageviews: 0 };
        if (ts < s.first) s.first = ts;
        if (ts > s.last) s.last = ts;
        sessionStats.set(r.session_id, s);
      }
      visitors.add(r.user_id ?? r.session_id ?? "unknown");

      if (r.event === "pageview") {
        pv++;
        d.pageviews++;
        if (r.session_id) {
          const s = sessionStats.get(r.session_id)!;
          s.pageviews++;
        }
        if (r.path) {
          pathViews.set(r.path, (pathViews.get(r.path) ?? 0) + 1);
          const slug = toolSlugFromPath(r.path);
          if (slug) toolUseCount.set(slug, (toolUseCount.get(slug) ?? 0) + 1);
        }
      } else if (r.event === "page_time") {
        const ms = Number(r.props?.ms);
        const p = (r.props?.path as string | undefined) ?? r.path ?? null;
        if (Number.isFinite(ms) && ms > 0 && ms < 30 * 60_000) {
          totalPageTimeMs += ms;
          pageTimeSamples++;
          if (p) {
            const cur = pathTimeMs.get(p) ?? { total: 0, n: 0 };
            cur.total += ms;
            cur.n++;
            pathTimeMs.set(p, cur);
            const slug = toolSlugFromPath(p);
            if (slug) {
              const t = toolTimeMs.get(slug) ?? { total: 0, n: 0 };
              t.total += ms;
              t.n++;
              toolTimeMs.set(slug, t);
            }
          }
        }
      } else if (r.event === "search" && typeof r.props?.q === "string") {
        const q = (r.props.q as string).trim().toLowerCase();
        if (q) searches.set(q, (searches.get(q) ?? 0) + 1);
      } else if (r.event === "tool_use" && typeof r.props?.slug === "string") {
        const s = r.props.slug as string;
        toolUseCount.set(s, (toolUseCount.get(s) ?? 0) + 1);
      }
    }

    // Session duration + bounce rate
    let totalSessionMs = 0;
    let bounces = 0;
    let totalPvInSessions = 0;
    for (const s of sessionStats.values()) {
      totalSessionMs += Math.max(0, s.last - s.first);
      totalPvInSessions += s.pageviews;
      if (s.pageviews <= 1) bounces++;
    }
    const sessionCount = sessionStats.size;

    const top = <K,>(m: Map<K, number>, n = 15) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);

    const topPaths = Array.from(pathViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([path, count]) => {
        const t = pathTimeMs.get(path);
        return {
          path,
          count,
          avgSec: t && t.n > 0 ? Math.round(t.total / t.n / 1000) : 0,
        };
      });

    const topToolUses = Array.from(toolUseCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([slug, count]) => {
        const t = toolTimeMs.get(slug);
        return {
          slug,
          count,
          avgSec: t && t.n > 0 ? Math.round(t.total / t.n / 1000) : 0,
          totalSec: t ? Math.round(t.total / 1000) : 0,
        };
      });

    return {
      totals: {
        events: rows.length,
        sessions: sessionCount,
        pageviews: pv,
        uniqueVisitors: visitors.size,
      },
      engagement: {
        bounceRate: sessionCount ? bounces / sessionCount : 0,
        avgSessionSec: sessionCount ? Math.round(totalSessionMs / sessionCount / 1000) : 0,
        avgTimeOnPageSec: pageTimeSamples ? Math.round(totalPageTimeMs / pageTimeSamples / 1000) : 0,
        pagesPerSession: sessionCount ? +(totalPvInSessions / sessionCount).toFixed(2) : 0,
      },
      topEvents: top(evCount).map(([event, count]) => ({ event, count })),
      topPaths,
      topSearches: top(searches, 20).map(([q, count]) => ({ q, count })),
      topToolUses,
      daily: Array.from(daily.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, v]) => ({ day, pageviews: v.pageviews, events: v.events, sessions: v.sessionSet.size })),
    };
  });

