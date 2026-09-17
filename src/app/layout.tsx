import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/**
 * One typeface carries the site.
 *
 * Schibsted Grotesk is narrow enough to hold a 13rem headline without the
 * letters splaying apart, and has enough vertical stress to read as
 * architectural rather than as a system font. It does display, interface and
 * body — the width of the scale does the work that a second sans would.
 *
 * Instrument Serif appears exactly twice in the whole site, where the page
 * needs to sound like a person instead of a plan. Any more than that and it
 * becomes the identity, which is the opposite of the intent.
 */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
  weight: ["400", "500"],
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  preload: false,
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: url,
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/media/og.jpg",
        width: 1200,
        height: 630,
        alt: "The completed Model Town development at dusk, seen from street level.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/media/og.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Never block pinch zoom.
  maximumScale: 5,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  url: url.toString(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${schibsted.variable} ${instrumentSerif.variable} no-js`}>
      <head>
        {/* The hero's first frames are the largest contentful paint; start them
            before the bundle has finished parsing. */}
        <link rel="preload" as="image" href="/media/film/land.webp" fetchPriority="high" />
        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
