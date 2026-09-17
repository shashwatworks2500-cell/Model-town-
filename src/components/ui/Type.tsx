"use client";

import { useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

type Size = "hero" | "display" | "heading";

const SIZE: Record<Size, string> = {
  hero: "t-hero",
  display: "t-display",
  heading: "t-heading",
};

interface LinesProps {
  /**
   * One entry per rendered line. Where a headline turns is composition, not
   * text flow — so it is authored here rather than left to the browser.
   */
  lines: readonly string[];
  size?: Size;
  /** Per-line horizontal offset in ch, for staggered, stepped headlines. */
  indent?: readonly number[];
  /** Lines rendered at reduced value, so one word in a phrase can recede. */
  mute?: readonly number[];
  as?: "h1" | "h2" | "p";
  id?: string;
  className?: string;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Reveal on mount instead of on scroll — for above-the-fold type. */
  immediate?: boolean;
}

/**
 * A headline that rises into place one line at a time.
 *
 * Each line sits in its own clipping box and translates up from below it, which
 * is the one text reveal that reads as typesetting rather than as an effect:
 * the letterforms never distort, never blur, and never arrive out of order.
 */
export function Lines({
  lines,
  size = "display",
  indent,
  mute,
  as: Tag = "h2",
  id,
  className,
  delay = 0,
  immediate = false,
}: LinesProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets = node.querySelectorAll<HTMLElement>("[data-line]");
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      // `y: 0` is not redundant. yPercent is applied on top of whatever
      // translate GSAP reads off the element, so if a previous run left one
      // behind — a reverted context, a remount — the offsets compound and the
      // line "finishes" a full line-height below its clipping box, invisible.
      // Pinning the base to zero makes the reveal idempotent.
      //
      // Opacity is deliberately untouched: the reveal is a translation and
      // nothing else, and writing an inline opacity here would silently
      // override the `mute` class on the lines that are meant to recede.
      gsap.set(targets, { yPercent: 108, y: 0 });
      gsap.to(targets, {
        yPercent: 0,
        y: 0,
        duration: 1.15,
        ease: "power3.out",
        delay,
        stagger: 0.075,
        ...(immediate
          ? {}
          : { scrollTrigger: { trigger: node, start: "top 88%", once: true } }),
      });
    }, node);

    return () => {
      ctx.revert();
      gsap.set(targets, { clearProps: "transform" });
    };
  }, [delay, immediate]);

  return (
    // @ts-expect-error — polymorphic tag; the ref widens correctly at runtime
    <Tag ref={ref} id={id} className={cn(SIZE[size], className)}>
      {lines.map((line, i) => (
        <span
          key={line}
          className="block line-clip"
          style={
            indent?.[i]
              ? { paddingLeft: `calc(${indent[i]}ch * var(--indent-step))` }
              : undefined
          }
        >
          <span data-line className={cn("block", mute?.includes(i) && "opacity-50")}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Section metadata: `02 — ARRIVAL`.
 *
 * The numbering is what makes the page read as one document rather than a
 * stack of blocks, and it is the only place the site uses a rule as ornament.
 */
export function Mark({
  index,
  label,
  tone = "dark",
  className,
}: {
  index?: string;
  label: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "t-label flex items-center gap-3",
        tone === "dark" ? "text-on-dark" : "text-on-light",
        className,
      )}
    >
      {index && (
        <>
          <span className={tone === "dark" ? "text-on-dark-mute" : "text-on-light-mute"}>
            {index}
          </span>
          <span
            aria-hidden
            className={cn("h-px w-6", tone === "dark" ? "bg-line-dark-strong" : "bg-line-light-strong")}
          />
        </>
      )}
      <span>{label}</span>
    </p>
  );
}

/** Vertical metadata running up an edge. Desktop only — it needs the height. */
export function RailMark({
  children,
  tone = "dark",
  side = "left",
  className,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <p
      aria-hidden
      className={cn(
        "t-label rail-label absolute top-1/2 hidden -translate-y-1/2 select-none xl:block",
        side === "left" ? "left-[calc(var(--gutter)*0.28)]" : "right-[calc(var(--gutter)*0.28)]",
        tone === "dark" ? "text-on-dark-faint" : "text-on-light-mute/60",
        className,
      )}
    >
      {children}
    </p>
  );
}
