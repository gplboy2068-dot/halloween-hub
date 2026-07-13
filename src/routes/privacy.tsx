import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <StaticPage title="Privacy Policy" lead="Last updated July 2026.">
      <p>HalloweenTools.com respects your privacy. This page describes what data we collect and how we use it.</p>
      <h2>Information we collect</h2>
      <p>We collect only what's needed to run our tools: anonymous usage analytics and, where you opt in, your email address for the newsletter.</p>
      <h2>Cookies</h2>
      <p>We use minimal cookies for site preferences and analytics. See our <a href="/cookies">Cookie Policy</a>.</p>
      <h2>Third parties</h2>
      <p>We may use third-party services (analytics, email, hosting) that process data on our behalf under strict agreements.</p>
      <h2>Your rights</h2>
      <p>You can request access, correction or deletion of your data anytime via our <a href="/contact">contact page</a>.</p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Privacy Policy — HalloweenTools" },
      { name: "description", content: "How HalloweenTools.com collects, uses, and protects your data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});
