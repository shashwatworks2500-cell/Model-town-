"use client";

import { cn } from "@/lib/cn";
import { footer, nav, site } from "@/lib/content";
import { ArrowGlyph, Button } from "@/components/ui/Button";
import { CloseButton, Overlay } from "@/components/ui/Overlay";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";

/**
 * Full-screen menu.
 *
 * Deliberately not a slide-down list: it takes the whole viewport, sets the
 * section names at display scale, and carries the contact block — so on a phone
 * the menu is a page in its own right rather than a dropdown.
 */
export function MobileMenu({
  open,
  onClose,
  active,
}: {
  open: boolean;
  onClose: () => void;
  active: string | null;
}) {
  const { openEnquiry } = useEnquiry();

  return (
    <Overlay open={open} onClose={onClose} label="Menu" className="inset-0">
      <div className="flex viewport-h flex-col bg-ink px-[var(--gutter)] py-[var(--gutter)] text-paper on-deep">
        <div className="flex h-[3.5rem] shrink-0 items-center justify-between">
          <p className="mark text-paper/60">{site.wordmark}</p>
          <div className="-mr-2">
            <CloseButton onClick={onClose} label="Close menu" />
          </div>
        </div>

        <nav aria-label="Sections" className="flex min-h-0 flex-1 items-center">
          <ul className="w-full">
            {nav.map((item, index) => (
              <li
                key={item.id}
                className="border-t border-rule-deep last:border-b"
                style={{
                  animation: open
                    ? `hero-fade 0.6s var(--ease-out-arch) ${0.06 + index * 0.05}s both`
                    : undefined,
                }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={onClose}
                  aria-current={active === item.id ? "true" : undefined}
                  className="group flex items-baseline justify-between gap-6 py-[clamp(0.7rem,2.4vh,1.25rem)]"
                >
                  <span className="display text-[clamp(2rem,9vw,3.25rem)]">{item.label}</span>
                  <span
                    className={cn(
                      "mark shrink-0 tabular-nums transition-colors",
                      active === item.id ? "text-paper" : "text-paper/35",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 space-y-6">
          <Button
            variant="solid"
            tone="deep"
            className="w-full justify-center"
            onClick={() => {
              onClose();
              openEnquiry();
            }}
          >
            Enquire
            <ArrowGlyph />
          </Button>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {footer.contact.slice(0, 2).map((row) => (
              <div key={row.label}>
                <dt className="mark text-paper/40">{row.label}</dt>
                <dd className="mt-1.5 text-[0.8125rem] text-paper/80">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Overlay>
  );
}
