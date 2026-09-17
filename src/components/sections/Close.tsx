"use client";

import Image from "next/image";
import { useRef } from "react";

import { close } from "@/lib/content";
import { Arrow, Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/lib/media.generated";
import { gsap } from "@/lib/gsap";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * The closing frame.
 *
 * The name returns at the largest size it appears anywhere, and as the section
 * crosses the viewport the two words draw apart while the finished development
 * surfaces between them. It is the same image the hero resolved into — the page
 * ends where the scroll ended, which is the whole point of having taken the
 * visitor through it.
 */
export function Close() {
  const ref = useRef<HTMLElement>(null);
  const { openEnquiry } = useEnquiry();
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const first = section.querySelector<HTMLElement>("[data-word='first']");
    const second = section.querySelector<HTMLElement>("[data-word='second']");
    const plate = section.querySelector<HTMLElement>("[data-plate]");
    if (!first || !second || !plate) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "center center",
          scrub: 0.8,
        },
      });
      // Small separation. Any more and it reads as a trick rather than as the
      // name opening to let the place through.
      tl.fromTo(first, { xPercent: 4 }, { xPercent: -3, ease: "none" }, 0);
      tl.fromTo(second, { xPercent: -4 }, { xPercent: 5, ease: "none" }, 0);
      tl.fromTo(plate, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ease: "none" }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="close-heading"
      className="relative overflow-hidden bg-ink pt-[var(--space-section)] pb-[var(--space-breath)] text-on-dark"
    >
      <div className="bleed">
        <Reveal>
          <Mark index={close.index} label={close.label} />
        </Reveal>
      </div>

      {/* The name, with the development surfacing between the two words. */}
      <div className="relative mt-[clamp(3rem,8vh,7rem)]">
        <div
          data-plate
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0"
        >
          <div className="relative mx-auto aspect-[4/3] w-[min(78vw,64rem)] md:aspect-[21/9]">
            <Image
              src="/media/film/arrival.webp"
              alt=""
              fill
              sizes="78vw"
              placeholder="blur"
              blurDataURL={media.blur.arrival}
              className="object-cover object-[center_62%]"
            />
            <div className="absolute inset-0 bg-ink/55" />
          </div>
        </div>

        <h2 id="close-heading" className="relative t-hero text-center text-bone">
          <span data-word="first" className="block">
            {close.title[0]}
          </span>
          <span data-word="second" className="block">
            {close.title[1]}
          </span>
        </h2>
      </div>

      <div className="bleed mt-[clamp(4rem,10vh,8rem)]">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p
              className="t-serif text-bone"
              style={{ fontSize: "var(--text-heading)", lineHeight: 1.08 }}
            >
              {close.serifLine.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Button variant="solid" tone="dark" magnetic onClick={openEnquiry}>
              {close.cta}
              <Arrow />
            </Button>
            <Button
              variant="line"
              tone="dark"
              onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
            >
              {close.back}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
