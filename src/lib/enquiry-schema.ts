/**
 * Enquiry payload validation, shared by the form and the route handler.
 *
 * The client copy exists to help someone fix a typo; the server copy is the one
 * that decides. Client-side checks are never trusted here — the route runs this
 * again on whatever actually arrives.
 */

export const CONTACT_PREFERENCES = ["email", "phone", "either"] as const;
export type ContactPreference = (typeof CONTACT_PREFERENCES)[number];

export interface Enquiry {
  name: string;
  email: string;
  phone: string;
  message: string;
  preference: ContactPreference;
}

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

const LIMITS = { name: 120, email: 254, phone: 32, message: 2000 } as const;

// Deliberately permissive: the job is to catch a mistyped address, not to
// adjudicate RFC 5322.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d][\d\s()+.-]{6,}$/;

const clean = (value: unknown): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

export function validateEnquiry(input: unknown): {
  ok: boolean;
  errors: FieldErrors;
  value: Enquiry;
} {
  const raw = (input ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = clean(raw.name);
  const email = clean(raw.email).toLowerCase();
  const phone = clean(raw.phone);
  // Message keeps its line breaks; only the ends are trimmed.
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  const preference = CONTACT_PREFERENCES.includes(raw.preference as ContactPreference)
    ? (raw.preference as ContactPreference)
    : "either";

  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > LIMITS.name) errors.name = "That name is too long.";

  if (!email) errors.email = "Please enter an email address.";
  else if (!EMAIL.test(email) || email.length > LIMITS.email)
    errors.email = "That does not look like an email address.";

  if (!phone) errors.phone = "Please enter a phone number.";
  else if (!PHONE.test(phone) || phone.length > LIMITS.phone)
    errors.phone = "Please enter a reachable phone number.";

  if (message.length > LIMITS.message) errors.message = "Please keep this under 2000 characters.";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { name, email, phone, message, preference },
  };
}
