import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";

const SLUG = "privacy";
const PATH = "/privacy";

export const Route = createFileRoute("/privacy")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: PrivacyPage,
  errorComponent: () => <LegalNotFound title="Privacy Policy" />,
  notFoundComponent: () => <LegalNotFound title="Privacy Policy" />,
});

function PrivacyPage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Privacy Policy" />;
  return <LegalDoc page={page} path={PATH} />;
}
