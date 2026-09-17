"use client";

import { cn } from "@/lib/cn";
import { stages } from "@/lib/content";

/**
 * The construction log, read as a film timeline.
 *
 * It sits along the bottom edge rather than down the side for a legibility
 * reason that turned out to be a design improvement: the film ends on a white
 * sky and pale render, and small text over that needs the bottom scrim to clear
 * the contrast floor. Anchoring it there also makes it read as a timeline —
 * which is what it is — instead of a dashboard bolted onto the picture.
 *
 * One tick per stage, and only the current stage is named. Eight simultaneous
 * labels would compete with the film for attention it has already earned.
 */
export function StageRail({
  active,
  barRef,
}: {
  active: number;
  barRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const current = stages[active] ?? stages[0];

  return (
    <div className="absolute bottom-[var(--gutter)] left-[var(--gutter)] max-w-[min(26rem,60vw)]">
      <p className="mark flex items-baseline gap-3 text-paper">
        <span className="tabular-nums text-paper/55">{current?.index}</span>
        <span>{current?.label}</span>
      </p>

      <ol aria-hidden className="mt-3.5 flex items-end gap-1.5">
        {stages.map((stage, index) => (
          <li
            key={stage.index}
            className={cn(
              "block w-7 transition-all duration-500 ease-(--ease-out-arch) sm:w-10",
              index === active
                ? "h-2.5 bg-paper"
                : index < active
                  ? "h-1 bg-paper/70"
                  : "h-px bg-paper/30",
            )}
          />
        ))}
      </ol>

      {/* Continuous progress under the stepped ticks: the stages are discrete,
          the film is not. */}
      <span aria-hidden className="mt-2.5 block h-px w-full bg-paper/20">
        <span
          ref={barRef}
          className="block h-full origin-left bg-paper"
          style={{ transform: "scaleX(0)" }}
        />
      </span>

      <p className="sr-only" aria-live="polite">
        Construction stage {current?.index}: {current?.label}
      </p>
    </div>
  );
}
