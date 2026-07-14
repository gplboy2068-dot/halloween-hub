import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

const LAST_REVIEWED = "2026-07-14";

export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy — How HalloweenTools Reviews Its Tools & Content" },
      { name: "description", content: "How we source, review, and update every tool, article, and idea page on HalloweenTools.com. Named reviewers, fact-checking, corrections policy." },
      { property: "og:title", content: "HalloweenTools Editorial Policy" },
      { property: "og:description", content: "How we source, review, fact-check, and update every tool and article on HalloweenTools.com." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/editorial-policy" },
    ],
    links: [{ rel: "canonical", href: "/editorial-policy" }],
  }),
  component: EditorialPolicy,
});

function EditorialPolicy() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-14 prose prose-invert prose-headings:font-display max-w-none">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Editorial Standards
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">
          Editorial Policy
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          HalloweenTools.com is written and reviewed by named professionals — designers,
          teachers, event planners, and AI engineers with real-world credentials. This
          page documents exactly how we source, review, fact-check, and update the tools
          and content on the site so you know what to expect.
        </p>

        <h2>Who writes and reviews this site</h2>
        <p>
          Every article, tool page, and idea page on HalloweenTools is written or reviewed
          by a member of our named <Link to="/authors">editorial team</Link>. Each team
          member has verifiable professional experience in the domain they cover — for
          example, our Kids &amp; Classroom Editor is a former K-6 teacher, and our Party
          &amp; Events Correspondent is a working professional event planner.
        </p>
        <p>
          You can see full bios, credentials, and areas of expertise on our{" "}
          <Link to="/authors">Authors page</Link>. Every published article carries a
          byline and links to that author's profile.
        </p>

        <h2>How we review our tools</h2>
        <ol>
          <li>
            <strong>Design &amp; build.</strong> Every tool is built to a spec that
            includes accessibility (keyboard navigation, focus states, colour contrast),
            mobile-first responsiveness, and safe output. Nothing ships without meeting
            all three.
          </li>
          <li>
            <strong>Category-specific review.</strong> AI tools are reviewed by our Head
            of AI Tools for prompt safety and output quality. Design tools are reviewed
            by our Senior Design Writer for template quality and export fidelity.
            Kid-facing tools require sign-off from our Kids &amp; Classroom Editor.
          </li>
          <li>
            <strong>Fact-check.</strong> Any factual claim on a tool page (e.g. "prints
            on standard A4") is verified in-house before publish.
          </li>
          <li>
            <strong>Annual re-review.</strong> Every tool page is re-reviewed at least
            once per year. Tools with material changes are re-reviewed on change.
          </li>
        </ol>

        <h2>Sourcing and citations</h2>
        <p>
          When a claim depends on outside information (a survey stat, a product spec, a
          trend statistic), we link the primary source inline. We don't cite other
          content-marketing pages as sources — only primary research, first-party
          product documentation, or reputable news outlets.
        </p>

        <h2>AI-assisted content</h2>
        <p>
          Our AI generators produce output on demand and are clearly labelled as
          AI-generated inside the tool. Editorial content (articles, guides, idea pages)
          is written by our team, not by AI. When we use AI internally for research or
          drafting assistance, a human editor rewrites and reviews the entire piece
          before publish.
        </p>

        <h2>Independence and monetisation</h2>
        <p>
          HalloweenTools is not sponsored by, and is not affiliated with, any commercial
          Halloween brand. We do not accept payment for coverage. If we ever add
          affiliate links, sponsored content, or advertising, they will be labelled
          clearly at the point of appearance.
        </p>

        <h2>Update policy</h2>
        <p>
          Every published article displays both a <em>published</em> date and (when
          different) an <em>updated</em> date. When we make a substantive change we
          update the modified date. Minor copy-edits and typo fixes do not trigger a
          re-date.
        </p>

        <h2>Corrections</h2>
        <p>
          Found a factual error? Email us via the{" "}
          <Link to="/contact">contact page</Link>. We correct verified errors within 48
          hours and, when the correction is material, add a dated note at the bottom of
          the affected page.
        </p>

        <h2>User safety</h2>
        <p>
          We don't collect personal data through our tools. Nothing you type into an AI
          generator is used to train a model, and we don't sell or share what you type
          with third parties. See our <Link to="/privacy">privacy policy</Link> for
          details.
        </p>

        <h2>Feedback</h2>
        <p>
          Editorial feedback, corrections, and tip submissions: use the{" "}
          <Link to="/contact">contact form</Link>. We read everything.
        </p>

        <p className="text-xs text-muted-foreground mt-12">
          This policy was last reviewed on{" "}
          <time dateTime={LAST_REVIEWED}>
            {new Date(LAST_REVIEWED).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          .
        </p>
      </article>
    </PageShell>
  );
}
