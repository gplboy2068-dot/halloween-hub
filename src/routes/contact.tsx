import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "contact";
const PATH = "/contact";

export const Route = createFileRoute("/contact")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: ContactPage,
  errorComponent: () => <LegalNotFound title="Contact" />,
  notFoundComponent: () => <LegalNotFound title="Contact" />,
});

function ContactPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Contact" />;
  return <LegalDoc page={page} path={PATH} />;
}
