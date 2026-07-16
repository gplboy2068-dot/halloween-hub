import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "advertise";
const PATH = "/advertise";

export const Route = createFileRoute("/advertise")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: AdvertisePage,
  errorComponent: () => <LegalNotFound title="Advertise With Us" />,
  notFoundComponent: () => <LegalNotFound title="Advertise With Us" />,
});

function AdvertisePage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Advertise With Us" />;
  return <LegalDoc page={page} path={PATH} />;
}
