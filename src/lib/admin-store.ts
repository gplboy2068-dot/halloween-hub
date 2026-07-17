/**
 * Admin store — TanStack Query wrapper around Supabase-backed CMS server fns.
 * Same hook names as before, but data is fetched from Lovable Cloud.
 */
import { useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listEntities,
  getEntity,
  createEntity as createEntityFn,
  updateEntity as updateEntityFn,
  deleteEntities as deleteEntitiesFn,
  bulkUpdateStatus,
  getAdminStats,
  getRecentActivity,
  getSiteSettings,
  getAdminSiteSettings,
  saveSiteSettings,
} from "./cms.functions";
import type { EntityKind, BaseEntity } from "./cms-shared";
export * from "./cms-shared";

// Legacy re-exports for older imports
export type LogEntity = BaseEntity & { level: "info" | "warn" | "error"; message: string; source: string };
export type UserEntity = BaseEntity & { email: string; name: string; role: string };

const keys = {
  list: (entity: string) => ["cms", "list", entity] as const,
  one: (entity: string, id: string) => ["cms", "one", entity, id] as const,
  stats: () => ["cms", "stats"] as const,
  activity: () => ["cms", "activity"] as const,
  settings: () => ["cms", "settings"] as const,
};

export function useEntityList<T extends BaseEntity>(entity: string): T[] {
  const list = useServerFn(listEntities);
  const { data } = useQuery({
    queryKey: keys.list(entity),
    queryFn: () => list({ data: { entity: entity as EntityKind } }),
    staleTime: 30_000,
    enabled: !!entity,
  });
  return (data ?? []) as T[];
}

export function useEntity<T extends BaseEntity>(entity: string, id: string): T | undefined {
  const get = useServerFn(getEntity);
  const { data } = useQuery({
    queryKey: keys.one(entity, id),
    queryFn: () => get({ data: { entity: entity as EntityKind, id } }),
    enabled: !!id,
  });
  return (data ?? undefined) as T | undefined;
}

export function useAdminStats() {
  const fn = useServerFn(getAdminStats);
  const { data } = useQuery({
    queryKey: keys.stats(),
    queryFn: () => fn(),
    staleTime: 30_000,
  });
  return (
    data ?? {
      toolsCount: 0,
      toolsPublished: 0,
      toolsDrafts: 0,
      articlesCount: 0,
      articlesPublished: 0,
      articlesDrafts: 0,
      categoriesCount: 0,
      faqsCount: 0,
    }
  );
}

export function useRecentActivity() {
  const fn = useServerFn(getRecentActivity);
  const { data } = useQuery({
    queryKey: keys.activity(),
    queryFn: () => fn(),
    staleTime: 15_000,
  });
  return data ?? [];
}

// --- mutations ------------------------------------------------------

export function useCreateEntity() {
  const create = useServerFn(createEntityFn);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entity: string; values?: Record<string, any> }) =>
      create({ data: { entity: vars.entity as EntityKind, values: vars.values } }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: keys.list(vars.entity) });
      qc.invalidateQueries({ queryKey: keys.stats() });
    },
  });
}

export function useUpdateEntity() {
  const update = useServerFn(updateEntityFn);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entity: string; id: string; values: Record<string, any> }) =>
      update({
        data: { entity: vars.entity as EntityKind, id: vars.id, values: vars.values },
      }),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: keys.list(vars.entity) });
      qc.invalidateQueries({ queryKey: keys.one(vars.entity, vars.id) });
      qc.invalidateQueries({ queryKey: keys.stats() });
    },
  });
}

export function useDeleteEntities() {
  const del = useServerFn(deleteEntitiesFn);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entity: string; ids: string[] }) =>
      del({ data: { entity: vars.entity as EntityKind, ids: vars.ids } }),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: keys.list(vars.entity) });
      qc.invalidateQueries({ queryKey: keys.stats() });
    },
  });
}

export function useBulkStatus() {
  const bulk = useServerFn(bulkUpdateStatus);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entity: string; ids: string[]; status: "draft" | "published" | "archived" }) =>
      bulk({ data: { entity: vars.entity as EntityKind, ids: vars.ids, status: vars.status } }),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: keys.list(vars.entity) });
      qc.invalidateQueries({ queryKey: keys.stats() });
    },
  });
}

// --- settings -------------------------------------------------------

export function useSiteSettings<T>(defaults: T) {
  const load = useServerFn(getAdminSiteSettings);
  const { data } = useQuery({
    queryKey: keys.settings(),
    queryFn: () => load(),
    staleTime: 60_000,
  });
  const merged = useMemo(() => ({ ...defaults, ...(data as any) }), [defaults, data]);
  return merged as T;
}

export function useSaveSettings() {
  const save = useServerFn(saveSiteSettings);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, any>) => save({ data: { values } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings() }),
  });
}
