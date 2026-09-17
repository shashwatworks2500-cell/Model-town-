import Link from "next/link";

import { site } from "@/lib/content";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex viewport-min-h flex-col justify-center bg-paper px-[var(--gutter)]">
      <div className="mx-auto w-full max-w-[96rem]">
        <p className="mark text-slate">Error 404</p>
        <h1 className="mt-8 display-tight text-[length:var(--text-h1)] text-ink">
          <span className="block">This page</span>
          <span className="block text-slate">was never built.</span>
        </h1>
        <p className="mt-8 max-w-[38ch] text-[length:var(--text-lead)] font-[family-name:var(--font-text)] leading-relaxed text-slate">
          Whatever you were looking for is not at this address.
        </p>
        <Link
          href="/"
          className="mark mt-12 inline-flex min-h-11 items-center gap-3 border-b border-rule-strong pb-2 text-ink transition-colors hover:border-ink"
        >
          Back to {site.name}
          <svg viewBox="0 0 18 10" fill="none" aria-hidden className="w-4">
            <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
