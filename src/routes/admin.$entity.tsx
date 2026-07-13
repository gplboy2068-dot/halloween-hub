import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityTable, type Column } from "@/components/admin/EntityTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { ENTITY_CONFIGS, type EntityConfig } from "@/lib/entity-configs";
import {
  createEntity, deleteEntity, updateEntity, useEntity, useEntityList,
  type BaseEntity,
} from "@/lib/admin-store";
import { Plus } from "lucide-react";

const ENTITIES = Object.keys(ENTITY_CONFIGS);

export const Route = createFileRoute("/admin/$entity")({
  loader: ({ params }) => {
    if (!ENTITIES.includes(params.entity)) throw notFound();
    return ENTITY_CONFIGS[params.entity];
  },
  component: EntityRoute,
  notFoundComponent: () => (
    <AdminShell title="Not found">
      <p className="text-muted-foreground">This admin module doesn't exist.</p>
    </AdminShell>
  ),
});

function EntityRoute() {
  const { entity } = Route.useParams();
  const cfg = Route.useLoaderData() as EntityConfig;
  const rows = useEntityList<BaseEntity & Record<string, unknown>>(entity);
  const navigate = useNavigate();

  const columns: Column<BaseEntity & Record<string, unknown>>[] = cfg.columns.map((c: EntityConfig["columns"][number]) => ({
    key: c.key,
    label: c.label,
    className: c.className,
    render: (row) => {
      const v = row[c.key];
      if (c.key === cfg.primaryKey) return <span className="font-medium text-foreground">{String(v ?? "—")}</span>;
      return <span className="text-muted-foreground">{String(v ?? "—")}</span>;
    },
  }));

  return (
    <AdminShell
      title={cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1)}
      actions={
        <button
          onClick={() => {
            const created = createEntity(entity, { status: "draft" });
            navigate({ to: "/admin/$entity/$id", params: { entity, id: created.id } });
          }}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow glow-primary"
        >
          <Plus className="h-4 w-4" /> New {cfg.singular}
        </button>
      }
    >
      <EntityTable
        entity={entity}
        rows={rows}
        columns={columns}
        editHref={(row) => `/admin/${entity}/${row.id}`}
        primaryLabel={cfg.singular}
      />
    </AdminShell>
  );
}
