import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "ai-transparency";
const PATH = "/ai-transparency";

export const Route = createFileRoute("/ai-transparency")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: AiTransparencyPage,
  errorComponent: () => <LegalNotFound title="AI Transparency Policy" />,
  notFoundComponent: () => <LegalNotFound title="AI Transparency Policy" />,
});

function AiTransparencyPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="AI Transparency Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
