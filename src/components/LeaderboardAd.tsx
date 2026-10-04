import { useEffect, useRef } from "react";

export function LeaderboardAd({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset container to avoid duplication on re-mount
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.title = "Advertisement";
    iframe.width = "728";
    iframe.height = "90";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";

    container.appendChild(iframe);

    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html>
<html>
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: transparent;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'faeb2229d33f77d1b82f21c28301e466',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/faeb2229d33f77d1b82f21c28301e466/invoke.js"></script>
  </body>
</html>`);
        doc.close();
      }
    } catch (e) {
      console.error("Failed to inject leaderboard ad iframe", e);
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 flex w-full justify-center items-center overflow-x-auto ${className}`}
    >
      <div
        ref={containerRef}
        className="min-h-[90px] min-w-[300px] max-w-[728px] flex justify-center items-center"
      />
    </aside>
  );
}
