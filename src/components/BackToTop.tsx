import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Floating "back to top" button. Fades in after 400px scroll. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg grid place-items-center hover:bg-primary-glow transition-colors glow-primary"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
