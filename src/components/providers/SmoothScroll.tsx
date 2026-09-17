"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * Smooth scroll, opted into deliberately.
 *
 * The hero maps scroll position onto film time, and native scroll on a trackpad
 * arrives in coarse, uneven jumps — the film stutters. Lenis interpolates that
 * into a continuous position, which is what makes the scrub feel physically
 * connected rather than stepped.
 *
 * It is switched off entirely under reduced motion, and it drives GSAP from a
 * single ticker so there are never two requestAnimationFrame loops competing.
 * Anchor links, find-in-page and keyboard scrolling all keep working.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  // Without Lenis there is no scroll hijacking, but the page still grows as
  // fonts and imagery settle, so the native jump needs repeating once.
  useEffect(() => {
    if (!reducedMotion) return;
    const id = window.location.hash.slice(1);
    if (!id) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Native momentum on touch is better than anything emulated.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchors keep working, and land where ScrollTrigger expects them to.
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      // Keep the focus ring and the viewport in agreement.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onAnchorClick);

    // A hash in the URL has to be honoured by hand. The browser's own jump
    // happens before Lenis takes over the scroll position and before
    // ScrollTrigger has measured a page whose hero is five viewports tall, so a
    // shared link to a section otherwise lands near the top.
    const hashTimer = window.setTimeout(() => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      ScrollTrigger.refresh();
      lenis.scrollTo(target, { immediate: true, force: true });
    }, 120);

    return () => {
      window.clearTimeout(hashTimer);
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}

/** Locks scrolling while a modal owns the viewport, without a layout jump. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement: html } = document;
    const gap = window.innerWidth - html.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    html.classList.add("lenis-stopped");

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      html.classList.remove("lenis-stopped");
    };
  }, [locked]);
}
