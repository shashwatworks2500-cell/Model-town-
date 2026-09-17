import { footer, nav, site } from "@/lib/content";

/**
 * Footer, carrying the contact block and the disclosure.
 *
 * The disclosure is not fine print hidden at the bottom by accident — it is the
 * statement that the imagery is indicative and that nothing on the page is a
 * specification. On a project where the only real asset is a film, saying so
 * plainly is the difference between a brochure and a misrepresentation.
 */
export function SiteFooter() {
  return (
    <footer className="bg-ink pb-10 pt-[var(--space-section-tight)] text-paper on-deep">
      <div className="shell">
        <div className="grid gap-y-12 border-t border-rule-deep pt-12 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <p className="display-tight text-[length:var(--text-h3)] text-paper">
              {site.wordmark}
            </p>
            <p className="mark mt-4 text-paper/45">{site.tagline}</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="mark text-paper/40">Sections</h2>
            <ul className="mt-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-11 items-center text-[0.875rem] text-paper/75 transition-colors duration-(--dur) hover:text-paper"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="mark text-paper/40">Contact</h2>
            <dl className="mt-5 space-y-4">
              {footer.contact.map((row) => (
                <div key={row.label}>
                  <dt className="mark text-paper/40">{row.label}</dt>
                  <dd className="mt-1 text-[0.875rem] text-paper/80">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 border-t border-rule-deep pt-8">
          <p className="max-w-[80ch] text-[0.75rem] leading-relaxed text-paper/40">
            {footer.disclosure}
          </p>
          <p className="mark mt-8 text-paper/30">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
