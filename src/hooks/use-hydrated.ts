import { useEffect, useState } from "react";

/** True only after client hydration — safe gate for browser-only APIs. */
export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
