/**
 * Contact-form mailer.
 *
 * Runs as a private Worker (workers_dev = false) behind the Pages Function
 * `functions/api/contact.js`, which forwards same-origin POSTs from
 * /api/contact over a service binding. It sends mail with Cloudflare Email
 * Sending (the `EMAIL` binding in wrangler.toml).
 */

const LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
};

const MIN_FILL_MS = 1500;
const MAX_BODY_BYTES = 20_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const fail = (error, status = 400, message = "") =>
  json({ ok: false, error, message }, status);

/** Strip CR/LF and control characters so values cannot inject headers. */
const headerSafe = (value) =>
  String(value).replace(/[\r\n\t\u0000-\u001f\u007f]+/g, " ").trim();

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function readField(payload, key, limit) {
  const raw = payload[key];
  if (typeof raw !== "string") return "";
  return raw.trim().slice(0, limit);
}

function validate(payload) {
  // Honeypot: real browsers never fill a display:none "website" field.
  if (typeof payload.website === "string" && payload.website.trim() !== "") {
    return { error: "spam" };
  }
  // Bots that POST blindly usually omit this; humans need time to type.
  const elapsedMs = Number(payload.elapsedMs);
  if (!Number.isFinite(elapsedMs) || elapsedMs < MIN_FILL_MS) {
    return { error: "too_fast" };
  }

  const name = readField(payload, "name", LIMITS.name);
  const email = readField(payload, "email", LIMITS.email);
  const subject = readField(payload, "subject", LIMITS.subject);
  const message = readField(payload, "message", LIMITS.message);

  if (!name) return { error: "name_required" };
  if (!EMAIL_RE.test(email)) return { error: "email_invalid" };
  if (!subject) return { error: "subject_required" };
  if (message.length < 10) return { error: "message_too_short" };

  return { value: { name, email, subject, message } };
}

function buildMessage({ name, email, subject, message }, env, request) {
  const headers = request.headers;
  const country = headers.get("x-contact-country") || (request.cf && request.cf.country) || "";
  const city = headers.get("x-contact-city") || (request.cf && request.cf.city) || "";
  const ip = headers.get("x-contact-ip") || headers.get("cf-connecting-ip") || "unknown";
  const agent = headers.get("x-contact-ua") || headers.get("user-agent") || "unknown";

  const meta = [
    `From:     ${name} <${email}>`,
    `IP:       ${ip}`,
    country ? `Country:  ${country}${city ? ` (${city})` : ""}` : null,
    `Agent:    ${headerSafe(agent).slice(0, 200)}`,
    `Received: ${new Date().toISOString()}`,
  ].filter(Boolean);

  const text = [
    `New message from the Strata contact form`,
    "",
    message,
    "",
    "---",
    ...meta,
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#0d1117;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6edf3">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto">
    <tr><td style="padding:0 0 16px">
      <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7d8590">Strata · contact form</p>
      <h1 style="margin:8px 0 0;font-size:20px;font-weight:600;color:#e6edf3">${escapeHtml(subject)}</h1>
    </td></tr>
    <tr><td style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:18px 20px">
      <p style="margin:0 0 14px;font-size:14px;color:#c9d1d9;white-space:pre-wrap">${escapeHtml(message)}</p>
      <hr style="border:none;border-top:1px solid #30363d;margin:16px 0">
      <p style="margin:0;font-size:12.5px;line-height:1.8;color:#7d8590">
        <strong style="color:#c9d1d9">${escapeHtml(name)}</strong>
        &lt;<a href="mailto:${escapeHtml(email)}" style="color:#58a6ff">${escapeHtml(email)}</a>&gt;<br>
        ${meta.map((line) => escapeHtml(line)).join("<br>")}
      </p>
    </td></tr>
  </table>
</body></html>`;

  return {
    from: { email: env.CONTACT_FROM, name: "Strata contact form" },
    to: env.CONTACT_TO,
    replyTo: { email, name },
    subject: `[strata contact] ${headerSafe(subject).slice(0, 180)}`,
    text,
    html,
  };
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return fail("method_not_allowed", 405);
    }
    if (!env.EMAIL || !env.CONTACT_TO || !env.CONTACT_FROM) {
      return fail("email_not_configured", 503);
    }

    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY_BYTES) {
      return fail("too_large", 413);
    }

    let payload;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return fail("too_large", 413);
      payload = JSON.parse(raw);
    } catch {
      return fail("invalid_json", 400);
    }
    if (!payload || typeof payload !== "object") {
      return fail("invalid_json", 400);
    }

    const { error, value } = validate(payload);
    if (error) {
      // Do not tell bots which trap they hit.
      return fail(error === "spam" || error === "too_fast" ? "rejected" : error, 400);
    }

    try {
      const result = await env.EMAIL.send(buildMessage(value, env, request));
      return json({ ok: true, id: result.messageId });
    } catch (e) {
      console.error("contact send failed", e && e.code, e && e.message);
      const status = e && e.code === "E_RATE_LIMIT_EXCEEDED" ? 429 : 502;
      return fail("send_failed", status);
    }
  },
};
