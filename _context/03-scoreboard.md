# Scoreboard

Copy scores straight from the AI Syndicate exports. Never from memory.

## Round 1 — 17 August 2026

Before = 8:28am pre-deploy. After = 1:43pm, re-audited on the live site post-push.

| Metric | Before | After | Delta | Target |
| --- | --- | --- | --- | --- |
| **AI access** | 54 | **89** | **+35** | 85+ ✅ |
| — Sitemap | 0 | **100** | +100 | 100 ✅ |
| — robots.txt | 49 | **100** | +51 | 95+ ✅ |
| — Crawlability | 100 | **100** | — | 100 ✅ |
| — AI crawler access | 100 | **100** | — | 100 ✅ |
| — Page content quality | 69 | **100** | +31 | 80+ ✅ |
| — Identity (NAP) | 25 | **85** | +60 | 75+ ✅ |
| — Structured data | 0 | **63** | +63 | 90+ ⚠️ |
| — llms.txt & agents | 0 | **56** | +56 | 90+ ⚠️ |
| — AI intent & permission | 14 | **56** | +42 | 80+ ⚠️ |
| **Status label** | Partially blocked | **Visible to major AI** | | |

Seven of nine categories hit target. Zero P0 findings remain — the "Top Critical Finding"
block is gone from the report entirely.

**Identity (NAP) beat its own forecast.** `03-scoreboard` predicted "the 50s at best from
on-page work alone, the rest needs a GBP." It went to 85 with no GBP at all, because the
platform's canonical-NAP extractor found a complete, conflict-free record in the JSON-LD:
"No NAP conflicts detected across the pages we sampled — every page agrees on the canonical
identity." The forecast was too pessimistic. The GBP is still the right next move, but the
on-page ceiling was higher than assumed.

### Not re-measured yet in this round

- **SEO access** — was 69. Not re-run after the push.
- **Security hygiene** — was 69 (D). Not re-run after the push. `vercel.json` is live, so
  this should move on the next scan.

## Round 2 — (date)

Start a new table. Never overwrite Round 1.
