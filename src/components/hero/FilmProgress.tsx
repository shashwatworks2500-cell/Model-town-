"use client";

import { cn } from "@/lib/cn";
import { hero } from "@/lib/content";

/**
 * `01 ───────── 04`.
 *
 * It exists to say that the hero is a sequence with a length, not a loop — so
 * the visitor knows scrolling is going somewhere. Deliberately hairline: the
 * moment a progress indicator becomes visually dominant it stops being an
 * instrument and starts competing with the picture.
 */
export function FilmProgress({
  phase,
  fillRef,
}: {
  phase: number;
  fillRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const total = hero.phases.length;

  return (
    <div className="flex items-center gap-4">
      <span className="t-label text-on-dark">
        {String(phase + 1).padStart(2, "0")}
      </span>

      <span
        aria-hidden
        className="relative block h-px w-[clamp(4rem,12vw,9rem)] bg-line-dark-strong"
      >
        <span
          ref={fillRef}
          className="absolute inset-y-0 left-0 block w-full origin-left bg-bone"
          style={{ transform: "scaleX(0)" }}
        />
        {/* Phase ticks, so the line reads as four chapters rather than a bar. */}
        {hero.phases.map((p, i) => (
          <span
            key={p.index}
            className={cn(
              "absolute top-1/2 h-1.5 w-px -translate-y-1/2 transition-colors duration-500",
              i <= phase ? "bg-bone" : "bg-line-dark-strong",
            )}
            style={{ left: `${(i / (total - 1)) * 100}%` }}
          />
        ))}
      </span>

      <span className="t-label text-on-dark-mute">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
