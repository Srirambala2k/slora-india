"use client";

import { useSyncExternalStore } from "react";

/** SSR-safe media-query hook (renders `false` on the server, then the real value). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor asked their system for less motion (accessibility, master prompt §41). */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
