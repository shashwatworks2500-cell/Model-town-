/**
 * Every word on the site lives here.
 *
 * Content integrity rule for this project: nothing on this page may assert a
 * fact about Model Town that has not been supplied. No sizes, counts, distances,
 * amenities, dates, prices or credentials. Where information is missing, a
 * bracketed placeholder is rendered verbatim so it is obvious what still needs
 * filling in. Copy describes what is actually visible in the supplied film, or
 * it describes intent — never specification.
 */

export const PLACEHOLDER = {
  phone: "[PHONE NUMBER]",
  email: "[EMAIL ADDRESS]",
  location: "[LOCATION]",
  locationDetail: "[LOCATION INFORMATION]",
  developer: "[DEVELOPER NAME]",
  masterplan: "[MASTERPLAN TO BE PROVIDED]",
} as const;

export const site = {
  name: "Model Town",
  wordmark: "MODEL TOWN",
  tagline: "A place taking shape.",
  description:
    "Model Town is a residential development shown here from cleared ground to finished street. An architectural film, an editorial look at the design intent, and a direct line to the team.",
} as const;

/**
 * Navigation order follows scroll order exactly. A menu that lists sections in
 * a different sequence to the page makes the active-state indicator jump around
 * as you scroll, which is worse than any argument for a different ordering.
 */
export const nav = [
  { id: "overview", label: "Overview" },
  { id: "masterplan", label: "Masterplan" },
  { id: "architecture", label: "Architecture" },
  { id: "experience", label: "Experience" },
  { id: "location", label: "Location" },
] as const;

export const hero = {
  eyebrow: "A community taking shape",
  title: "Model Town",
  lede: "From cleared ground to a finished street, in one continuous take.",
  cta: "Explore Model Town",
  scrollHint: "Scroll to build",
  loading: "Preparing the film",
} as const;

/**
 * Stage markers for the scrub rail. `at` is normalised film progress, read off
 * the supplied footage — these describe what is on screen, nothing more.
 */
export const stages = [
  { at: 0.0, index: "01", label: "Land" },
  { at: 0.12, index: "02", label: "Groundwork" },
  { at: 0.24, index: "03", label: "Plots" },
  { at: 0.33, index: "04", label: "Foundation" },
  { at: 0.46, index: "05", label: "Structure" },
  { at: 0.63, index: "06", label: "Enclosure" },
  { at: 0.77, index: "07", label: "Landscape" },
  { at: 0.93, index: "08", label: "Arrival" },
] as const;

export const arrival = {
  mark: "00 — Arrival",
  heading: ["What you just watched", "takes years."],
  body: "Model Town is the part that comes after. The ordinary, unhurried business of living somewhere that was thought about first.",
} as const;

export const overview = {
  mark: "01 — The vision",
  heading: ["More than", "a place to live."],
  lede: "A considered environment shaped around architecture, open space and everyday life.",
  columns: [
    {
      title: "Drawn before it was built",
      body: "The street line came first, then the plots, then the houses. Nothing here was fitted in afterwards.",
    },
    {
      title: "Open ground, on purpose",
      body: "Space between buildings is treated as part of the design rather than what is left over once the plots are set.",
    },
  ],
  caption: "Indicative lifestyle photography.",
} as const;

export const masterplan = {
  mark: "02 — The drawing",
  heading: ["It begins", "as a drawing."],
  lede: "Four moments from the film, in the order the ground went through them.",
  body: "A plan is a promise about how a place will be used — where the street runs, how far the houses sit back from it, what stays open. The film records that promise being kept, frame by frame.",
  stages: [
    {
      id: "land",
      index: "01",
      label: "Land",
      caption: "Cleared ground, held inside its boundary tree line.",
    },
    {
      id: "plan",
      index: "02",
      label: "Groundwork",
      caption: "The street pattern is set down first and defines everything after it.",
    },
    {
      id: "structure",
      index: "03",
      label: "Structure",
      caption: "Massing rises to the plot lines already drawn on the ground.",
    },
    {
      id: "arrival",
      index: "04",
      label: "Arrival",
      caption: "Planting closes the composition and the street becomes a street.",
    },
  ],
  planNote: {
    title: "Detailed masterplan",
    body: "A measured plan drawing has not yet been supplied for this site.",
    value: PLACEHOLDER.masterplan,
  },
  disclosure: "Stills from the supplied architectural film. An artist's impression.",
} as const;

export const architecture = {
  mark: "03 — The architecture",
  heading: ["Designed", "with intention."],
  lede: "Five decisions you can read off the elevation.",
  principles: [
    {
      index: "01",
      title: "Horizon",
      body: "Low, flat rooflines keep the street open to the sky instead of closing it in.",
    },
    {
      index: "02",
      title: "Aperture",
      body: "Full-height glazing turns each façade into something that collects light rather than resists it.",
    },
    {
      index: "03",
      title: "Threshold",
      body: "Planting sits between the pavement and the door, so arriving home takes a moment.",
    },
    {
      index: "04",
      title: "Shadow",
      body: "Deep reveals and set-back terraces give the elevation something to cast through the day.",
    },
    {
      index: "05",
      title: "Repetition",
      body: "One language, repeated with variation, so the street reads as a single idea and not a catalogue.",
    },
  ],
} as const;

export const interior = {
  mark: "04 — Inside",
  heading: ["A space to", "come home to."],
  body: "Rooms that hold their proportion when they are empty and still work when they are full.",
  caption: "Indicative interior photography. Not a Model Town residence.",
} as const;

export const rhythm = {
  mark: "05 — The day",
  heading: ["Life, in its", "own rhythm."],
  lede: "The hour before anyone else is up. The long part of a Sunday. The walk back from somewhere.",
  body: "A neighbourhood earns its character in the unremarkable hours, not the photographed ones.",
  caption: "Indicative lifestyle photography.",
} as const;

export const community = {
  mark: "06 — The ground",
  heading: ["Ground", "held open."],
  lede: "Green space that belongs to the plan rather than to what was left over.",
  body: "Trees at the boundary, planting at the thresholds, and room between the buildings to move through rather than around.",
  caption: "Indicative photography of a landscaped residential environment.",
} as const;

export const leisure = {
  mark: "07 — Slowing down",
  heading: ["Moments made for", "slowing down."],
  body: "Somewhere to stop, at the end of the part of the day that asked something of you.",
  caption:
    "Indicative lifestyle photography. Does not depict a Model Town amenity.",
} as const;

export const gallery = {
  mark: "08 — The record",
  heading: ["The record", "so far."],
  lede: "Film stills and reference photography. Use the arrow keys, or swipe.",
  /**
   * Paired into rows rather than dropped into one grid. Auto-placement with
   * offset column starts leaves holes wherever an item cannot fit beside its
   * neighbour, and a gallery full of holes reads as broken rather than as
   * composed. Each row here is an explicit two-picture composition.
   */
  rows: [
    [
      { id: "arrival", start: 1, span: 7, ratio: "16 / 10", drop: 0, alt: "The completed development at dusk, seen from street level.", label: "Arrival", source: "film" },
      { id: "interior", start: 9, span: 4, ratio: "3 / 4", drop: 2, alt: "A living room opening onto a kitchen, warmly lit.", label: "Interior", source: "reference" },
    ],
    [
      { id: "leisure", start: 1, span: 4, ratio: "3 / 4", drop: 1, alt: "A person resting at the edge of a pool, looking out over a coastline at dusk.", label: "Pause", source: "reference" },
      { id: "structure", start: 6, span: 7, ratio: "16 / 10", drop: 0, alt: "Houses under construction, massing complete and landscaping not yet begun.", label: "Structure", source: "film" },
    ],
    [
      { id: "plan", start: 1, span: 8, ratio: "16 / 9", drop: 0, alt: "The street pattern laid out across cleared ground, seen from above.", label: "Groundwork", source: "film" },
      { id: "welcome", start: 10, span: 3, ratio: "3 / 4", drop: 3, alt: "Three people walking through a bright, empty residential interior.", label: "Viewing", source: "reference" },
    ],
    [
      { id: "land", start: 2, span: 4, ratio: "16 / 10", drop: 2, alt: "Cleared ground before construction, framed by a boundary tree line.", label: "Land", source: "film" },
      { id: "community", start: 7, span: 6, ratio: "4 / 3", drop: 0, alt: "Two people running on a path through a landscaped residential park.", label: "Open ground", source: "reference" },
    ],
  ],
} as const;

export const location = {
  mark: "09 — The address",
  heading: ["The", "address."],
  lede: "Location details for Model Town have not yet been supplied.",
  body: "Connectivity, surroundings and travel times will be published here once they can be stated accurately. Nothing has been estimated in the meantime.",
  rows: [
    { label: "Location", value: PLACEHOLDER.location },
    { label: "Neighbourhood", value: PLACEHOLDER.locationDetail },
    { label: "Developer", value: PLACEHOLDER.developer },
  ],
} as const;

export const finalCta = {
  mark: "10 — Next",
  heading: ["Come home to", "something considered."],
  body: "Register your interest and the team will be in touch.",
  primary: "Enquire now",
  secondary: "Back to the beginning",
} as const;

export const enquiry = {
  title: "Register your interest",
  lede: "Tell us how to reach you and someone from the team will follow up.",
  fields: {
    name: { label: "Full name", placeholder: "Your name" },
    email: { label: "Email", placeholder: "you@example.com" },
    phone: { label: "Phone", placeholder: "Include country code" },
    message: { label: "Message", placeholder: "Anything you would like us to know (optional)" },
    preference: { label: "Preferred contact" },
  },
  preferences: [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "either", label: "Either" },
  ],
  submit: "Send enquiry",
  submitting: "Sending",
  success: { title: "Thank you.", body: "Your enquiry has been received." },
  error: "Something went wrong sending your enquiry. Please try again, or reach us directly.",
  direct: "Or reach us directly",
} as const;

export const footer = {
  disclosure:
    "The film on this page is an artist's impression of the development. Photography is indicative reference imagery and does not depict Model Town, its residences or its amenities. No pricing, dimensions, timelines or specifications are represented on this site.",
  contact: [
    { label: "Telephone", value: PLACEHOLDER.phone, href: "tel:" },
    { label: "Email", value: PLACEHOLDER.email, href: "mailto:" },
    { label: "Location", value: PLACEHOLDER.location },
    { label: "Developer", value: PLACEHOLDER.developer },
  ],
} as const;
