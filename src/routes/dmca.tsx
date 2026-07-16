import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "dmca";
const PATH = "/dmca";

export const Route = createFileRoute("/dmca")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: DmcaPage,
  errorComponent: () => <LegalNotFound title="DMCA Policy" />,
  notFoundComponent: () => <LegalNotFound title="DMCA Policy" />,
});

function DmcaPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="DMCA Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
