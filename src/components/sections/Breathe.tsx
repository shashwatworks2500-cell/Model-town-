import { breathe } from "@/lib/content";
import { Caption, Figure } from "@/components/ui/Figure";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The picture runs edge to edge with no container, and the heading sits on top
 * of it, crossing the boundary between the surface above and the image below.
 * Text overlapping an image edge is the one move that makes a page feel
 * composed rather than assembled — so it happens once, here.
 */
export function Breathe() {
  return (
    <section
      aria-labelledby="breathe-heading"
      className="relative overflow-hidden bg-bone pt-[var(--space-section)] pb-[var(--space-breath)] text-on-light"
    >
      <div className="bleed">
        <Reveal>
          <Mark index={breathe.index} label={breathe.label} tone="light" />
        </Reveal>
      </div>

      {/*
        The heading straddles the top edge of the picture — from `md` up.

        On a phone that move stops working: the portrait crop puts most of the
        line over sky rather than over the surface above it, and a difference
        blend against a bright, varying backdrop is exactly where the type
        washes out. So the phone gets its own composition — the statement
        above the picture, at full strength — instead of the desktop one
        squeezed until it fails.
      */}
      <div className="relative mt-[clamp(3rem,8vh,5rem)] md:mt-[clamp(8rem,17vh,13rem)]">
        <div className="pointer-events-none relative z-10 md:absolute md:inset-x-0 md:top-0 md:-translate-y-1/2">
          <div className="bleed">
            <Lines
              id="breathe-heading"
              lines={breathe.heading}
              size="display"
              indent={[0, 5]}
              className="text-on-light md:mix-blend-difference"
            />
          </div>
        </div>

        <Figure
          id="community"
          alt="A landscaped park between residential buildings, with mature trees and clipped hedging."
          ratio="21 / 9"
          ratioSm="4 / 5"
          sizes="100vw"
          position="center 62%"
          parallax={18}
          className="mt-8 w-full md:mt-0"
        />
      </div>

      <div className="bleed mt-14">
        <div className="grid gap-y-8 md:grid-cols-12">
          <div className="md:col-span-5 md:col-start-8">
            <Reveal>
              <p className="t-body text-on-light-mute">{breathe.body}</p>
            </Reveal>
            <Caption tone="light" className="mt-8">
              {breathe.caption}
            </Caption>
          </div>
        </div>
      </div>
    </section>
  );
}
