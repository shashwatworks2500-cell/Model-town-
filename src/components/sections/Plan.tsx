"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { plan } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { media } from "@/lib/media.generated";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

const stages = plan.stages;

/**
 * The drawing.
 *
 * Scrolling advances the stage and clicking a stage scrolls to it — one
 * mechanism driven from one place, so the two controls can never disagree.
 * Under reduced motion the pinning is dropped and it becomes a plain stepper
 * that still does everything.
 *
 * Every image here is a real frame from the supplied film. No measured plan
 * drawing exists for this site and none has been invented; the note below says
 * so in as many words.
 */
export function Plan() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const next = Math.min(
              stages.length - 1,
              Math.floor(self.progress * stages.length * 1.02),
            );
            if (next !== activeRef.current) {
              activeRef.current = next;
              setActive(next);
            }
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  const select = useCallback(
    (index: number) => {
      activeRef.current = index;
      setActive(index);

      const section = sectionRef.current;
      if (!section || reduced) return;

      // Land in the middle of the band that maps to this stage, so scroll
      // position and selection stay in agreement afterwards.
      const range = section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: section.offsetTop + (range * (index + 0.5)) / stages.length,
        behavior: "smooth",
      });
    },
    [reduced],
  );

  const current = stages[active] ?? stages[0];

  return (
    <section
      ref={sectionRef}
      id="masterplan"
      aria-labelledby="plan-heading"
      className="relative bg-ink text-on-dark"
      style={reduced ? undefined : { height: `${130 + stages.length * 52}vh` }}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          reduced ? "py-[var(--space-section)]" : "sticky top-0 viewport-min-h py-[var(--space-breath)]",
        )}
      >
        <div className="bleed w-full">
          <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-12">
            {/* ---- the log ------------------------------------------------ */}
            <div className="lg:col-span-4">
              <Reveal>
                <Mark index={plan.index} label={plan.label} />
              </Reveal>

              <Lines
                id="plan-heading"
                lines={plan.heading}
                size="heading"
                className="mt-9 text-bone"
              />

              <p className="t-body mt-8 text-on-dark-mute">{plan.body}</p>

              <ol className="mt-12 border-t border-line-dark">
                {stages.map((stage, index) => {
                  const isActive = index === active;
                  return (
                    <li key={stage.id} className="border-b border-line-dark">
                      <button
                        type="button"
                        onClick={() => select(index)}
                        aria-current={isActive ? "step" : undefined}
                        className="group flex w-full items-baseline gap-6 py-5 text-left"
                      >
                        <span
                          className={cn(
                            "t-label transition-colors duration-(--dur)",
                            isActive ? "text-bone" : "text-on-dark-faint group-hover:text-on-dark-mute",
                          )}
                        >
                          {stage.index}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[length:var(--text-sub)] tracking-[-0.02em] transition-colors duration-(--dur)",
                              isActive ? "text-bone" : "text-on-dark-mute group-hover:text-on-dark",
                            )}
                          >
                            {stage.label}
                          </span>
                          <span
                            className={cn(
                              "grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-out-arch)",
                              isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <span className="overflow-hidden">
                              <span className="block max-w-[38ch] pt-3 text-[0.875rem] leading-relaxed text-on-dark-mute">
                                {stage.caption}
                              </span>
                            </span>
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "mt-2 block h-px shrink-0 self-start transition-all duration-500 ease-(--ease-out-arch)",
                            isActive ? "w-10 bg-bone" : "w-4 bg-line-dark-strong",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* ---- the plate ---------------------------------------------- */}
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="relative overflow-hidden bg-ink-2">
                <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                  {stages.map((stage, index) => (
                    <Image
                      key={stage.id}
                      src={`/media/film/${stage.id}.webp`}
                      alt={`${stage.label}: ${stage.caption}`}
                      fill
                      sizes="(max-width: 1024px) 92vw, 58vw"
                      placeholder="blur"
                      blurDataURL={media.blur[stage.id as keyof typeof media.blur]}
                      aria-hidden={index !== active}
                      className={cn(
                        "object-cover transition-opacity duration-700 ease-(--ease-out-arch)",
                        index === active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  ))}
                  <SurveyMarks />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
                <p className="t-label text-bone">
                  <span className="text-on-dark-mute">{current?.index}</span>
                  <span className="ml-3">{current?.label}</span>
                </p>
                <p className="max-w-[46ch] text-[0.75rem] leading-relaxed text-on-dark-mute">
                  {plan.disclosure}
                </p>
              </div>

              {/* The honest bit. */}
              <div className="mt-12 border-t border-line-dark pt-7 sm:flex sm:items-start sm:justify-between sm:gap-10">
                <div>
                  <h3 className="t-label text-bone">{plan.note.title}</h3>
                  <p className="mt-3 max-w-[44ch] text-[0.875rem] leading-relaxed text-on-dark-mute">
                    {plan.note.body}
                  </p>
                </div>
                <p className="t-label mt-5 shrink-0 border border-dashed border-line-dark-strong px-4 py-3 text-on-dark-mute sm:mt-0">
                  {plan.note.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Survey marks over the plate — a hairline border and corner ticks, the way a
 * drawing sheet carries its own. Ornament with a job: it says that what you are
 * looking at is being read as a plan, not as a photograph. No scale bar,
 * because no measured scale has been supplied.
 */
function SurveyMarks() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-bone/30"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <rect x="3" y="4" width="94" height="92" fill="none" stroke="currentColor" strokeWidth="0.12" vectorEffect="non-scaling-stroke" />
      {[
        [3, 4],
        [97, 4],
        [3, 96],
        [97, 96],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} stroke="currentColor" strokeWidth="0.3" vectorEffect="non-scaling-stroke">
          <line x1={x} y1={(y ?? 0) - 2} x2={x} y2={(y ?? 0) + 2} />
          <line x1={(x ?? 0) - 1.4} y1={y} x2={(x ?? 0) + 1.4} y2={y} />
        </g>
      ))}
    </svg>
  );
}
