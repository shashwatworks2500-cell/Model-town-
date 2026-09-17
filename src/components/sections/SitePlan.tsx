"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import { masterplan } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { media } from "@/lib/media.generated";
import { Reveal, SectionMark } from "@/components/ui/Reveal";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

const stages = masterplan.stages;

/**
 * The drawing.
 *
 * Scrolling advances the stage and clicking a stage scrolls to it — one
 * mechanism, driven from one place, so the two controls can never disagree.
 * Under reduced motion the pinning is dropped and it becomes a plain stepper
 * that still does everything.
 *
 * Everything shown here is a real frame from the supplied film. No measured
 * plan drawing has been provided for this site, and one has not been invented:
 * the placeholder below says so in as many words.
 */
export function SitePlan() {
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

      // Land in the middle of the band that maps to this stage, so the scroll
      // position and the selection stay in agreement afterwards.
      const range = section.offsetHeight - window.innerHeight;
      const target = section.offsetTop + (range * (index + 0.5)) / stages.length;
      window.scrollTo({ top: target, behavior: "smooth" });
    },
    [reduced],
  );

  const current = stages[active] ?? stages[0];

  return (
    <section
      ref={sectionRef}
      id="masterplan"
      aria-labelledby="masterplan-heading"
      className="relative scroll-mt-0 bg-ink text-paper on-deep"
      style={reduced ? undefined : { height: `${140 + stages.length * 55}vh` }}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          reduced
            ? "py-[var(--space-section)]"
            : "sticky top-0 viewport-min-h py-[var(--space-section-tight)]",
        )}
      >
        <div className="shell w-full">
          <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
            {/* ---- Left: the log ---------------------------------------- */}
            <div className="lg:col-span-4 lg:pt-2">
              <Reveal mode="fade">
                <SectionMark tone="deep">{masterplan.mark}</SectionMark>
              </Reveal>

              <Reveal mode="mask" stagger={0.08} className="mt-7">
                <h2
                  id="masterplan-heading"
                  className="display-tight text-[length:var(--text-h3)] text-paper"
                >
                  {masterplan.heading.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </Reveal>

              <p className="mt-6 max-w-[42ch] text-[length:var(--text-body)] leading-relaxed text-on-deep-muted">
                {masterplan.body}
              </p>

              <ol className="mt-10 border-t border-rule-deep">
                {stages.map((stage, index) => {
                  const isActive = index === active;
                  return (
                    <li key={stage.id} className="border-b border-rule-deep">
                      <button
                        type="button"
                        onClick={() => select(index)}
                        aria-current={isActive ? "step" : undefined}
                        className="group flex w-full items-baseline gap-5 py-4 text-left transition-colors duration-(--dur)"
                      >
                        <span
                          className={cn(
                            "mark tabular-nums transition-colors duration-(--dur)",
                            isActive ? "text-paper" : "text-paper/35 group-hover:text-paper/70",
                          )}
                        >
                          {stage.index}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block font-[family-name:var(--font-display)] text-[length:var(--text-h4)] font-medium tracking-[-0.02em] transition-colors duration-(--dur)",
                              isActive ? "text-paper" : "text-paper/45 group-hover:text-paper/80",
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
                              <span className="block max-w-[40ch] pt-2 text-[0.875rem] leading-relaxed text-on-deep-muted">
                                {stage.caption}
                              </span>
                            </span>
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "mt-2 block h-px shrink-0 self-start transition-all duration-500 ease-(--ease-out-arch)",
                            isActive ? "w-10 bg-paper" : "w-4 bg-paper/25",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* ---- Right: the plate ------------------------------------- */}
            <div className="lg:col-span-7 lg:col-start-6">
              <div className="relative overflow-hidden rounded-(--radius-frame) bg-ink-raised">
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
                  <SurveyOverlay />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <p className="mark text-paper">
                  <span className="tabular-nums text-on-deep-muted">{current?.index}</span>
                  <span className="ml-3">{current?.label}</span>
                </p>
                {/* Sentence case, not tracked caps: this one is meant to be
                    read, not glanced at. */}
                <p className="max-w-[52ch] text-[0.75rem] leading-relaxed text-on-deep-muted">
                  {masterplan.disclosure}
                </p>
              </div>

              {/* The honest bit. */}
              <div className="mt-10 border-t border-rule-deep pt-6 sm:flex sm:items-start sm:justify-between sm:gap-10">
                <div>
                  <h3 className="mark text-paper">{masterplan.planNote.title}</h3>
                  <p className="mt-3 max-w-[46ch] text-[0.875rem] leading-relaxed text-on-deep-muted">
                    {masterplan.planNote.body}
                  </p>
                </div>
                <p className="mark mt-5 shrink-0 rounded-(--radius-control) border border-dashed border-rule-deep px-4 py-3 text-paper/55 sm:mt-0">
                  {masterplan.planNote.value}
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
 * Survey marks over the plate: a hairline frame and corner ticks, the way a
 * drawing sheet carries its border. Ornament with a job — it tells you that
 * what you are looking at is being read as a plan, not as a photograph. No
 * scale bar, because no measured scale has been supplied.
 */
function SurveyOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-paper/35"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <rect
        x="3"
        y="4"
        width="94"
        height="92"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.12"
        vectorEffect="non-scaling-stroke"
      />
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
      <line
        x1="50"
        y1="4"
        x2="50"
        y2="9"
        stroke="currentColor"
        strokeWidth="0.12"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="50"
        y1="91"
        x2="50"
        y2="96"
        stroke="currentColor"
        strokeWidth="0.12"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
