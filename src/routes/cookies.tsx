import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "cookies";
const PATH = "/cookies";

export const Route = createFileRoute("/cookies")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: CookiesPage,
  errorComponent: () => <LegalNotFound title="Cookie Policy" />,
  notFoundComponent: () => <LegalNotFound title="Cookie Policy" />,
});

function CookiesPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Cookie Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
