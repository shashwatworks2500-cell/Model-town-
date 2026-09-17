"use client";

import { cn } from "@/lib/cn";
import { footer, nav, site } from "@/lib/content";
import { Arrow, Button } from "@/components/ui/Button";
import { CloseButton, Overlay } from "@/components/ui/Overlay";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";

/**
 * A page in its own right, not a dropdown. The section names are set at display
 * scale and numbered like the rest of the site, and the contact block comes
 * with them — on a phone this is the site's table of contents.
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
      <div className="flex viewport-h flex-col bg-ink px-[var(--gutter)] py-[var(--gutter)] text-on-dark">
        <div className="flex h-[3.5rem] shrink-0 items-center justify-between">
          <p className="t-label text-on-dark-mute">{site.wordmark}</p>
          <div className="-mr-2">
            <CloseButton onClick={onClose} label="Close menu" />
          </div>
        </div>

        <nav aria-label="Sections" className="flex min-h-0 flex-1 items-center">
          <ul className="w-full">
            {nav.map((item, index) => (
              <li
                key={item.id}
                className="border-t border-line-dark last:border-b"
                style={{
                  animation: open
                    ? `fade-up 0.6s var(--ease-out-arch) ${0.06 + index * 0.05}s both`
                    : undefined,
                }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={onClose}
                  aria-current={active === item.id ? "true" : undefined}
                  className="flex items-baseline justify-between gap-6 py-[clamp(0.85rem,2.6vh,1.4rem)]"
                >
                  <span
                    className={cn(
                      "t-heading",
                      active === item.id ? "text-bone" : "text-on-dark-mute",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="t-label shrink-0 text-on-dark-faint">{item.index}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 space-y-7">
          <Button
            variant="solid"
            tone="dark"
            className="w-full justify-center"
            onClick={() => {
              onClose();
              openEnquiry();
            }}
          >
            Enquire
            <Arrow />
          </Button>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {footer.contact.slice(0, 2).map((row) => (
              <div key={row.label}>
                <dt className="t-label text-on-dark-faint">{row.label}</dt>
                <dd className="mt-1.5 text-[0.8125rem] text-on-dark">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Overlay>
  );
}
