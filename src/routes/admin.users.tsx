import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminListUsers,
  adminSetUserRole,
  adminDeleteUser,
  type AdminUser,
} from "@/lib/users-admin.functions";
import { toast } from "sonner";
import { Loader2, Shield, ShieldOff, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  component: UsersAdmin,
});

function UsersAdmin() {
  const listFn = useServerFn(adminListUsers);
  const roleFn = useServerFn(adminSetUserRole);
  const delFn = useServerFn(adminDeleteUser);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listFn(),
  });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: "admin"; grant: boolean }) => roleFn({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const delMut = useMutation({
    mutationFn: (userId: string) => delFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const users: AdminUser[] = data?.users ?? [];
  const filtered = q
    ? users.filter(
        (u) =>
          u.email?.toLowerCase().includes(q.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(q.toLowerCase()),
      )
    : users;

  return (
    <AdminShell
      title={`Users${data ? ` (${users.length})` : ""}`}
      actions={
        <input
          placeholder="Search email or name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm w-64"
        />
      }
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {error && <p className="text-destructive text-sm">{(error as Error).message}</p>}
      {data && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Roles</th>
                <th className="px-4 py-3 text-left">Signed up</th>
                <th className="px-4 py-3 text-left">Last sign-in</th>
                <th className="px-4 py-3 text-right">Gens</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const isAdmin = u.roles.includes("admin");
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {(u.display_name ?? u.email ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{u.display_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              r === "admin"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{u.generation_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            roleMut.mutate({ userId: u.id, role: "admin", grant: !isAdmin })
                          }
                          disabled={roleMut.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-50"
                          title={isAdmin ? "Revoke admin" : "Grant admin"}
                        >
                          {isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                          {isAdmin ? "Revoke" : "Make admin"}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${u.email}? This is permanent.`))
                              delMut.mutate(u.id);
                          }}
                          disabled={delMut.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-destructive/40 text-destructive text-xs hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
