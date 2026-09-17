"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/**
 * Header.
 *
 * Over the film it is transparent and set in paper, so it reads as part of the
 * shot. Once the film has resolved into the page it settles onto a solid
 * surface and flips to ink. The change is a state, not a fade-in-on-scroll
 * gimmick: it marks leaving one mode of the page for another.
 */
export function SiteHeader() {
  const [settled, setSettled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { openEnquiry } = useEnquiry();

  // The header settles just before the film hands over to the page, not after.
  // During the handover the film clips inward and takes its scrim with it — a
  // header still set in paper would briefly sit on paper and vanish.
  useIsomorphicLayoutEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const settledRef = { current: false };
    const apply = (next: boolean) => {
      if (next === settledRef.current) return;
      settledRef.current = next;
      setSettled(next);
    };

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => apply(self.progress > 0.86),
      onLeave: () => apply(true),
      onLeaveBack: () => apply(false),
    });

    return () => trigger.kill();
  }, []);

  // Active section. A narrow IntersectionObserver band across the middle of the
  // viewport is cheaper and steadier than measuring offsets on every scroll.
  //
  // The observer keeps a running set rather than reading each callback in
  // isolation: entries only describe what just changed, so acting on them alone
  // leaves the last section marked active forever once everything has left the
  // band — which is exactly what the hero, sitting above all of them, does.
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
        // Ties go to the section furthest down the page, which is the one being
        // scrolled into.
        const current = ids.filter((id) => inBand.has(id)).pop() ?? null;
        setActive(current);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <a
        href="#overview"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[120] focus-visible:rounded-(--radius-control) focus-visible:bg-ink focus-visible:px-5 focus-visible:py-3 focus-visible:text-paper mark"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-[background-color,border-color,color] duration-500 ease-(--ease-out-arch)",
          // Solid once settled. A translucent bar lets headlines slide through
          // it and read as mush, and blurred glass is not this project's
          // language.
          settled
            ? "border-b border-rule bg-paper text-ink"
            : "border-b border-transparent bg-transparent text-paper",
        )}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6 md:h-[5.25rem]">
          <a
            href="#hero"
            className="mark relative -ml-2 inline-flex min-h-11 items-center px-2 transition-opacity hover:opacity-70"
            aria-label={`${site.name} — back to the top`}
          >
            {site.wordmark}
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "true" : undefined}
                    className="group relative flex min-h-11 items-center text-[0.8125rem] tracking-[0.02em] opacity-72 transition-opacity duration-(--dur) hover:opacity-100 aria-[current]:opacity-100"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-2.5 left-0 h-px bg-current transition-[width] duration-(--dur) ease-(--ease-out-arch) group-hover:w-full",
                        active === item.id ? "w-full" : "w-0",
                      )}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              tone={settled ? "light" : "deep"}
              magnetic
              onClick={openEnquiry}
              className="hidden px-6 py-3 sm:inline-flex"
            >
              Enquire
            </Button>

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
