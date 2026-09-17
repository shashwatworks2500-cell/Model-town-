"use client";

import { hero, site } from "@/lib/content";

/**
 * Loading state for the frame sequence.
 *
 * Sits over the film rather than replacing it, fades rather than cuts, and
 * shows real progress — the percentage is the priority tier actually arriving,
 * not a scripted animation. On a dark page it is a held black frame with one
 * number in it, which is how a film starts.
 */
export function HeroLoader({ progress }: { progress: number }) {
  const leaving = progress >= 1;
  const pct = Math.min(99, Math.round(progress * 100));

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between bg-ink px-[var(--gutter)] py-[var(--gutter)] transition-opacity duration-700 ease-(--ease-out-arch)"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : "auto" }}
      role="status"
      aria-live="polite"
    >
      <p className="t-label text-on-dark-mute">{site.wordmark}</p>

      <div className="flex items-end justify-between gap-8">
        <p className="t-label text-on-dark-mute">{hero.loading}</p>
        <p className="text-bone" style={{ fontSize: "clamp(3rem,11vw,7rem)", lineHeight: 0.8, letterSpacing: "-0.05em" }}>
          <span className="tabular-nums">{String(pct).padStart(2, "0")}</span>
        </p>
      </div>

      <span aria-hidden className="block h-px w-full bg-line-dark">
        <span
          className="block h-full origin-left bg-bone transition-transform duration-300 ease-linear"
          style={{ transform: `scaleX(${Math.max(0.02, progress).toFixed(3)})` }}
        />
      </span>
    </div>
  );
}
