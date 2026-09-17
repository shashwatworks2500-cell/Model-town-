"use client";

import { useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/**
 * Entrance for everything that is not a headline.
 *
 * Scoped to a `gsap.context` so reverting on unmount kills the tween and its
 * ScrollTrigger together — leaked triggers are the usual cause of scrolling
 * going strange on a page this long.
 */
export function Reveal({
  children,
  delay = 0,
  stagger = 0,
  distance = 28,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  distance?: number;
  className?: string;
  as?: "div" | "figure" | "ul" | "ol" | "dl" | "li" | "header";
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets: Element[] = stagger > 0 ? Array.from(node.children) : [node];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { clearProps: "all", opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: distance });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        delay,
        stagger,
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });
    }, node);

    return () => ctx.revert();
  }, [delay, stagger, distance]);

  return (
    // @ts-expect-error — polymorphic tag; the ref widens correctly at runtime
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Depth, not movement. Small values only — the point is that a picture sits at
 * a slightly different distance from the page, not that it slides around.
 */
export function Parallax({
  children,
  distance = 56,
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
        { yPercent: -distance / 20 },
        {
          yPercent: distance / 20,
          ease: "none",
          scrollTrigger: {
            trigger: node.parentElement ?? node,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
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
