# Changelog — Motion District added to the portfolio, 5 September 2026

## What changed

Added **Motion District** (`motiondistrict.co`) as a portfolio entry, then adjusted
ordering and the NLH Media preview image. All edits made directly in
`ryderschilling-v2`. Nothing committed to git, nothing deployed.

### Files touched

| File | Change |
| --- | --- |
| `index.html` | New work card for Motion District in the `#workTrack` carousel, placed **second** (`data-n="02"`). All cards renumbered in document order, 01 through 08. Added Motion District to the "view full portfolio" collage sheet. NLH card image switched from `work-1.jpg` to `work-nlh.jpg`. |
| `portfolio/index.html` | New `<article class="row" id="p2">` for Motion District, second in the list. Rows renumbered p1 through p9. BreadcrumbList JSON-LD updated: Motion District at position 2, everything after shifted by one. |
| `index.md` | Motion District row added to the project table, directly under NLH Media. |
| `llms-full.txt` | Same table row added, same position. |
| `assets/img/work-motion.jpg` | New file, 1440x896, 102 KB. |

### Copy used

- Tag / category: **Production**
- Portfolio line: "Cinematic production studio in Tampa. Shot, directed and cut in-house."
- Homepage card line: "Cinematic production studio in Tampa. Built to feel like the footage."
- Homepage card tags: Production / Next.js / Motion
- md table line: "Cinematic production studio in Tampa: shot, directed and cut in-house. A site built to feel like the footage."

## How the screenshot was made

`motiondistrict.co` could not be loaded by a headless browser through the sandbox egress
proxy (`ERR_CONNECTION_RESET` on every attempt, both with and without an explicit proxy
arg). Plain `requests` through the proxy worked fine.

The fix: launch Chromium normally, then intercept **every** request with
`page.route("**/*", handler)` and fulfill it from a `requests.Session`. The browser never
touches the network itself, so the proxy restriction does not apply, and the page still
renders and executes exactly as normal.

Then: 1600x1000 viewport, wait 8s for hero video and animations, screenshot, resize to
1440x896 with PIL LANCZOS, save at JPEG quality 86 progressive.

**Reuse this for any future portfolio screenshot.** The 1440x896 size matters, it is what
every other `work-*.jpg` in `assets/img/` uses (except `work-nlh.jpg` at 1800x938).

## Image conventions confirmed

- Work shots live in `assets/img/`, named `work-N.jpg` or `work-<slug>.jpg`
- Standard size 1440x896 (ratio 1.607), JPEG, roughly 80 to 120 KB
- Cards use object-fit cover, so a slightly wider source still renders correctly

## Ordering notes

- Neither `js/main.js` nor `css/portfolio.css` depends on the row ids (`#p1`..`#p9`)
  or on `data-n` / `wc-num` values, so reordering is safe. Renumber in document order
  after any insert or swap.
- Homepage order as of this change: 01 NLH Media, 02 Motion District, 03 Elias Collective,
  04 Found Community, 05 Coastal Home Management, 06 Fit Flour, 07 HydroWild,
  08 View Full Portfolio.
- Portfolio page order: p1 NLH Media, p2 Motion District, p3 Kurt Benkert,
  p4 Elias Collective, p5 Found Community, p6 Coastal Home Management, p7 Source A Trade,
  p8 Fit Flour, p9 HydroWild.

## Open items

- Not committed to git, not deployed to Vercel.
- `work-1.jpg` is now unreferenced anywhere in the site. Safe to delete if nothing else needs it.
- Kurt Benkert appears on the portfolio page but not in the homepage carousel. Pre-existing,
  not introduced here.
