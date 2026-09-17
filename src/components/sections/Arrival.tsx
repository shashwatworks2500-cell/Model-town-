import { arrival } from "@/lib/content";
import { Caption, Figure } from "@/components/ui/Figure";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Type on the left, a tall plate on the right, pushed down out of alignment
 * with it. The heading steps inward line by line so the three words read as a
 * descent rather than a block, and the picture starts below where the eye
 * expects it — which is what stops this reading as a two-column layout.
 */
export function Arrival() {
  return (
    <section
      aria-labelledby="arrival-heading"
      className="relative overflow-hidden bg-bone py-[var(--space-breath)] text-on-light"
    >
      <div className="bleed">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-6 lg:pt-[6vh]">
            <Reveal>
              <Mark index={arrival.index} label={arrival.label} tone="light" />
            </Reveal>

            <Lines
              id="arrival-heading"
              lines={arrival.heading}
              size="display"
              indent={[0, 2, 4]}
              className="mt-10 text-on-light"
            />

            <Reveal delay={0.1} className="mt-[clamp(3rem,6vh,5rem)] max-w-[34ch]">
              <p className="t-body text-on-light-mute">{arrival.body}</p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:mt-[14vh]">
            <Figure
              id="welcome"
              alt="Three people walking through a bright, empty residential interior."
              ratio="3 / 4"
              sizes="(max-width: 1024px) 92vw, 38vw"
              position="center 34%"
              parallax={14}
            />
            <Caption tone="light" className="mt-5">
              {arrival.caption}
            </Caption>
          </div>
        </div>
      </div>
    </section>
  );
}
