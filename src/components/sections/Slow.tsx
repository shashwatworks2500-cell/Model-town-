import { slow } from "@/lib/content";
import { Caption, Figure } from "@/components/ui/Figure";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The stillness.
 *
 * A full-height picture, two words, and one line in the serif — the first of
 * only two places on the site where the page is allowed to sound like a person.
 * Nothing moves here except the picture drifting; the section exists so the
 * ones on either side of it have something to be faster than.
 */
export function Slow() {
  return (
    <section
      aria-labelledby="slow-heading"
      className="relative bg-ink text-on-dark"
    >
      <div className="relative viewport-min-h">
        <div className="absolute inset-0">
          <Figure
            id="leisure"
            alt="A person resting at the edge of a pool, looking out over a coastline at dusk."
            sizes="100vw"
            position="center 32%"
            parallax={12}
            className="h-full [&>[data-frame]]:h-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25"
        />
        {/* The frame opens on a bright sky, and the section mark sits in it.
            Same idea as the hero — darken the band the type occupies rather
            than dimming the whole photograph — but weighted to the very top,
            because here the mark sits high and the hero's mark sits low. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-ink via-ink/70 to-transparent"
        />

        <div className="relative flex viewport-min-h flex-col justify-between py-[var(--space-breath)]">
          <div className="bleed">
            <Reveal>
              <Mark index={slow.index} label={slow.label} />
            </Reveal>
          </div>

          <div className="bleed">
            <Lines
              id="slow-heading"
              lines={slow.heading}
              size="hero"
              indent={[0, 4]}
              className="text-bone"
            />
          </div>

          <div className="bleed">
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <Reveal>
                <p className="t-serif text-bone" style={{ fontSize: "var(--text-sub)", lineHeight: 1.35 }}>
                  {slow.serifLine.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </Reveal>
              <Caption className="md:text-right">{slow.caption}</Caption>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
