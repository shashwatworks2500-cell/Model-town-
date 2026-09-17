"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { FilmProgress } from "@/components/hero/FilmProgress";
import { HeroLoader } from "@/components/hero/HeroLoader";
import { useFilmSequence } from "@/components/hero/useFilmSequence";
import { cuts, neverChanges, resolveCut } from "@/lib/film";
import { gsap } from "@/lib/gsap";
import { hero, site } from "@/lib/content";
import { media } from "@/lib/media.generated";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useMediaQuery";

/** Runway length. Longer reads as slower, more deliberate construction. */
const RUNWAY_VH = 620;

/** Fraction of the runway spent handing the film over to the page. */
const HANDOVER = 0.11;

/**
 * Ceiling on how far the canvas may exceed the source resolution. The film is
 * 720 lines; painting it into 2532 device pixels on a DPR-3 phone invents no
 * detail and costs five times the fill rate.
 */
const MAX_SOURCE_SCALE = 1.6;

function phaseFor(progress: number): number {
  let index = 0;
  for (let i = 0; i < hero.phases.length; i += 1) {
    const phase = hero.phases[i];
    if (phase && progress >= phase.at) index = i;
  }
  return index;
}

/**
 * The opening sequence.
 *
 * Scroll drives film time. The page opens as a poster — wordmark, nothing else
 * — and becomes an instrument: the title clips away in the first tenth of the
 * runway and a four-line narrative takes the frame, so the scroll reads as a
 * story about a place being built rather than as footage with a scrubber.
 *
 * It resolves rather than cuts: in the last stretch the film contracts into a
 * framed still on the page colour, and the section below continues from it.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const instrumentRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boxRef = useRef({ w: 0, h: 0 });
  const lastFrameRef = useRef(0);
  const phaseRef = useRef(0);

  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  const cut = useSyncExternalStore(neverChanges, resolveCut, () => null);
  const { progress: loadProgress, ready, failed, frameAt } = useFilmSequence(cut);

  const draw = useCallback(
    (index: number) => {
      const context = ctxRef.current;
      const image = frameAt(index);
      if (!context || !image) return;

      const { w, h } = boxRef.current;
      if (w === 0 || h === 0) return;

      const { naturalWidth: iw, naturalHeight: ih } = image;
      // Cover, anchored centre. The film is symmetrical about its vertical
      // axis, so a centre crop keeps the avenue and both terraces intact.
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;

      context.clearRect(0, 0, w, h);
      context.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
      lastFrameRef.current = index;
    },
    [frameAt],
  );

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cut) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    ctxRef.current = context;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const src = cuts[cut];
      const supplyCap = Math.max(
        1,
        Math.min(
          (src.width * MAX_SOURCE_SCALE) / rect.width,
          (src.height * MAX_SOURCE_SCALE) / rect.height,
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

  // Paint frame zero as soon as it lands, so the loader sits over the film
  // rather than over an empty box.
  useEffect(() => {
    if (cut && loadProgress > 0) draw(0);
  }, [cut, loadProgress, draw]);

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
          // A touch of smoothing on top of Lenis — this is what removes the
          // last of the stepping when a trackpad delivers a coarse delta.
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
            }
            const next = phaseFor(self.progress);
            if (next !== phaseRef.current) {
              phaseRef.current = next;
              setPhase(next);
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

      // Poster gives way to instrument.
      timeline.to(posterRef.current, { autoAlpha: 0, y: -60, duration: 0.09 }, 0.012);
      timeline.fromTo(instrumentRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.05);

      // The hint has done its work the instant the film moves. Leaving it up
      // for five more screens turns an invitation into an instruction nobody
      // needs any more.
      timeline.to(hintRef.current, { autoAlpha: 0, duration: 0.03 }, 0.008);

      // Handover. The overlay clears before its scrim does, or type is left
      // stranded on a brightening frame.
      const inset =
        window.innerWidth < 768 ? "inset(4% 6% 10% 6%)" : "inset(8% 18% 13% 18%)";
      timeline
        .to(instrumentRef.current, { autoAlpha: 0, duration: 0.035 }, 1 - HANDOVER)
        // The corner metadata belongs to the film, not to the viewport. Once
        // the frame pulls away from the edges they would be left annotating
        // black.
        .to(cornersRef.current, { autoAlpha: 0, duration: 0.045 }, 1 - HANDOVER)
        .to(gradeRef.current, { autoAlpha: 0, duration: HANDOVER * 0.7 }, 1 - HANDOVER + 0.03)
        .to(
          frameRef.current,
          { clipPath: inset, scale: 0.94, duration: HANDOVER, ease: "power2.inOut" },
          1 - HANDOVER,
        );
    }, section);

    return () => ctx.revert();
  }, [cut, ready, reducedMotion, draw]);

  // The loader stays mounted through its own fade; unmounting the instant the
  // sequence reports ready cuts it off mid-transition.
  const [loaderRetired, setLoaderRetired] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setLoaderRetired(true), 900);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const staticFilm = reducedMotion || failed;
  const showLoader = Boolean(cut) && !failed && !reducedMotion && !loaderRetired;
  const current = hero.phases[phase] ?? hero.phases[0];

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label={`${site.name} — the development taking shape`}
      style={{ height: staticFilm ? undefined : `${RUNWAY_VH}vh` }}
      className="relative bg-ink"
    >
      <div className="sticky top-0 viewport-h w-full overflow-hidden bg-ink">
        <div
          ref={frameRef}
          className="absolute inset-0 will-change-[clip-path,transform]"
          style={{ clipPath: "inset(0%)" }}
        >
          {staticFilm ? (
            <StaticFilm />
          ) : (
            <>
              {/* The opening frame is on screen before a single sequence frame
                  has decoded, and is the LCP element. Served raw so the
                  <link rel="preload"> in the head matches exactly. */}
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
                aria-label="Model Town from cleared ground through to the completed development. Scroll to move through the film."
              />
            </>
          )}

          <div ref={gradeRef} aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 vignette" />
            <div className="absolute inset-x-0 top-0 h-36 scrim-t" />
            <div className="absolute inset-x-0 bottom-0 h-[66%] scrim-b" />
          </div>
        </div>

        {/* ---- Poster ------------------------------------------------------ */}
        <div
          ref={posterRef}
          className="pointer-events-none absolute inset-0 flex items-end pb-[calc(var(--gutter)*2.6)]"
        >
          <div className="bleed w-full">
            <h1 className="t-hero text-bone">
              {hero.title.map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    className="block"
                    style={{
                      animation: `rise-in 1.25s var(--ease-out-arch) ${0.25 + i * 0.09}s both`,
                    }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>
          </div>
        </div>

        {/* ---- Instrument --------------------------------------------------- */}
        {!staticFilm && (
          <div
            ref={instrumentRef}
            className="pointer-events-none absolute inset-0 flex items-end pb-[calc(var(--gutter)*2.6)] opacity-0"
          >
            <div className="bleed w-full">
              <p className="t-label text-on-dark">{current?.index}</p>
              <p
                key={current?.index}
                className="t-heading mt-5 max-w-[14ch] text-bone [animation:fade-up_0.7s_var(--ease-out-arch)_both]"
              >
                {current?.line}
              </p>
            </div>
          </div>
        )}

        {/* ---- Persistent corners -------------------------------------------- */}
        <div
          ref={cornersRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 pb-[var(--gutter)]"
        >
          <div className="bleed flex items-end justify-between gap-6">
            <p className="t-label text-on-dark-mute [animation:fade-only_1s_var(--ease-out-arch)_0.9s_both]">
              {hero.mark}
            </p>
            {!staticFilm && (
              <div className="[animation:fade-only_1s_var(--ease-out-arch)_1.05s_both]">
                <FilmProgress phase={phase} fillRef={fillRef} />
              </div>
            )}
          </div>
        </div>

        {/* ---- Scroll hint --------------------------------------------------- */}
        {!staticFilm && (
          <div
            ref={hintRef}
            className={cn(
              "pointer-events-none absolute left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex",
              "bottom-[calc(var(--gutter)+3.5rem)]",
              "[animation:fade-only_1s_var(--ease-out-arch)_1.3s_both]",
            )}
          >
            <span className="t-label text-on-dark-mute">{hero.scroll}</span>
            <span aria-hidden className="block h-10 w-px overflow-hidden bg-line-dark">
              <span className="block h-full w-full bg-bone [animation:line-drop_2.4s_var(--ease-arch)_infinite]" />
            </span>
          </div>
        )}

        {showLoader && <HeroLoader progress={loadProgress} />}
      </div>
    </section>
  );
}

/**
 * Reduced motion, or a sequence that could not be fetched. The film is served
 * with native controls and the completed development as its poster — watchable
 * deliberately rather than by scrolling.
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
