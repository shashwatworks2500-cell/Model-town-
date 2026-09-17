"use client";

import { useCallback } from "react";

import { cn } from "@/lib/cn";
import { useFinePointer, useReducedMotion } from "@/lib/hooks/useMediaQuery";

type Variant = "solid" | "outline" | "quiet" | "link";
type Tone = "light" | "deep";

interface CommonProps {
  variant?: Variant;
  tone?: Tone;
  magnetic?: boolean;
  children: React.ReactNode;
  className?: string;
}

const base =
  "group relative inline-flex items-center gap-3 select-none " +
  "font-[family-name:var(--font-display)] text-[0.78125rem] font-medium uppercase tracking-[0.16em] " +
  "transition-[color,background-color,border-color,opacity] duration-(--dur) ease-(--ease-out-arch) " +
  "disabled:pointer-events-none disabled:opacity-40";

const shapes: Record<Variant, string> = {
  solid: "rounded-(--radius-control) px-7 py-4 min-h-11 overflow-hidden isolate",
  outline: "rounded-(--radius-control) px-7 py-4 min-h-11 border overflow-hidden isolate",
  quiet: "min-h-11 py-2",
  link: "min-h-11 py-2",
};

const tones: Record<Variant, Record<Tone, string>> = {
  solid: {
    light: "bg-ink text-paper hover:text-ink",
    deep: "bg-paper text-ink hover:text-paper",
  },
  outline: {
    light: "border-rule-strong text-ink hover:text-paper",
    deep: "border-rule-deep text-paper hover:text-ink",
  },
  quiet: { light: "text-slate hover:text-ink", deep: "text-on-deep-muted hover:text-on-deep" },
  link: { light: "text-ink", deep: "text-paper" },
};

/** The wash that sweeps in behind solid and outline buttons on hover. */
function Wash({ tone, variant }: { tone: Tone; variant: Variant }) {
  if (variant !== "solid" && variant !== "outline") return null;
  const fill =
    variant === "solid"
      ? tone === "light"
        ? "bg-paper"
        : "bg-ink"
      : tone === "light"
        ? "bg-ink"
        : "bg-paper";
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

/** Travelling arrow. Leaves and re-enters rather than merely nudging. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative block h-[0.6em] w-[1.15em] overflow-hidden", className)}
    >
      {[0, 1].map((i) => (
        <svg
          key={i}
          viewBox="0 0 18 10"
          fill="none"
          className={cn(
            "absolute inset-0 h-full w-full transition-transform duration-(--dur) ease-(--ease-out-arch)",
            i === 0
              ? "group-hover:translate-x-[140%] group-focus-visible:translate-x-[140%]"
              : "-translate-x-[140%] group-hover:translate-x-0 group-focus-visible:translate-x-0",
          )}
        >
          <path
            d="M0 5h16M12 1l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
          />
        </svg>
      ))}
    </span>
  );
}

/** Underline that wipes out and back in, rather than sliding one way. */
function LinkRule({ tone }: { tone: Tone }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bottom-1 left-0 h-px w-full overflow-hidden",
        tone === "light" ? "bg-rule-strong" : "bg-rule-deep",
      )}
    >
      <span
        className={cn(
          "absolute inset-0 origin-left scale-x-0 transition-transform duration-(--dur) ease-(--ease-out-arch)",
          "group-hover:scale-x-100 group-focus-visible:scale-x-100",
          tone === "light" ? "bg-ink" : "bg-paper",
        )}
      />
    </span>
  );
}

/**
 * Magnetic pull. Desktop pointers only, and never under reduced motion — it is
 * a flourish, so it is the first thing to go.
 *
 * The element comes from the event rather than from a ref, which keeps the
 * component free of ref-merging and means a forwarded ref stays the caller's
 * alone.
 */
function useMagnetic(enabled: boolean) {
  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const node = event.currentTarget;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.32;
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    },
    [enabled],
  );

  const onPointerLeave = useCallback((event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.transform = "";
  }, []);

  return { onPointerMove, onPointerLeave };
}

export type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>;
  };

export function Button({
  variant = "solid",
  tone = "light",
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
      <Wash tone={tone} variant={variant} />
      {variant === "link" && <LinkRule tone={tone} />}
      {children}
    </button>
  );
}

export type LinkButtonProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    ref?: React.Ref<HTMLAnchorElement>;
  };

export function LinkButton({
  variant = "outline",
  tone = "light",
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
      <Wash tone={tone} variant={variant} />
      {variant === "link" && <LinkRule tone={tone} />}
      {children}
    </a>
  );
}
