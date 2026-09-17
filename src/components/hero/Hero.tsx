"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/Button";
import { ArrowGlyph } from "@/components/ui/Button";
import { useFilmSequence } from "@/components/hero/useFilmSequence";
import { HeroLoader } from "@/components/hero/HeroLoader";
import { StageRail } from "@/components/hero/StageRail";
import { cuts, neverChanges, resolveCut } from "@/lib/film";
import { gsap } from "@/lib/gsap";
import { hero, site, stages } from "@/lib/content";
import { media } from "@/lib/media.generated";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/** Runway length. Longer reads as slower, more deliberate construction. */
const RUNWAY_VH = 560;

/** Fraction of the runway spent handing the film over to the page. */
const HANDOVER = 0.12;

/**
 * Ceiling on how far the canvas backing store may exceed the source frames.
 *
 * The film is 720 lines. Painting it into 2532 device pixels on a DPR-3 phone
 * invents no detail and costs five times the fill rate — which is the
 * difference between a 60fps scrub and a 30fps one on a mid-tier device.
 */
const MAX_SOURCE_SCALE = 1.6;

function stageIndexFor(progress: number): number {
  let index = 0;
  for (let i = 0; i < stages.length; i += 1) {
    const stage = stages[i];
    if (stage && progress >= stage.at) index = i;
  }
  return index;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const instrumentRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const gradesRef = useRef<HTMLDivElement>(null);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boxRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(0);
  const stageRef = useRef(0);

  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState(0);

  // Read straight from matchMedia through an external store, so the right cut
  // is known on the first client render. Resolving this from a hook that
  // reports false on its first pass would lock the phone sequence on a desktop
  // and then upscale 480px frames across a 1440px canvas.
  const cut = useSyncExternalStore(neverChanges, resolveCut, () => null);

  const { progress: loadProgress, ready, failed, frameAt } = useFilmSequence(cut);

  const draw = useCallback(
    (index: number) => {
      const ctx = ctxRef.current;
      const image = frameAt(index);
      if (!ctx || !image) return;

      const { w, h } = boxRef.current;
      if (w === 0 || h === 0) return;

      const { naturalWidth: iw, naturalHeight: ih } = image;
      // Cover fit, anchored to the centre. The film is symmetrical about its
      // vertical axis, so a centre crop keeps the avenue and both terraces.
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
      lastFrameRef.current = index;
    },
    [frameAt],
  );

  // Canvas sizing. See MAX_SOURCE_SCALE above.
  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cut) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    ctxRef.current = context;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const source = cuts[cut];
      const supplyCap = Math.max(
        1,
        Math.min(
          (source.width * MAX_SOURCE_SCALE) / rect.width,
          (source.height * MAX_SOURCE_SCALE) / rect.height,
        ),
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2, supplyCap);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingQuality = "high";
      boxRef.current = { w: rect.width, h: rect.height };
      draw(lastFrameRef.current);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [cut, draw]);

  // Paint frame zero the moment it lands, so the loader sits over the film
  // rather than over an empty box.
  useEffect(() => {
    if (cut && loadProgress > 0) draw(0);
  }, [cut, loadProgress, draw]);

  // The scrub itself.
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !cut || !ready || reducedMotion) return;

    const frameCount = cuts[cut].count;
    const playhead = { index: 0 };

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          // A touch of scrub smoothing on top of Lenis: this is what removes
          // the last of the stepping when a trackpad delivers a coarse delta.
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100);
            if (percentRef.current) {
              percentRef.current.textContent = String(pct).padStart(2, "0");
            }
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
            }
            const next = stageIndexFor(self.progress);
            if (next !== stageRef.current) {
              stageRef.current = next;
              setStage(next);
            }
          },
        },
      });

      timeline.to(
        playhead,
        {
          index: frameCount - 1,
          duration: 1,
          onUpdate: () => draw(Math.round(playhead.index)),
        },
        0,
      );

      // The page opens as a poster and becomes an instrument: the title clips
      // away early and the stage rail takes over the frame.
      timeline.to(posterRef.current, { autoAlpha: 0, y: -48, duration: 0.11 }, 0.015);
      timeline.fromTo(
        instrumentRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.07 },
        0.05,
      );

      // Handover: the film contracts into a framed still on the page colour,
      // so the hero resolves into the section below rather than cutting to it.
      const inset = window.innerWidth < 768 ? "inset(4% 6% 10% 6%)" : "inset(7% 17% 12% 17%)";
      timeline
        // The overlay text clears out before its scrim does. The other order
        // leaves type briefly stranded on a brightening frame.
        .to(instrumentRef.current, { autoAlpha: 0, duration: 0.035 }, 1 - HANDOVER)
        .to(gradesRef.current, { autoAlpha: 0, duration: HANDOVER * 0.7 }, 1 - HANDOVER + 0.03)
        .to(
          frameWrapRef.current,
          { clipPath: inset, scale: 0.94, duration: HANDOVER, ease: "power2.inOut" },
          1 - HANDOVER,
        );
    }, section);

    return () => ctx.revert();
  }, [cut, ready, reducedMotion, draw]);

  // The loader stays mounted through its own fade. Unmounting the instant the
  // sequence reports ready cuts it off mid-transition, and the film snaps in
  // rather than resolving.
  const [loaderRetired, setLoaderRetired] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setLoaderRetired(true), 900);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const showLoader = Boolean(cut) && !failed && !reducedMotion && !loaderRetired;
  const staticFilm = reducedMotion || failed;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label={`${site.name} — the development taking shape`}
      style={{ height: staticFilm ? undefined : `${RUNWAY_VH}vh` }}
      className="relative bg-ink"
    >
      <div className="sticky top-0 viewport-h w-full overflow-hidden bg-paper">
        <div
          ref={frameWrapRef}
          className="absolute inset-0 will-change-[clip-path,transform]"
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          {staticFilm ? (
            <StaticFilm />
          ) : (
            <>
              {/* Poster underneath: the opening frame is on screen before a
                  single sequence frame has decoded, and it is the LCP element.
                  Served raw rather than through next/image so the <link rel=
                  "preload"> in the document head matches the request exactly —
                  routing it via the optimiser would change the URL and waste
                  the preload. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/film/land.webp"
                alt=""
                width={cuts[cut ?? "lg"].width}
                height={cuts[cut ?? "lg"].height}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ backgroundImage: `url(${media.blur.land})`, backgroundSize: "cover" }}
                aria-hidden
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                role="img"
                aria-label="Model Town shown from cleared ground through to the completed development. Scroll to move through the film."
              />
            </>
          )}

          {/* Cinematic grade. Grouped so it can leave as one thing when the
              film hands over — a scrim left behind on the framed still reads as
              a smudge on a photograph. */}
          <div ref={gradesRef} aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 vignette" />
            <div className="absolute inset-x-0 top-0 h-40 scrim-top" />
            <div className="absolute inset-x-0 bottom-0 h-[70%] scrim-bottom" />
          </div>
        </div>

        {/* ---- Poster state ------------------------------------------------ */}
        <div
          ref={posterRef}
          className="pointer-events-none absolute inset-0 flex flex-col justify-end pb-[calc(var(--gutter)*2.4)]"
        >
          <div className="shell">
            <p className="mark text-paper/70 [text-shadow:0_1px_10px_rgb(23_21_15/0.45)]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-5 display text-paper text-[length:var(--text-hero)] [text-shadow:0_1px_24px_rgb(23_21_15/0.28)]">
              <span className="block overflow-hidden">
                <span className="block [animation:hero-rise_1.15s_var(--ease-out-arch)_0.15s_both]">
                  {hero.title}
                </span>
              </span>
            </h1>
            <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-[30ch] font-[family-name:var(--font-text)] text-[length:var(--text-lead)] font-light leading-snug text-paper/85 [animation:hero-fade_1s_var(--ease-out-arch)_0.5s_both]">
                {hero.lede}
              </p>
              <div className="pointer-events-auto [animation:hero-fade_1s_var(--ease-out-arch)_0.65s_both]">
                <Button
                  variant="outline"
                  tone="deep"
                  magnetic
                  onClick={() => {
                    document
                      .getElementById("overview")
                      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
                  }}
                >
                  {hero.cta}
                  <ArrowGlyph />
                </Button>
              </div>
            </div>

            {!staticFilm && (
              <div className="mt-10 hidden items-center gap-3 text-paper/70 md:flex [animation:hero-fade_1s_var(--ease-out-arch)_1.1s_both]">
                <span className="mark">{hero.scrollHint}</span>
                <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-paper/25">
                  <span className="absolute inset-x-0 top-0 h-3 bg-paper [animation:hero-drop_1.9s_var(--ease-arch)_infinite]" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ---- Instrument state -------------------------------------------- */}
        {!staticFilm && (
          <div ref={instrumentRef} className="pointer-events-none absolute inset-0 opacity-0">
            <StageRail active={stage} barRef={barRef} />
            <div className="absolute bottom-[var(--gutter)] right-[var(--gutter)] text-right text-paper">
              <span
                ref={percentRef}
                className="block font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,5rem)] font-medium leading-none tabular-nums tracking-tight"
              >
                00
              </span>
              <span className="mark mt-2 block text-paper/60">Built</span>
            </div>
          </div>
        )}

        {showLoader && <HeroLoader progress={loadProgress} />}
      </div>
    </section>
  );
}

/**
 * The path taken under reduced motion, and if the sequence cannot be fetched.
 * The completed development is shown as a still, and the film is offered with
 * native controls so it can be watched deliberately rather than by scrolling.
 */
function StaticFilm() {
  return (
    <div className="absolute inset-0">
      <video
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="none"
        poster="/media/film/arrival.webp"
        aria-label="Film of Model Town, from cleared ground to the completed development"
      >
        <source src="/media/film/model-town-film.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
