"use client";

import { useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { enquiry as copy, PLACEHOLDER } from "@/lib/content";
import { ArrowGlyph, Button } from "@/components/ui/Button";
import { CloseButton, Overlay } from "@/components/ui/Overlay";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import {
  CONTACT_PREFERENCES,
  type ContactPreference,
  type FieldErrors,
  validateEnquiry,
} from "@/lib/enquiry-schema";

type Status = "idle" | "sending" | "sent" | "failed" | "unavailable";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  message: "",
  preference: "either" as ContactPreference,
  company: "",
};

export function EnquiryPanel() {
  const { open, closeEnquiry } = useEnquiry();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // A fresh panel each time it opens; a half-filled form from twenty minutes
  // ago is not a feature. Adjusting during render rather than in an effect
  // means the blank form is what renders, instead of the stale one followed by
  // a second pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(EMPTY);
      setErrors({});
      setStatus("idle");
    }
  }

  const set = (field: keyof typeof EMPTY) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field as keyof FieldErrors];
      return next;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;

    const { ok, errors: found } = validateEnquiry(values);
    if (!ok) {
      setErrors(found);
      // Send focus to the first thing that needs attention.
      const firstKey = Object.keys(found)[0];
      if (firstKey) document.getElementById(`enquiry-${firstKey}`)?.focus();
      return;
    }

    setStatus("sending");
    setErrors({});

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setStatus("sent");
        return;
      }

      const body = (await response.json().catch(() => null)) as
        | { code?: string; errors?: FieldErrors }
        | null;

      if (body?.code === "invalid" && body.errors) {
        setErrors(body.errors);
        setStatus("idle");
        return;
      }

      // The endpoint has no destination configured, so nothing was delivered.
      // Say that, rather than showing a success state that did not happen.
      setStatus(body?.code === "not_configured" ? "unavailable" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <Overlay
      open={open}
      onClose={closeEnquiry}
      label={copy.title}
      className="inset-x-0 bottom-0 top-0 ml-auto w-full max-w-[34rem] sm:inset-y-0"
    >
      <div className="flex viewport-h flex-col overflow-y-auto overscroll-contain bg-paper" data-lenis-prevent>
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-rule px-[var(--gutter)] py-4">
          <p className="mark text-slate">{copy.title}</p>
          <div className="-mr-2">
            <CloseButton onClick={closeEnquiry} tone="light" label="Close enquiry form" />
          </div>
        </div>

        {status === "sent" ? (
          <Success onClose={closeEnquiry} />
        ) : (
          <form noValidate onSubmit={submit} className="flex flex-1 flex-col px-[var(--gutter)] py-8">
            <h2 className="display-tight text-[length:var(--text-h3)] text-ink">{copy.title}</h2>
            <p className="mt-4 max-w-[42ch] text-[length:var(--text-body)] leading-relaxed text-slate">
              {copy.lede}
            </p>

            <div className="mt-9 space-y-6">
              <Field
                id="enquiry-name"
                ref={firstFieldRef}
                label={copy.fields.name.label}
                placeholder={copy.fields.name.placeholder}
                value={values.name}
                onChange={set("name")}
                error={errors.name}
                autoComplete="name"
                required
              />
              <Field
                id="enquiry-email"
                type="email"
                inputMode="email"
                label={copy.fields.email.label}
                placeholder={copy.fields.email.placeholder}
                value={values.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Field
                id="enquiry-phone"
                type="tel"
                inputMode="tel"
                label={copy.fields.phone.label}
                placeholder={copy.fields.phone.placeholder}
                value={values.phone}
                onChange={set("phone")}
                error={errors.phone}
                autoComplete="tel"
                required
              />

              <Preference value={values.preference} onChange={set("preference")} />

              <Field
                id="enquiry-message"
                multiline
                label={copy.fields.message.label}
                placeholder={copy.fields.message.placeholder}
                value={values.message}
                onChange={set("message")}
                error={errors.message}
              />

              {/* Honeypot. Hidden from sight and from assistive technology, and
                  skipped in the tab order — only a bot will ever fill it. */}
              <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="enquiry-company">Company</label>
                <input
                  id="enquiry-company"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="h-px w-px"
                  value={values.company}
                  onChange={(event) => set("company")(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-9" aria-live="polite">
              {(status === "failed" || status === "unavailable") && (
                <p className="rounded-(--radius-control) border border-rule-strong bg-stone/40 px-4 py-3 text-[0.875rem] leading-relaxed text-ink">
                  {status === "unavailable"
                    ? "This form is not connected to a destination yet, so nothing was sent. Please reach us directly using the details below."
                    : copy.error}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-5">
              <Button type="submit" variant="solid" disabled={status === "sending"} className="justify-center">
                {status === "sending" ? copy.submitting : copy.submit}
                <ArrowGlyph />
              </Button>

              <div className="border-t border-rule pt-5">
                <p className="mark text-slate/70">{copy.direct}</p>
                <dl className="mt-3 space-y-1.5">
                  <div className="flex gap-3">
                    <dt className="mark w-20 shrink-0 text-slate/60">Phone</dt>
                    <dd className="text-[0.875rem] text-ink">{PLACEHOLDER.phone}</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="mark w-20 shrink-0 text-slate/60">Email</dt>
                    <dd className="text-[0.875rem] text-ink">{PLACEHOLDER.email}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </form>
        )}
      </div>
    </Overlay>
  );
}

function Success({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center px-[var(--gutter)] py-14">
      <p className="mark text-forest">Received</p>
      <h2 className="mt-7 display-tight text-[length:var(--text-h2)] text-ink">
        {copy.success.title}
      </h2>
      <p className="mt-6 max-w-[34ch] text-[length:var(--text-lead)] font-[family-name:var(--font-text)] leading-relaxed text-slate">
        {copy.success.body}
      </p>
      <div className="mt-12">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | undefined;
  type?: string;
  inputMode?: "email" | "tel" | "text";
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
}

/**
 * One field treatment for the whole form: a real label above the control (never
 * a placeholder standing in for one), and the error tied to the input through
 * `aria-describedby` so it is announced rather than merely displayed.
 */
function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  inputMode,
  autoComplete,
  required,
  multiline,
  ref,
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) {
  const errorId = useId();
  const shared = {
    id,
    value,
    placeholder,
    required,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(
      "w-full border-b bg-transparent px-0 py-3 text-[length:var(--text-body)] text-ink",
      "placeholder:text-slate/45 transition-colors duration-(--dur) outline-none",
      "focus-visible:outline-none focus:border-ink",
      error ? "border-forest" : "border-rule-strong",
    ),
  };

  return (
    <div>
      <label htmlFor={id} className="mark block text-slate">
        {label}
        {required && <span className="ml-1.5 text-forest">*</span>}
      </label>

      {multiline ? (
        <textarea
          {...shared}
          rows={3}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={cn(shared.className, "mt-1 resize-y")}
        />
      ) : (
        <input
          {...shared}
          ref={ref}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={cn(shared.className, "mt-1")}
        />
      )}

      {error && (
        <p id={errorId} className="mt-2 text-[0.8125rem] text-forest">
          {error}
        </p>
      )}
    </div>
  );
}

function Preference({
  value,
  onChange,
}: {
  value: ContactPreference;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mark text-slate">{copy.fields.preference.label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONTACT_PREFERENCES.map((option) => {
          const label = copy.preferences.find((p) => p.value === option)?.label ?? option;
          const selected = value === option;
          return (
            <label
              key={option}
              className={cn(
                "mark cursor-pointer rounded-(--radius-control) border px-4 py-3 transition-colors duration-(--dur)",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-rule-strong text-slate hover:border-ink hover:text-ink",
              )}
            >
              <input
                type="radio"
                name="preference"
                value={option}
                checked={selected}
                onChange={(event) => onChange(event.target.value)}
                className="sr-only"
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
