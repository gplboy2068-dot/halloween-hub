import { createFileRoute, useNavigate, notFound, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityForm } from "@/components/admin/EntityForm";
import { ENTITY_CONFIGS, type EntityConfig } from "@/lib/entity-configs";
import {
  useDeleteEntities,
  useEntity,
  useUpdateEntity,
  type BaseEntity,
} from "@/lib/admin-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const cfg = Route.useLoaderData() as EntityConfig;
  const item = useEntity<BaseEntity & Record<string, unknown>>(entity, id);
  const navigate = useNavigate();
  const updateMut = useUpdateEntity();
  const deleteMut = useDeleteEntities();

  if (!item) {
    return (
      <AdminShell title={`Edit ${cfg.singular}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          <Link to="/admin/$entity" params={{ entity }} className="ml-4 text-primary hover:underline">Back</Link>
        </div>
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
        onSave={async (values) => {
          try {
            await updateMut.mutateAsync({ entity, id, values: values as Record<string, unknown> });
            toast.success("Saved");
            navigate({ to: "/admin/$entity", params: { entity } });
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to save");
          }
        }}
        onDelete={async () => {
          try {
            await deleteMut.mutateAsync({ entity, ids: [id] });
            toast.success("Deleted");
            navigate({ to: "/admin/$entity", params: { entity } });
          } catch (e: any) {
            toast.error(e?.message ?? "Failed to delete");
          }
        }}
      />
    </AdminShell>
  );
}
