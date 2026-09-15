/* ==================================================================
   52 BOOKS . renderer
   Reads /assets/books.js and paints the page. Never edit this file to
   add a book. Edit /assets/books.js.
   ================================================================== */
(function () {
  "use strict";

  var CFG = window.BOOKS_CONFIG || {};
  var ALL = (window.BOOKS || []).slice();
  var QUEUE = window.BOOKS_QUEUE || [];
  var GOAL = CFG.goal || 52;

  /* ---------- helpers ------------------------------------------- */
  function d(s) { if (!s) return null; var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function days(a, b) { return Math.round((b - a) / 86400000); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function amz(asin) { return "https://m.media-amazon.com/images/P/" + asin + ".01._SCLZZZZZZZ_.jpg"; }
  function cover(b) { return b.cover || (b.asin ? amz(b.asin) : ""); }
  function rate(r) { return (Math.round(r * 10) / 10).toString(); }
  function monthDay(s) {
    var x = d(s); if (!x) return "";
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][x.getMonth()] + " " + x.getDate();
  }
  function artHTML(b) {
    var src = cover(b);
    var fb = '<span class="bk-fallback"><span class="ft">' + esc(b.title) + '</span><span class="fa">' + esc(b.author || "") + "</span></span>";
    return fb + (src ? '<img src="' + esc(src) + '" alt="' + esc(b.title) + ' cover" loading="lazy" onerror="this.remove()">' : "");
  }

  var DONE = ALL.filter(function (b) { return b.status === "done"; });
  var NOW = ALL.filter(function (b) { return b.status === "reading"; })[0] || null;
  var RATED = DONE.filter(function (b) { return b.rating > 0; });

  var START = d(CFG.startDate) || new Date();
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  var elapsed = days(START, TODAY);
  var started = elapsed >= 0;
  var week = started ? Math.min(GOAL, Math.floor(elapsed / 7) + 1) : 0;
  var daysLeft = Math.max(0, days(TODAY, d(CFG.endDate) || TODAY));
  var pagesRead = DONE.reduce(function (t, b) { return t + (b.pages || 0); }, 0);
  var avg = RATED.length ? RATED.reduce(function (t, b) { return t + b.rating; }, 0) / RATED.length : 0;
  var pace = DONE.length - (started ? week - 1 : 0);

  /* ---------- 52 cell tracker ----------------------------------- */
  var cells = document.getElementById("cells");
  if (cells) {
    var html = "";
    for (var i = 1; i <= GOAL; i++) {
      var bk = ALL.filter(function (b) { return b.n === i; })[0];
      var cls = "cell";
      var tip = "Week " + pad(i);
      if (bk && bk.status === "done") { cls += " done"; tip = pad(i) + " . " + bk.title; }
      else if (bk && bk.status === "reading") { cls += " now"; tip = "Reading now . " + bk.title; }
      html += '<div class="' + cls + '" data-cell="' + i + '"><span class="tip">' + esc(tip) + "</span></div>";
    }
    cells.innerHTML = html;
    cells.addEventListener("click", function (e) {
      var c = e.target.closest(".cell.done"); if (!c) return;
      var b = ALL.filter(function (x) { return x.n === +c.getAttribute("data-cell"); })[0];
      if (b) openDrawer(b);
    });
  }

  /* ---------- stats --------------------------------------------- */
  function set(id, v) { var el = document.getElementById(id); if (el) el.innerHTML = v; }
  set("st-read", DONE.length + '<small> / ' + GOAL + "</small>");
  set("st-week", started ? pad(week) + '<small> / ' + GOAL + "</small>" : "SOON");
  set("st-pages", pagesRead ? pagesRead.toLocaleString() : "0");
  // no rated books yet means no average, not a zero. Never show a score nobody gave.
  set("st-avg", RATED.length ? rate(avg) + "<small> / 10</small>" : "Pending");
  set("st-pace", !started ? "0" : (pace > 0 ? "+" + pace : "" + pace));
  var paceEl = document.getElementById("st-pace");
  if (paceEl && paceEl.parentElement) paceEl.parentElement.classList.add(pace >= 0 ? "pace-up" : "pace-down");
  var tr = document.getElementById("tracker-v");
  if (tr) tr.textContent = started ? (DONE.length + " of " + GOAL + " done") : ("Starts " + monthDay(CFG.startDate));

  /* ---------- currently reading --------------------------------- */
  var nowWrap = document.getElementById("now-wrap");
  if (nowWrap && !started && NOW) {
    var toGo = Math.abs(elapsed);
    var pl = NOW.photo || cover(NOW);
    nowWrap.innerHTML =
      '<div class="prelaunch">' +
        '<div class="now-frame' + (NOW.photo ? " photo" : "") + ' "><span class="badge">Book one</span>' +
          (pl ? '<img src="' + esc(pl) + '" alt="' + esc(NOW.title) + '">' : "") +
        "</div>" +
        '<div>' +
          '<p class="now-wk">Day one is ' + monthDay(CFG.startDate) + "</p>" +
          '<h3 class="now-ttl">' + esc(NOW.title) + "</h3>" +
          (NOW.subtitle ? '<p class="now-sub">' + esc(NOW.subtitle) + "</p>" : "") +
          '<p class="now-by">' + esc(NOW.author) + "</p>" +
          '<p class="cd"><b>' + toGo + "</b> days out</p>" +
          '<p style="color:var(--ink-2);margin-top:18px;max-width:42ch;line-height:1.8">Book one is already on the desk. The clock starts ' + monthDay(CFG.startDate) + ", and every week after that a book lands on this page with a number beside it.</p>" +
          '<div class="btns">' +
            (NOW.buy ? '<a class="btn btn-solid" href="' + esc(NOW.buy) + '" target="_blank" rel="noopener sponsored"><span>Start it with me</span><span class="arw">&rarr;</span></a>' : "") +
            '<a class="btn btn-ghost" href="#join"><span>Join the challenge</span></a>' +
          "</div>" +
        "</div>" +
      "</div>";
  } else if (nowWrap) {
    if (!NOW) {
      nowWrap.innerHTML = '<div class="shelf-empty"><p class="t">Between books.</p><p>Next one goes up the day I crack it open. Follow along on Instagram to see it first.</p></div>';
    } else {
      var since = NOW.started ? Math.max(1, days(d(NOW.started), TODAY) + 1) : 1;
      var pct = Math.max(6, Math.min(100, Math.round((since / 7) * 100)));
      var frameImg = NOW.photo || cover(NOW);
      var isPhoto = !!NOW.photo;
      nowWrap.innerHTML =
        '<div class="now-grid">' +
          '<div class="now-frame' + (isPhoto ? " photo" : "") + '"><span class="badge">Reading now</span>' +
            (frameImg ? '<img src="' + esc(frameImg) + '" alt="' + esc(NOW.title) + '">' : "") +
          "</div>" +
          '<div>' +
            '<p class="now-wk">Book ' + pad(NOW.n) + " of " + GOAL + (NOW.started ? " . started " + monthDay(NOW.started) : "") + "</p>" +
            '<h3 class="now-ttl">' + esc(NOW.title) + "</h3>" +
            (NOW.subtitle ? '<p class="now-sub">' + esc(NOW.subtitle) + "</p>" : "") +
            '<p class="now-by">' + esc(NOW.author) + "</p>" +
            '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
            '<div class="now-meta">' +
              '<div><p class="k">Day</p><p class="v">' + since + (since <= 7 ? " of 7" : "") + "</p></div>" +
              (NOW.pages ? '<div><p class="k">Pages</p><p class="v">' + NOW.pages + "</p></div>" : "") +
              '<div><p class="k">Verdict</p><p class="v">' + (NOW.rating ? rate(NOW.rating) + " / 10" : "Pending") + "</p></div>" +
            "</div>" +
            '<div class="btns">' +
              (NOW.buy ? '<a class="btn btn-solid" href="' + esc(NOW.buy) + '" target="_blank" rel="noopener sponsored"><span>Read it with me</span><span class="arw">&rarr;</span></a>' : "") +
              '<a class="btn btn-ghost" href="#join"><span>Join the challenge</span></a>' +
            "</div>" +
          "</div>" +
        "</div>";
    }
  }

  /* ---------- the shelf ----------------------------------------- */
  var shelf = document.getElementById("shelf");
  var filterBar = document.getElementById("filters");
  var activeFilter = "all";

  function cardHTML(b) {
    return '<button class="bk" data-n="' + b.n + '" type="button">' +
      '<span class="bk-art">' +
        '<span class="bk-num">' + pad(b.n) + "</span>" +
        (b.rating ? '<span class="bk-rate">' + rate(b.rating) + "<small> / 10</small></span>" : "") +
        artHTML(b) +
      "</span>" +
      '<span class="bk-meta">' +
        '<span class="t">' + esc(b.title) + "</span>" +
        '<span class="a">' + esc(b.author) + "</span>" +
        (b.verdict ? '<span class="v">' + esc(b.verdict) + "</span>" : "") +
      "</span>" +
    "</button>";
  }

  function paint() {
    if (!shelf) return;
    var list = DONE.slice().sort(function (a, b) { return b.n - a.n; });
    if (activeFilter === "top") list = list.filter(function (b) { return b.rating >= 9; });
    else if (activeFilter !== "all") list = list.filter(function (b) { return (b.tags || []).indexOf(activeFilter) > -1; });

    if (!list.length) {
      shelf.innerHTML = DONE.length
        ? '<div class="shelf-empty"><p class="t">Nothing here yet.</p><p>No finished book carries that tag so far.</p></div>'
        : '<div class="shelf-empty"><p class="t">The shelf is empty. For now.</p><p>Book one is open on my desk. Every finished book lands here with a rating and a straight report, no summaries you could have gotten from the back cover.</p></div>';
      shelf.className = DONE.length ? "" : "";
      return;
    }
    shelf.className = "shelf";
    shelf.innerHTML = list.map(cardHTML).join("");
  }

  if (filterBar) {
    var tags = {};
    DONE.forEach(function (b) { (b.tags || []).forEach(function (t) { tags[t] = 1; }); });
    var keys = Object.keys(tags).sort();
    var f = '<button class="filt on" data-f="all">All ' + DONE.length + "</button>";
    if (DONE.filter(function (b) { return b.rating >= 9; }).length) f += '<button class="filt" data-f="top">9 and up</button>';
    keys.forEach(function (k) { f += '<button class="filt" data-f="' + esc(k) + '">' + esc(k) + "</button>"; });
    filterBar.innerHTML = keys.length || DONE.length ? f : "";
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest(".filt"); if (!b) return;
      filterBar.querySelectorAll(".filt").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); activeFilter = b.getAttribute("data-f"); paint();
    });
  }
  paint();
  if (shelf) shelf.addEventListener("click", function (e) {
    var c = e.target.closest(".bk"); if (!c) return;
    var b = ALL.filter(function (x) { return x.n === +c.getAttribute("data-n"); })[0];
    if (b) openDrawer(b);
  });

  /* ---------- up next ------------------------------------------- */
  var q = document.getElementById("queue");
  if (q) {
    if (!QUEUE.length) {
      var sec = document.getElementById("sec-queue"); if (sec) sec.style.display = "none";
    } else {
      // Every queue item links to its buy page. People order ahead from this
      // row, so a cover with no link is a dead end.
      q.innerHTML = QUEUE.map(function (b, i) {
        var src = b.asin ? amz(b.asin) : (b.cover || "");
        var art = '<span class="art">' +
          '<span class="ph">' + esc(b.title) + "</span>" +
          (src ? '<img src="' + esc(src) + '" alt="' + esc(b.title) + ' cover" loading="lazy" onerror="this.remove()">' : "") +
          '<span class="qn">Week ' + pad(DONE.length + (NOW ? 1 : 0) + i + 1) + "</span>" +
          "</span>";
        var meta = '<span class="t">' + esc(b.title) + '</span><span class="a">' + esc(b.author || "") + "</span>" +
          (b.buy ? '<span class="get">Get it ahead &rarr;</span>' : "");
        return b.buy
          ? '<a class="qk" href="' + esc(b.buy) + '" target="_blank" rel="noopener sponsored">' + art + meta + "</a>"
          : '<div class="qk">' + art + meta + "</div>";
      }).join("");
    }
  }

  /* ---------- drawer -------------------------------------------- */
  var drawer = document.getElementById("bdrawer");
  var drBody = drawer ? drawer.querySelector(".panel-in") : null;

  function openDrawer(b) {
    if (!drawer || !drBody) return;
    var src = cover(b);
    drBody.innerHTML =
      '<p class="dr-num">Book ' + pad(b.n) + " of " + GOAL + (b.finished ? " . finished " + monthDay(b.finished) : "") + "</p>" +
      (src ? '<img class="dr-cover" src="' + esc(src) + '" alt="' + esc(b.title) + '" onerror="this.remove()">' : "") +
      '<h2 class="dr-ttl">' + esc(b.title) + "</h2>" +
      '<p class="dr-by">' + esc(b.author) + "</p>" +
      (b.rating ? '<div class="dr-score"><span class="big">' + rate(b.rating) + "<small> / 10</small></span><span class=\"k\">My rating</span></div>" : '<div class="dr-score"><span class="k">Report coming when I finish it</span></div>') +
      (b.report ? '<p class="dr-body">' + esc(b.report) + "</p>" : (b.verdict ? '<p class="dr-body">' + esc(b.verdict) + "</p>" : "")) +
      ((b.takeaways && b.takeaways.length) ? '<p class="dr-h">What I actually took from it</p><ul class="dr-take">' +
        b.takeaways.map(function (t, i) { return "<li><b>" + pad(i + 1) + "</b><span>" + esc(t) + "</span></li>"; }).join("") + "</ul>" : "") +
      (b.quote ? '<blockquote class="dr-quote">' + esc(b.quote) + "</blockquote>" : "") +
      ((b.tags && b.tags.length) ? '<div class="dr-tags">' + b.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="btns">' +
        (b.buy ? '<a class="btn btn-solid" href="' + esc(b.buy) + '" target="_blank" rel="noopener sponsored"><span>Get this book</span><span class="arw">&rarr;</span></a>' : "") +
        '<button class="btn btn-ghost" data-drclose type="button"><span>Back to the shelf</span></button>' +
      "</div>";
    drawer.classList.add("open");
    requestAnimationFrame(function () { drawer.classList.add("in"); });
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("in");
    document.body.style.overflow = "";
    setTimeout(function () { drawer.classList.remove("open"); }, 500);
  }
  if (drawer) {
    drawer.addEventListener("click", function (e) {
      if (e.target.closest(".scrim") || e.target.closest("[data-drclose]") || e.target.closest(".dr-close")) closeDrawer();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });
  }

  /* ---------- forms (join + recommend) --------------------------- */
  function wire(formId, okId, source, build, validate, failMsg) {
    var form = document.getElementById(formId); if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = build(form); data.source = source;
      var note = form.querySelector(".note");
      if (!validate(data)) { if (note) note.textContent = failMsg; return; }
      var btn = form.querySelector("button[type=submit] span");
      if (btn) btn.textContent = "Sending";
      fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error("no"); return r; })
        .then(function () {
          form.style.display = "none";
          var ok = document.getElementById(okId); if (ok) ok.style.display = "block";
        })
        .catch(function () {
          window.location.href = "mailto:ryder@ryderschilling.com?subject=" +
            encodeURIComponent("52 Books . " + source) + "&body=" +
            encodeURIComponent(Object.keys(data).map(function (k) { return k + ": " + data[k]; }).join("\n"));
        });
    });
  }

  wire("join-form", "join-ok", "52books-join",
    function (f) {
      return {
        name: (f.querySelector('[name="name"]') || {}).value || "",
        contact: (f.querySelector('[name="contact"]') || {}).value || "",
        need: "52 Books . joining the challenge",
        msg: (f.querySelector('[name="msg"]') || {}).value || ""
      };
    },
    function (d2) { return d2.name.trim() && /.+@.+\..+/.test(d2.contact.trim()); },
    "FIRST NAME AND A REAL EMAIL. THAT IS ALL I NEED."
  );

  wire("rec-form", "rec-ok", "52books-recommendation",
    function (f) {
      return {
        name: (f.querySelector('[name="name"]') || {}).value || "Anonymous",
        contact: (f.querySelector('[name="contact"]') || {}).value || "no email given",
        need: "52 Books . book recommendation",
        msg: ((f.querySelector('[name="book"]') || {}).value || "") + "\n\nWhy: " + ((f.querySelector('[name="why"]') || {}).value || "")
      };
    },
    function (d2) { return d2.msg.trim().length > 3; },
    "TELL ME THE TITLE AT LEAST."
  );

  /* ---------- renumber the visible sections ---------------------- */
  var seqs = [].slice.call(document.querySelectorAll("[data-seq]")).filter(function (n) {
    var sec = n.closest("section"); return !sec || sec.style.display !== "none";
  });
  seqs.forEach(function (n, i) { var b = n.querySelector("b"); if (b) b.textContent = pad(i + 1); });

  /* ---------- homepage section ---------------------------------- */
  var h52 = document.getElementById("h52-strip");
  if (h52) {
    var recent = DONE.slice().sort(function (a, b) { return b.n - a.n; }).slice(0, 3);
    var feat = (NOW ? [NOW] : []).concat(recent).slice(0, 4);
    var out = "";
    for (var j = 0; j < 4; j++) {
      var bb = feat[j];
      if (bb) {
        var s = cover(bb);
        out += '<a class="s" href="/52/" title="' + esc(bb.title) + '"><span class="art' + (bb.status === "reading" ? " live" : "") + '">' +
          '<span class="ph">' + pad(bb.n) + "</span>" +
          (s ? '<img src="' + esc(s) + '" alt="' + esc(bb.title) + '" loading="lazy" onerror="this.remove()">' : "") +
          "</span></a>";
      } else {
        out += '<a class="s" href="/52/"><span class="art"><span class="ph">' + pad(DONE.length + (NOW ? 1 : 0) + (j - feat.length) + 1) + "</span></span></a>";
      }
    }
    h52.innerHTML = out;
    set("h52-read", DONE.length + " / " + GOAL);
    set("h52-week", started ? "Week " + pad(week) : monthDay(CFG.startDate));
    set("h52-now", NOW ? NOW.title : "Starting soon");
  }
})();
