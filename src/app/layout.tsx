import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/content";

/**
 * Two voices.
 *
 * Archivo is the architectural one — a grotesque with enough width axis to be
 * set tight and large without turning into a poster face. It carries headlines,
 * labels and every piece of interface text.
 *
 * Newsreader is the human one, used only for the reflective lines. Keeping the
 * serif in the minority is what stops the page from reading as another
 * cream-and-serif property brochure.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  axes: ["wdth"],
  preload: true,
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  // One variable file rather than four static cuts. Nothing on the page is set
  // in italic, and the optical-size axis is what makes the serif hold up at the
  // large sizes the reflective lines are set in.
  axes: ["opsz"],
  preload: true,
});

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "https://model-town.example";

export const metadata: Metadata = {
  metadataBase: new URL(url),
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
  colorScheme: "light",
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
  url,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${newsreader.variable} no-js`}>
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
