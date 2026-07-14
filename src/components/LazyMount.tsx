import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * LazyMount defers rendering of below-the-fold content until it
 * scrolls near the viewport. During SSR and initial hydration it
 * renders a lightweight placeholder with reserved height to avoid CLS.
 *
 * Combined with CSS `content-visibility: auto`, this reduces initial
 * JS/DOM work and improves LCP/TBT on content-heavy pages.
 */
export function LazyMount({
  children,
  minHeight = 400,
  rootMargin = "400px",
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: visible ? undefined : minHeight,
        contentVisibility: "auto",
        containIntrinsicSize: `${minHeight}px`,
      } as React.CSSProperties}
    >
      {visible ? children : null}
    </div>
  );
}
