import { address } from "@/lib/content";
import { Lines, Mark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The address.
 *
 * No map, no travel times, no landmark list — none of it has been supplied, and
 * a location section that invents its content is worse than one that admits it
 * is waiting. The bracketed values render as they are, set in the same
 * metadata voice as everything else, so the gaps read as deliberate rather
 * than broken.
 */
export function Address() {
  return (
    <section
      id="location"
      aria-labelledby="address-heading"
      className="relative scroll-mt-24 bg-bone py-[var(--space-section)] text-on-light"
    >
      <div className="bleed">
        <div className="grid gap-y-16 lg:grid-cols-12 lg:gap-x-10">
          <div className="lg:col-span-5">
            <Reveal>
              <Mark index={address.index} label={address.label} tone="light" />
            </Reveal>
            {/* Set a step below the emotional sections. By this point the page
                has shouted twice; the facts arrive in a calmer voice. */}
            <Lines
              id="address-heading"
              lines={address.heading}
              size="heading"
              indent={[0, 2]}
              mute={[0]}
              className="mt-12 text-on-light"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-[10vh]">
            <Reveal>
              <p className="t-body text-on-light-mute">{address.body}</p>
            </Reveal>

            <Reveal as="dl" delay={0.1} stagger={0.08} className="mt-[clamp(3rem,7vh,5rem)]">
              {address.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-line-light py-6 last:border-b"
                >
                  <dt className="t-label text-on-light-mute">{row.label}</dt>
                  <dd className="t-label text-on-light">{row.value}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
