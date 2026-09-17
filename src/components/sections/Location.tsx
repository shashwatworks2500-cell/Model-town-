import { location } from "@/lib/content";
import { Reveal, SectionMark } from "@/components/ui/Reveal";

/**
 * The address.
 *
 * No map, no travel times, no landmark list — none of it has been supplied, and
 * a location section that invents its content is worse than one that admits it
 * is waiting. The bracketed values are rendered as they are so it is obvious at
 * a glance what still needs filling in.
 */
export function Location() {
  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative scroll-mt-24 bg-paper py-[var(--space-section)]"
    >
      <div className="shell">
        <div className="grid gap-y-12 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <Reveal mode="fade">
              <SectionMark>{location.mark}</SectionMark>
            </Reveal>

            <Reveal mode="mask" stagger={0.08} className="mt-7">
              <h2
                id="location-heading"
                className="display-tight text-[length:var(--text-h1)] text-ink"
              >
                {location.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7 md:pt-4">
            <Reveal mode="up">
              <p className="prose-arch text-slate">{location.lede}</p>
            </Reveal>

            <Reveal mode="up" delay={0.08} className="mt-8">
              <p className="measure text-[length:var(--text-body)] leading-relaxed text-slate">
                {location.body}
              </p>
            </Reveal>

            <Reveal as="dl" mode="up" delay={0.12} stagger={0.08} className="mt-14 border-t border-rule">
              {location.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-rule py-5"
                >
                  <dt className="mark text-slate">{row.label}</dt>
                  <dd className="mark text-ink/70">{row.value}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
