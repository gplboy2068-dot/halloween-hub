import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/terms")({
  component: () => (
    <StaticPage title="Terms of Service" lead="Last updated July 2026.">
      <p>By using HalloweenTools.com you agree to these terms.</p>
      <h2>Use of the service</h2>
      <p>Our tools are provided free of charge for personal and commercial use unless stated otherwise on a specific tool page.</p>
      <h2>Intellectual property</h2>
      <p>The HalloweenTools brand, code and design are owned by us. User-generated outputs belong to their creators.</p>
      <h2>Disclaimer</h2>
      <p>Tools are provided "as is" without warranties. See our <a href="/disclaimer">Disclaimer</a>.</p>
      <h2>Contact</h2>
      <p>Questions? Reach us via our <a href="/contact">contact page</a>.</p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Terms of Service — HalloweenTools" },
      { name: "description", content: "The terms governing use of HalloweenTools.com." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});
