# ryderschilling.com — SEO + GEO context

The running record of search and AI-search work on ryderschilling.com. Read `00-baseline`
first, then `01-changelog`. Anything not written down here did not happen.

| File | What it holds |
| --- | --- |
| `00-baseline-2026-08-17.md` | Starting scores and exactly what was missing, before any change. |
| `01-changelog-2026-08-17.md` | Every change made, why, the file it lives in, and how to verify it. |
| `02-ai-search-prompts.md` | The 3 AI-search prompts to track, plus the result log. |
| `03-scoreboard.md` | Before / after score table. Fill the "after" column post re-audit. |
| `04-next-moves.md` | What is still open, in priority order. |
| `05-results-2026-08-17.md` | Round 1 post-deploy results, the hallucination-watch read, and the ⚠️ Boca Raton address problem. |
| `06-changelog-round2-2026-08-17.md` | Round 2: the three MISSING AI-intent signals, agents.md, and LocalBusiness. |
| `reports/` | The raw platform exports each round. Never edit these. |

## Rules for this folder

1. One dated baseline + changelog pair per round of work. Never overwrite an old one.
2. Every score in here is copied from an AI Syndicate export, not remembered.
3. Every change gets a verify line. If it can't be verified, it isn't done.
4. This folder is excluded from the Vercel deploy via `.vercelignore`.

## The measurement stack

- **AI Syndicate** (aisyndicate.com, ryder@aisyndicate.com) — AI access, SEO access,
  Security access, prompt tracking. Workspace: ryderschilling.com.
- **Google Search Console** — property `https://ryderschilling.com/`, verified by the
  HTML meta tag now in `index.html`.
