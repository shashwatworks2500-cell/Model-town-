"use client";

import { useRef } from "react";

import { home } from "@/lib/content";
import { Caption, Figure } from "@/components/ui/Figure";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/**
 * The picture opens as you pass it.
 *
 * It begins as a narrow vertical slot and widens to fill the measure as the
 * section crosses the viewport — a room being entered rather than a photograph
 * being shown. Scrubbed, so the visitor controls it; under reduced motion it
 * is simply open from the start.
 */
export function Home() {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;

    const frame = section.querySelector<HTMLElement>("[data-widen]");
    if (!frame) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(frame, { width: "100%" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        frame,
        { width: "38%" },
        {
          width: "100%",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "center center",
            scrub: 0.6,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="home-heading"
      className="relative overflow-hidden bg-bone py-[var(--space-breath)] text-on-light"
    >
      <div className="bleed">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <Reveal>
            <Mark index={home.index} label={home.label} tone="light" />
          </Reveal>
          <Reveal delay={0.08} className="max-w-[30ch] md:pt-1">
            <p className="t-body text-on-light-mute">{home.body}</p>
          </Reveal>
        </div>

        <Lines
          id="home-heading"
          lines={home.heading}
          size="hero"
          indent={[0, 6]}
          className="mt-[clamp(3rem,7vh,6rem)] text-on-light"
        />
      </div>

      <div className="mt-[clamp(3rem,8vh,7rem)] flex justify-center">
        <div data-widen className="w-[38%]">
          <Figure
            id="interior"
            alt="A living room opening onto a kitchen, lit warmly from one side."
            ratio="16 / 10"
            sizes="100vw"
            position="center 45%"
          />
        </div>
      </div>

      <div className="bleed mt-6 flex justify-end">
        <Caption tone="light">{home.caption}</Caption>
      </div>
    </section>
  );
}
