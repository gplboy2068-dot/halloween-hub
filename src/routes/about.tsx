import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/StaticPage";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — HalloweenTools" },
      { name: "description", content: "The mission and story behind HalloweenTools.com — the internet's biggest Halloween toolkit." },
      { property: "og:title", content: "About HalloweenTools" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <StaticPage title="About HalloweenTools" lead="We're building the internet's biggest, most useful, most fun Halloween platform.">
      <h2>Our mission</h2>
      <p>HalloweenTools.com exists to make Halloween easier and more magical for everyone — from parents planning trick-or-treat to creators shipping content to teachers running classroom activities.</p>
      <h2>What you'll find here</h2>
      <p>Free interactive tools, AI generators, printable packs, party planners, pumpkin templates, wishes, quotes, guides and more — all free, all mobile-first, all built for the modern web.</p>
      <h2>The team</h2>
      <p>A small crew of makers, designers and Halloween obsessives. Say hi on our <a href="/contact">contact page</a>.</p>
    </StaticPage>
  );
}
