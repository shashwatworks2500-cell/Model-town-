import { cn } from "@/lib/cn";
import { Figure } from "@/components/ui/Figure";
import { Reveal, SectionMark } from "@/components/ui/Reveal";
import type { media } from "@/lib/media.generated";

interface FullBleedProps {
  id?: string;
  mediaId: keyof typeof media.size;
  alt: string;
  mark: string;
  heading: readonly string[];
  body: string;
  caption: string;
  /** Where the type sits over the picture. Varied between the two breaks so
   *  they do not read as the same section twice. */
  align?: "start" | "end";
  position?: string;
}

/**
 * The immersive breaks.
 *
 * Between the reading sections the page goes to full bleed and near-silence:
 * one picture, one line, no grid. These are the exhalations that make the dense
 * sections tolerable, and they are the reason the page has a rhythm at all.
 */
export function FullBleed({
  id,
  mediaId,
  alt,
  mark,
  heading,
  body,
  caption,
  align = "start",
  position = "center",
}: FullBleedProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${mediaId}-heading`}
      className="relative scroll-mt-24 bg-ink text-paper on-deep"
    >
      <div className="relative min-h-[36rem] md:min-h-[44rem] lg:min-h-[52rem]">
        <div className="absolute inset-0">
          <Figure
            id={mediaId}
            alt={alt}
            sizes="100vw"
            parallax={90}
            position={position}
            className="h-full [&>div]:h-full [&>div]:rounded-none"
          />
        </div>

        {/* Sized against measured pixel contrast, not by eye: paper type over a
            lit interior needs the backdrop down near the ink end before it
            clears 4.5:1, and these sections are meant to be dark anyway. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/62 to-ink/34"
        />

        <div
          className={cn(
            "relative flex min-h-[36rem] flex-col justify-end px-[var(--gutter)] py-[var(--space-section-tight)] md:min-h-[44rem] lg:min-h-[52rem]",
            align === "end" && "md:items-end md:text-right",
          )}
        >
          <div className={cn("w-full max-w-[96rem]", align === "start" ? "mx-auto" : "mx-auto")}>
            <div className={cn("max-w-[46rem]", align === "end" && "md:ml-auto")}>
              <Reveal mode="fade">
                <SectionMark tone="image" className={cn(align === "end" && "md:flex-row-reverse")}>
                  {mark}
                </SectionMark>
              </Reveal>

              <Reveal mode="mask" stagger={0.08} className="mt-7">
                <h2
                  id={`${mediaId}-heading`}
                  className="display-tight text-[length:var(--text-h2)] text-paper"
                >
                  {heading.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </Reveal>

              <Reveal mode="up" delay={0.08} className="mt-7">
                <p className={cn("prose-arch text-paper", align === "end" && "md:ml-auto")}>
                  {body}
                </p>
              </Reveal>

              <p className="mark mt-10 text-paper">{caption}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
