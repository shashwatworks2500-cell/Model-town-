"use client";

import Image from "next/image";

import { finalCta } from "@/lib/content";
import { ArrowGlyph, Button } from "@/components/ui/Button";
import { Reveal, SectionMark } from "@/components/ui/Reveal";
import { media } from "@/lib/media.generated";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * The close of the journey.
 *
 * Returns to the final frame of the film — the same image the hero resolved
 * into, now still and full width. The page ends where the scroll ended, which
 * is the whole point of having taken the visitor through it.
 */
export function FinalCta() {
  const { openEnquiry } = useEnquiry();
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden bg-ink text-paper on-deep"
    >
      <div className="absolute inset-0">
        <Image
          src="/media/film/arrival.webp"
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={media.blur.arrival}
          className="object-cover object-[center_65%]"
          aria-hidden
        />
        <div aria-hidden className="absolute inset-0 bg-ink/74" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"
        />
      </div>

      <div className="relative shell py-[calc(var(--space-section)*1.15)]">
        <Reveal mode="fade">
          <SectionMark tone="image">{finalCta.mark}</SectionMark>
        </Reveal>

        <Reveal mode="mask" stagger={0.08} className="mt-10">
          <h2 id="cta-heading" className="display-tight text-[length:var(--text-h1)] text-paper">
            {finalCta.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal mode="up" delay={0.1} className="mt-12">
          <p className="prose-arch text-paper">{finalCta.body}</p>
        </Reveal>

        <Reveal
          mode="up"
          delay={0.16}
          className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
        >
          <Button variant="solid" tone="deep" magnetic onClick={openEnquiry}>
            {finalCta.primary}
            <ArrowGlyph />
          </Button>

          <Button
            variant="link"
            tone="deep"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
            }}
          >
            {finalCta.secondary}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
