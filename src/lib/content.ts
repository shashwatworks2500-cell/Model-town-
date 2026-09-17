/**
 * Every word on the site, with its line breaks.
 *
 * Headlines are stored as arrays of lines, not as sentences. That is an
 * art-direction decision rather than a data-modelling one: where a line turns
 * is part of the composition, and leaving it to the browser means the most
 * visible typography on the page is the only thing nobody designed.
 *
 * Content integrity: nothing here asserts a fact about Model Town that was not
 * supplied. No sizes, counts, distances, dates, amenities, prices or
 * credentials. Where information is missing, a bracketed placeholder renders
 * verbatim so it is obvious what still needs filling in.
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
  wordmark: "Model Town",
  tagline: "A place taking shape",
  year: "2026",
  description:
    "Model Town, shown from cleared ground to a finished street. An architectural film you scroll through, an editorial look at the design intent, and a direct line to the team.",
} as const;

export const nav = [
  { id: "idea", index: "01", label: "Overview" },
  { id: "architecture", index: "02", label: "Architecture" },
  { id: "experience", index: "03", label: "Experience" },
  { id: "location", index: "04", label: "Location" },
] as const;

/* ------------------------------------------------------------------ hero -- */

export const hero = {
  /** The film carries its own numbering in the progress rail; this is the
   *  standing caption, not a counter, so it does not repeat it. */
  mark: "A place taking shape",
  title: ["Model", "Town"],
  scroll: "Scroll to build",
  loading: "Preparing the film",
  /**
   * The film runs from cleared ground to a finished street. These four lines
   * run alongside it — one per quarter — so the scroll reads as a narrative
   * rather than as footage with a scrubber attached.
   */
  phases: [
    { at: 0.0, index: "01", line: "An idea" },
    { at: 0.26, index: "02", line: "A plan" },
    { at: 0.56, index: "03", line: "A community" },
    { at: 0.82, index: "04", line: "A place to belong" },
  ],
} as const;

/* --------------------------------------------------------------- sections -- */

export const idea = {
  index: "01",
  label: "The idea",
  heading: ["A community", "taking shape."],
  body: "What you just scrolled through takes years. Model Town is the part that comes after — the ordinary, unhurried business of living somewhere that was thought about first.",
} as const;

export const arrival = {
  index: "02",
  label: "Arrival",
  heading: ["See", "yourself", "here."],
  body: "The street line came first, then the plots, then the houses. Nothing here was fitted in afterwards.",
  caption: "Indicative lifestyle photography",
} as const;

export const breathe = {
  index: "03",
  label: "Open ground",
  heading: ["Space", "to breathe."],
  body: "Green space that belongs to the plan rather than to what was left over once the plots were set. Trees at the boundary, planting at the thresholds, room between the buildings to move through rather than around.",
  caption: "Indicative photography of a landscaped residential environment",
} as const;

export const slow = {
  index: "04",
  label: "Moments",
  heading: ["Slow", "down."],
  /** First of the two serif moments. Broken by hand, like every other
   *  headline here — where a sentence turns is a decision, not a reflow. */
  serifLine: ["A neighbourhood earns its character in the", "unremarkable hours, not the photographed ones."],
  caption: "Indicative lifestyle photography. Does not depict a Model Town amenity",
} as const;

export const home = {
  index: "05",
  label: "Interiors",
  heading: ["Come", "home."],
  body: "Rooms that hold their proportion when they are empty and still work when they are full.",
  caption: "Indicative interior photography. Not a Model Town residence",
} as const;

export const architecture = {
  index: "06",
  label: "Architecture",
  heading: ["Form", "meets", "life."],
  lede: "Five decisions you can read off the elevation.",
  principles: [
    { index: "01", title: "Horizon", body: "Low, flat rooflines keep the street open to the sky instead of closing it in." },
    { index: "02", title: "Aperture", body: "Full-height glazing turns each façade into something that collects light rather than resists it." },
    { index: "03", title: "Threshold", body: "Planting sits between the pavement and the door, so arriving home takes a moment." },
    { index: "04", title: "Shadow", body: "Deep reveals and set-back terraces give the elevation something to cast through the day." },
    { index: "05", title: "Repetition", body: "One language, repeated with variation, so the street reads as a single idea and not a catalogue." },
  ],
} as const;

export const plan = {
  index: "07",
  label: "The plan",
  heading: ["It begins", "as a drawing."],
  body: "A plan is a promise about how a place will be used — where the street runs, how far the houses sit back from it, what stays open. The film records that promise being kept, frame by frame.",
  stages: [
    { id: "land", index: "01", label: "Land", caption: "Cleared ground, held inside its boundary tree line." },
    { id: "plan", index: "02", label: "Groundwork", caption: "The street pattern is set down first and defines everything after it." },
    { id: "structure", index: "03", label: "Structure", caption: "Massing rises to the plot lines already drawn on the ground." },
    { id: "arrival", index: "04", label: "Arrival", caption: "Planting closes the composition and the street becomes a street." },
  ],
  note: {
    title: "Detailed masterplan",
    body: "A measured plan drawing has not yet been supplied for this site, so none is shown.",
    value: PLACEHOLDER.masterplan,
  },
  disclosure: "Stills from the supplied architectural film. An artist's impression.",
} as const;

export const address = {
  index: "09",
  label: "The address",
  heading: ["The", "address."],
  body: "Connectivity, surroundings and travel times will be published here once they can be stated accurately. Nothing has been estimated in the meantime.",
  rows: [
    { label: "Location", value: PLACEHOLDER.location },
    { label: "Neighbourhood", value: PLACEHOLDER.locationDetail },
    { label: "Developer", value: PLACEHOLDER.developer },
  ],
} as const;

export const close = {
  index: "10",
  label: "The invitation",
  title: ["Model", "Town"],
  /** Second and last serif moment. */
  serifLine: ["Let's talk about", "your next address."],
  cta: "Enquire now",
  back: "Back to the beginning",
} as const;

/* ---------------------------------------------------------------- gallery -- */

export const gallery = {
  index: "08",
  label: "The record",
  heading: ["The record", "so far."],
  lede: "Film stills and reference photography. Arrow keys, or swipe.",
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

/* ---------------------------------------------------------------- enquiry -- */

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
    { label: "Telephone", value: PLACEHOLDER.phone },
    { label: "Email", value: PLACEHOLDER.email },
    { label: "Location", value: PLACEHOLDER.location },
    { label: "Developer", value: PLACEHOLDER.developer },
  ],
} as const;
