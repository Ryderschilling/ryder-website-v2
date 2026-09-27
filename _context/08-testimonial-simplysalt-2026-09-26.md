# Testimonial added: Tucker T., Simply Salt Delivery (2026-09-26)

Source: Tucker Tuebel by iMessage, 2026-09-24. He said "Feel free to trim or change
whatever you need to." On 09-25 he asked to be credited as "Tucker T." or the business
name. Use **Tucker T., Simply Salt Delivery**. Never his full last name.

## Full original, verbatim

> Ryder was great to work with! He was very thorough throughout the entire process and
> communicated extremely well from start to finish. Since I'm not local, I wasn't able to
> meet with Ryder in person, so it was especially important to me to find someone who
> communicated well, understood what I was looking for, and paid close attention to
> detail. Ryder made the whole process easy and made sure everything turned out the way I
> wanted. Overall, I had a great experience working with Ryder. I highly recommend him and
> look forward to working with him again on future projects!

## Trimmed version used on the site (index.html, index.md, llms-full.txt)

> Ryder was great to work with! He was very thorough throughout the entire process and
> communicated extremely well from start to finish. Since I'm not local, it was especially
> important to me to find someone who communicated well, understood what I was looking
> for, and paid close attention to detail. Ryder made the whole process easy. I highly
> recommend him.

## What changed

- `index.html`: new first slide in `#testiSwiper`, class `testi-card tc-long`.
- `css/style.css`: `.testi-card.tc-long > blockquote` 1.22vw desktop, 16px mobile.
- `assets/img/logo-simplysalt.png`: ink mark rendered from simplysalt `public/favicon.svg`
  (background rect stripped), 440x301, black on transparent like the other logo chips.
- `index.md` + `llms-full.txt`: quote line under the Fit Flour one.
- Stale "only two testimonials" comments in style.css and main.js reworded.
- Three cards no longer fit on desktop, so the swiper now drags and the segment dots show.

Verified in Playwright at 1470x860 and 390x844: no page errors, all three logos load.
Not committed: `.git/index.lock` was stale. Delete it, then commit from Cursor.
Leave `about/index.html` and `css/pages.css` out of that commit; those edits predate this.
