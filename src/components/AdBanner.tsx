import { useEffect, useRef } from "react";

const SCRIPT_URL = "https://pl31658834.profitableratecpmnetwork.com/ce9e68b2400428a95dcf96ee49c7861e/invoke.js";
const CONTAINER_ID = "container-ce9e68b2400428a95dcf96ee49c7861e";

export function AdBanner({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // If already populated, no need to reload
    if (container.children.length > 0) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch {
        // ignore cleanup error
      }
    };
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full flex justify-center items-center my-8 min-h-[60px] overflow-hidden ${className}`}
    >
      <div id={CONTAINER_ID} ref={containerRef} />
    </aside>
  );
}
