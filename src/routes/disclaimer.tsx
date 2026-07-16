import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "disclaimer";
const PATH = "/disclaimer";

export const Route = createFileRoute("/disclaimer")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: DisclaimerPage,
  errorComponent: () => <LegalNotFound title="Disclaimer" />,
  notFoundComponent: () => <LegalNotFound title="Disclaimer" />,
});

function DisclaimerPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Disclaimer" />;
  return <LegalDoc page={page} path={PATH} />;
}
