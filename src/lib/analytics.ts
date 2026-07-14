/**
 * Client-side analytics facade. Batches events and forwards them
 * to the trackEvent server fn. Safe to call from anywhere; no-ops
 * on the server or when navigator is unavailable.
 */
import { ingestEvents } from "@/lib/analytics.functions";

type Props = Record<string, string | number | boolean | null | undefined>;
type QueuedEvent = { event: string; path: string; props: Props; ts: number };

const SESSION_KEY = "ht_sid_v1";
const QUEUE: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let enabled = true;

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const cur = window.sessionStorage.getItem(SESSION_KEY);
    if (cur) return cur;
    const fresh = `s_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return "anon";
  }
}

function schedule() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 1200);
}

async function flush() {
  flushTimer = null;
  if (!QUEUE.length || !enabled) return;
  const batch = QUEUE.splice(0, QUEUE.length);
  try {
    await ingestEvents({
      data: {
        events: batch.map((e) => ({
          event: e.event,
          path: e.path,
          props: e.props,
          ts: e.ts,
        })),
        session_id: sessionId(),
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
    });
  } catch {
    // swallow — analytics must never break the app
  }
}

export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  QUEUE.push({
    event,
    path: window.location.pathname + window.location.search,
    props,
    ts: Date.now(),
  });
  schedule();
}

export function disableAnalytics() { enabled = false; }

/** Flush on tab hide / navigation so nothing is lost. */
export function installAnalyticsFlush() {
  if (typeof window === "undefined") return;
  const handler = () => { if (QUEUE.length) flush(); };
  window.addEventListener("visibilitychange", handler);
  window.addEventListener("pagehide", handler);
}
