"use client";

import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { media } from "@/lib/media.generated";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

type MediaId = keyof typeof media.size;

const FILM = ["arrival", "arrival-sm", "land", "plan", "structure"];
const source = (id: MediaId) =>
  FILM.includes(id) ? `/media/film/${id}.webp` : `/media/img/${id}.webp`;

interface FigureProps {
  id: MediaId;
  alt: string;
  /** CSS aspect ratio. Varied per placement — never a uniform card. */
  ratio?: string;
  /**
   * Aspect ratio below `md`. A cinematic desktop crop collapses into a thin
   * band on a phone, where the frame is a third of the width — the small
   * screen wants a different photograph, not the same one squeezed.
   */
  ratioSm?: string;
  sizes: string;
  priority?: boolean;
  /** Vertical crop anchor, for art-directing a tall image into a short frame. */
  position?: string;
  /** Drift distance for depth. 0 disables it. */
  parallax?: number;
  className?: string;
  /** Reveal direction: the clip opens from this edge. */
  from?: "bottom" | "left" | "right";
}

/**
 * Every image on the site comes through here.
 *
 * Images arrive by clip — the frame opens and the picture inside settles from a
 * slight over-scale, rather than the whole rectangle sliding or fading in. It
 * reads as a camera finding its subject instead of as a card appearing, which
 * is the difference between this and a template.
 */
export function Figure({
  id,
  alt,
  ratio,
  ratioSm,
  sizes,
  priority = false,
  position = "center",
  parallax = 0,
  className,
  from = "bottom",
}: FigureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dims = media.size[id];

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const frame = node.querySelector<HTMLElement>("[data-frame]");
    const picture = node.querySelector<HTMLElement>("[data-picture]");
    if (!frame || !picture) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(frame, { clipPath: "inset(0%)" });
      gsap.set(picture, { scale: 1 });
      return;
    }

    const closed =
      from === "left"
        ? "inset(0% 100% 0% 0%)"
        : from === "right"
          ? "inset(0% 0% 0% 100%)"
          : "inset(100% 0% 0% 0%)";

    const ctx = gsap.context(() => {
      gsap.set(frame, { clipPath: closed });
      gsap.set(picture, { scale: 1.12 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
      });
      tl.to(frame, { clipPath: "inset(0%)", duration: 1.25, ease: "power3.inOut" });
      tl.to(picture, { scale: 1, duration: 1.6, ease: "power3.out" }, 0);

      if (parallax > 0) {
        gsap.fromTo(
          picture,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, node);

    return () => ctx.revert();
  }, [from, parallax]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        data-frame
        className={cn(
          "relative h-full w-full overflow-hidden bg-ink-2",
          ratio && "aspect-[var(--ar-sm)] md:aspect-[var(--ar)]",
        )}
        style={
          ratio
            ? ({ "--ar": ratio, "--ar-sm": ratioSm ?? ratio } as React.CSSProperties)
            : undefined
        }
      >
        {/* Over-scaled so parallax drift never exposes an edge. */}
        <div data-picture className={cn("h-full w-full", parallax > 0 && "scale-[1.14]")}>
          <Image
            src={source(id)}
            alt={alt}
            width={dims.width}
            height={dims.height}
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            placeholder="blur"
            blurDataURL={media.blur[id as keyof typeof media.blur]}
            className="h-full w-full object-cover"
            style={{ objectPosition: position }}
          />
        </div>
      </div>
    </div>
  );
}

/** Caption. Deliberately small, deliberately far from the picture. */
export function Caption({
  children,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "t-label",
        tone === "dark" ? "text-on-dark-mute" : "text-on-light-mute",
        className,
      )}
    >
      {children}
    </p>
  );
}
