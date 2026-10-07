/* Home: free guide opt-in. Same /api/guide contract as /build. */
(function () {
  'use strict';
  var sec = document.getElementById('guide');
  if (!sec) return;
  var T0 = Date.now();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fan = sec.querySelector('.g-fan');
  if (fan) {
    if (reduce || !('IntersectionObserver' in window)) fan.classList.add('is-open');
    else new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { fan.classList.add('is-open'); o.disconnect(); }
    }, { threshold: .35 }).observe(fan);
  }
  var card = sec.querySelector('.g-card');
  if (card && window.matchMedia('(pointer: fine)').matches) card.addEventListener('pointermove', function (e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty('--gx', ((e.clientX - r.left) / r.width - .5) * 60 + '%');
    card.style.setProperty('--gy', ((e.clientY - r.top) / r.height - .5) * 60 + '%');
  });

  var EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i;
  var f = sec.querySelector('form');
  var input = f.querySelector('input[type=email]');
  var note = f.querySelector('.g-note');
  var btn = f.querySelector('button');
  var base = note.textContent;
  function state(s, msg) {
    f.classList.remove('is-busy', 'is-err', 'is-done');
    if (s) { void f.offsetWidth; f.classList.add('is-' + s); }
    note.textContent = msg || base;
  }
  var FAIL = "Couldn't send it right now. DM me BUILD on Instagram @ryderschillingofficial.";
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
      body: JSON.stringify({ email: email, website: f.querySelector('.hp').value, source: 'home', t: Date.now() - T0 })
    }).then(function (r) {
      btn.disabled = false;
      if (r.ok) {
        state('done', "It's on the way to " + email + '. Not there in a few minutes? Check spam.');
        input.blur();
        try { sessionStorage.setItem('rs_guide_email', email); } catch (x) {}
        setTimeout(function () { location.href = '/build/thanks/?src=home'; }, reduce ? 300 : 1100);
        return;
      }
      state('err', r.status === 400 ? "That email doesn't look right. Try again?" : FAIL);
    }).catch(function () { btn.disabled = false; state('err', FAIL); });
  });
})();
