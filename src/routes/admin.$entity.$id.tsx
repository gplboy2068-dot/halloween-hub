import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityForm } from "@/components/admin/EntityForm";
import { ENTITY_CONFIGS } from "@/lib/entity-configs";
import {
  deleteEntity, updateEntity, useEntity,
  type BaseEntity,
} from "@/lib/admin-store";

const ENTITIES = Object.keys(ENTITY_CONFIGS);

export const Route = createFileRoute("/admin/$entity/$id")({
  loader: ({ params }) => {
    if (!ENTITIES.includes(params.entity)) throw notFound();
    return ENTITY_CONFIGS[params.entity];
  },
  component: EditEntity,
});

function EditEntity() {
  const { entity, id } = Route.useParams();
  const cfg = Route.useLoaderData();
  const item = useEntity<BaseEntity & Record<string, unknown>>(entity, id);
  const navigate = useNavigate();

  if (!item) {
    return (
      <AdminShell title="Not found">
        <p className="text-muted-foreground">This item doesn't exist. <Link to="/admin/$entity" params={{ entity }} className="text-primary hover:underline">Go back</Link></p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Edit ${cfg.singular}`}>
      <EntityForm
        title={((item[cfg.primaryKey] as string) || `New ${cfg.singular}`)}
        backHref={`/admin/${entity}`}
        initial={item}
        fields={cfg.fields}
        onSave={(values) => {
          updateEntity(entity, id, values);
          navigate({ to: "/admin/$entity", params: { entity } });
        }}
        onDelete={() => {
          deleteEntity(entity, id);
          navigate({ to: "/admin/$entity", params: { entity } });
        }}
      />
    </AdminShell>
  );
}
