import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "ai-content-policy";
const PATH = "/ai-content-policy";

export const Route = createFileRoute("/ai-content-policy")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: Page,
  errorComponent: () => <LegalNotFound title="AI Content Policy" />,
  notFoundComponent: () => <LegalNotFound title="AI Content Policy" />,
});

function Page() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="AI Content Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
