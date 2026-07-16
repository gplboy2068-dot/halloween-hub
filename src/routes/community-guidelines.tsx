import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "community-guidelines";
const PATH = "/community-guidelines";

export const Route = createFileRoute("/community-guidelines")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: Page,
  errorComponent: () => <LegalNotFound title="Community Guidelines" />,
  notFoundComponent: () => <LegalNotFound title="Community Guidelines" />,
});

function Page() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Community Guidelines" />;
  return <LegalDoc page={page} path={PATH} />;
}
