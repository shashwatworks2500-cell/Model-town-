import { media } from "@/lib/media.generated";

export type CutName = "lg" | "sm";

export interface Cut {
  readonly count: number;
  readonly width: number;
  readonly height: number;
}

export const cuts: Record<CutName, Cut> = media.film.cuts;

export const framePath = (cut: CutName, index: number) =>
  `/media/film/${cut}/${String(index).padStart(4, "0")}.webp`;

/**
 * Two-tier load order.
 *
 * Tier one is every fourth frame plus the last: a complete pass over the whole
 * film at coarse temporal resolution, which is enough to start scrubbing. It is
 * what gates the loader, so its size is what the visitor actually waits for —
 * roughly a quarter of the sequence rather than all of it. Tier two fills the
 * gaps afterwards and silently upgrades smoothness, so nobody waits on frames
 * they may never scroll to.
 */
const PRIORITY_STRIDE = 4;

export function loadOrder(count: number): { priority: number[]; rest: number[] } {
  const priority: number[] = [];
  const rest: number[] = [];

  for (let i = 0; i < count; i += 1) {
    if (i % PRIORITY_STRIDE === 0 || i === count - 1) priority.push(i);
    else rest.push(i);
  }

  return { priority, rest };
}

/** True when the device has asked for less data; tier two is then skipped. */
export function prefersLessData(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

let lockedCut: CutName | null = null;

/** Never resubscribes: the resolved cut is fixed for the session. */
export const neverChanges = () => () => {};

/**
 * Resolves which cut to deliver, once, and then holds it.
 *
 * Locking matters: dragging a desktop window narrower than the breakpoint would
 * otherwise throw away a decoded sequence and download the other one, and the
 * canvas covers any viewport shape regardless. Returns null on the server, and
 * while reduced motion is in effect, because in both cases no sequence should
 * be fetched at all.
 */
export function resolveCut(): CutName | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  lockedCut ??= window.matchMedia("(min-width: 768px)").matches ? "lg" : "sm";
  return lockedCut;
}
