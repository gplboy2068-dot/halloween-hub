import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "ugc-policy";
const PATH = "/ugc-policy";

export const Route = createFileRoute("/ugc-policy")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: Page,
  errorComponent: () => <LegalNotFound title="UGC Policy" />,
  notFoundComponent: () => <LegalNotFound title="UGC Policy" />,
});

function Page() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="UGC Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
