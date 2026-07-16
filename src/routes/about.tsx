import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "about";
const PATH = "/about";

export const Route = createFileRoute("/about")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: AboutPage,
  errorComponent: () => <LegalNotFound title="About" />,
  notFoundComponent: () => <LegalNotFound title="About" />,
});

function AboutPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="About" />;
  return <LegalDoc page={page} path={PATH} />;
}
