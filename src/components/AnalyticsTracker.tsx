import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { track, installAnalyticsFlush } from "@/lib/analytics";

/**
 * Mounts once at the app root. Emits:
 *  - `pageview` on each route change
 *  - `scroll_depth` at 25/50/75/100%
 *  - `page_time` when the user leaves a page (route change / tab hide / unload)
 *    with `{ ms, path }` so the admin can compute avg time on page, per-tool
 *    dwell time, session duration, and bounce rate.
 */
export function AnalyticsTracker() {
  const router = useRouter();

  useEffect(() => {
    installAnalyticsFlush();

    let currentPath = window.location.pathname + window.location.search;
    let enteredAt = Date.now();
    let lastDepth = 0;
    const firedDepths = new Set<number>();

    const emitPageTime = () => {
      const ms = Date.now() - enteredAt;
      // Ignore absurd values (tab open for hours w/ no interaction) and near-zero
      if (ms < 500 || ms > 30 * 60_000) return;
      track("page_time", { ms, path: currentPath, depth: lastDepth });
    };

    const trackGa = (path: string) => {
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("config", "G-GNYQXKH3EE", {
          page_path: path,
          page_title: document.title,
        });
      }
    };

    track("pageview", { title: document.title, path: currentPath });
    trackGa(currentPath);

    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      emitPageTime();
      currentPath = toLocation.pathname + toLocation.searchStr;
      enteredAt = Date.now();
      lastDepth = 0;
      firedDepths.clear();
      track("pageview", { title: document.title, path: currentPath });
      trackGa(currentPath);
    });

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((doc.scrollTop / max) * 100);
      if (pct <= lastDepth) return;
      lastDepth = pct;
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !firedDepths.has(mark)) {
          firedDepths.add(mark);
          track("scroll_depth", { depth: mark });
        }
      }
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") emitPageTime();
    };
    const onPageHide = () => emitPageTime();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [router]);

  return null;
}
