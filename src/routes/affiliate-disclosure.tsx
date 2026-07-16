import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "affiliate-disclosure";
const PATH = "/affiliate-disclosure";

export const Route = createFileRoute("/affiliate-disclosure")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: AffiliateDisclosurePage,
  errorComponent: () => <LegalNotFound title="Affiliate Disclosure" />,
  notFoundComponent: () => <LegalNotFound title="Affiliate Disclosure" />,
});

function AffiliateDisclosurePage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Affiliate Disclosure" />;
  return <LegalDoc page={page} path={PATH} />;
}
