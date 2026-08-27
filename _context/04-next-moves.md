# Next moves, in priority order

Everything above the line is worth more than everything below it.

---

## 0. ⚠️ Correct the "owner-verified" address inside AI Syndicate  <-- DO THIS FIRST

The platform believes Ryder Schilling's verified address is **a South Florida address that is NOT his (redacted, never repeat it)**. It is not. Do not press "Fix this now" or "Fix all 26" in
Hallucination watch until that record says Santa Rosa Beach, FL 32459 — those buttons
publish the platform's facts to the engines, and a conflicting address is exactly what
knocks Identity (NAP) back down from 85. Full detail in `05-results-2026-08-17.md`.

## 1. Google Business Profile — Santa Rosa Beach, FL  <-- CONFIRMED NOT FOUND (08-17 probe)

Nothing on-page moves Identity (NAP) or local AI answers as much as a verified GBP. It is
the record the engines cross-reference against the schema now on the site. Service-area
business, no storefront address shown. Primary category: **Website designer**. Secondary:
Web developer, Marketing agency.

Name, phone and service area must match `llms.txt` **character for character** or the
cross-reference fails and it actively hurts:

```
Ryder Schilling
+1 309-415-8793
Santa Rosa Beach, FL 32459
https://ryderschilling.com
```

When it's live, add its Maps URL and the profile URL to the `sameAs` array in the
`#business` JSON-LD node.

## 2. One real LinkedIn URL + a LinkedIn Company Page (both CONFIRMED NOT FOUND 08-17)

The sidebar link in `index.html` still points at `https://www.linkedin.com/` — a generic
link that is a dead trust signal. LinkedIn is also the business channel. Hand over the
profile URL and it goes into three places: the sidebar `href`, the `#business` `sameAs`
array, and the `#ryder` `sameAs` array. `sameAs` is one of the primary ways an engine
confirms two mentions of a name are the same entity.

## 3. Analytics — there is currently none

No GA4, no Vercel Analytics, no tag manager anywhere on the site. Every score in
`03-scoreboard.md` is a platform score; there is no traffic, query or conversion baseline
to prove any of this worked commercially. Vercel Web Analytics is one line and needs no
cookie banner; GA4 gives query-level detail once Search Console is linked. Pick one this
week, before the traffic this round earns is unmeasurable in hindsight.

> Whichever you add, its domain must go into `connect-src` and `script-src` in
> `vercel.json` in the same commit, or the CSP will block it silently.

## 4. Bing Webmaster Tools

Import the Search Console property in two clicks. Bing's index feeds Copilot and parts of
ChatGPT search, so this is a genuine AI-visibility channel, not an afterthought.

## 5. Directory citations — Yelp, BBB, Clutch.co, Foursquare, OpenStreetMap, Bing Places all NOT FOUND

> Clutch.co first: the platform notes Clutch profiles specifically feed AI answers to
> "best [service] in [city]" — which is tracked prompt 2, word for word.


Same NAP, character for character, everywhere: Bing Places, Apple Business Connect, Yelp,
Clutch, plus local Walton County and 30A business directories. This is the grind that
actually moves Identity (NAP) into the 70s.

## 6. DKIM

The security report found no DKIM key at common selectors. If mail sends from
`@ryderschilling.com`, enable DKIM at the provider and publish the selector TXT record.
DMARC is already enforcing at `p=quarantine`, so any sender that isn't DKIM-signed or in
SPF is being quarantined right now — worth 10 minutes to confirm which tools are covered.

---

## Below the line — real work, slower payoff

- **Service pages.** The whole site is one page scoring 69 on content quality. Separate
  indexable pages for Custom Website, AI Receptionist, and Local SEO would each carry their
  own schema, their own canonical, and their own keyword surface. This is the highest-value
  structural change available, and it also fixes the "1 page audited" problem in the SEO
  report.
- **A 30A / Santa Rosa Beach location page.** The geographic query is the one buyers
  actually type.
- **Case studies for the 7 projects already on the homepage.** Right now they are a name, a
  URL and one line. As real pages with `CreativeWork` schema and a result, they are the
  strongest authority asset available, and they cost nothing but writing.
- **Tighten the CSP** by hashing the JSON-LD block and dropping `'unsafe-inline'` from
  `script-src` — but only once the schema has stopped changing.
- **Re-audit cadence.** The `monthly-site-report` skill already fires on the 12th. Add
  ryderschilling.com to it so this stops depending on remembering to check.
