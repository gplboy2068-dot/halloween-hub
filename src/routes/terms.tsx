import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "terms";
const PATH = "/terms";

export const Route = createFileRoute("/terms")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: TermsPage,
  errorComponent: () => <LegalNotFound title="Terms and Conditions" />,
  notFoundComponent: () => <LegalNotFound title="Terms and Conditions" />,
});

function TermsPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Terms and Conditions" />;
  return <LegalDoc page={page} path={PATH} />;
}
