import { NextResponse } from "next/server";
import { validateContact, type ContactFields } from "@/lib/contact";

// Delivery uses Resend's REST API (https://resend.com) via fetch, so no SDK is needed.
// Required environment variables (server-side only, never exposed to the browser):
//   RESEND_API_KEY      API key from the Resend dashboard
//   CONTACT_TO_EMAIL    inbox that receives messages
// Optional:
//   CONTACT_FROM_EMAIL  verified sender, e.g. "Portfolio <hello@yourdomain.com>".
//                       Defaults to Resend's test sender, which can only deliver to your own Resend account email.

const MIN_FILL_MS = 2500;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

// Best-effort, per-instance limiter: serverless instances don't share memory, so this only slows down bursts.
const recent = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 1000) recent.clear();
  return hits.length > RATE_LIMIT.max;
}

const singleLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export async function POST(request: Request) {
  let body: Partial<ContactFields & { website: string; startedAt: number }>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_request", error: "Invalid request." }, { status: 400 });
  }

  const fields: ContactFields = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    subject: String(body.subject ?? ""),
    message: String(body.message ?? ""),
  };

  // Spam checks. The honeypot field is hidden from people, so a filled one almost always means a bot.
  // The reply stays honest (nothing was sent) and points people to email in case autofill was the cause.
  if (body.website) {
    return NextResponse.json(
      { ok: false, code: "spam", error: "This message couldn't be sent. If you're a person, please email me directly instead." },
      { status: 400 },
    );
  }
  // Real people take a moment to fill the form.
  const startedAt = Number(body.startedAt);
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json(
      { ok: false, code: "too_fast", error: "That was sent a little too quickly. Please wait a moment and try again." },
      { status: 400 },
    );
  }

  const errors = validateContact(fields);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, code: "invalid", errors }, { status: 422 });
  }

  // Checked before rate limiting: with no delivery configured nothing is sent, so there's nothing to throttle.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json(
      { ok: false, code: "not_configured", error: "Message delivery is not configured." },
      { status: 503 },
    );
  }

  // Only submissions that would actually be delivered count towards the limit.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, code: "rate_limited", error: "Too many messages in a short time. Please try again later." },
      { status: 429 },
    );
  }

  const name = singleLine(fields.name);
  const email = singleLine(fields.email);
  const subject = singleLine(fields.subject);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} <${email}>\n\n${fields.message.trim()}`,
      }),
    });
    if (!res.ok) {
      console.error("Contact form delivery failed:", res.status, await res.text().catch(() => ""));
      return NextResponse.json(
        { ok: false, code: "delivery_failed", error: "The message couldn't be delivered right now. Please try again or email directly." },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Contact form delivery error:", error);
    return NextResponse.json(
      { ok: false, code: "delivery_failed", error: "The message couldn't be delivered right now. Please try again or email directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
