/* /build page: intro, dot field, 3D guide, rails, opt-in. No libraries. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var T0 = Date.now();
  var params = new URLSearchParams(location.search);
  var ref = (params.get('src') || params.get('utm_source') || '').replace(/[^\w-]/g, '').slice(0, 20);

  /* ---------- intro ---------- */
  var hero = document.querySelector('.hero');
  var stage = document.querySelector('.stage');
  function go() {
    document.body.classList.add('is-in');
    setTimeout(function () { stage && stage.classList.add('is-open'); }, reduce ? 0 : 650);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(go); });
  setTimeout(go, 1200); // never leave the page invisible

  /* ---------- reveals ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- pointer ---------- */
  var px = -9999, py = -9999, nx = 0, ny = 0, lastMove = 0;
  window.addEventListener('pointermove', function (e) {
    px = e.clientX; py = e.clientY; lastMove = performance.now();
    nx = e.clientX / innerWidth - .5; ny = e.clientY / innerHeight - .5;
  }, { passive: true });

  /* ---------- 3D guide tilt ---------- */
  var fan = document.querySelector('.fan');
  var rx = 10, ry = 0;
  function tilt() {
    if (!fan) return;
    var trx, try_;
    if (fine) { trx = 10 - ny * 14; try_ = nx * 22; }
    else {
      var r = stage.getBoundingClientRect();
      var p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      trx = 10 + p * 10; try_ = Math.sin(performance.now() / 2600) * 7;
    }
    rx += (trx - rx) * .08; ry += (try_ - ry) * .08;
    fan.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    fan.style.setProperty('--ry', ry.toFixed(2) + 'deg');
  }
  if (fan) fan.style.transition = 'none';

  /* ---------- dot field (a real background layer, behind everything) ---------- */
  var cv = document.querySelector('.field');
  var ctx = cv && cv.getContext('2d');
  var dots = [], W = 0, H = 0, DPR = 1, GAP = 26;
  function size() {
    if (!cv) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = hero.offsetWidth; H = hero.offsetHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    GAP = W < 600 ? 22 : 28;
    dots = [];
    for (var y = GAP / 2; y < H; y += GAP) for (var x = GAP / 2; x < W; x += GAP) dots.push(x, y);
  }
  var heroOn = true;
  new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }).observe(hero);
  function field(t) {
    if (!ctx || !heroOn) return;
    ctx.clearRect(0, 0, W, H);
    var r = hero.getBoundingClientRect();
    var idle = !fine || t - lastMove > 2500;
    var mx = idle ? W / 2 + Math.cos(t / 2100) * W * .32 : px - r.left;
    var my = idle ? H * .32 + Math.sin(t / 1700) * H * .16 : py - r.top;
    var R = W < 600 ? 120 : 190;
    for (var i = 0; i < dots.length; i += 2) {
      var dx = dots[i] - mx, dy = dots[i + 1] - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      var k = d < R ? 1 - d / R : 0;
      k = k * k;
      var rad = .9 + k * 2.6;
      ctx.fillStyle = 'rgba(11,10,8,' + (0.13 + k * .55).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(dots[i] - dx * k * .12, dots[i + 1] - dy * k * .12, rad, 0, 6.283);
      ctx.fill();
    }
  }

  /* ---------- rails ---------- */
  var rails = [].map.call(document.querySelectorAll('.rail'), function (rail) {
    var run = rail.querySelector('.rail-run');
    run.innerHTML += run.innerHTML; // two copies for a seamless loop
    [].forEach.call(run.children, function (a, i) {
      if (i >= run.children.length / 2) { a.setAttribute('aria-hidden', 'true'); a.tabIndex = -1; }
    });
    var o = { run: run, dir: +rail.dataset.dir || 1, x: 0, hover: false, half: 0, speed: 0 };
    rail.addEventListener('pointerenter', function () { o.hover = true; });
    rail.addEventListener('pointerleave', function () { o.hover = false; });
    return o;
  });
  function measure() { rails.forEach(function (o) { o.half = o.run.scrollWidth / 2; }); }
  var lastY = scrollY, boost = 0;
  function railStep() {
    var dy = scrollY - lastY; lastY = scrollY;
    boost += (Math.min(14, Math.abs(dy) * .25) - boost) * .1;
    rails.forEach(function (o) {
      var target = o.hover ? 0 : (0.55 + boost);
      o.speed += (target - o.speed) * .08;
      o.x -= o.speed * o.dir;
      if (o.half) { if (o.x <= -o.half) o.x += o.half; if (o.x > 0) o.x -= o.half; }
      o.run.style.transform = 'translate3d(' + o.x.toFixed(1) + 'px,0,0)';
    });
  }

  /* ---------- last card glow ---------- */
  var card = document.querySelector('.last-card');
  if (card && fine) card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty('--gx', ((e.clientX - r.left) / r.width - .5) * 60 + '%');
    card.style.setProperty('--gy', ((e.clientY - r.top) / r.height - .5) * 60 + '%');
  });

  /* ---------- loop ---------- */
  function loop(t) {
    if (!reduce) { tilt(); field(t); railStep(); }
    requestAnimationFrame(loop);
  }
  size(); measure();
  if (reduce) { field(0); }
  requestAnimationFrame(loop);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); measure(); if (reduce) field(0); }, 150); });
  window.addEventListener('load', measure);

  /* ---------- opt-in ---------- */
  var EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i;
  document.querySelectorAll('form.optin').forEach(function (f) {
    var input = f.querySelector('input[type=email]');
    var note = f.querySelector('.note');
    var btn = f.querySelector('button');
    var base = note.textContent;
    function state(s, msg) {
      f.classList.remove('is-busy', 'is-err', 'is-done');
      if (s) { void f.offsetWidth; f.classList.add('is-' + s); }
      note.textContent = msg || base;
    }
    input.addEventListener('input', function () { if (f.classList.contains('is-err')) state('', base); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.classList.contains('is-busy') || f.classList.contains('is-done')) return;
      var email = input.value.trim();
      if (!EMAIL.test(email)) { state('err', "That email doesn't look right. Try again?"); input.focus(); return; }
      state('busy', 'Sending...');
      btn.disabled = true;
      fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          website: f.querySelector('.hp').value,
          source: f.dataset.source + (ref ? '-' + ref : ''),
          t: Date.now() - T0
        })
      }).then(function (r) {
        btn.disabled = false;
        if (r.ok) {
          state('done', "It's on the way to " + email + '. Not there in a few minutes? Check spam.');
          input.blur();
          document.querySelectorAll('form.optin').forEach(function (o) {
            if (o !== f) { o.classList.add('is-done'); o.querySelector('.note').textContent = 'Already sent to ' + email + '.'; }
          });
          return;
        }
        if (r.status === 400) state('err', "That email doesn't look right. Try again?");
        else state('err', "Couldn't send it right now. DM me BUILD on Instagram @ryderschillingofficial.");
      }).catch(function () {
        btn.disabled = false;
        state('err', "Couldn't send it right now. DM me BUILD on Instagram @ryderschillingofficial.");
      });
    });
  });
})();
