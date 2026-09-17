"use client";

import { useCallback } from "react";

import { cn } from "@/lib/cn";
import { useFinePointer, useReducedMotion } from "@/lib/hooks/useMediaQuery";

type Variant = "line" | "framed" | "solid";
type Tone = "dark" | "light";

/**
 * Buttons are set in the same metadata voice as the section marks — small,
 * tracked, uppercase — so a call to action reads as part of the editorial
 * system rather than as a widget dropped onto it. No pills, no fills by
 * default, no shadows.
 */
const base =
  "group relative inline-flex items-center gap-3 t-label select-none " +
  "transition-colors duration-(--dur) ease-(--ease-out-arch) " +
  "disabled:pointer-events-none disabled:opacity-40";

const shapes: Record<Variant, string> = {
  line: "min-h-11 py-3",
  framed: "min-h-12 border px-7 py-4 overflow-hidden isolate",
  solid: "min-h-12 px-7 py-4 overflow-hidden isolate",
};

const tones: Record<Variant, Record<Tone, string>> = {
  line: { dark: "text-on-dark", light: "text-on-light" },
  framed: {
    dark: "border-line-dark-strong text-on-dark hover:text-ink",
    light: "border-line-light-strong text-on-light hover:text-bone",
  },
  solid: {
    dark: "bg-bone text-ink hover:text-bone",
    light: "bg-ink text-bone hover:text-ink",
  },
};

/** The wash that rises behind framed and solid buttons on hover. */
function Wash({ variant, tone }: { variant: Variant; tone: Tone }) {
  if (variant === "line") return null;
  const fill =
    variant === "solid"
      ? tone === "dark"
        ? "bg-ink"
        : "bg-bone"
      : tone === "dark"
        ? "bg-bone"
        : "bg-ink";
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 origin-bottom scale-y-0",
        "transition-transform duration-(--dur) ease-(--ease-out-arch)",
        "group-hover:scale-y-100 group-focus-visible:scale-y-100",
        fill,
      )}
    />
  );
}

/** Underline that wipes in from the left on the bare `line` variant. */
function Rule({ tone }: { tone: Tone }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-1.5 left-0 h-px w-full overflow-hidden",
        tone === "dark" ? "bg-line-dark-strong" : "bg-line-light-strong",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 origin-left scale-x-0 transition-transform duration-(--dur) ease-(--ease-out-arch)",
          "group-hover:scale-x-100 group-focus-visible:scale-x-100",
          tone === "dark" ? "bg-bone" : "bg-ink",
        )}
      />
    </span>
  );
}

/** Diagonal arrow. Leaves the box and re-enters from the opposite corner. */
export function Arrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative block h-[0.7em] w-[0.7em] overflow-hidden", className)}>
      {[0, 1].map((i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          fill="none"
          className={cn(
            "absolute inset-0 h-full w-full transition-transform duration-(--dur) ease-(--ease-out-arch)",
            i === 0
              ? "group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full"
              : "-translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0",
          )}
        >
          <path d="M2 10L10 2M10 2H3.5M10 2V8.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ))}
    </span>
  );
}

/** Magnetic pull, read from the event so no ref merging is needed. */
function useMagnetic(enabled: boolean) {
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const node = event.currentTarget;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.18;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.26;
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    },
    [enabled],
  );

  const onPointerLeave = useCallback((event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "";
  }, []);

  return { onPointerMove, onPointerLeave };
}

interface Common {
  variant?: Variant;
  tone?: Tone;
  magnetic?: boolean;
  children: React.ReactNode;
  className?: string;
}

export type ButtonProps = Common &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> };

export function Button({
  variant = "framed",
  tone = "dark",
  magnetic = false,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const pull = useMagnetic(magnetic && fine && !reduced);

  return (
    <button
      ref={ref}
      data-cursor="cta"
      onPointerMove={pull.onPointerMove}
      onPointerLeave={pull.onPointerLeave}
      className={cn(
        base,
        shapes[variant],
        tones[variant][tone],
        magnetic && "transition-transform will-change-transform",
        className,
      )}
      {...rest}
    >
      <Wash variant={variant} tone={tone} />
      {variant === "line" && <Rule tone={tone} />}
      {children}
    </button>
  );
}

export type LinkButtonProps = Common &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: React.Ref<HTMLAnchorElement> };

export function LinkButton({
  variant = "framed",
  tone = "dark",
  magnetic = false,
  className,
  children,
  ref,
  ...rest
}: LinkButtonProps) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const pull = useMagnetic(magnetic && fine && !reduced);

  return (
    <a
      ref={ref}
      data-cursor="cta"
      onPointerMove={pull.onPointerMove}
      onPointerLeave={pull.onPointerLeave}
      className={cn(
        base,
        shapes[variant],
        tones[variant][tone],
        magnetic && "transition-transform will-change-transform",
        className,
      )}
      {...rest}
    >
      <Wash variant={variant} tone={tone} />
      {variant === "line" && <Rule tone={tone} />}
      {children}
    </a>
  );
}
