"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/content";
import { Arrow, Button } from "@/components/ui/Button";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";

/**
 * The header never becomes a bar, and it never sits on top of the work.
 *
 * Instead of fading in a background once you scroll, it stays transparent for
 * the whole page and inverts its own colour against whatever surface is passing
 * beneath it. The tone is read from the section currently crossing the top of
 * the viewport, which each section declares with `data-surface`.
 *
 * Transparency alone is not enough: the headlines on this page are set at a
 * size that runs straight through the top band, and bone type crossing bone
 * type is unreadable whichever way it is toned. So the navigation withdraws
 * while you are reading forward and returns the moment you scroll back — the
 * gesture that means "where am I" is the one that brings it out. It is always
 * present at the top of the page, and always present for anyone arriving by
 * keyboard.
 */
export function SiteHeader() {
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [retracted, setRetracted] = useState(false);
  const { openEnquiry } = useEnquiry();

  // Withdraw on the way down, return on the way up. The thresholds are
  // asymmetric on purpose: leaving takes a deliberate push, coming back takes
  // almost nothing, because wanting it back is the more urgent intent.
  //
  // The menu locks the page, so no scroll arrives while it is open; the header
  // is simply held out on the way down and released again by the gesture that
  // means "where am I".
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      if (y < 120) setRetracted(false);
      else if (delta > 8) setRetracted(true);
      else if (delta < -6) setRetracted(false);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Which surface is under the header right now. A thin band at the very top
  // of the viewport is the only region that matters.
  useEffect(() => {
    const surfaces = Array.from(document.querySelectorAll<HTMLElement>("[data-surface]"));
    if (surfaces.length === 0) return;

    const crossing = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) crossing.add(el);
          else crossing.delete(el);
        }
        // Lowest one still in the band wins — that is the one being entered.
        const under = surfaces.filter((s) => crossing.has(s)).pop();
        if (under) setTone(under.dataset.surface === "light" ? "light" : "dark");
      },
      { rootMargin: "0px 0px -94% 0px", threshold: 0 },
    );

    surfaces.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Active section, from a narrow band across the middle of the viewport.
  useEffect(() => {
    const ids = nav.map((item) => item.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const inBand = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        setActive(ids.filter((id) => inBand.has(id)).pop() ?? null);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const text = tone === "light" ? "text-on-light" : "text-on-dark";
  const muted = tone === "light" ? "text-on-light-mute" : "text-on-dark-mute";

  return (
    <>
      <a
        href="#idea"
        className="t-label sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[120] focus-visible:bg-bone focus-visible:px-5 focus-visible:py-3 focus-visible:text-ink"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[80]",
          "transition-[transform,opacity,color] duration-500 ease-(--ease-out-arch)",
          "motion-reduce:transition-none",
          // Tabbing into a withdrawn header has to bring it back, or the focus
          // ring lands somewhere off-screen.
          "focus-within:translate-y-0 focus-within:opacity-100",
          retracted && !menuOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
          text,
        )}
      >
        <div className="bleed flex h-[4.5rem] items-center justify-between gap-6 md:h-[5.5rem]">
          <a
            href="#hero"
            className="t-label pointer-events-auto -ml-1 inline-flex min-h-11 items-center px-1 transition-opacity duration-(--dur) hover:opacity-60"
            aria-label={`${site.name} — back to the top`}
          >
            {site.wordmark}
          </a>

          <nav aria-label="Sections" className="pointer-events-auto hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    className="group flex min-h-11 items-center gap-2"
                  >
                    <span
                      className={cn(
                        "t-label transition-opacity duration-(--dur)",
                        active === item.id ? "opacity-100" : "opacity-40 group-hover:opacity-100",
                        muted,
                      )}
                    >
                      {item.index}
                    </span>
                    <span
                      className={cn(
                        "t-label transition-opacity duration-(--dur)",
                        active === item.id ? "opacity-100" : "opacity-60 group-hover:opacity-100",
                      )}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pointer-events-auto flex items-center gap-2">
            <span className="hidden sm:block">
              <Button variant="line" tone={tone} onClick={openEnquiry}>
                Enquire
                <Arrow />
              </Button>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span aria-hidden className="flex w-6 flex-col gap-[5px]">
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} />
    </>
  );
}
