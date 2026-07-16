import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "accessibility";
const PATH = "/accessibility";

export const Route = createFileRoute("/accessibility")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: Page,
  errorComponent: () => <LegalNotFound title="Accessibility Statement" />,
  notFoundComponent: () => <LegalNotFound title="Accessibility Statement" />,
});

function Page() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Accessibility Statement" />;
  return <LegalDoc page={page} path={PATH} />;
}
