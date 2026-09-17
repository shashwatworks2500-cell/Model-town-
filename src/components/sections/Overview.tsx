import { overview } from "@/lib/content";
import { Figure } from "@/components/ui/Figure";
import { Reveal, SectionMark } from "@/components/ui/Reveal";

/**
 * Two pictures, offset against each other and against the type.
 *
 * Not a three-card row: the images are different sizes, sit at different
 * heights and are read in a deliberate order — the tall one first, then the
 * wider one further down and across, so the eye travels diagonally through the
 * section instead of scanning a shelf.
 */
export function Overview() {
  return (
    <section
      id="overview"
      aria-labelledby="overview-heading"
      className="relative scroll-mt-24 overflow-hidden bg-paper-raised py-[var(--space-section)]"
    >
      <div className="shell">
        <div className="grid gap-y-14 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-7 lg:col-span-6">
            <Reveal mode="fade">
              <SectionMark>{overview.mark}</SectionMark>
            </Reveal>

            <Reveal mode="mask" stagger={0.08} className="mt-8">
              <h2
                id="overview-heading"
                className="display-tight text-[length:var(--text-h2)] text-ink"
              >
                {overview.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </Reveal>

            <Reveal mode="up" delay={0.08} className="mt-9">
              <p className="prose-arch text-slate">{overview.lede}</p>
            </Reveal>
          </div>

          {/* Tall plate, pushed up into the heading's air. */}
          <Reveal
            mode="up"
            delay={0.12}
            className="md:col-span-5 md:col-start-9 lg:col-span-4 lg:col-start-9 md:-mt-24 lg:-mt-32"
          >
            <Figure
              id="welcome"
              alt="Three people walking through a bright, empty residential interior."
              ratio="3 / 4"
              sizes="(max-width: 768px) 92vw, 33vw"
              parallax={56}
              position="center 35%"
            />
          </Reveal>
        </div>

        <div className="mt-20 grid gap-y-14 md:mt-28 md:grid-cols-12 md:gap-x-8">
          {/* Wide plate, offset the other way. */}
          <Reveal mode="up" className="md:col-span-7 lg:col-span-7">
            <Figure
              id="community"
              alt="Two people running along a path through a landscaped residential park."
              ratio="4 / 3"
              sizes="(max-width: 768px) 92vw, 58vw"
              parallax={44}
              caption={overview.caption}
            />
          </Reveal>

          <div className="md:col-span-4 md:col-start-9 md:self-end md:pb-16">
            <Reveal mode="up" stagger={0.12} delay={0.06}>
              {overview.columns.map((column) => (
                <div key={column.title} className="border-t border-rule pt-5 first:mt-0 mt-10">
                  <h3 className="mark text-ink">{column.title}</h3>
                  <p className="mt-4 max-w-[38ch] text-[length:var(--text-body)] leading-relaxed text-slate">
                    {column.body}
                  </p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
