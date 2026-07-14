import { useEffect, useState } from "react";

/** Thin horizontal progress bar showing article scroll progress. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      setPct(max > 0 ? Math.min(100, (scrolled / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-40 pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-100 ease-out"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
