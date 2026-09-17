import { useEffect, useLayoutEffect } from "react";

/** `useLayoutEffect` without the server-render warning. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
