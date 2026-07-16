import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, LegalNotFound, legalHead } from "@/components/LegalDoc";
import { getLegalPage } from "@/lib/legal.functions";
import { ReportAbuseForm } from "@/components/ReportAbuseForm";

const SLUG = "report-abuse";
const PATH = "/report-abuse";

export const Route = createFileRoute("/report-abuse")({
  loader: () => getLegalPage({ data: { slug: SLUG } }),
  head: ({ loaderData }) => legalHead(loaderData, PATH),
  component: ReportAbusePage,
  errorComponent: () => <LegalNotFound title="Report Abuse" />,
  notFoundComponent: () => <LegalNotFound title="Report Abuse" />,
});

function ReportAbusePage() {
  const page = Route.useLoaderData();
  if (!page) return <LegalNotFound title="Report Abuse" />;
  return (
    <LegalDoc page={page} path={PATH}>
      <ReportAbuseForm />
    </LegalDoc>
  );
}
