(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var email = '';
  try { email = sessionStorage.getItem('rs_guide_email') || ''; } catch (e) {}

  if (email) {
    var s = document.getElementById('sentTo');
    s.textContent = '';
    s.appendChild(document.createTextNode('The guide is on the way to '));
    var b = document.createElement('b'); b.textContent = email; s.appendChild(b);
    s.appendChild(document.createTextNode('. It usually lands in under a minute.'));

    // one-tap "open your inbox" for the big providers
    var d = email.split('@')[1].toLowerCase();
    var q = encodeURIComponent('from:ryder@ryderschilling.com');
    var map = [
      [/^(gmail|googlemail)\.com$/, 'Gmail', 'https://mail.google.com/mail/u/0/#search/' + q],
      [/^(outlook|hotmail|live|msn)\.com$/, 'Outlook', 'https://outlook.live.com/mail/0/'],
      [/^(icloud|me|mac)\.com$/, 'iCloud Mail', 'https://www.icloud.com/mail/'],
      [/^(yahoo|ymail)\.com$/, 'Yahoo Mail', 'https://mail.yahoo.com/']
    ];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(d)) {
      document.getElementById('openMailName').textContent = map[i][1];
      document.getElementById('openMailLink').href = map[i][2];
      document.getElementById('openMail').hidden = false;
      break;
    }
  }

  function go() { document.body.classList.add('is-in'); }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(go); });
  setTimeout(go, 1000);

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // same dot field as /build, ambient only
  var hero = document.querySelector('.ty-hero'), cv = document.querySelector('.field'), ctx = cv.getContext('2d');
  var dots = [], W, H, GAP;
  function size() {
    var DPR = Math.min(2, window.devicePixelRatio || 1);
    W = hero.offsetWidth; H = hero.offsetHeight; cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); GAP = W < 600 ? 22 : 28; dots = [];
    for (var y = GAP / 2; y < H; y += GAP) for (var x = GAP / 2; x < W; x += GAP) dots.push(x, y);
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var mx = W / 2 + Math.cos(t / 2100) * W * .32, my = H * .28 + Math.sin(t / 1700) * H * .14, R = W < 600 ? 120 : 190;
    for (var i = 0; i < dots.length; i += 2) {
      var dx = dots[i] - mx, dy = dots[i + 1] - my, dd = Math.sqrt(dx * dx + dy * dy), k = dd < R ? 1 - dd / R : 0; k *= k;
      ctx.fillStyle = 'rgba(11,10,8,' + (0.13 + k * .5).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(dots[i], dots[i + 1], .9 + k * 2.4, 0, 6.283); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  size(); requestAnimationFrame(draw);
  window.addEventListener('resize', size);
})();
