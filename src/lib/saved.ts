/**
 * Save-for-later. Persists bookmarked tools and articles in
 * localStorage. Client-only — read via useHydrated() gate.
 */

const KEY = "ht_saved_v1";
const EVT = "ht:saved:change";

export type SavedKind = "tool" | "article";
export type SavedItem = {
  kind: SavedKind;
  slug: string;
  title: string;
  emoji?: string;
  href: string;
  addedAt: number;
};

type Store = { items: SavedItem[] };

function read(): Store {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

function write(store: Store): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function listSaved(): SavedItem[] {
  return read().items.sort((a, b) => b.addedAt - a.addedAt);
}

export function isSaved(kind: SavedKind, slug: string): boolean {
  return read().items.some((i) => i.kind === kind && i.slug === slug);
}

export function toggleSaved(item: Omit<SavedItem, "addedAt">): boolean {
  const store = read();
  const idx = store.items.findIndex((i) => i.kind === item.kind && i.slug === item.slug);
  if (idx >= 0) {
    store.items.splice(idx, 1);
    write(store);
    return false;
  }
  store.items.push({ ...item, addedAt: Date.now() });
  write(store);
  return true;
}

export function clearSaved(): void {
  write({ items: [] });
}

/** Subscribe to changes (returns unsubscribe). */
export function onSavedChange(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => fn();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", handler);
  };
}
