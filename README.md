# ryderschilling-v2

One-page personal site. Vanilla HTML/CSS/JS + GSAP + ScrollTrigger + Lenis + Swiper. No build step.

## Run it

```
cd "ryderschilling-v2"
node tools/dev-server.js
```

Open http://localhost:8080. Use this instead of `python3 -m http.server`, because the site
scanner needs `/api/scan` and only this server provides it locally. Needs Node 18+.

`python3 -m http.server 8080` still works for everything except the scanner.

## What's what

- `index.html` : all sections
- `css/style.css` : design system (colors, type, radii are CSS vars at the top)
- `js/main.js` : preloader, hero-to-sidebar scroll morph, reveals, work gallery, text fill, chat, swiper, FAQ, image trail, site scanner, lead form
- `api/scan.js` : Vercel serverless function, the real site scanner
- `api/_scan.js` : the scan logic. The underscore means Vercel does not expose it as its own endpoint. Shared with the dev server.
- `tools/dev-server.js` : static server + `/api/scan`, for local work
- `assets/img/portrait.webp` : cut-out hero photo
- Fonts are self-hosted (Archivo display, Instrument Sans text). Swap by editing the `@font-face` blocks + `--display` / `--text` vars.

## The site scanner

`/api/scan` fetches the visitor's homepage server-side and grades 14 real checks:
HTTPS, response time, page weight, render-blocking scripts, mobile viewport, title,
meta description, H1, canonical, structured data, social preview, favicon, image alt
text, contact paths. Score is weighted, 0-100.

It refuses private and loopback addresses, follows at most 4 redirects, times out at
9 seconds, and caps the response at 3MB.

**This only works once the site is on Vercel, or locally via `tools/dev-server.js`.**
On a plain static file server the request 404s and the UI tells the visitor to email instead.

## The lead form

`FORM_ACCESS_KEY` at the top of the lead-form block in `js/main.js` is empty, so
submitting opens the visitor's mail app with everything pre-filled, addressed to
ryderschilling@gmail.com. Zero setup, works anywhere.

To send silently in the background instead: get a free access key at web3forms.com
(enter the inbox address, they email you a key, no account needed) and paste it:

```js
var FORM_ACCESS_KEY = 'paste-key-here';
```

That is a stopgap. Move it to `/api/lead` with a real mail provider before this
takes any volume.

## Deploying

Vercel, framework preset "Other". Root directory is this folder. No build command.
`api/scan.js` is picked up as a serverless function automatically.

## Still placeholder

5 of the 7 testimonial slots, the journey card avatars, and the sidebar client logos.
