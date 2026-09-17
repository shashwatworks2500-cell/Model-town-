/**
 * The canonical origin, resolved defensively.
 *
 * `new URL(process.env.SOMETHING)` is a build-time crash waiting to happen. A
 * bare hostname throws, stray whitespace throws, and an empty string throws —
 * and `??` does not catch an empty string, so a variable that exists but was
 * left blank sails straight through to the constructor. This runs at module
 * scope in the root layout, so any of those takes the entire build down before
 * a single page renders, which in a build log is indistinguishable from any
 * other early failure.
 *
 * A misconfigured environment variable should degrade to the default, not stop
 * the site from shipping.
 */
const FALLBACK = "https://model-town.example";

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (raw) {
    // A bare hostname is the usual way this gets typed into a dashboard.
    const candidate = HAS_SCHEME.test(raw) ? raw : `https://${raw}`;
    try {
      return new URL(candidate);
    } catch {
      // Fall through to the default rather than failing the build.
    }
  }

  return new URL(FALLBACK);
}

/** Origin with no trailing slash, for string interpolation. */
export const siteOrigin = (): string => siteUrl().origin;
