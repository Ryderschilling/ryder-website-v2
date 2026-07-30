'use strict';

/**
 * Real, first-pass site audit. No dependencies.
 * Fetches the page server-side and grades it on the same things I check
 * before quoting a rebuild. Shared by api/scan.js (Vercel) and
 * tools/dev-server.js (local).
 */

const dns = require('dns').promises;

const TIMEOUT_MS = 9000;
const MAX_BYTES = 3_000_000;
const MAX_REDIRECTS = 4;

/* ---------------------------------------------------------------- */
/* Safety: never let this thing be used to probe a private network   */
/* ---------------------------------------------------------------- */

function isPrivateIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  const [a, b] = p;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateIPv6(ip) {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (s === '::1' || s === '::') return true;
  if (s.startsWith('fc') || s.startsWith('fd')) return true;   // unique local
  if (s.startsWith('fe80')) return true;                        // link local
  if (s.startsWith('::ffff:')) return isPrivateIPv4(s.split(':').pop());
  return false;
}

async function assertPublicHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
      host.endsWith('.internal') || host.endsWith('.home.arpa')) {
    throw new Error('That address is not reachable from the public internet.');
  }
  let addrs;
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch (e) {
    throw new Error("I couldn't find that domain. Check the spelling and try again.");
  }
  for (const { address, family } of addrs) {
    const priv = family === 6 ? isPrivateIPv6(address) : isPrivateIPv4(address);
    if (priv) throw new Error('That address is not reachable from the public internet.');
  }
}

/* ---------------------------------------------------------------- */
/* Fetch                                                             */
/* ---------------------------------------------------------------- */

function normalise(raw) {
  let input = String(raw || '').trim();
  if (!input) throw new Error('Enter a website address first.');
  input = input.replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(input)) input = 'https://' + input;
  let u;
  try { u = new URL(input); } catch (e) { throw new Error("That doesn't look like a web address."); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http and https addresses can be scanned.');
  if (!u.hostname.includes('.')) throw new Error("That doesn't look like a web address.");
  u.hash = '';
  return u;
}

async function fetchPage(startUrl) {
  let url = startUrl;
  let redirects = 0;
  const t0 = Date.now();

  while (true) {
    await assertPublicHost(url.hostname);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res;
    try {
      res = await fetch(url.toString(), {
        redirect: 'manual',
        signal: ctrl.signal,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; RyderSchillingSiteScan/1.0; +https://ryderschilling.com)',
          'accept': 'text/html,application/xhtml+xml',
          'accept-language': 'en-US,en;q=0.9'
        }
      });
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') throw new Error('That site took too long to answer (over 9 seconds). That is itself a problem worth fixing.');
      throw new Error("I couldn't reach that site. Is it live?");
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      if (++redirects > MAX_REDIRECTS) throw new Error('That site redirects too many times in a row.');
      url = new URL(res.headers.get('location'), url);
      continue;
    }

    const len = Number(res.headers.get('content-length') || 0);
    if (len > MAX_BYTES) throw new Error('That page is too large to scan.');

    const body = await res.text();
    return {
      status: res.status,
      finalUrl: url,
      headers: res.headers,
      html: body.length > MAX_BYTES ? body.slice(0, MAX_BYTES) : body,
      bytes: Buffer.byteLength(body),
      ms: Date.now() - t0,
      redirects
    };
  }
}

/* ---------------------------------------------------------------- */
/* Parsing helpers (regex is enough for head-level checks)           */
/* ---------------------------------------------------------------- */

const stripTags = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function metaContent(html, attr, value) {
  const re = new RegExp(
    '<meta[^>]*' + attr + '\\s*=\\s*["\']' + value + '["\'][^>]*>',
    'i'
  );
  const tag = html.match(re);
  if (!tag) return null;
  const c = tag[0].match(/content\s*=\s*["']([^"']*)["']/i);
  return c ? c[1].trim() : '';
}

function headHtml(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : html.slice(0, 20000);
}

/* ---------------------------------------------------------------- */
/* The checks                                                        */
/* ---------------------------------------------------------------- */

function buildChecks(page) {
  const { html, finalUrl, headers, bytes, ms } = page;
  const head = headHtml(html);
  const out = [];
  const add = (o) => out.push(o);

  /* --- security --- */
  add({
    key: 'https',
    group: 'Trust',
    label: 'Secure connection (HTTPS)',
    weight: 10,
    ...(finalUrl.protocol === 'https:'
      ? { state: 'pass', detail: 'Padlock is there. Good.' }
      : { state: 'fail', detail: 'No padlock. Chrome marks this site "Not Secure" to every visitor.' })
  });

  /* --- speed --- */
  const speedState = ms < 800 ? 'pass' : ms < 1800 ? 'warn' : 'fail';
  add({
    key: 'speed',
    group: 'Speed',
    label: 'Server response time',
    weight: 12,
    state: speedState,
    detail: speedState === 'pass'
      ? `Answered in ${ms}ms. Fast.`
      : speedState === 'warn'
        ? `Answered in ${ms}ms. Noticeable pause before anything appears.`
        : `Answered in ${ms}ms. Visitors on phones start leaving around this point.`
  });

  const kb = Math.round(bytes / 1024);
  const weightState = kb < 120 ? 'pass' : kb < 400 ? 'warn' : 'fail';
  add({
    key: 'weight',
    group: 'Speed',
    label: 'Page code size',
    weight: 6,
    state: weightState,
    detail: `${kb}KB of HTML before images or scripts.` + (weightState === 'pass' ? ' Lean.' : weightState === 'warn' ? ' Heavier than it needs to be.' : ' Very heavy, usually a page builder.')
  });

  const headScripts = (head.match(/<script[^>]*src=[^>]*>/gi) || [])
    .filter((s) => !/\b(defer|async|type\s*=\s*["']module["'])/i.test(s));
  const blockState = headScripts.length === 0 ? 'pass' : headScripts.length <= 3 ? 'warn' : 'fail';
  add({
    key: 'blocking',
    group: 'Speed',
    label: 'Scripts blocking first paint',
    weight: 6,
    state: blockState,
    detail: headScripts.length === 0
      ? 'Nothing in the head is holding up the page.'
      : `${headScripts.length} script${headScripts.length === 1 ? '' : 's'} in the head with no defer or async. The page waits on ${headScripts.length === 1 ? 'it' : 'them'} before showing anything.`
  });

  /* --- mobile --- */
  const viewport = metaContent(html, 'name', 'viewport');
  add({
    key: 'viewport',
    group: 'Mobile',
    label: 'Mobile viewport set',
    weight: 10,
    ...(viewport
      ? { state: 'pass', detail: 'The page knows it is on a phone.' }
      : { state: 'fail', detail: 'No viewport tag. Phones render this at desktop width and shrink it. Most of your traffic is on a phone.' })
  });

  /* --- findability --- */
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : '';
  const titleState = !title ? 'fail' : (title.length < 15 || title.length > 65) ? 'warn' : 'pass';
  add({
    key: 'title',
    group: 'Found on Google',
    label: 'Page title',
    weight: 10,
    state: titleState,
    detail: !title
      ? 'No title tag at all. Google has nothing to show as your headline in search.'
      : `"${title}" (${title.length} characters).` + (titleState === 'warn' ? (title.length < 15 ? ' Too short to say what you do or where you are.' : ' Google cuts this off around 60 characters.') : '')
  });

  const desc = metaContent(html, 'name', 'description');
  const descState = !desc ? 'fail' : (desc.length < 50 || desc.length > 165) ? 'warn' : 'pass';
  add({
    key: 'description',
    group: 'Found on Google',
    label: 'Search description',
    weight: 8,
    state: descState,
    detail: !desc
      ? 'Missing. Google writes its own snippet for you, and it is usually worse than what you would write.'
      : `${desc.length} characters.` + (descState === 'warn' ? (desc.length < 50 ? ' Short enough that Google will probably ignore it.' : ' Gets cut off in results.') : ' Good length.')
  });

  const h1s = html.match(/<h1[\s>][\s\S]*?<\/h1>/gi) || [];
  const h1State = h1s.length === 1 ? 'pass' : h1s.length === 0 ? 'fail' : 'warn';
  add({
    key: 'h1',
    group: 'Found on Google',
    label: 'One clear main heading',
    weight: 7,
    state: h1State,
    detail: h1s.length === 0
      ? 'No H1. Nothing tells Google what this page is actually about.'
      : h1s.length === 1
        ? `"${stripTags(h1s[0]).slice(0, 80)}"`
        : `${h1s.length} H1 tags. Competing signals, so Google picks one at random.`
  });

  const canonical = /<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i.test(head);
  add({
    key: 'canonical',
    group: 'Found on Google',
    label: 'Canonical URL',
    weight: 4,
    ...(canonical
      ? { state: 'pass', detail: 'Duplicate versions of this page point back here.' }
      : { state: 'warn', detail: 'Missing. Google can treat www, non-www and query versions as separate pages and split your ranking.' })
  });

  const jsonLd = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
  add({
    key: 'schema',
    group: 'Found on Google',
    label: 'Structured data',
    weight: 7,
    ...(jsonLd
      ? { state: 'pass', detail: 'Google can read your business details directly.' }
      : { state: 'fail', detail: 'None found. This is what feeds your hours, address, reviews and service area into search and AI answers.' })
  });

  /* --- sharing --- */
  const ogTitle = metaContent(html, 'property', 'og:title') || metaContent(html, 'name', 'og:title');
  const ogImage = metaContent(html, 'property', 'og:image') || metaContent(html, 'name', 'og:image');
  const ogState = ogTitle && ogImage ? 'pass' : (ogTitle || ogImage) ? 'warn' : 'fail';
  add({
    key: 'social',
    group: 'Trust',
    label: 'Link preview when shared',
    weight: 6,
    state: ogState,
    detail: ogState === 'pass'
      ? 'Shows a proper card with an image in texts and on social.'
      : ogState === 'warn'
        ? 'Half set up. The preview will look broken on some platforms.'
        : 'Nothing. Paste your link in a text message and it shows as bare grey text.'
  });

  const favicon = /<link[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*>/i.test(head);
  add({
    key: 'favicon',
    group: 'Trust',
    label: 'Browser tab icon',
    weight: 3,
    ...(favicon
      ? { state: 'pass', detail: 'Your mark shows in the tab and in bookmarks.' }
      : { state: 'warn', detail: 'Missing. Your tab shows a blank page icon next to every competitor with a logo.' })
  });

  /* --- accessibility / images --- */
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const withAlt = imgs.filter((t) => /alt\s*=\s*["'][^"']+["']/i.test(t)).length;
  const pct = imgs.length ? Math.round((withAlt / imgs.length) * 100) : 100;
  const altState = !imgs.length ? 'warn' : pct >= 90 ? 'pass' : pct >= 50 ? 'warn' : 'fail';
  add({
    key: 'alt',
    group: 'Found on Google',
    label: 'Image alt text',
    weight: 5,
    state: altState,
    detail: !imgs.length
      ? 'No images found in the HTML. Often means they are loaded by script, which Google indexes poorly.'
      : `${withAlt} of ${imgs.length} images described (${pct}%).` + (altState === 'pass' ? '' : ' Undescribed images are invisible to Google Images and to screen readers.')
  });

  /* --- conversion --- */
  const hasTel = /href\s*=\s*["']tel:/i.test(html);
  const hasMail = /href\s*=\s*["']mailto:/i.test(html);
  const hasForm = /<form\b/i.test(html);
  const paths = [hasTel && 'tap-to-call', hasMail && 'email link', hasForm && 'a form'].filter(Boolean);
  const convState = paths.length >= 2 ? 'pass' : paths.length === 1 ? 'warn' : 'fail';
  add({
    key: 'contact',
    group: 'Turning visitors into work',
    label: 'Ways to contact you',
    weight: 6,
    state: convState,
    detail: paths.length
      ? `Found ${paths.join(' and ')} on the homepage.` + (convState === 'warn' ? ' One path only, so anyone who prefers a different one leaves.' : '')
      : 'No phone link, no email link, no form on the homepage. Every visitor has to go hunting.'
  });

  return out;
}

const GRADES = [
  { min: 90, grade: 'Sharp', line: 'This is in good shape. The wins left are small ones.' },
  { min: 75, grade: 'Solid, with gaps', line: 'The foundation is fine. A handful of fixes would move real numbers.' },
  { min: 55, grade: 'Needs work', line: 'Enough is broken here that you are losing people who were ready to buy.' },
  { min: 0,  grade: 'Losing customers', line: 'This site is working against you. Worth rebuilding rather than patching.' }
];

async function runScan(rawUrl) {
  const url = normalise(rawUrl);
  const page = await fetchPage(url);

  if (page.status >= 400) {
    throw new Error(`That address returned a ${page.status} error, so there was no page to scan.`);
  }

  const checks = buildChecks(page);
  const total = checks.reduce((n, c) => n + c.weight, 0);
  const earned = checks.reduce(
    (n, c) => n + c.weight * (c.state === 'pass' ? 1 : c.state === 'warn' ? 0.5 : 0),
    0
  );
  const score = Math.round((earned / total) * 100);
  const band = GRADES.find((g) => score >= g.min);

  const fails = checks.filter((c) => c.state === 'fail').length;
  const warns = checks.filter((c) => c.state === 'warn').length;

  return {
    ok: true,
    url: url.toString(),
    finalUrl: page.finalUrl.toString(),
    score,
    grade: band.grade,
    summary: band.line,
    counts: { pass: checks.length - fails - warns, warn: warns, fail: fails, total: checks.length },
    responseMs: page.ms,
    checks: checks.map(({ weight, ...rest }) => rest)
  };
}

module.exports = { runScan };
