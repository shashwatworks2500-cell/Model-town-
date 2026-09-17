"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { useScrollLock } from "@/components/providers/SmoothScroll";
import { useHydrated } from "@/lib/hooks/useMediaQuery";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal surface shared by the menu and the enquiry panel.
 *
 * Handles the things that are easy to get wrong and impossible to use without:
 * focus moves in on open and returns to the trigger on close, Tab cycles inside,
 * Escape closes, the page behind is locked and hidden from assistive tech.
 */
export function Overlay({
  open,
  onClose,
  label,
  children,
  className,
  tone = "deep",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  tone?: "deep" | "light";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // The portal target does not exist during server rendering, so the first
  // client render has to match the server's (nothing) before the portal opens.
  const hydrated = useHydrated();

  useScrollLock(open);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const root = document.getElementById("site-root");
    root?.setAttribute("aria-hidden", "true");
    root?.setAttribute("inert", "");

    // Focus the panel itself rather than its first control, so a screen reader
    // announces what just opened before what can be done in it.
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      root?.removeAttribute("aria-hidden");
      root?.removeAttribute("inert");
      restoreRef.current?.focus?.();
    };
  }, [open, close]);

  if (!hydrated) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[90] transition-opacity duration-(--dur) ease-(--ease-out-arch)",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={close}
        className={cn(
          "absolute inset-0 h-full w-full cursor-default",
          tone === "deep" ? "bg-ink/70" : "bg-ink/40",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute outline-none transition-transform duration-500 ease-(--ease-out-arch)",
          open ? "translate-y-0" : "translate-y-3",
          className,
        )}
      >
        <span id={titleId} className="sr-only">
          {label}
        </span>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** The close control used by both overlays — a drawn cross, not a glyph font. */
export function CloseButton({
  onClick,
  tone = "deep",
  label = "Close",
}: {
  onClick: () => void;
  tone?: "deep" | "light";
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group inline-flex h-11 w-11 items-center justify-center rounded-(--radius-control) transition-colors duration-(--dur)",
        tone === "deep" ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-ink/8",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M3 3l14 14M17 3L3 17"
          stroke="currentColor"
          strokeWidth="1.25"
          className="origin-center transition-transform duration-(--dur) ease-(--ease-out-arch) group-hover:rotate-90"
        />
      </svg>
    </button>
  );
}
