"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import { gallery } from "@/lib/content";
import { media } from "@/lib/media.generated";
import { Reveal } from "@/components/ui/Reveal";
import { Lines, Mark } from "@/components/ui/Type";
import { CloseButton, Overlay } from "@/components/ui/Overlay";

type Item = (typeof gallery.rows)[number][number];

const src = (item: Item) =>
  item.source === "film" ? `/media/film/${item.id}.webp` : `/media/img/${item.id}.webp`;

/**
 * Column placement on the twelve-column grid, written out rather than left to
 * auto-placement: start and span are both explicit, so a row is a composition
 * and not whatever happens to fit. Phones stack, so none of it applies below md.
 *
 * Tailwind needs to see whole class names at build time, which is why these are
 * maps rather than interpolated strings.
 */
const START: Record<number, string> = {
  1: "md:col-start-1",
  2: "md:col-start-2",
  6: "md:col-start-6",
  7: "md:col-start-7",
  9: "md:col-start-9",
  10: "md:col-start-10",
};

const SPAN: Record<number, string> = {
  3: "md:col-span-3",
  4: "md:col-span-4",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
};

/** Vertical offset, in steps, so no two plates in a row share a top edge. */
const DROP = ["", "md:mt-12", "md:mt-24", "md:mt-36"] as const;

const SIZES = "(max-width: 768px) 92vw, (max-width: 1280px) 48vw, 44vw";

/** The flat sequence the lightbox steps through, and where each row starts in
 *  it. Both derive from static content, so they are computed once at module
 *  load rather than on every render. */
const FLAT: Item[] = gallery.rows.flat();
const ROW_OFFSETS: number[] = gallery.rows.map((_, i) =>
  gallery.rows.slice(0, i).reduce((total, row) => total + row.length, 0),
);

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) =>
      setOpen((current) => (current === null ? null : (current + delta + FLAT.length) % FLAT.length)),
    [],
  );

  return (
    <section
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden bg-ink py-[var(--space-section)] text-on-dark"
    >
      <div className="shell">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <Mark index={gallery.index} label={gallery.label} />
            </Reveal>
            <Lines
              id="gallery-heading"
              lines={gallery.heading}
              size="heading"
              indent={[0, 2]}
              className="mt-9 text-bone"
            />
          </div>
          <Reveal delay={0.1}>
            <p className="t-sub max-w-[28ch] text-on-dark-mute md:text-right">{gallery.lede}</p>
          </Reveal>
        </div>

        <div className="mt-16 space-y-10 md:mt-24 md:space-y-24">
          {gallery.rows.map((row, rowIndex) => (
            <ul
              key={rowIndex}
              className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-8"
            >
              {row.map((item, itemIndex) => {
                const position = (ROW_OFFSETS[rowIndex] ?? 0) + itemIndex;
                return (
                  <li
                    key={item.id}
                    className={cn("min-w-0", START[item.start], SPAN[item.span], DROP[item.drop])}
                  >
                    <Reveal>
                      <Plate item={item} index={position} onOpen={() => setOpen(position)} />
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>

      <Lightbox items={FLAT} index={open} onClose={() => setOpen(null)} onStep={step} />
    </section>
  );
}

function Plate({ item, index, onOpen }: { item: Item; index: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="view"
      aria-label={`Open ${item.label}: ${item.alt}`}
      className="group relative block w-full overflow-hidden bg-ink-2"
      style={{ aspectRatio: item.ratio }}
    >
      <Image
        src={src(item)}
        alt={item.alt}
        fill
        sizes={SIZES}
        placeholder="blur"
        blurDataURL={media.blur[item.id as keyof typeof media.blur]}
        className="object-cover transition-transform duration-[900ms] ease-(--ease-out-arch) group-hover:scale-[1.045]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/88 to-transparent p-4 opacity-0 transition-opacity duration-(--dur) group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="t-label text-bone">{item.label}</span>
        <span className="t-label text-on-dark-mute">{String(index + 1).padStart(2, "0")}</span>
      </span>
    </button>
  );
}

/** Fullscreen viewer. Arrow keys on desktop, swipe on touch, Escape anywhere. */
function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: Item[];
  index: number | null;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const startX = useRef<number | null>(null);
  const open = index !== null;
  const item = index === null ? null : items[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(-1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onStep]);

  if (!item || index === null) return null;

  return (
    <Overlay open={open} onClose={onClose} label={`Gallery — ${item.label}`} className="inset-0">
      <div
        className="flex viewport-h flex-col bg-ink px-[var(--gutter)] py-[var(--gutter)] text-on-dark"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (Math.abs(delta) > 48) onStep(delta < 0 ? 1 : -1);
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-4">
          <p className="t-label text-bone">
            <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-on-dark-mute">/</span>
            <span className="tabular-nums text-on-dark-mute">
              {String(items.length).padStart(2, "0")}
            </span>
            <span className="ml-4">{item.label}</span>
          </p>
          <div className="-mr-2">
            <CloseButton onClick={onClose} label="Close gallery" />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 py-5">
          <Image
            key={item.id}
            src={src(item)}
            alt={item.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={media.blur[item.id as keyof typeof media.blur]}
            className="object-contain [animation:hero-fade_0.5s_var(--ease-out-arch)_both]"
          />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-6">
          <p className="t-label max-w-[42ch] text-on-dark-mute">{item.alt}</p>
          <div className="flex shrink-0 gap-1">
            <StepButton direction={-1} onStep={onStep} />
            <StepButton direction={1} onStep={onStep} />
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function StepButton({ direction, onStep }: { direction: -1 | 1; onStep: (d: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onStep(direction)}
      aria-label={direction === 1 ? "Next image" : "Previous image"}
      className="inline-flex h-11 w-11 items-center justify-center text-bone transition-colors duration-(--dur) hover:bg-bone/10"
    >
      <svg
        viewBox="0 0 18 10"
        fill="none"
        aria-hidden
        className={cn("w-5", direction === -1 && "rotate-180")}
      >
        <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      </svg>
    </button>
  );
}
