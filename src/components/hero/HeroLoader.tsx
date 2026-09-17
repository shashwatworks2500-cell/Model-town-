"use client";

import { hero, site } from "@/lib/content";

/**
 * Loading state for the frame sequence.
 *
 * It sits over the film rather than replacing it, fades rather than cuts, and
 * shows real progress — the percentage is the priority tier actually arriving,
 * not a scripted animation.
 */
export function HeroLoader({ progress }: { progress: number }) {
  // Derived, not stored: there is no state here that the progress value does
  // not already describe.
  const leaving = progress >= 1;
  const pct = Math.min(99, Math.round(progress * 100));

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between bg-paper px-[var(--gutter)] py-[var(--gutter)] transition-opacity duration-700 ease-(--ease-out-arch)"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : "auto" }}
      role="status"
      aria-live="polite"
    >
      <p className="mark text-slate">{site.wordmark}</p>

      <div className="flex items-end justify-between gap-8">
        <p className="mark text-slate">{hero.loading}</p>
        <p className="font-[family-name:var(--font-display)] text-[clamp(3rem,12vw,7rem)] font-medium leading-[0.8] tabular-nums tracking-tight text-ink">
          {String(pct).padStart(2, "0")}
          <span className="ml-1 align-super text-[0.28em] tracking-normal">%</span>
        </p>
      </div>

      <span aria-hidden className="block h-px w-full bg-rule">
        <span
          className="block h-full origin-left bg-ink transition-transform duration-300 ease-linear"
          style={{ transform: `scaleX(${Math.max(0.02, progress).toFixed(3)})` }}
        />
      </span>
    </div>
  );
}
