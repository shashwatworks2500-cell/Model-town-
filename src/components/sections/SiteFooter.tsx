import { footer, nav, site } from "@/lib/content";

/**
 * Four contact rows, the section list, and the disclosure. Nothing else.
 *
 * The disclosure is not fine print by accident — it states that the imagery is
 * indicative and that nothing on the page is a specification. On a project
 * whose only real asset is a film, saying so plainly is the difference between
 * a brochure and a misrepresentation.
 */
export function SiteFooter() {
  return (
    <footer className="bg-ink pb-10 text-on-dark">
      <div className="bleed">
        <div className="grid gap-y-14 border-t border-line-dark pt-14 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <p className="t-heading text-bone">{site.wordmark}</p>
            <p className="t-label mt-5 text-on-dark-mute">{site.tagline}</p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="t-label text-on-dark-mute">Sections</h2>
            <ul className="mt-5">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group inline-flex min-h-11 items-center gap-3 text-[0.875rem] text-on-dark-mute transition-colors duration-(--dur) hover:text-bone"
                  >
                    <span className="t-label text-on-dark-faint transition-colors group-hover:text-on-dark-mute">
                      {item.index}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="t-label text-on-dark-mute">Contact</h2>
            <dl className="mt-5 space-y-4">
              {footer.contact.map((row) => (
                <div key={row.label}>
                  <dt className="t-label text-on-dark-faint">{row.label}</dt>
                  <dd className="mt-1.5 text-[0.875rem] text-on-dark">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 border-t border-line-dark pt-8">
          <p className="max-w-[86ch] text-[0.75rem] leading-relaxed text-on-dark-mute">
            {footer.disclosure}
          </p>
          <p className="t-label mt-8 text-on-dark-faint">
            {site.name} — {site.year}
          </p>
        </div>
      </div>
    </footer>
  );
}
