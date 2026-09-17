import { NextResponse } from "next/server";

import { validateEnquiry } from "@/lib/enquiry-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enquiry endpoint.
 *
 * It does exactly one of two things, and never pretends to do the other. With
 * `ENQUIRY_WEBHOOK_URL` configured it forwards the enquiry and reports whether
 * that succeeded. Without it, it returns 503 and the form tells the visitor to
 * use the direct contact details instead. A form that shows "thank you" while
 * dropping the message on the floor is worse than no form.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 8_000;

/**
 * Per-instance rate limit. Adequate for a single node; behind more than one,
 * move this to shared storage.
 */
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, code: "too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_json" }, { status: 400 });
  }

  // Bots fill every field they find; people never see this one.
  if (typeof (payload as { company?: unknown })?.company === "string" &&
      (payload as { company: string }).company.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { ok, errors, value } = validateEnquiry(payload);
  if (!ok) {
    return NextResponse.json({ ok: false, code: "invalid", errors }, { status: 422 });
  }

  const endpoint = process.env.ENQUIRY_WEBHOOK_URL;
  if (!endpoint) {
    return NextResponse.json({ ok: false, code: "not_configured" }, { status: 503 });
  }

  try {
    const forwarded = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...value, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });

    if (!forwarded.ok) {
      return NextResponse.json({ ok: false, code: "upstream" }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ ok: false, code: "upstream" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
