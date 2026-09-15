/*
 * Vercel serverless function: POST /api/lead
 *
 * Emails every form submission to Ryder via Resend. Used by the /52 page
 * (challenge signups and book recommendations) and available to any other
 * form on the site.
 *
 * Needs RESEND_API_KEY in the Vercel project env, and ryderschilling.com
 * verified in Resend so it can send from the domain. Without the key this
 * returns 503 and the page falls back to a prefilled mailto, so nothing
 * ever silently swallows a signup.
 *
 * Body: { name, contact, need, msg, source }
 */

'use strict';

const INBOX = "ryder@ryderschilling.com";
const FROM = "Ryder Schilling Site <leads@ryderschilling.com>";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return res.status(503).json({ ok: false, configured: false });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { name = "", contact = "", need = "", msg = "", source = "site" } = body || {};

  const clean = (s) => String(s == null ? "" : s).slice(0, 1200).replace(/[<>]/g, "");
  const who = clean(name);
  const reach = clean(contact);
  const src = clean(source);
  if (!who && !clean(msg)) return res.status(400).json({ ok: false });

  const books = src.indexOf("52books") === 0;
  const subject = books
    ? `52 Books: ${who || "someone"} (${clean(need) || src})`
    : `New website lead: ${who || "someone"} (${clean(need) || src})`;

  let r;
  try {
    r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [INBOX],
        reply_to: /.+@.+\..+/.test(reach) ? reach : undefined,
        subject,
        text:
          `FROM RYDERSCHILLING.COM (${src})\n\n` +
          `Name: ${who}\n` +
          `Reach at: ${reach}\n` +
          `About: ${clean(need)}\n\n` +
          `${clean(msg)}\n\n` +
          `ryderschilling.com`,
      }),
    });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }

  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
