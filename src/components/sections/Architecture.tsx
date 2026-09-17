"use client";

import { useRef } from "react";

import { architecture } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { Reveal, SectionMark } from "@/components/ui/Reveal";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * Five principles, read sideways.
 *
 * The page has been moving vertically for a long time by this point. Turning
 * the axis is the cheapest way to make a section feel like a different place,
 * and it suits the content — an elevation is something you read along.
 *
 * Under reduced motion, and on phones where a hijacked horizontal scroll is
 * genuinely unpleasant, the same list simply stacks.
 */
export function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reduced) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - track.clientWidth;

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="architecture"
      aria-labelledby="architecture-heading"
      className="relative scroll-mt-24 overflow-hidden bg-paper py-[var(--space-section)]"
    >
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal mode="fade">
              <SectionMark>{architecture.mark}</SectionMark>
            </Reveal>
            <Reveal mode="mask" stagger={0.08} className="mt-7">
              <h2
                id="architecture-heading"
                className="display-tight text-[length:var(--text-h2)] text-ink"
              >
                {architecture.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </Reveal>
          </div>
          <Reveal mode="up" delay={0.1}>
            <p className="prose-arch text-slate md:text-right">{architecture.lede}</p>
          </Reveal>
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <ul
          ref={trackRef}
          className="flex flex-col gap-px bg-rule md:flex-row md:gap-0 md:bg-transparent md:will-change-transform md:pl-[var(--gutter)]"
        >
          {architecture.principles.map((principle, index) => (
            <li
              key={principle.index}
              className="group relative bg-paper px-[var(--gutter)] py-10 md:w-[clamp(19rem,26vw,25rem)] md:shrink-0 md:border-l md:border-rule md:px-10 md:py-14"
            >
              {/* The index sits behind the text at a scale that makes it a
                  texture rather than a label. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 top-4 select-none font-[family-name:var(--font-display)] text-[7rem] font-medium leading-none tracking-tighter text-ink/[0.045] md:text-[9rem]"
              >
                {principle.index}
              </span>

              <div className="relative">
                <p className="mark text-forest">{principle.index}</p>
                <h3 className="mt-6 display text-[length:var(--text-h3)] text-ink">
                  {principle.title}
                </h3>
                <p className="mt-5 max-w-[34ch] text-[length:var(--text-body)] leading-relaxed text-slate">
                  {principle.body}
                </p>
              </div>

              <span
                aria-hidden
                className="mt-10 block h-px w-12 origin-left bg-ink/25 transition-transform duration-500 ease-(--ease-out-arch) group-hover:scale-x-[2.4]"
                style={{ animationDelay: `${index * 40}ms` }}
              />
            </li>
          ))}
          <li aria-hidden className="hidden w-[var(--gutter)] shrink-0 bg-paper md:block" />
        </ul>
      </div>
    </section>
  );
}
