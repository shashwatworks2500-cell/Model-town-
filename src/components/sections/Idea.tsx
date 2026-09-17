import { idea } from "@/lib/content";
import { Lines, Mark, RailMark } from "@/components/ui/Type";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The first breath after the film.
 *
 * Composed to one screen rather than spread down a long section — negative
 * space only reads as composition when you can see what it is surrounding.
 *
 * It is also the one place on the page where the type hangs off the far
 * margin: the statement is set ragged-left against the right edge, the body
 * copy sits at the opposite corner, and the diagonal between them is the
 * composition. Every other section on the page reads left-to-right off the
 * gutter, so this reads as a deliberate turn rather than as a stray alignment.
 */
export function Idea() {
  return (
    <section
      id="idea"
      aria-labelledby="idea-heading"
      className="relative flex scroll-mt-24 viewport-min-h flex-col justify-between bg-ink pt-[calc(var(--space-breath)+3rem)] pb-[var(--space-breath)]"
    >
      <RailMark>Model Town — {idea.label}</RailMark>

      <div className="bleed">
        <Reveal>
          <Mark index={idea.index} label={idea.label} />
        </Reveal>
      </div>

      <div className="bleed">
        <Lines
          id="idea-heading"
          lines={idea.heading}
          size="display"
          mute={[0]}
          className="text-right text-bone"
        />
      </div>

      <div className="bleed">
        <Reveal>
          <p className="t-body text-on-dark-mute">{idea.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
