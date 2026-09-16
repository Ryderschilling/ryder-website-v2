# /52 . 52 Books in a Year
Context file for the reading challenge page. Read this before touching /52, js/books.js, or anything books related.
Last updated 2026-09-15.

LIVE at https://ryderschilling.com/52/

## The challenge, as it actually runs
- **Started Wednesday 2026-09-09.** An earlier plan said Oct 1. That was wrong.
- Reading week runs **Wednesday to Tuesday**. New book every Wednesday.
- Book 1: From the Trash Man to the Cash Man, Myron Golden, 152pp, started 09-09.
- Queue: 100 Bible Principles for Business (Dennis Juan Allen), then $100M Offers, then $100M Leads (Alex Hormozi).
- **Ratings are out of 5**, not 10. Changed 2026-09-15 across the whole site.
- Amazon Associates tag `ryderschillin-20`. Short links are `amzn.to/...`.
- Instagram is **@ryder_schilling_official** (underscores). `ryderschillingofficial` does not exist, it 404s.

## Files
| file | what it is |
|---|---|
| `52/index.html` | the page, served at `/52/` |
| `js/books.js` | THE ONLY FILE THAT CHANGES WEEKLY |
| `js/fiftytwo.js` | the renderer. Never edit this to add a book |
| `css/books.css` | page styles, loads after pages.css |
| `api/lead.js` | Resend relay for both forms (CommonJS, matches api/scan.js) |
| `assets/books/` | cover jpgs dropped in by hand |
| `index.html` | the `#books52` homepage section, sits between `#testimonial` and `#contact` |

Nav and footer link to /52/ on all 11 pages. sitemap.xml and llms.txt updated.

## Adding a book each week
Edit `js/books.js` only.
- `window.BOOKS` holds done + currently reading. Exactly one should be `status:"reading"`.
- `window.BOOKS_QUEUE` is up next, in reading order. **Every queue entry needs a `buy` link.** People order ahead off that row, a cover with no link is a dead end.
- Fields: `n, title, subtitle, author, asin, cover, photo, status, started, finished, rating (out of 5), pages, tags[], verdict, report, takeaways[], quote, buy`
- Leave `cover` empty and set `asin`, and the cover loads from `https://m.media-amazon.com/images/P/<ASIN>.01._SCLZZZZZZZ_.jpg`. Works for plain ASINs and ISBN-10 style ones, both verified.
- `photo` is Ryder's own shot of the book. Only used on the "on the desk" feature.
- Never invent `pages`. Leave it 0 until the number comes off the actual book.

## The four state tracker
52 cells. State is derived from the data, there is no flag to set.
- **done**, green #4F6B4A. Popover: cover, rating out of 5, "Read the report" opens the drawer.
- **now**, ink ring, pulsing. Popover: cover, "Read it with me" buy link.
- **planned**, amber #B8893B, anything in BOOKS_QUEUE. Popover: cover, "Buy it now".
- **open**, dashed clay #A8563F. Popover: "Suggest a book", scrolls to the recommend form and prefills the hidden week field so the email says which week they picked.

Colours are deliberately desaturated, not traffic light. There is a text legend under the grid because colour alone excludes colourblind visitors. One shared `#cellpop` element, not 52 tooltips, so it can hold real links without the mouse losing it on the way over.

## Mobile rules (rebuilt 2026-09-15)
- Tracker drops to **7 columns under 560px**, cells go from 21px to ~40px. Tap targets beat the 26-per-row half-year read.
- The popover becomes a **bottom sheet** under 560px. JS adds `.sheet` and clears the inline left/top so CSS owns placement. Tap outside or Close dismisses.
- Stats go 2-up with the fifth spanning the row. Was 5 stacked cards, 400px of scroll.
- `.now-frame.photo img` capped at 300px with `object-position:center 42%`.
- **Form inputs are 16px on phones.** Anything smaller makes iOS Safari zoom the whole page on focus.
- `@media (hover:none){.qk .art{opacity:1;filter:none}}` because the queue covers are dimmed-until-hover on desktop and would sit greyed out forever on a phone.
- Drawer goes full width and the cover un-floats so it clears the Close button.

## Traps that already cost time
1. **Inline `<span>` children get no `aspect-ratio`, `position` or `object-fit`.** Every `.bk`, `.bk-art`, `.bk-meta` and `.h52-strip .art` carries an explicit `display`. Cards rendering as overlapping text with no box is always this.
2. **Never put HTML inside an inline `onerror=""`.** The double quotes break the attribute and the fallback never renders. The fallback sits in the DOM behind the `<img>` and a failed image just does `onerror="this.remove()"`.
3. Cell tooltips were absolutely positioned and pushed scrollWidth to 421px on a 390px screen. Hover-only things are `visibility:hidden` until needed.
4. The JS state string is `planned`, so the class is `.cell.s-planned`. Writing `.s-plan` fails silently.
5. Amazon covers are `loading="lazy"`, so checking them before scrolling reports `naturalWidth:0`. Scroll the section in first.

## Still open
- Book 1 rating, report and takeaways. Only Ryder can supply these. The shelf card shows no score until he does.
- Page count for 100 Bible Principles.
- Confirm the two Hormozi short links map correctly (assumed Offers = 4d4ysVN, Leads = 4ipLlgs).
