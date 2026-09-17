"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

type Mode = "up" | "mask" | "fade";

interface RevealProps {
  children: React.ReactNode;
  mode?: Mode;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: "div" | "section" | "figure" | "ul" | "ol" | "dl" | "header" | "li";
}

/**
 * Scroll-triggered entrance.
 *
 * Every instance lives inside a `gsap.context` scoped to its own element, so
 * reverting on unmount kills the tweens and their ScrollTriggers together —
 * leaked ScrollTriggers are the usual cause of scroll going strange on a
 * long page like this one.
 *
 * Under reduced motion the tween is skipped and the inline styles are cleared,
 * so content is simply present. Content is never hidden behind an animation
 * that might not run.
 */
export function Reveal({
  children,
  mode = "up",
  delay = 0,
  stagger = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets: Element[] = stagger > 0 ? Array.from(node.children) : [node];

    if (reduced) {
      gsap.set(targets, { clearProps: "all", opacity: 1, y: 0, clipPath: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      const from =
        mode === "mask"
          // Horizontal slack on the mask: a clip pinned to the box edges shears
          // the sides off any glyph that overhangs, and off the whole line if a
          // wrapper turns out narrower than its text.
          ? { clipPath: "inset(0% -6% 100% -6%)", y: "0.14em", opacity: 1 }
          : mode === "fade"
            ? { opacity: 0 }
            : { opacity: 0, y: 28 };

      const to =
        mode === "mask"
          ? { clipPath: "inset(0% -6% -14% -6%)", y: "0em", opacity: 1 }
          : mode === "fade"
            ? { opacity: 1 }
            : { opacity: 1, y: 0 };

      gsap.set(targets, from);
      gsap.to(targets, {
        ...to,
        duration: mode === "mask" ? 1.05 : 0.85,
        ease: "power3.out",
        delay,
        stagger,
        clearProps: "clipPath,willChange",
        scrollTrigger: { trigger: node, start: "top 86%", once: true },
      });
    }, node);

    return () => ctx.revert();
  }, [mode, delay, stagger]);

  return (
    // @ts-expect-error — polymorphic tag, ref type widens correctly at runtime
    <Tag ref={ref} className={cn(mode === "mask" && "[&>*]:will-change-[clip-path]", className)}>
      {children}
    </Tag>
  );
}

/**
 * Sheet mark — the small numbered label that heads every section, borrowed from
 * the way drawing sets are indexed. It is what makes the page read as one
 * document rather than a stack of unrelated blocks.
 */
export function SectionMark({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  /**
   * `deep` is for solid ink surfaces, where a muted grey reads correctly.
   * `image` is for type over photography, where that same grey collapses
   * against a lit backdrop — there the mark is set in full paper and earns its
   * quietness from size and letterspacing instead of from opacity.
   */
  tone?: "light" | "deep" | "image";
  className?: string;
}) {
  const text =
    tone === "light" ? "text-slate" : tone === "deep" ? "text-on-deep-muted" : "text-paper";
  const rule = tone === "light" ? "bg-rule-strong" : tone === "deep" ? "bg-rule-deep" : "bg-paper/70";

  return (
    <p className={cn("mark flex items-center gap-4", text, className)}>
      <span aria-hidden className={cn("h-px w-8", rule)} />
      {children}
    </p>
  );
}

/**
 * Parallax drift for imagery. Small values only — the point is that a picture
 * sits in the page at a slightly different depth, not that it slides around.
 */
export function Parallax({
  children,
  distance = 48,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { y: -distance / 2 },
        {
          y: distance / 2,
          ease: "none",
          scrollTrigger: { trigger: node.parentElement ?? node, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, node);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [distance]);

  return (
    <div ref={ref} className={cn("h-full w-full will-change-transform", className)}>
      {children}
    </div>
  );
}
