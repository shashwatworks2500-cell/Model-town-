import { community } from "@/lib/content";
import { Figure } from "@/components/ui/Figure";
import { Reveal, SectionMark } from "@/components/ui/Reveal";

/**
 * The ground.
 *
 * Surface shifts to the stone tone and the picture goes wide and low — after
 * two tall portrait plates, a landscape band reads as the page opening out,
 * which is what the section is about.
 */
export function Community() {
  return (
    <section
      aria-labelledby="community-heading"
      className="relative overflow-hidden bg-stone/45 py-[var(--space-section)]"
    >
      <div className="shell">
        <div className="max-w-[52rem]">
          <Reveal mode="fade">
            <SectionMark>{community.mark}</SectionMark>
          </Reveal>

          <Reveal mode="mask" stagger={0.08} className="mt-7">
            <h2 id="community-heading" className="display-tight text-[length:var(--text-h2)] text-ink">
              {community.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </Reveal>
        </div>

        <Reveal mode="up" delay={0.06} className="mt-14 md:mt-20">
          <Figure
            id="community"
            alt="A landscaped park between residential buildings, with mature trees and clipped hedging."
            ratio="16 / 9"
            sizes="100vw"
            parallax={80}
            position="center 62%"
          />
        </Reveal>

        <div className="mt-12 grid gap-y-8 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <p className="prose-arch text-ink">{community.lede}</p>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:self-end">
            <p className="measure text-[length:var(--text-body)] leading-relaxed text-slate">
              {community.body}
            </p>
            <p className="mark mt-8 text-slate/70">{community.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
