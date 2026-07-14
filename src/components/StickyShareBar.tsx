import { useEffect, useState } from "react";
import { Twitter, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { track } from "@/lib/analytics";

/** Vertical sticky share rail. On mobile collapses into a bottom row. */
export function StickyShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;
  const share = (network: string, href: string) => {
    track("share_click", { network, url });
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share_click", { network: "copy", url });
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <aside
      aria-label="Share this article"
      className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2 rounded-2xl border border-border bg-card/80 backdrop-blur px-2 py-3"
    >
      <button
        onClick={() => share("twitter", twitter)}
        aria-label="Share on Twitter"
        className="h-9 w-9 rounded-lg grid place-items-center hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        onClick={() => share("facebook", facebook)}
        aria-label="Share on Facebook"
        className="h-9 w-9 rounded-lg grid place-items-center hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        onClick={copy}
        aria-label="Copy link"
        className="h-9 w-9 rounded-lg grid place-items-center hover:bg-primary/10 hover:text-primary transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </aside>
  );
}
