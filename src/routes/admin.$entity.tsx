import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ENTITY_CONFIGS, type EntityConfig } from "@/lib/entity-configs";

const ENTITIES = Object.keys(ENTITY_CONFIGS);

export const Route = createFileRoute("/admin/$entity")({
  loader: ({ params }) => {
    if (!ENTITIES.includes(params.entity)) throw notFound();
    return ENTITY_CONFIGS[params.entity];
  },
  component: () => <Outlet />,
  errorComponent: () => (
    <AdminShell title="Admin error">
      <p className="text-muted-foreground">Unable to load this admin module.</p>
    </AdminShell>
  ),
  notFoundComponent: () => (
    <AdminShell title="Not found">
      <p className="text-muted-foreground">This admin module doesn't exist.</p>
    </AdminShell>
  ),
});
