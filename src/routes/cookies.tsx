import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/cookies")({
  component: () => (
    <StaticPage title="Cookie Policy">
      <p>We use cookies to remember preferences and understand how visitors use HalloweenTools.com.</p>
      <h2>Types of cookies</h2>
      <p><strong>Essential:</strong> required for the site to work (e.g. theme preference).</p>
      <p><strong>Analytics:</strong> anonymous usage stats to improve the product.</p>
      <h2>Managing cookies</h2>
      <p>You can disable cookies in your browser settings. Some features may not work without them.</p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Cookie Policy — HalloweenTools" },
      { name: "description", content: "How HalloweenTools.com uses cookies." },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
});
