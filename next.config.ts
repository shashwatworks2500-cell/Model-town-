import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `script-src` allows inline scripts, and that is a deliberate, bounded
 * decision rather than an oversight. Next inlines the hydration payload into
 * the document, so a policy that refuses inline scripts needs a per-request
 * nonce — and a nonce cannot be stamped onto a statically prerendered page,
 * because the HTML is written at build time. The choice is therefore between a
 * nonce plus dynamic rendering on every request, or static HTML plus
 * `unsafe-inline`.
 *
 * This site is a brochure: it renders no user-supplied content into HTML, uses
 * `dangerouslySetInnerHTML` only for an author-controlled JSON-LD literal,
 * loads no third-party script, and sends its one piece of user input to a route
 * handler that never echoes it back. With no injection sink, `unsafe-inline`
 * gives an attacker nothing, while static HTML is a real benefit to everybody
 * who loads the page.
 *
 * If this site ever renders content it did not author — a CMS field, a comment,
 * a query parameter — that reasoning stops holding. At that point, add a proxy
 * that sets a nonce on both the request and response `Content-Security-Policy`
 * headers (Next reads it off the request to stamp its script tags), replace the
 * `script-src` below with `'self' 'nonce-<value>' 'strict-dynamic'`, and accept
 * dynamic rendering. Anything less leaves the policy decorative.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Static security headers. */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The project keeps its conventions in code and comments; no generated rules file.
  agentRules: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Frame sequences and the film are content-addressed by build; cache hard.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
