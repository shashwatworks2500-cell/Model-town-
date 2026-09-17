import { arrival } from "@/lib/content";
import { Reveal, SectionMark } from "@/components/ui/Reveal";

/**
 * The first breath after the film.
 *
 * Deliberately holds nothing but type on an open field of paper. After five
 * screens of moving image, the most striking thing the page can do is stop
 * moving — the pause is what makes the film feel like it meant something.
 */
export function Arrival() {
  return (
    <section
      aria-labelledby="arrival-heading"
      className="relative bg-paper pt-[var(--space-section-tight)] pb-[var(--space-section)]"
    >
      <div className="shell">
        <Reveal mode="fade">
          <SectionMark>{arrival.mark}</SectionMark>
        </Reveal>

        <Reveal mode="mask" stagger={0.08} className="mt-10 md:mt-14">
          <h2
            id="arrival-heading"
            className="display-tight text-[length:var(--text-h1)] text-ink"
          >
            {arrival.heading.map((line, i) => (
              <span key={line} className={i === 1 ? "block text-slate/55" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal mode="up" delay={0.1} className="mt-12 flex md:mt-16 md:justify-end">
          <p className="prose-arch text-slate md:max-w-[38ch]">{arrival.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
