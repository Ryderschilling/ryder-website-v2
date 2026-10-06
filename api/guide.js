/*
 * Vercel serverless function: POST /api/guide
 *
 * The /build lead magnet. Someone enters their email, this:
 *   1. emails THEM the "Claude Websites in 4 Steps" PDF (attached + a link)
 *   2. emails RYDER a ping so every signup lands in his inbox
 *
 * Uses the same RESEND_API_KEY as /api/lead. Without it this returns 503
 * and the page tells the visitor to DM "BUILD" on Instagram instead.
 *
 * Body: { email, source, t, website }
 *   t       = ms between page load and submit (bots are instant)
 *   website = hidden honeypot, humans never fill it
 */

'use strict';

// Where signups + replies land. ryder@ryderschilling.com is send-only, Ryder reads Gmail.
const INBOX = "ryderschilling@gmail.com";
const FROM_GUIDE = "Ryder Schilling <ryder@ryderschilling.com>";
const FROM_PING = "Ryder Schilling Site <leads@ryderschilling.com>";
const PDF_URL = "https://ryderschilling.com/build/claude-websites-in-4-steps.pdf";
const PDF_NAME = "Claude-Websites-in-4-Steps.pdf";

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i;

function send(key, payload) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const guideText = (pdf) =>
`Hey,

Here's the guide: Claude Websites in 4 Steps. The PDF is attached, and you can also open it here:
${pdf}

Start with step 1 and copy my prompt. If you get stuck anywhere, screenshot it and give it to Claude. It will walk you through it.

If you'd rather have a site built fully custom to your needs, or want a private call to answer any of your questions, just reply to this email.

Ryder
ryderschilling.com`;

const guideHtml = (pdf) => `<!doctype html><html><body style="margin:0;background:#EDE7D8;padding:32px 16px;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#0B0A08">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0B0A08;border-radius:18px;color:#EDE7D8">
<tr><td style="padding:36px 32px 8px">
<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8f8a7c">Free guide</div>
<div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-1px;margin-top:14px">CLAUDE</div>
<div style="font-size:34px;line-height:1.05;font-weight:300;letter-spacing:-1px">websites in</div>
<div style="font-size:40px;line-height:1;font-weight:900;letter-spacing:-1px">4 STEPS</div>
</td></tr>
<tr><td style="padding:22px 32px 6px;font-size:16px;line-height:1.55;color:#c9c3b3">
Hey, here's the guide. The PDF is attached, and you can also open it with the button below.<br><br>
Start with step 1 and copy my prompt. If you get stuck anywhere, screenshot it and give it to Claude. It will walk you through it.
</td></tr>
<tr><td style="padding:22px 32px 30px">
<a href="${pdf}" style="display:inline-block;background:#EDE7D8;color:#0B0A08;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:99px">Open the guide &rarr;</a>
</td></tr>
<tr><td style="padding:0 32px 34px;font-size:14px;line-height:1.55;color:#8f8a7c;border-top:1px solid #2c2924">
<br>Want a site built fully custom to your needs, or a private call to answer your questions? Just reply to this email.<br><br>
<span style="color:#EDE7D8">Ryder</span><br><a href="https://ryderschilling.com" style="color:#8f8a7c">ryderschilling.com</a>
</td></tr>
</table></td></tr></table></body></html>`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return res.status(503).json({ ok: false, configured: false });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const email = String(body.email || "").trim().slice(0, 200);
  const source = String(body.source || "build").replace(/[^\w\- ]/g, "").slice(0, 40);

  // Bots: fake a success so they move on, send nothing.
  const elapsed = Number(body.t);
  if (String(body.website || "").trim() !== "" || !Number.isFinite(elapsed) || elapsed < 2500) {
    return res.status(200).json({ ok: true });
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: "email" });

  let guide;
  try {
    guide = await send(KEY, {
      from: FROM_GUIDE,
      to: [email],
      reply_to: INBOX,
      subject: "Your guide: Claude Websites in 4 Steps",
      text: guideText(PDF_URL),
      html: guideHtml(PDF_URL),
      attachments: [{ filename: PDF_NAME, path: PDF_URL }],
    });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
  if (!guide.ok) return res.status(502).json({ ok: false });

  // Ping Ryder. A failure here never blocks the visitor, they already have the guide.
  try {
    const when = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
    await send(KEY, {
      from: FROM_PING,
      to: [INBOX],
      reply_to: email,
      subject: `Guide signup: ${email}`,
      text:
        `New signup for "Claude Websites in 4 Steps"\n\n` +
        `Email: ${email}\n` +
        `Came from: ${source}\n` +
        `When: ${when} (Central)\n\n` +
        `They were sent the PDF. Reply to this email to reach them directly.`,
    });
  } catch (e) { /* ignore */ }

  return res.status(200).json({ ok: true });
};
