"use client";

import { useRef } from "react";

import { architecture } from "@/lib/content";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/**
 * Five decisions, read sideways.
 *
 * The page has been moving vertically for a long time by now, and turning the
 * axis is the cheapest way to make a section feel like a different place. It
 * also suits the content: an elevation is something you read along. On phones,
 * where hijacking horizontal scroll is genuinely unpleasant, the same list
 * simply stacks.
 */
export function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="architecture"
      aria-labelledby="architecture-heading"
      className="relative scroll-mt-0 overflow-hidden bg-bone py-[var(--space-breath)] text-on-light"
    >
      <div className="bleed">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <Mark index={architecture.index} label={architecture.label} tone="light" />
            </Reveal>
            <Lines
              id="architecture-heading"
              lines={architecture.heading}
              size="display"
              indent={[0, 2, 4]}
              className="mt-10 text-on-light"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="t-sub max-w-[26ch] text-on-light-mute md:text-right">
              {architecture.lede}
            </p>
          </Reveal>
        </div>
      </div>

      <ol
        ref={trackRef}
        className="mt-[clamp(4rem,10vh,8rem)] flex flex-col md:flex-row md:will-change-transform md:pl-[var(--gutter)]"
      >
        {architecture.principles.map((principle) => (
          <li
            key={principle.index}
            className="group relative border-t border-line-light px-[var(--gutter)] py-12 md:w-[clamp(20rem,27vw,27rem)] md:shrink-0 md:border-t-0 md:border-l md:px-12 md:py-16"
          >
            <p className="t-label text-on-light-mute">{principle.index}</p>
            {/* Sized to the column, not to the page. The display scale belongs
                to the sections that carry the story; a card in a row of five
                is a different register and reads as one when it is set as one. */}
            <h3
              className="mt-8 text-on-light"
              style={{
                fontSize: "clamp(1.75rem, 2.4vw, 2.75rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
              }}
            >
              {principle.title}
            </h3>
            <p className="t-body mt-7 max-w-[30ch] text-on-light-mute">{principle.body}</p>

            <span
              aria-hidden
              className="mt-12 block h-px w-10 origin-left bg-line-light-strong transition-transform duration-500 ease-(--ease-out-arch) group-hover:scale-x-[2.6]"
            />
          </li>
        ))}
        <li aria-hidden className="hidden w-[var(--gutter)] shrink-0 md:block" />
      </ol>
    </section>
  );
}
