/**
 * POST /api/contact
 *
 * Same-origin endpoint for the landing-page contact form. Forwards the
 * (already size-capped) JSON body to the private `stratasre-contact` Worker
 * over a service binding, so Email Sending credentials never reach the browser.
 * The form falls back to mailto: if this route is unavailable (e.g. GitHub Pages).
 */

const MAX_BODY_BYTES = 20_000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  if (!env.CONTACT) {
    return json({ ok: false, error: "email_not_configured" }, 503);
  }

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "too_large" }, 413);
  }

  const cf = request.cf || {};
  const headers = {
    "content-type": "application/json",
    "x-contact-ip": request.headers.get("cf-connecting-ip") || "",
    "x-contact-country": cf.country || "",
    "x-contact-city": cf.city || "",
    "x-contact-ua": (request.headers.get("user-agent") || "").slice(0, 200),
  };

  try {
    const upstream = await env.CONTACT.fetch("https://stratasre-contact.internal/send", {
      method: "POST",
      headers,
      body,
    });
    const payload = await upstream.text();
    return new Response(payload, {
      status: upstream.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("contact proxy failed", e && e.message);
    return json({ ok: false, error: "send_failed" }, 502);
  }
}
