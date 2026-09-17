import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins classes and resolves Tailwind conflicts so the last one actually wins.
 *
 * Without the merge, a component that sets `inline-flex` in its base styles
 * silently beats a `hidden` passed in by a caller — the two land in the same
 * cascade layer and stylesheet order decides, not intent. That exact bug put a
 * second Enquire button on the phone header.
 */
export function cn(...parts: ClassValue[]): string {
  return twMerge(clsx(parts));
}
