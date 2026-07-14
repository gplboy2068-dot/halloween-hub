import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { track, installAnalyticsFlush } from "@/lib/analytics";

/**
 * Mounts once at the app root. Emits `pageview` per route change and
 * `scroll_depth` at 25/50/75/100% per page.
 */
export function AnalyticsTracker() {
  const router = useRouter();

  useEffect(() => {
    installAnalyticsFlush();
    track("pageview", { title: document.title });

    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      const path = toLocation.pathname + toLocation.searchStr;
      track("pageview", { title: document.title, path });
      lastDepth = 0;
      firedDepths.clear();
    });

    let lastDepth = 0;
    const firedDepths = new Set<number>();

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
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, [router]);

  return null;
}
