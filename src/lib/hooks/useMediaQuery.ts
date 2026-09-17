"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * `useSyncExternalStore` rather than state-in-an-effect: the browser's match
 * list is an external store, and treating it as one means the value is correct
 * on the first render after hydration instead of flipping a frame later. The
 * server snapshot is always `false`, so server and client markup agree.
 */
export function useMediaQuery(query: string): boolean {
  const list = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia(query)),
    [query],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!list) return () => {};
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [list],
  );

  return useSyncExternalStore(
    subscribe,
    () => list?.matches ?? false,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Desktop pointer: gates the custom cursor and magnetic buttons only. */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

const noop = () => () => {};

/**
 * True once the client has taken over from the server-rendered markup. Used by
 * anything that cannot exist during server rendering — portals, most obviously.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
