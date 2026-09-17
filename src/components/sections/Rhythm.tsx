import { rhythm } from "@/lib/content";
import { Figure } from "@/components/ui/Figure";
import { Reveal, SectionMark } from "@/components/ui/Reveal";

/**
 * The day.
 *
 * A narrow column of type running against a tall picture that breaks the top of
 * the grid — the one place on the page where an image is allowed to sit higher
 * than the heading beside it.
 */
export function Rhythm() {
  return (
    <section
      id="experience"
      aria-labelledby="rhythm-heading"
      className="relative scroll-mt-24 overflow-hidden bg-paper py-[var(--space-section)]"
    >
      <div className="shell">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          <Reveal mode="up" className="lg:col-span-5 lg:-mt-20">
            <Figure
              id="leisure"
              alt="A person resting at the edge of a pool, looking out over a coastline at dusk."
              ratio="4 / 5"
              sizes="(max-width: 1024px) 92vw, 40vw"
              parallax={64}
              position="center 40%"
            />
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
            <Reveal mode="fade">
              <SectionMark>{rhythm.mark}</SectionMark>
            </Reveal>

            <Reveal mode="mask" stagger={0.08} className="mt-8">
              <h2 id="rhythm-heading" className="display-tight text-[length:var(--text-h2)] text-ink">
                {rhythm.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </Reveal>

            <Reveal mode="up" delay={0.08} className="mt-9">
              <p className="prose-arch text-slate">{rhythm.lede}</p>
            </Reveal>

            <Reveal mode="up" delay={0.14} className="mt-8 border-t border-rule pt-7">
              <p className="measure text-[length:var(--text-body)] leading-relaxed text-slate">
                {rhythm.body}
              </p>
            </Reveal>

            <p className="mark mt-10 text-slate/70">{rhythm.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
