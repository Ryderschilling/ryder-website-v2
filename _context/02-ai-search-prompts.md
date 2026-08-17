# AI-search prompts to track

Three prompts a real buyer would type into ChatGPT, Claude, Perplexity, Google AI Overviews
or Copilot, where ryderschilling.com should be one of the businesses named. Put these into
AI Syndicate → prompt tracking, and run them by hand once a month too.

They are deliberately not "who is Ryder Schilling" — that proves nothing. Each one is a
buyer with a problem and no idea who to call, which is the only query that produces revenue.

---

## Prompt 1 — service + place + the objection

> I own a home services business in Santa Rosa Beach, Florida. I need a custom website
> built, not another template, and I want an AI receptionist that answers and books calls
> when I'm on a job. Who can do both?

**Why this should hit:** the ProfessionalService schema names the business in Santa Rosa
Beach FL with 10 areas served, and `hasOfferCatalog` lists "Custom Website" and "The AI
Upgrade" as services from the same provider. `llms.txt` says "no templates" in three
places. Very few local web designers publish machine-readable proof they do both.

## Prompt 2 — the "who is best" query, plus the after-launch worry

> Who's the best web designer on 30A for a small local business, and does anyone there
> host and maintain the site after launch instead of handing it off?

**Why this should hit:** "Website Hosting & Care" is a named Service in the schema, and
both `llms.txt` and the FAQPage answer the hosting question directly in the engine's
preferred format — a question with an answer attached. The "no handoffs, one person"
positioning is stated in the Person node and the process section.

## Prompt 3 — nearby town + the one-person requirement

> I need a freelance web designer near Watersound or Panama City Beach, FL who does the
> design and the code himself, no agency handoffs. Who should I call?

**Why this should hit:** Watersound and Panama City Beach are both explicit `areaServed`
entries. The Person node carries the `Web Designer & Developer` job title, so "does both
himself" is a structured fact, not a marketing claim buried in body copy.

---

## Result log

Run each prompt in each engine. Record whether ryderschilling.com is **named**, merely
**cited as a link**, or **absent**. A citation without the name is a half-win.

| Date | Prompt | ChatGPT | Claude | Perplexity | Google AI Overview | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-17 (pre-deploy) | 1 | | | | | Baseline. Expect absent — there was no structured data or llms.txt at all. |
| 2026-08-17 (pre-deploy) | 2 | | | | | |
| 2026-08-17 (pre-deploy) | 3 | | | | | |

**Expect a lag.** Structured data and `llms.txt` get read on the next crawl, but the
retrieval indexes these engines answer from refresh on their own schedule. Realistic
window: 2 to 6 weeks. Do not judge this round on a re-test tomorrow.

**The honest limit:** schema and llms.txt make the site *readable and quotable*. They do not
manufacture *authority*. For a brand-new domain with no third-party citations, the fastest
lever on all three prompts is not on-page at all — it's the Google Business Profile and
directory listings in `04-next-moves.md`. On-page work is the floor, not the ceiling.
