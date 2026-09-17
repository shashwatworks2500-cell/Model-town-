# Model Town

A scroll-driven site for a residential development, built around a single
supplied asset: a ten-second architectural film that takes a site from cleared
ground to a finished street.

The film is not decoration here. Scrolling the hero moves through it frame by
frame, so the visitor builds the place as they read about it, and the page
resolves out of the film's final frame rather than cutting away from it.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, including the React Compiler rules |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run media` | Regenerate everything in `public/media` from `media-source/` |

Copy `.env.example` to `.env.local` and fill it in. Neither variable is required
to run the site; without `ENQUIRY_WEBHOOK_URL` the enquiry form reports that it
is not connected rather than pretending to send.

---

## The hero

The supplied film is 1280×720, ten seconds, 241 frames — and carries a single
keyframe. Seeking a video like that with `currentTime` means decoding from the
start of the file on every scroll event, which is unusable for scrubbing. So the
hero does not use a `<video>` element at all: `scripts/prepare-media.mjs`
decodes the film to still frames and the hero paints them to a canvas.

Two art-directed cuts come out of that pipeline:

| Cut | Used by | Frames | Size |
|---|---|---|---|
| `lg` | ≥768px, landscape 1280×720 | 121 | ~5.0 MB |
| `sm` | phones, centre portrait crop 480×720 | 81 | ~1.3 MB |

The phone cut is a centre crop rather than a squeeze. The film is symmetrical
about its vertical axis, so the centre holds the avenue and both terraces
intact.

Frames load in two tiers. The first is every fourth frame — a complete pass over
the whole film at coarse temporal resolution, enough to start scrubbing, and the
only thing the loading state waits for. The rest streams in afterwards and
upgrades smoothness silently; the canvas draws the nearest frame it has, so
there is never a gap. On a connection reporting `saveData`, the second tier
never runs.

The canvas backing store is capped at 1.6× the source resolution. Painting a
720-line film into 2532 device pixels on a DPR-3 phone invents no detail and
costs five times the fill rate.

**Fallbacks.** Under `prefers-reduced-motion`, or if the sequence cannot be
fetched, the hero collapses to one screen and serves the film as a normal
`<video controls>` with the completed development as its poster — watchable
deliberately rather than by scrolling. Nothing on the page depends on an
animation having run.

---

## Layout of the code

```
src/
  app/            Route, layout, metadata, robots, sitemap, enquiry endpoint
  components/
    hero/         Frame sequence loader, canvas scrubber, stage rail, loader
    navigation/   Header and the full-screen phone menu
    sections/     The narrative sections, in scroll order
    gallery/      Editorial grid and the full-screen viewer
    enquiry/      Panel, validation, context
    ui/           Buttons, reveals, overlay, figure
    cursor/       Desktop cursor
    providers/    Lenis + GSAP ticker
  lib/            Content, design tokens in code, film helpers, hooks
scripts/          Media pipeline
media-source/     The supplied originals. Everything else is derived.
```

All copy lives in `src/lib/content.ts`.

---

## What the page does not claim

Nothing on this site asserts a fact about Model Town that was not supplied.
There are no prices, sizes, counts, distances, dates, amenities or credentials,
and none have been estimated. Where information is missing the page renders a
bracketed placeholder — `[LOCATION]`, `[DEVELOPER NAME]`,
`[MASTERPLAN TO BE PROVIDED]` — so it is obvious what still needs filling in.

The four photographs are reference imagery and are labelled as indicative
wherever they appear. The film is described as an artist's impression. The
footer states both plainly.

**Two things to replace before launch:**

1. `media-source/01-lifestyle-welcome.jpeg` is a watermarked stock comp. It is
   used at restrained scale and regraded, but it needs a licensed or project
   photograph.
2. The contact placeholders in `src/lib/content.ts`.

If a measured masterplan drawing is supplied, the Masterplan section is built to
take it — it currently shows four real stills from the film and says outright
that no plan drawing exists yet.

---

## Design system

Colour is sampled from the film rather than invented: the cleared ground, the
hazy sky at the horizon, the asphalt of the first roads, the boundary tree line,
and the warm light inside the finished windows. Tokens live in the `@theme`
block in `src/app/globals.css` as primitives and semantics; components reference
the semantic names.

Two typefaces. Archivo carries every headline, label and piece of interface
text. Newsreader appears only in the reflective lines — keeping the serif in the
minority is what stops the page reading as another cream-and-serif property
brochure.

---

## Verified

Against the production build:

- **Core Web Vitals** — LCP 1.5s and CLS 0.000 on a phone profile throttled to
  4× CPU and 10 Mbps. Desktop CLS 0.000, no long tasks.
- **Scrub** — median frame gap 21ms on that same throttled phone profile, 17ms
  on desktop.
- **Contrast** — every text node measured against the pixels actually rendered
  behind it, including type over film frames and photography. Zero failures
  against WCAG AA at both 1440 and 390.
- **Responsive** — 320, 360, 390, 430, 768, 1024, 1280, 1440, 1600 and 1920:
  no horizontal overflow, no clipped text, no touch target under 44px, no
  console errors.
- **Keyboard and assistive tech** — skip link first in the tab order, visible
  focus throughout, no traps, focus trapped inside and restored from both
  overlays, page behind them made inert, errors tied to inputs by
  `aria-describedby`.
- **Reduced motion** — hero collapses to one screen with a controllable video,
  no heading hidden behind an animation, no parallax, no custom cursor.
- Deep links, browser back/forward and mid-page reload all land correctly.
