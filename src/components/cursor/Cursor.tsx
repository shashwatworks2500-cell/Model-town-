"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { useFinePointer, useReducedMotion } from "@/lib/hooks/useMediaQuery";

type Mode = "default" | "view" | "cta" | "drag";

/**
 * Desktop cursor.
 *
 * A small dot that follows exactly, and a ring that trails slightly behind it —
 * the lag is the whole effect, and it is the reason it reads as a physical
 * object rather than a second pointer. It grows and takes a word over anything
 * that opens an image.
 *
 * Never on touch, never under reduced motion, and the real cursor is only
 * hidden once this one is actually tracking.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);

  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const target = { x: 0, y: 0 };
    const ring = { x: 0, y: 0 };
    let frame = 0;
    let started = false;

    const render = () => {
      // Exponential follow. Cheap, frame-rate tolerant, and it never overshoots.
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;

      if (!started) {
        started = true;
        ring.x = target.x;
        ring.y = target.y;
        setVisible(true);
        frame = requestAnimationFrame(render);
      }

      const element = event.target as HTMLElement | null;
      const hit = element?.closest?.("[data-cursor]");
      const next = (hit?.getAttribute("data-cursor") as Mode | undefined) ?? "default";
      setMode((current) => (current === next ? current : next));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => {
      if (started) setVisible(true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      setVisible(false);
    };
  }, [enabled]);

  // The system cursor stays until this one is proven to be tracking, so a
  // failure here can never leave someone without a pointer.
  useEffect(() => {
    document.documentElement.classList.toggle("has-cursor", enabled && visible);
    return () => document.documentElement.classList.remove("has-cursor");
  }, [enabled, visible]);

  if (!enabled) return null;

  const label = mode === "view" ? "View" : mode === "cta" ? "Explore" : mode === "drag" ? "Drag" : null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ringRef}
        className={cn(
          "fixed left-0 top-0 flex items-center justify-center rounded-full border border-bone/70 backdrop-invert-[0.08]",
          "transition-[width,height,opacity,background-color] duration-(--dur) ease-(--ease-out-arch) will-change-transform",
          visible ? "opacity-100" : "opacity-0",
          label ? "h-[4.25rem] w-[4.25rem] border-transparent bg-bone" : "h-8 w-8",
        )}
      >
        {label && (
          <span className="t-label text-[0.625rem] text-ink [animation:hero-fade_0.25s_var(--ease-out-arch)_both]">
            {label}
          </span>
        )}
      </div>

      <div
        ref={dotRef}
        className={cn(
          "fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-bone mix-blend-difference",
          "transition-opacity duration-(--dur) will-change-transform",
          visible && !label ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
