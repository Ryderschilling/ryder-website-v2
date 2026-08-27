/* ============================================================
   RYDER(R) v2, interaction layer
   Lenis smooth scroll + GSAP ScrollTrigger + Swiper
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 991px)').matches;
  /* A finger, not a mouse. Separate from isMobile on purpose: isMobile is a
     LAYOUT question (<=991px), isTouch is an INPUT question. A small desktop
     window is isMobile but not isTouch; an iPad in landscape is the reverse. */
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var vw = function () { return window.innerWidth; };
  var vh = function () { return window.innerHeight; };

  gsap.registerPlugin(ScrollTrigger);
  if (reduced) document.documentElement.classList.add('no-motion');

  /* ⚠️ Phones and tablets fire a window resize every time the browser's
     address bar slides away, which is CONSTANTLY while you scroll. Left alone
     that resize triggers a full ScrollTrigger.refresh mid-swipe, the page
     hitches, and the scroll reads as "stuck". ignoreMobileResize makes
     ScrollTrigger ignore a height-only resize on touch devices. */
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ------------------------------------------------ Lenis --
     ⚠️ Lenis is DESKTOP ONLY, and that is deliberate.
     Even with syncTouch off (the default), Lenis binds touchstart/touchmove/
     touchend with { passive: false } on the window, and on every single
     touchmove it walks event.composedPath() looking for opt-out attributes.
     iOS cannot start its native scroll until that handler returns, so the
     first ~100ms of every swipe is dead and the momentum flick feels like it
     snags. Native touch scrolling is already smooth; there is nothing for
     Lenis to improve here, only latency to add. Desktop keeps the smooth
     wheel because a mouse wheel genuinely is steppy without it.
     lagSmoothing stays ON for touch: with it off, a dropped frame makes every
     scrubbed animation catch up in one giant jump, which reads as a glitch. */
  var lenis = null;
  if (!reduced && !isTouch) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* -------------------------------------- mobile menu ------ */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    var navClone = document.querySelector('.side-nav').cloneNode(true);
    navClone.classList.remove('side-card', 'side-nav');
    mobileMenu.appendChild(navClone);
    var mail = document.createElement('button');
    mail.className = 'm-mail';
    mail.type = 'button';
    mail.setAttribute('data-open-mail', '');
    mail.textContent = 'Email me';
    mobileMenu.appendChild(mail);
    var book = document.createElement('a');
    book.className = 'btn btn-accent';
    book.href = 'tel:+13094158793';
    book.textContent = 'Call Now';
    mobileMenu.appendChild(book);
    burger.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) document.body.classList.remove('menu-open');
    });
  }

  /* -------------------------------------- anchor scroll ----
     On phones a fixed top bar covers the first ~68px of the
     viewport, so an un-offset jump buries the section heading
     underneath it. Measure the bar instead of hard-coding. */
  function navOffset() {
    var bar = document.querySelector('.mobile-bar');
    if (!bar) return 0;
    if (getComputedStyle(bar).display === 'none') return 0;
    return -(bar.getBoundingClientRect().height + 14);
  }

  /* Lenis already honours CSS scroll-margin-top, so the smooth path
     needs no extra offset. The native fallback does not, so it gets
     the measured bar height instead. */
  function goTo(el, duration) {
    if (lenis && !reduced) { lenis.scrollTo(el, { offset: 0, duration: duration }); return; }
    var y = el.getBoundingClientRect().top + window.pageYOffset + navOffset();
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      goTo(el, 1.4);
    });
  });

  /* ------------------------------------------------ helpers  */
  function rect(el) { return el.getBoundingClientRect(); }
  function center(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ============================================================
     HERO: load intro + scroll morph into sidebar (desktop only)
     ============================================================ */
  var stage = document.querySelector('.hero-stage');
  var mark = document.querySelector('.brandmark');
  var markInner = document.querySelector('.brandmark-inner');
  var markReg = document.querySelector('.brandmark-reg');
  var portrait = document.querySelector('.portrait-img');
  var sidebar = document.getElementById('sidebar');

  if (!isMobile && !reduced && stage && sidebar) {
    document.body.classList.add('hero-live');

    /* ---------- intro: letters wake centered, then travel to the top ---------- */
    var introBits = [
      '.hero-navrow a', '.hero-title', '.hero-btns .btn', '.hero-corner'
    ];
    var letters = markInner.querySelectorAll('span');
    var yCenter = function () {
      var m = markInner.getBoundingClientRect();
      return Math.max(0, (vh() - m.height) / 2 - (mark.getBoundingClientRect().top - (gsap.getProperty(mark, 'y') || 0)));
    };
    gsap.set(mark, { y: yCenter(), opacity: 1, filter: 'blur(0px)' });
    gsap.set(letters, { opacity: 0, filter: 'blur(16px)', yPercent: 18, scale: 0.96, transformOrigin: '50% 100%' });
    gsap.set(markReg, { opacity: 0, scale: 0.4 });
    gsap.set(portrait, { opacity: 0, filter: 'blur(60px)', scale: 1.12 });
    introBits.forEach(function (s) { gsap.set(s, { opacity: 0, y: 26 }); });

    var intro = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: function () {
        document.body.classList.remove('is-loading');
        ScrollTrigger.refresh();
      }
    });
    intro
      .to(letters, { opacity: 1, filter: 'blur(0px)', yPercent: 0, scale: 1, duration: 0.95, stagger: 0.07 }, 0.25)
      .to(portrait, { opacity: 0.55, filter: 'blur(34px)', duration: 0.9, ease: 'power2.out' }, 0.45)
      .to(mark, { y: 0, duration: 1.15, ease: 'expo.inOut' }, 1.35)
      .to(portrait, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.2, ease: 'expo.inOut' }, 1.4)
      .to(markReg, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 2.35)
      .to('.hero-navrow a', { opacity: 1, y: 0, duration: 0.7, stagger: 0.045 }, 2.1)
      .to('.hero-title', { opacity: 1, y: 0, duration: 0.8 }, 2.2)
      .to('.hero-btns .btn', { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 }, 2.35)
      .to('.hero-corner', { opacity: 1, y: 0, duration: 0.6 }, 2.45);

    /* ---------- morph ----------
       The hero words do not fade out and get replaced by the sidebar. Each one
       flies to its pill, shrinks to the pill label's exact glyph size, and hands
       off to the real label at the moment it lands. Same place, same size, so it
       reads as the word becoming the nav. */
    var LEAD = 0.26;    /* first word leaves the hero          */
    var FLIGHT = 0.38;  /* time in the air                     */
    var GAP = 0.03;     /* stagger between words               */
    var HAND = 0.05;    /* crossfade window at the landing     */

    var flights = [];
    function buildFlights() {
      flights = [];
      document.querySelectorAll('.hero-navrow a').forEach(function (sp) {
        var pill = document.querySelector('.side-nav .nav-pill[data-slot="' + sp.getAttribute('data-fly') + '"]');
        if (pill && pill.querySelector('span')) {
          flights.push({ el: sp, to: pill.querySelector('span'), fit: 'font' });
        }
      });
      /* the CTA lands last, at the bottom of the sidebar */
      flights.push({ el: document.querySelector('.hero-book'), to: document.querySelector('[data-slot="book"]'), fit: 'h' });
      flights = flights.filter(function (f) { return f.el && f.to; });
    }
    buildFlights();

    /* read straight off the tokens so the flight stays in sync with the CSS */
    var rootCss = getComputedStyle(document.documentElement);
    var ACCENT = rootCss.getPropertyValue('--accent').trim() || '#14110D';
    var ACCENT_ON = rootCss.getPropertyValue('--accent-on').trim() || '#EDE7D8';

    function delta(f) {
      gsap.set(f.el, { x: 0, y: 0, scale: 1 });
      var a = rect(f.el), b = rect(f.to);
      var ca = center(a), cb = center(b);
      var s = 1;
      if (f.fit === 'h') {
        s = b.height / a.height;
      } else if (f.fit === 'font') {
        /* match the glyph size, not the box. The hero link carries padding and
           the pill label does not, so a box-width ratio lands it too small. */
        s = parseFloat(getComputedStyle(f.to).fontSize) /
            parseFloat(getComputedStyle(f.el).fontSize);
      }
      return { x: cb.x - ca.x, y: cb.y - ca.y, s: s };
    }

    /* the sidebar starts as an empty frame: cards and pill icons, no labels */
    var pillLabels = gsap.utils.toArray('.side-nav .nav-pill span');
    var sideChip = document.querySelector('.side-chip');
    var sideBook = document.querySelector('.side-book');
    var landables = pillLabels.concat([sideChip, sideBook]).filter(Boolean);
    gsap.set(sidebar, { opacity: 1, pointerEvents: 'none' });
    gsap.set('.side-card', { opacity: 0, x: -14 });
    gsap.set(landables, { opacity: 0 });

    var morph = gsap.timeline({
      scrollTrigger: {
        trigger: '.hero-space',
        start: 'top top',
        end: '+=' + Math.round(vh() * 1.15),
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          document.body.classList.toggle('hero-live', p < 0.9);
          stage.style.visibility = p >= 0.985 ? 'hidden' : 'visible';
          mark.style.visibility = p >= 0.985 ? 'hidden' : 'visible';
        }
      },
      defaults: { ease: 'none' }
    });

    /* brandmark shrinks into the sidebar chip */
    morph.add(function () {}, 0);
    morph.to(mark, {
      x: function () {
        gsap.set(mark, { x: 0, y: 0, scale: 1 });
        var chip = rect(document.querySelector('.side-chip'));
        var m = rect(markInner);
        return chip.left + 8 - m.left;
      },
      y: function () {
        gsap.set(mark, { x: 0, y: 0, scale: 1 });
        var chip = rect(document.querySelector('.side-chip'));
        var m = rect(markInner);
        return chip.top + 4 - m.top;
      },
      scale: function () {
        var chip = rect(document.querySelector('.side-chip'));
        var m = rect(markInner);
        return Math.max(0.028, (chip.width * 0.72) / m.width);
      },
      duration: 0.56,
      ease: 'power1.in'
    }, 0);
    /* brandmark hands off to the chip the instant it lands on it */
    morph.to(mark, { opacity: 0, duration: 0.05 }, 0.545);
    morph.to(sideChip, { opacity: 1, duration: 0.08 }, 0.555);
    morph.to(markReg, { opacity: 0, duration: 0.25 }, 0.15);

    /* the frame arrives before anything lands in it. .side-top comes in last,
       with the chip, because the shrinking brandmark passes over that corner
       and would otherwise disappear behind the card on its way down. */
    morph.to('.side-card:not(.side-top)', { opacity: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out' }, 0.16);
    morph.to('.side-top', { opacity: 1, x: 0, duration: 0.07, ease: 'power2.out' }, 0.525);

    /* portrait blurs away — a real photo needs to drop much further than the
       old flat illustration did, or a giant blurred face sits behind the copy */
    morph.to(portrait, { filter: 'blur(46px)', scale: 1.07, opacity: 0.14 }, 0);

    /* title + corners + about btn out */
    morph.to('.hero-title', { yPercent: -150, opacity: 0, duration: 0.55, ease: 'power1.in' }, 0);
    morph.to('.hero-corner', { opacity: 0, duration: 0.22 }, 0);
    morph.to('.hero-about', { opacity: 0, scale: 0.9, duration: 0.3 }, 0);
    /* it is invisible from here on but still an <a> on a layer above the page,
       so it would quietly eat clicks meant for the content behind it */
    morph.set('.hero-about', { pointerEvents: 'none' }, 0.05);

    /* flights: fly, shrink to label size, hand off on arrival */
    flights.forEach(function (f, i) {
      var d = { x: 0, y: 0, s: 1 };
      var start = LEAD + i * GAP;
      var land = start + FLIGHT;
      morph.to(f.el, {
        x: function () { d = delta(f); return d.x; },
        y: function () { return d.y; },
        scale: function () { return d.s; },
        duration: FLIGHT,
        ease: 'power1.inOut'
      }, start);
      /* once it is airborne it must not swallow clicks meant for the sidebar */
      morph.set(f.el, { pointerEvents: 'none' }, start);
      /* the CTA leaves the hero bone-on-black (it sits on his suit) and darkens
         on the way in, so it matches the sidebar button when it touches down */
      if (f.el.classList.contains('hero-book')) {
        morph.to(f.el, {
          backgroundColor: ACCENT, color: ACCENT_ON, duration: FLIGHT * 0.3
        }, start + FLIGHT * 0.02);
      }
      morph.to(f.el, { opacity: 0, duration: HAND }, land - HAND * 0.55);
      morph.to(f.to, { opacity: 1, duration: HAND * 1.5 }, land - HAND * 0.35);
    });

    morph.set(sidebar, { pointerEvents: 'auto' }, 0.9);
    /* pins the timeline length at 1 so the progress numbers below stay honest */
    morph.to({ end: 0 }, { end: 1, duration: 0.01 }, 0.99);

  } else {
    /* mobile / reduced motion: settled state, no morph */
    document.body.classList.remove('is-loading');
    if (stage) stage.style.display = 'none';
    if (mark && !isMobile) mark.style.display = 'none';
    if (sidebar && !isMobile) gsap.set(sidebar, { opacity: 1 });
    if (reduced && lenis) lenis.destroy();
  }

  /* ============================================================
     Sidebar states: active section + dark mode over work
     ============================================================ */
  /* id = the section, pill = which nav pill lights up for it */
  var sections = [
    { id: 'hero', pill: 'hero' },
    { id: 'work', pill: 'work' },
    { id: 'about', pill: 'about' },
    { id: 'watch', pill: 'about' },
    { id: 'scan', pill: 'work' },
    { id: 'overview', pill: 'overview' },
    { id: 'services', pill: 'services' },
    { id: 'testimonial', pill: 'testimonial' },
    { id: 'contact', pill: 'faq' },
    { id: 'faq', pill: 'faq' }
  ];
  sections.forEach(function (s) {
    var el = document.getElementById(s.id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: function (self) {
        if (!self.isActive) return;
        document.querySelectorAll('.nav-pill').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-nav') === s.pill);
        });
      }
    });
  });
  ScrollTrigger.create({
    trigger: '#work',
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: function (self) {
      document.body.classList.toggle('over-dark', self.isActive);
    }
  });

  /* ============================================================
     Generic reveals
     ============================================================ */
  /* IntersectionObserver, not ScrollTrigger. ScrollTrigger resolves
     'top 88%' against the document height, and on phones the last two
     sections resolved to a scroll position past the end of the page, so
     they never played and stayed at opacity 0 forever. An observer only
     cares whether the element is on screen, so it cannot get stranded. */
  if (!reduced) {
    var revealEls = gsap.utils.toArray('.reveal');
    gsap.set(revealEls, { y: 44, opacity: 0 });
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealIO.unobserve(entry.target);
        gsap.to(entry.target, {
          y: 0, opacity: 1, duration: 1.05, ease: 'expo.out',
          /* ⚠️ .reveal carries will-change:transform,opacity in the CSS, which
             pins every one of these ~38 elements to its own GPU layer FOREVER.
             On a phone that is a lot of layer memory held for an animation
             that runs once, and it starves the compositor during scroll.
             Hand the layer back the moment the reveal is done. */
          onComplete: function () {
            /* clearProps drops GSAP's inline transform so CSS :hover rules on
               .reveal elements still work; the inline will-change then beats
               the .reveal rule that clearProps just re-exposed. */
            gsap.set(entry.target, { clearProps: 'transform' });
            entry.target.style.willChange = 'auto';
          }
        });
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* ============================================================
     Statement band: the rule and the underline sweep once the band
     is on screen. Class-driven so the CSS owns the timing, and the
     no-motion path in the CSS already has them drawn.
     ============================================================ */
  var stBand = document.getElementById('statement');
  if (stBand) {
    if (reduced) {
      stBand.classList.add('is-in');
    } else {
      var stIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          stIO.unobserve(entry.target);
          entry.target.classList.add('is-in');
        });
      }, { rootMargin: '0px 0px -18% 0px', threshold: 0.01 });
      stIO.observe(stBand);
    }
  }

  /* ============================================================
     Timeline: draw the path, pop the dots
     ============================================================ */
  var tlSvg = document.querySelector('.tl-svg');
  if (tlSvg && !isMobile) {
    var path = tlSvg.querySelector('.tl-path');
    var L = path.getTotalLength();
    var maskId = 'tlMask';
    var ns = 'http://www.w3.org/2000/svg';
    var mask = document.createElementNS(ns, 'mask');
    mask.setAttribute('id', maskId);
    var mp = document.createElementNS(ns, 'path');
    mp.setAttribute('d', path.getAttribute('d'));
    mp.setAttribute('stroke', '#fff');
    mp.setAttribute('stroke-width', '14');
    mp.setAttribute('fill', 'none');
    mp.style.strokeDasharray = L;
    mp.style.strokeDashoffset = L;
    mask.appendChild(mp);
    tlSvg.insertBefore(mask, tlSvg.firstChild);
    path.setAttribute('mask', 'url(#' + maskId + ')');

    var dots = tlSvg.querySelectorAll('.tl-dots circle');
    gsap.set(dots, { transformOrigin: '50% 50%', scale: reduced ? 1 : 0 });

    if (!reduced) {
      gsap.to(mp.style, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 78%', scrub: 0.4 }
      });
      dots.forEach(function (d, i) {
        gsap.to(d, {
          scale: 1, duration: 0.4, ease: 'back.out(2.5)',
          scrollTrigger: { trigger: '.timeline', start: (8 + i * 15) + '% 70%', once: true }
        });
      });
    } else {
      mp.style.strokeDashoffset = 0;
    }
  }

  /* ============================================================
     Work: sticky horizontal scrub + drag + card dimming
     ============================================================ */
  var track = document.getElementById('workTrack');
  var workDrag = document.getElementById('workDrag');
  var cards = gsap.utils.toArray('.work-card');

  function dimCards() {
    cards.forEach(function (c) {
      var r = rect(c);
      var t = (vw() * 0.98 - r.left) / (vw() * 0.42);
      var o = Math.max(0.14, Math.min(1, t));
      c.style.opacity = o;
    });
  }

  /* the cards are browser windows: width follows from the available height so
     the shot stays a real 16:10 viewport at any window size */
  function sizeWorkCards() {
    if (!track || !workDrag || isMobile) return;
    var bar = track.querySelector('.wc-bar');
    var barH = bar ? bar.getBoundingClientRect().height : 0;
    var shotH = Math.max(120, workDrag.getBoundingClientRect().height - barH);
    track.style.setProperty('--wc-w', Math.round(shotH * 1.6) + 'px');
  }
  sizeWorkCards();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { sizeWorkCards(); ScrollTrigger.refresh(); });
  }

  /* ---- mobile swipe rails ----------------------------------------
     One controller for every horizontal rail on the page: keeps the
     "01 / 07" counter and the progress bar in step with the rail's own
     scrollLeft, and stops the arrow nudging once they have swiped.
     Desktop scrubs the work rail from page scroll and hides the hints,
     so the maths simply never shows up there. */
  function wireRail(scroller, itemSel, ids) {
    var bar = document.getElementById(ids.bar);
    var now = document.getElementById(ids.now);
    var total = document.getElementById(ids.total);
    var hint = document.getElementById(ids.hint);
    if (!scroller || !bar || !now) return;

    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var count = scroller.querySelectorAll(itemSel).length;
    if (!count) return;
    if (total) total.textContent = pad2(count);

    var sync = function () {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var pct = max > 0 ? scroller.scrollLeft / max : 0;
      bar.style.width = Math.max(100 / count, pct * 100) + '%';
      var step = scroller.scrollWidth / count;
      var idx = Math.min(count, Math.round(scroller.scrollLeft / step) + 1);
      now.textContent = pad2(idx);
      if (hint && scroller.scrollLeft > 12) hint.classList.add('is-moved');
    };
    /* ⚠️ sync() reads scrollWidth/clientWidth, which forces a synchronous
       layout. Firing it raw on every scroll and resize event means a forced
       layout in the middle of a swipe, which is exactly what makes a phone
       stutter. rAF-throttle it so it runs at most once a frame. */
    var queued = false;
    var syncSoon = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sync(); });
    };
    scroller.addEventListener('scroll', syncSoon, { passive: true });
    window.addEventListener('resize', syncSoon, { passive: true });
    sync();
  }

  wireRail(workDrag, '.work-card',
    { bar: 'railBar', now: 'railNow', total: 'railTotal', hint: 'railHint' });
  wireRail(document.getElementById('tierRail'), '.tier',
    { bar: 'tierBar', now: 'tierNow', total: 'tierTotal', hint: 'tierHint' });

  if (track && !isMobile && !reduced) {
    var workST = gsap.to(track, {
      x: function () {
        var left = workDrag.getBoundingClientRect().left;
        return -(track.scrollWidth + left - vw() + vw() * 0.014);
      },
      ease: 'none',
      scrollTrigger: {
        trigger: '#work',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        invalidateOnRefresh: true,
        onUpdate: dimCards
      }
    });
    dimCards();

    /* drag to scrub */
    var dragging = false, startX = 0, startScroll = 0;
    workDrag.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; startScroll = window.scrollY;
      workDrag.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var target = startScroll + (startX - e.clientX) * 2.1;
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else window.scrollTo(0, target);
    });
    window.addEventListener('pointerup', function () {
      dragging = false; workDrag.classList.remove('dragging');
    });
    workDrag.addEventListener('click', function (e) {
      if (Math.abs(startX - e.clientX) > 6) e.preventDefault();
    }, true);
  } else if (isMobile) {
    cards.forEach(function (c) { c.style.opacity = 1; });
  }

  /* ============================================================
     Scroll text fill (chars for the big paragraph, words for heads)
     ============================================================ */
  function splitChars(el) {
    var out = [];
    function walk(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (piece) {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.style.display = 'inline-block';
          w.style.whiteSpace = 'nowrap';
          piece.split('').forEach(function (chr) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.textContent = chr;
            w.appendChild(s);
            out.push(s);
          });
          frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && !node.classList.contains('inline-chip')) {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(walk);
    return out;
  }

  var fillText = document.getElementById('fillText');
  if (fillText) {
    var chs = splitChars(fillText);
    if (!reduced) {
      gsap.to(chs, {
        color: '#111110', ease: 'none', stagger: 0.6, duration: 3,
        scrollTrigger: { trigger: fillText, start: 'top 82%', end: 'top 22%', scrub: 0.3 }
      });
    } else {
      chs.forEach(function (c) { c.style.color = '#111110'; });
    }
  }

  /* ============================================================
     Inline chips: pop in on arrival, open a panel that says something
     ============================================================ */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.inline-chip[data-pop]'));
  if (chips.length) {
    var touch = window.matchMedia('(hover: none)').matches;

    /* keep the panel on screen no matter where the chip sits on the line */
    function place(chip) {
      var pop = chip.querySelector('.chip-pop');
      if (!pop) return;
      var cr = chip.getBoundingClientRect();
      var mid = cr.left + cr.width / 2;
      var half = pop.offsetWidth / 2;
      var pad = 14, shift = 0;
      if (mid - half < pad) shift = pad - (mid - half);
      else if (mid + half > window.innerWidth - pad) shift = (window.innerWidth - pad) - (mid + half);
      pop.style.setProperty('--pop-x', Math.round(shift) + 'px');
      /* if it would run off the bottom, open it upward instead */
      var gap = cr.height * 0.5 + 12;
      var below = window.innerHeight - cr.bottom - gap;
      var above = cr.top - gap;
      chip.classList.toggle('pop-up', below < pop.offsetHeight && above > below);
    }

    function close(chip) { chip.classList.remove('is-open'); }
    function closeAll(except) {
      chips.forEach(function (c) { if (c !== except) close(c); });
    }
    function open(chip) {
      closeAll(chip);
      chip.classList.add('is-open');
      place(chip);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('mouseenter', function () { place(chip); });
      chip.addEventListener('focus', function () { place(chip); });
      chip.addEventListener('blur', function () { close(chip); });

      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          if (chip.tagName !== 'A') { e.preventDefault(); chip.classList.contains('is-open') ? close(chip) : open(chip); }
        } else if (e.key === 'Escape') { close(chip); chip.blur(); }
      });
    });

    /* capture, because the site-wide anchor handler would otherwise fire first
       and scroll away on the very first tap */
    document.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.inline-chip[data-pop]') : null;
      if (!chip) { closeAll(null); return; }
      /* a chip with no panel is just a link, leave it alone */
      if (!chip.querySelector('.chip-pop')) { closeAll(null); return; }
      var isLink = chip.tagName === 'A';
      var isOpen = chip.classList.contains('is-open');
      if (touch && !isOpen) {
        /* first tap opens the panel and goes nowhere */
        e.preventDefault(); e.stopPropagation();
        open(chip);
        return;
      }
      if (!isLink) { e.preventDefault(); e.stopPropagation(); isOpen ? close(chip) : open(chip); return; }
      /* a link that is already open: let it through, but tidy up */
      close(chip);
    }, true);
    /* only a real width change should slam the panels shut. On a phone the
       address bar sliding away fires resize, and an open chip panel used to
       vanish the instant you nudged the page. */
    var chipW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === chipW) return;
      chipW = window.innerWidth;
      closeAll(null);
    }, { passive: true });

    /* keep the flip honest while the page moves under an open panel */
    /* only pay for this while a panel is actually open. place() reads
       getBoundingClientRect + offsetWidth, so running it on every scroll
       frame with nothing open was a forced layout for no reason. */
    var placing = false;
    window.addEventListener('scroll', function () {
      if (placing) return;
      var live = chips.filter(function (c) {
        return c.classList.contains('is-open') || (!isTouch && c.matches(':hover'));
      });
      if (!live.length) return;
      placing = true;
      requestAnimationFrame(function () {
        placing = false;
        live.forEach(place);
      });
    }, { passive: true });

    /* the entrance pop, once, when the paragraph gets here */
    if (!reduced && fillText) {
      chips.forEach(function (c) { c.classList.add('chip-armed'); });
      var chipIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          chipIO.disconnect();
          chips.forEach(function (c, i) {
            setTimeout(function () {
              c.classList.remove('chip-armed');
              c.classList.add('chip-in');
            }, 220 + i * 260);
          });
        });
      }, { rootMargin: '0px 0px -22% 0px', threshold: 0 });
      chipIO.observe(fillText);
    }
  }

  function wordFill(el, ghost) {
    var words = [];
    el.innerHTML = el.innerHTML.split('<br>').map(function (line) {
      return line.split(' ').filter(Boolean).map(function (w) {
        return '<span class="wf" style="color:' + ghost + '">' + w + '</span>';
      }).join(' ');
    }).join('<br>');
    words = el.querySelectorAll('.wf');
    if (!reduced) {
      gsap.to(words, {
        color: '#111110', ease: 'none', stagger: 0.5, duration: 2,
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 40%', scrub: 0.3 }
      });
    } else {
      words.forEach(function (w) { w.style.color = '#111110'; });
    }
  }
  var testiHead = document.getElementById('testiHead');
  var faqHead = document.getElementById('faqHead');
  if (testiHead) wordFill(testiHead, 'rgba(17,17,16,0.3)');
  if (faqHead) wordFill(faqHead, 'rgba(17,17,16,0.3)');

  /* ============================================================
     Chat sequence
     ============================================================ */
  var chat = document.getElementById('chat');
  if (chat) {
    if (reduced) { chat.classList.add('done'); }
    else {
      var rows = chat.querySelectorAll('.chat-row');
      gsap.set(rows, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: chat, start: 'top 78%', once: true,
        onEnter: function () {
          var t = gsap.timeline();
          t.to(rows[0], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' })
           .to(rows[1], { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' }, '+=0.35')
           .add(function () { chat.classList.add('done'); }, '+=1.1')
           .fromTo('#chatBtn', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
        }
      });
    }
  }

  /* ============================================================
     Testimonials swiper + segmented pagination
     ============================================================ */
  var swiperEl = document.getElementById('testiSwiper');
  if (swiperEl && window.Swiper) {
    var segWrap = document.getElementById('segPag');
    var slideCount = swiperEl.querySelectorAll('.swiper-slide').length;
    var sw = new Swiper(swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 14,
      speed: 500,
      grabCursor: true,
      freeMode: false
    });
    /* with only a couple of real testimonials everything fits on screen and
       there is nothing to slide, so the dots would be dead controls */
    var fits = function () { return sw.isBeginning && sw.isEnd; };
    var syncPag = function () {
      if (!segWrap) return;
      var dead = fits();
      segWrap.style.display = dead ? 'none' : '';
      swiperEl.classList.toggle('is-static', dead);
    };
    if (segWrap && !fits()) {
      for (var i = 0; i < slideCount; i++) {
        var b = document.createElement('button');
        b.className = 'seg' + (i === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        (function (idx) {
          b.addEventListener('click', function () { sw.slideTo(idx); });
        })(i);
        segWrap.appendChild(b);
      }
      sw.on('activeIndexChange', function () {
        segWrap.querySelectorAll('.seg').forEach(function (s, j) {
          s.classList.toggle('is-active', j === sw.activeIndex);
        });
      });
    }
    syncPag();
    sw.on('resize', syncPag);
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var toggle = item.querySelector('.faq-toggle');
    var answer = item.querySelector('.faq-answer');
    toggle.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      if (reduced) { answer.style.height = open ? 'auto' : '0px'; return; }
      gsap.to(answer, { height: open ? 'auto' : 0, duration: 0.45, ease: 'power3.inOut' });
    });
  });

  /* ============================================================
     Email anywhere on the page opens the form, not a mail client
     ============================================================ */
  function openLeadForm() {
    var section = document.getElementById('contact');
    var form = document.getElementById('leadForm');
    if (!section) return;
    goTo(section, 1.2);
    setTimeout(function () {
      var name = document.getElementById('lfName');
      if (name) name.focus({ preventScroll: true });
      if (form) {
        form.classList.add('is-called');
        setTimeout(function () { form.classList.remove('is-called'); }, 1500);
      }
    }, reduced ? 60 : 1150);
  }
  document.querySelectorAll('#openMail, [data-open-mail]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openLeadForm(); });
  });

  /* ============================================================
     Giant mark image trail
     ============================================================ */
  var giant = document.getElementById('giantMark');
  if (giant && !reduced) {
    var svg = giant.querySelector('svg');
    var group = document.getElementById('trailGroup');
    var nsvg = 'http://www.w3.org/2000/svg';
    var trailN = 6, ti = 0, lastX = -999, lastY = -999, live = 0;

    svg.addEventListener('mousemove', function (e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var ctm = svg.getScreenCTM();
      if (!ctm) return;
      var p = pt.matrixTransform(ctm.inverse());
      var dx = p.x - lastX, dy = p.y - lastY;
      if (dx * dx + dy * dy < 5200) return;
      lastX = p.x; lastY = p.y;
      if (live > 14) return;
      ti = (ti % trailN) + 1;
      var img = document.createElementNS(nsvg, 'image');
      img.setAttribute('href', 'assets/img/trail-' + ti + '.jpg');
      var w = 190, h = 232;
      img.setAttribute('x', p.x - w / 2);
      img.setAttribute('y', p.y - h / 2);
      img.setAttribute('width', w);
      img.setAttribute('height', h);
      img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      group.appendChild(img);
      live++;
      gsap.fromTo(img, { opacity: 0, scale: 0.55, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, duration: 0.28, ease: 'power2.out' });
      gsap.to(img, {
        opacity: 0, scale: 0.8, y: 26, duration: 0.55, delay: 0.5, ease: 'power2.in',
        onComplete: function () { group.removeChild(img); live--; }
      });
    });
  }

  /* ============================================================
     Site scan: posts to /api/scan, which really fetches the page
     ============================================================ */
  var scanForm = document.getElementById('scanForm');
  if (scanForm) {
    var scanInput = document.getElementById('scanUrl');
    var scanBtn = document.getElementById('scanBtn');
    var scanHint = document.getElementById('scanHint');
    var scanResult = document.getElementById('scanResult');
    var dialFg = document.getElementById('dialFg');
    var DIAL_LEN = 2 * Math.PI * 52;
    var scannedUrl = '';
    var HINT_DEFAULT = scanHint.textContent;

    var ICONS = {
      pass: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
      warn: '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/></svg>',
      fail: '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>'
    };

    var esc = function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    var setHint = function (msg, isError) {
      scanHint.textContent = msg;
      scanHint.classList.toggle('is-error', !!isError);
    };

    var busy = function (on) {
      scanBtn.disabled = on;
      scanBtn.classList.toggle('is-busy', on);
      scanBtn.querySelector('.scan-go-text').textContent = on ? 'Scanning' : 'Scan My Site';
    };

    /* ---- lead gate -------------------------------------------
       Nobody gets the whole report for free. A healthy site (80+)
       sees only the number and the one-line verdict. A site with
       real problems also sees its three worst, because that is the
       hook. Everything else is behind a name and an email.
       Once they hand it over the unlock sticks for the session, so
       a second scan is not a second wall. */
    var GATE_AT = 80;
    var unlocked = false;
    var lastScan = null;

    var checkHtml = function (c) {
      return '<div class="check s-' + c.state + '">' +
        '<span class="check-ico">' + ICONS[c.state] + '</span>' +
        '<div class="check-body">' +
          '<span class="check-group">' + esc(c.group) + '</span>' +
          '<h4>' + esc(c.label) + '</h4>' +
          '<p>' + esc(c.detail) + '</p>' +
        '</div></div>';
    };

    /* worst first: anything actively costing them, then the warnings */
    var worstFirst = function (checks) {
      var rank = { fail: 0, warn: 1, pass: 2 };
      return checks.slice().sort(function (a, b) { return rank[a.state] - rank[b.state]; });
    };

    var paint = function (data, showAll) {
      var tally = document.getElementById('scoreTally');
      var checksEl = document.getElementById('scanChecks');
      var gate = document.getElementById('scanGate');
      var locked = document.getElementById('gateLocked');
      var strip = document.getElementById('scanStrip');
      var healthy = data.score >= GATE_AT;

      if (showAll) {
        tally.hidden = false;
        checksEl.innerHTML = data.checks.map(checkHtml).join('');
        gate.hidden = true;
        strip.hidden = false;
        return;
      }

      /* healthy site: the number and the verdict, nothing itemised */
      var preview = healthy ? [] : worstFirst(data.checks).filter(function (c) {
        return c.state !== 'pass';
      }).slice(0, 3);

      tally.hidden = healthy;
      checksEl.innerHTML = preview.map(checkHtml).join('');
      strip.hidden = true;

      var hidden = data.checks.length - preview.length;
      locked.hidden = hidden < 1;
      document.getElementById('gateLockedText').textContent =
        hidden + (hidden === 1 ? ' more check' : ' more checks') + ' on this page, plus what I would fix first';

      document.getElementById('gateHead').textContent = healthy
        ? 'Solid score. Here is what is still leaking.'
        : 'That is ' + preview.length + ' of ' + data.checks.length + '. Want the rest?';
      document.getElementById('gateLine').textContent = healthy
        ? 'A ' + data.score + ' means the basics are right, so the wins left are the ones your competitors have not found either. Tell me where to send them.'
        : 'The full list plus what I would fix first, in plain English, in the order that matters. Opens right here.';

      gate.hidden = false;
    };

    var render = function (data) {
      scannedUrl = data.finalUrl || data.url;
      lastScan = data;
      var host = scannedUrl;
      try { host = new URL(scannedUrl).host; } catch (e) { /* keep raw */ }
      lastScan.host = host;

      scanResult.classList.toggle('is-low', data.score < 75 && data.score >= 55);
      scanResult.classList.toggle('is-bad', data.score < 55);

      document.getElementById('scoreGrade').textContent = data.grade;
      document.getElementById('scoreSite').textContent = host;
      document.getElementById('scoreLine').textContent = data.summary;
      document.getElementById('scoreTally').innerHTML =
        '<span class="tally t-pass">' + data.counts.pass + ' passing</span>' +
        '<span class="tally t-warn">' + data.counts.warn + ' worth a look</span>' +
        '<span class="tally t-fail">' + data.counts.fail + ' costing you</span>';

      paint(data, unlocked);

      scanResult.hidden = false;

      /* count the number up and sweep the dial */
      var numEl = document.getElementById('scoreNum');
      dialFg.style.strokeDasharray = DIAL_LEN;
      dialFg.style.strokeDashoffset = DIAL_LEN;
      if (reduced) {
        numEl.textContent = data.score;
        dialFg.style.transition = 'none';
        dialFg.style.strokeDashoffset = DIAL_LEN * (1 - data.score / 100);
      } else {
        requestAnimationFrame(function () {
          dialFg.style.strokeDashoffset = DIAL_LEN * (1 - data.score / 100);
        });
        gsap.fromTo(numEl, { textContent: 0 }, {
          textContent: data.score, duration: 1.1, ease: 'power2.out',
          snap: { textContent: 1 }
        });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };

    scanForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = scanInput.value.trim();
      if (!raw) { setHint('Type your website address first.', true); scanInput.focus(); return; }

      busy(true);
      setHint('Fetching your page and running the checks.', false);

      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw })
      }).then(function (r) {
        return r.json().then(function (body) { return { status: r.status, body: body }; });
      }).then(function (out) {
        busy(false);
        if (out.body && out.body.ok) {
          setHint(HINT_DEFAULT, false);
          render(out.body);
        } else {
          setHint((out.body && out.body.error) || 'That scan did not go through.', true);
        }
      }).catch(function () {
        busy(false);
        setHint('The scanner is not running here. It needs the site deployed on Vercel, or run it locally with: node tools/dev-server.js', true);
      });
    });

    /* ---- gate submit: unlock the page AND send Ryder the lead ----
       FORM_ENDPOINT / INBOX are declared further down in this same
       scope. This handler only ever runs on a click, long after that
       assignment, so referencing them here is safe. */
    var gateForm = document.getElementById('gateForm');
    if (gateForm) {
      var gateBtn = document.getElementById('gateBtn');
      var gateStatus = document.getElementById('gateStatus');

      var gateSay = function (msg, kind) {
        gateStatus.textContent = msg || '';
        gateStatus.classList.toggle('is-error', kind === 'error');
        gateStatus.classList.toggle('is-done', kind === 'done');
      };

      var gateBusy = function (on) {
        gateBtn.disabled = on;
        gateBtn.classList.toggle('is-busy', on);
        gateBtn.querySelector('.gate-go-text').textContent = on ? 'Unlocking' : 'Unlock My Full Report';
      };

      var openReport = function () {
        unlocked = true;
        if (lastScan) paint(lastScan, true);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      };

      gateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (document.getElementById('gateHp').value) { openReport(); return; }

        var nameEl = document.getElementById('gateName');
        var mailEl = document.getElementById('gateEmail');
        var name = nameEl.value.trim();
        var email = mailEl.value.trim();

        gateForm.querySelectorAll('.gate-field').forEach(function (f) { f.classList.remove('is-invalid'); });
        if (!name) {
          nameEl.closest('.gate-field').classList.add('is-invalid'); nameEl.focus();
          gateSay('Put a name in so I know who I am talking to.', 'error'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          mailEl.closest('.gate-field').classList.add('is-invalid'); mailEl.focus();
          gateSay('That email address does not look right.', 'error'); return;
        }

        var d = lastScan || {};
        var flagged = (d.checks || []).filter(function (c) { return c.state !== 'pass'; })
          .map(function (c) { return c.label + ' (' + c.state + ')'; }).join(', ');

        var payload = {
          _subject: 'Site scan: ' + (d.host || 'a site') + ' scored ' + (d.score == null ? '?' : d.score),
          _template: 'table',
          _captcha: 'false',
          name: name,
          email: email,
          site: d.host || scannedUrl || '(unknown)',
          score: (d.score == null ? '?' : d.score) + '/100 (' + (d.grade || '') + ')',
          issues: flagged || 'none flagged'
        };

        gateBusy(true);
        gateSay('Unlocking.', null);
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); }).then(function () {
          gateBusy(false);
          gateSay('');
          openReport();
        }).catch(function () {
          /* their report is the deal: never hold it hostage to my inbox */
          gateBusy(false);
          gateSay('');
          openReport();
        });
      });
    }

    /* carry the scanned URL into the lead form */
    var scanToContact = document.getElementById('scanToContact');
    if (scanToContact) {
      scanToContact.addEventListener('click', function () {
        var proj = document.getElementById('lfProject');
        if (proj && scannedUrl && !proj.value.trim()) {
          proj.value = 'I scanned ' + scannedUrl + ' on your site' +
            (lastScan && lastScan.score != null ? ' and got ' + lastScan.score + '/100' : '') +
            '. Send me the fix list.';
        }
      });
    }
  }

  /* ============================================================
     Lead form
     ============================================================ */
  /* Submissions post straight to the inbox in the background, no mail client.
     FormSubmit needs no key: the FIRST submission triggers a one-time
     confirmation email you have to click, then every one after it just lands.
     Paste a free web3forms.com key below and it uses that instead. */
  var FORM_ACCESS_KEY = '';
  /* assembled at runtime so the address is not sitting in the source as a
     plain string for scrapers. Not encryption, just not gift-wrapped. */
  var INBOX = ['ryderschilling', '@', 'gmail', '.', 'com'].join('');
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + INBOX;

  var leadForm = document.getElementById('leadForm');
  if (leadForm) {
    var leadBtn = document.getElementById('leadBtn');
    var leadStatus = document.getElementById('leadStatus');

    var say = function (msg, kind) {
      leadStatus.textContent = msg;
      leadStatus.classList.toggle('is-error', kind === 'error');
      leadStatus.classList.toggle('is-done', kind === 'done');
    };

    var leadBusy = function (on) {
      leadBtn.disabled = on;
      leadBtn.classList.toggle('is-busy', on);
      leadBtn.querySelector('.lead-go-text').textContent = on ? 'Sending' : 'Send It';
    };

    /* only if the send genuinely fails: hand it to their mail client so the
       message they just typed is not lost */
    function fallbackToMail(name, body) {
      say("Couldn't send from here. Opening your email app with it filled in.", 'error');
      window.location.href = 'mailto:' + INBOX +
        '?subject=' + encodeURIComponent('Website enquiry from ' + name) +
        '&body=' + encodeURIComponent(body);
    }

    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      /* bots fill the hidden field, people never see it */
      if (leadForm.querySelector('.hp-field').value) { say('Thanks, sent.', 'done'); return; }

      var vals = {
        name: document.getElementById('lfName').value.trim(),
        email: document.getElementById('lfEmail').value.trim(),
        business: document.getElementById('lfBiz').value.trim(),
        project: document.getElementById('lfProject').value.trim()
      };

      var bad = null;
      leadForm.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-invalid'); });
      if (!vals.name) bad = 'lfName';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(vals.email)) bad = 'lfEmail';
      else if (!vals.project) bad = 'lfProject';
      if (bad) {
        var el = document.getElementById(bad);
        el.closest('.field').classList.add('is-invalid');
        el.focus();
        say(bad === 'lfEmail' ? 'That email address does not look right.' : 'Fill this one in and I can actually reply.', 'error');
        return;
      }

      var body =
        'Name: ' + vals.name + '\n' +
        'Email: ' + vals.email + '\n' +
        'Business: ' + (vals.business || '(not given)') + '\n\n' +
        vals.project;

      var url, payload;
      if (FORM_ACCESS_KEY) {
        url = 'https://api.web3forms.com/submit';
        payload = {
          access_key: FORM_ACCESS_KEY,
          subject: 'Website enquiry from ' + vals.name,
          from_name: 'ryderschilling.com',
          replyto: vals.email,
          name: vals.name, email: vals.email,
          business: vals.business, project: vals.project
        };
      } else {
        url = FORM_ENDPOINT;
        payload = {
          _subject: 'Website enquiry from ' + vals.name,
          _template: 'table',
          _captcha: 'false',
          name: vals.name, email: vals.email,
          business: vals.business || '(not given)',
          project: vals.project
        };
      }

      leadBusy(true);
      say('Sending.', null);
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (out) {
        leadBusy(false);
        var ok = out && (out.success === true || out.success === 'true');
        if (ok) {
          leadForm.reset();
          say("Got it. I'll reply within a day, usually sooner.", 'done');
        } else {
          fallbackToMail(vals.name, body);
        }
      }).catch(function () {
        leadBusy(false);
        fallbackToMail(vals.name, body);
      });
    });
  }

  /* ============================================================
     Refresh on resize (targets recompute via function values)
     ============================================================ */
  /* ⚠️ On a phone the address bar collapsing mid-scroll fires resize, so a
     naive handler runs a full ScrollTrigger.refresh() while your finger is
     still on the glass. Only the WIDTH changing is a real layout change worth
     refreshing for; a height-only resize on touch is just browser chrome. */
  var rT, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    var w = window.innerWidth;
    if (isTouch && w === lastW) return;
    lastW = w;
    clearTimeout(rT);
    rT = setTimeout(function () { sizeWorkCards(); ScrollTrigger.refresh(); }, 250);
  }, { passive: true });

  if (isMobile || reduced) document.body.classList.remove('is-loading');
})();

/* ============================================================
   WATCH: the video section
   Self-hosted vertical clip. It loads nothing until the section is
   near the screen, plays muted while it is in view, pauses when it
   leaves, and only pulls the big file on wide screens.
   ============================================================ */
(function () {
  var phone = document.getElementById('watchPhone');
  var video = document.getElementById('watchVideo');
  if (!phone || !video) return;

  var playBtn = document.getElementById('watchPlay');
  var soundBtn = document.getElementById('watchSound');
  var soundTxt = soundBtn ? soundBtn.querySelector('.phone-sound-txt') : null;
  var bar = document.getElementById('watchBar');
  var timeEl = document.getElementById('watchTime');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loaded = false;
  var userPaused = false;

  /* ⚠️ The <source> child is the no-JS fallback and is the small file.
     Setting video.src wins over any child <source>, so this is where the
     desktop upgrade happens, once, before the first byte is fetched. */
  function load() {
    if (loaded) return;
    loaded = true;
    var big = window.innerWidth >= 700;
    var src = big ? video.getAttribute('data-hi') : video.getAttribute('data-lo');
    if (src) { video.setAttribute('src', src); video.load(); }
  }

  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function tryPlay() {
    load();
    var p = video.play();
    if (p && p.catch) p.catch(function () { phone.classList.remove('is-playing'); });
  }

  video.addEventListener('play', function () { phone.classList.add('is-playing'); });
  video.addEventListener('pause', function () { phone.classList.remove('is-playing'); });
  video.addEventListener('loadedmetadata', function () {
    if (timeEl) timeEl.textContent = fmt(video.duration);
  });
  video.addEventListener('timeupdate', function () {
    if (bar && video.duration) bar.style.width = (video.currentTime / video.duration * 100) + '%';
    if (timeEl && video.duration) timeEl.textContent = fmt(video.duration - video.currentTime);
  });

  /* play only while it is actually on screen */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          load();
          if (!reduced && !userPaused) tryPlay();
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.45 });
    io.observe(phone);
  } else {
    load();
  }

  /* tapping the screen toggles playback */
  phone.addEventListener('click', function (e) {
    if (e.target.closest('.phone-sound')) return;
    if (video.paused) { userPaused = false; tryPlay(); }
    else { userPaused = true; video.pause(); }
  });

  if (playBtn) {
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); phone.click(); });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      video.muted = !video.muted;
      soundBtn.classList.toggle('is-on', !video.muted);
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      soundBtn.setAttribute('aria-label', video.muted ? 'Turn the sound on' : 'Turn the sound off');
      if (soundTxt) soundTxt.textContent = video.muted ? 'Tap for sound' : 'Sound on';
      /* unmuting is a real user gesture, so this is the one moment the
         browser will let an audible play through */
      if (!video.muted && video.paused) { userPaused = false; tryPlay(); }
    });
  }

  /* the sidebar inverts over dark sections, same as it does over the work rail */
  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#watch',
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (self) { document.body.classList.toggle('over-dark', self.isActive); }
    });
  }
})();
