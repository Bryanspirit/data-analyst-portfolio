/* ═══════════════════════════════════════════════════════════════════
   Bryan Opoku, data analyst portfolio

   1. theme         light / dark, remembered
   2. reveal        on-scroll fade, respects reduced motion
   3. accordion     the analysis records
   4. filters       records by domain
   5. copy email
   6. demo          synthetic claims, scatter + histogram + table

   The demo data is generated from a FIXED SEED so every visitor sees
   the same 400 claims. It is synthetic. It is not real claims data,
   and the page says so above the charts. Keep that notice.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────────────────── 1. theme ───────────────────── */
  (function theme() {
    var root = document.documentElement;
    var btn  = $('#themeBtn');
    var saved;
    try { saved = localStorage.getItem('bo-theme'); } catch (e) { saved = null; }
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var current = root.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('bo-theme', next); } catch (e) {}
    });
  }());

  /* ───────────────────── 2. reveal ───────────────────── */
  (function reveal() {
    var items = $$('.rv');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }());

  /* ─────────────────── 3. accordion ─────────────────── */
  (function accordion() {
    $$('.rec-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.querySelector('.rec-tog').textContent = open ? '+' : '+';
      });
    });
  }());

  /* ──────────────────── 4. filters ──────────────────── */
  (function filters() {
    var btns  = $$('.fbtn');
    var recs  = $$('.rec');
    var count = $('#filterCount');
    if (!btns.length) return;

    function apply(f) {
      var shown = 0;
      recs.forEach(function (rec) {
        var hit = (f === 'all') || rec.getAttribute('data-cat') === f;
        rec.hidden = !hit;
        if (hit) shown++;
        // collapse anything being hidden, so reopening is predictable
        if (!hit) {
          var b = rec.querySelector('.rec-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
      if (count) {
        count.textContent = f === 'all'
          ? 'Showing all ' + shown + ' records'
          : 'Showing ' + shown + ' of ' + recs.length + ' records';
      }
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        apply(btn.getAttribute('data-f'));
      });
    });
    apply('all');
  }());

  /* ────────────────── 5. copy email ────────────────── */
  (function copyMail() {
    [['#copyMail', '#copyTxt'], ['#copyMail2', '#copyTxt2']].forEach(function (pair) {
      var btn = $(pair[0]), txt = $(pair[1]);
      if (!btn || !txt) return;
      var original = txt.textContent;
      btn.addEventListener('click', function () {
        var mail = btn.getAttribute('data-mail');
        var done = function () {
          txt.textContent = 'Copied';
          var hint = $('#copyHint');
          if (hint) hint.textContent = 'Address copied to clipboard';
          setTimeout(function () {
            txt.textContent = original;
            if (hint) hint.textContent = 'Click the address to copy';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mail).then(done, function () { window.location.href = 'mailto:' + mail; });
        } else {
          window.location.href = 'mailto:' + mail;
        }
      });
    });
  }());

  /* ═══════════════════ 6. the demo ═══════════════════ */

  /* -- deterministic PRNG, so the dataset is identical for everyone -- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(rnd) {                       // Box-Muller
    var u = 1 - rnd(), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function median(arr) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /* -- build 400 synthetic claims -------------------------------- */
  function buildClaims() {
    var rnd = mulberry32(20260812);
    var rows = [], i;
    for (i = 0; i < 400; i++) {
      // cover spread over roughly one and a half orders of magnitude
      var cover = Math.exp(Math.log(9000) + rnd() * (Math.log(520000) - Math.log(9000)));
      // typical claim sits near a quarter of cover, with real spread
      var lnRatio = Math.log(0.22) + gauss(rnd) * 0.42;
      // ~6% of claims come from a different process entirely
      var odd = rnd() < 0.06;
      if (odd) lnRatio += 0.9 + rnd() * 1.1;
      var ratio = Math.exp(lnRatio);
      // a claim rarely exceeds its cover, so compress the top rather than
      // hard-clipping it, which would pile identical scores into one bin
      if (ratio > 1.1) ratio = 1.1 + (ratio - 1.1) * 0.18;
      rows.push({
        id: 'CLM-' + String(10240 + i),
        cover: cover,
        amount: cover * ratio,
        lnRatio: Math.log(ratio)
      });
    }
    // robust z score: how far the claim-to-cover ratio sits from typical
    var med = median(rows.map(function (r) { return r.lnRatio; }));
    var mad = median(rows.map(function (r) { return Math.abs(r.lnRatio - med); }));
    var scale = 1.4826 * (mad || 1e-6);
    rows.forEach(function (r) { r.score = Math.abs(r.lnRatio - med) / scale; });
    return rows;
  }

  var CLAIMS = null;

  /* -- small formatting + geometry helpers ----------------------- */
  function fmtK(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + 'M';
    if (n >= 1e3) return Math.round(n / 1e3) + 'K';
    return String(Math.round(n));
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* rounded at the data end, square at the baseline */
  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, w / 2, h);
    return 'M' + x + ',' + (y + h) +
           'V' + (y + r) +
           'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + (-r) +
           'h' + (w - 2 * r) +
           'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r +
           'V' + (y + h) + 'Z';
  }

  /* round an axis maximum up to a readable number */
  function niceMax(n) {
    if (n <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(n)));
    var steps = [1, 2, 2.5, 5, 10];
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] * p >= n) return steps[i] * p;
    }
    return 10 * p;
  }

  /* log-scale tick values (1, 3, 10, 30 ...) inside a range */
  function logTicks(lo, hi) {
    var out = [], e = Math.floor(Math.log10(lo));
    for (; e <= Math.ceil(Math.log10(hi)); e++) {
      [1, 3].forEach(function (m) {
        var v = m * Math.pow(10, e);
        if (v >= lo && v <= hi) out.push(v);
      });
    }
    return out;
  }

  /* -- the tooltip ------------------------------------------------ */
  var tip = $('#tip');
  function showTip(html, x, y) {
    if (!tip) return;
    tip.innerHTML = html;
    tip.classList.add('on');
    var r = tip.getBoundingClientRect();
    var left = Math.min(Math.max(8, x + 14), window.innerWidth - r.width - 8);
    var top  = y - r.height - 12 < 8 ? y + 18 : y - r.height - 12;
    tip.style.left = left + 'px';
    tip.style.top  = top + 'px';
  }
  function hideTip() { if (tip) tip.classList.remove('on'); }

  /* -- scatter: claim amount against cover ------------------------ */
  function drawScatter(svg, rows, thr) {
    var W = 460, H = 300;
    var m = { t: 12, r: 12, b: 34, l: 50 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;

    var xLo = 8000,  xHi = 600000;
    var yLo = 900,   yHi = 700000;
    var lx = function (v) { return m.l + (Math.log(v) - Math.log(xLo)) / (Math.log(xHi) - Math.log(xLo)) * pw; };
    var ly = function (v) { return m.t + ph - (Math.log(v) - Math.log(yLo)) / (Math.log(yHi) - Math.log(yLo)) * ph; };

    var s = '';

    // recessive grid, hairline, solid
    logTicks(yLo, yHi).forEach(function (v) {
      s += '<line class="grid" x1="' + m.l + '" y1="' + ly(v).toFixed(1) + '" x2="' + (m.l + pw) + '" y2="' + ly(v).toFixed(1) + '"/>';
      s += '<text class="axl" x="' + (m.l - 8) + '" y="' + (ly(v) + 3.5).toFixed(1) + '" text-anchor="end">' + fmtK(v) + '</text>';
    });
    logTicks(xLo, xHi).forEach(function (v) {
      s += '<text class="axl" x="' + lx(v).toFixed(1) + '" y="' + (m.t + ph + 16) + '" text-anchor="middle">' + fmtK(v) + '</text>';
    });
    s += '<line class="axis" x1="' + m.l + '" y1="' + (m.t + ph) + '" x2="' + (m.l + pw) + '" y2="' + (m.t + ph) + '"/>';

    // axis titles
    s += '<text class="axl" x="' + (m.l + pw) + '" y="' + (m.t + ph + 30) + '" text-anchor="end">Sum insured</text>';
    s += '<text class="axl" x="' + m.l + '" y="' + (m.t - 2) + '" text-anchor="start">Claim amount</text>';

    // normal marks first, flagged on top so they are never buried
    var flagged = [];
    rows.forEach(function (r, i) {
      var cx = lx(r.cover), cy = ly(r.amount);
      r._x = cx; r._y = cy;
      if (r.score >= thr) { flagged.push(r); return; }
      s += '<circle class="dot" data-i="' + i + '" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.4"/>';
    });
    flagged.forEach(function (r) {
      s += '<circle class="dot flag" data-i="' + rows.indexOf(r) + '" cx="' + r._x.toFixed(1) + '" cy="' + r._y.toFixed(1) + '" r="4.6"/>';
    });

    svg.innerHTML = s;
    svg.setAttribute('aria-label',
      'Scatter plot of claim amount against sum insured, 400 synthetic claims on logarithmic axes. ' +
      flagged.length + ' claims score at or above the current threshold and are drawn in the flagged colour. ' +
      'The same figures are available in the table below.');
  }

  /* -- histogram of scores, with the cut marked ------------------- */
  function drawHist(svg, bins, thr, maxScore) {
    var W = 320, H = 190;
    var m = { t: 10, r: 8, b: 30, l: 36 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var maxN = niceMax(Math.max.apply(null, bins.map(function (b) { return b.n; })) || 1);

    var bx = function (v) { return m.l + (v / maxScore) * pw; };
    var by = function (n) { return m.t + ph - (n / maxN) * ph; };

    var s = '';
    [0, 0.5, 1].forEach(function (f) {
      var n = Math.round(maxN * f), y = by(n);
      s += '<line class="grid" x1="' + m.l + '" y1="' + y.toFixed(1) + '" x2="' + (m.l + pw) + '" y2="' + y.toFixed(1) + '"/>';
      s += '<text class="axl" x="' + (m.l - 7) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">' + n + '</text>';
    });

    var bw = pw / bins.length;
    bins.forEach(function (b, i) {
      if (!b.n) return;
      var x = m.l + i * bw + 1;            // 2px surface gap between neighbours
      var w = Math.max(1, bw - 2);
      var y = by(b.n), h = m.t + ph - y;
      s += '<path class="bar' + (b.lo >= thr ? ' flag' : '') + '" data-b="' + i + '" d="' + barPath(x, y, w, h, 3) + '"/>';
    });

    s += '<line class="axis" x1="' + m.l + '" y1="' + (m.t + ph) + '" x2="' + (m.l + pw) + '" y2="' + (m.t + ph) + '"/>';
    [0, 2, 4, 6].forEach(function (v) {
      if (v > maxScore) return;
      s += '<text class="axl" x="' + bx(v).toFixed(1) + '" y="' + (m.t + ph + 15) + '" text-anchor="middle">' + v + '</text>';
    });
    s += '<text class="axl" x="' + (m.l + pw) + '" y="' + (m.t + ph + 27) + '" text-anchor="end">Anomaly score (&#963;)</text>';

    // the threshold annotation, direct-labelled
    var tx = bx(thr);
    s += '<line class="thr" x1="' + tx.toFixed(1) + '" y1="' + (m.t - 2) + '" x2="' + tx.toFixed(1) + '" y2="' + (m.t + ph) + '"/>';
    var anchor = tx > m.l + pw - 60 ? 'end' : 'start';
    var lxp = anchor === 'end' ? tx - 5 : tx + 5;
    s += '<text class="thrlab" x="' + lxp.toFixed(1) + '" y="' + (m.t + 8) + '" text-anchor="' + anchor + '">cut at ' + thr.toFixed(2) + '</text>';

    svg.innerHTML = s;
  }

  /* -- bin the scores --------------------------------------------- */
  function binScores(rows, width, maxScore) {
    var n = Math.ceil(maxScore / width), bins = [], i;
    for (i = 0; i < n; i++) bins.push({ lo: i * width, hi: (i + 1) * width, n: 0 });
    rows.forEach(function (r) {
      var i = Math.min(bins.length - 1, Math.floor(r.score / width));
      bins[i].n++;
    });
    return bins;
  }

  /* -- the table view, the non-visual path to the same data ------- */
  function drawTable(body, rows, thr) {
    var width = 0.5;
    var maxScore = Math.ceil(Math.max.apply(null, rows.map(function (r) { return r.score; })) / width) * width;
    var bins = binScores(rows, width, maxScore);
    var total = rows.length;
    body.innerHTML = bins.filter(function (b) { return b.n; }).map(function (b) {
      var flagged = b.lo >= thr;
      return '<tr>' +
        '<td>' + b.lo.toFixed(2) + ' to ' + b.hi.toFixed(2) + '</td>' +
        '<td>' + b.n + '</td>' +
        '<td>' + (b.n / total * 100).toFixed(1) + '%</td>' +
        '<td>' + (flagged ? 'Flagged' : 'Below threshold') + '</td>' +
        '</tr>';
    }).join('');
  }

  /* -- wire it all together --------------------------------------- */
  (function demo() {
    var scatter = $('#scatter');
    var hist    = $('#hist');
    var slider  = $('#thr');
    if (!scatter || !hist || !slider) return;

    CLAIMS = buildClaims();

    var elThrv  = $('#thrv');
    var elCount = $('#roCount');
    var elRate  = $('#roRate');
    var tblBody = $('#tblBody');

    var maxScore = Math.ceil(Math.max.apply(null, CLAIMS.map(function (r) { return r.score; })) * 2) / 2;
    var bins = binScores(CLAIMS, 0.25, maxScore);
    var currentThr = 2.6;

    function render() {
      var thr = parseInt(slider.value, 10) / 10;
      currentThr = thr;
      var flagged = CLAIMS.filter(function (r) { return r.score >= thr; }).length;

      if (elThrv)  elThrv.innerHTML = thr.toFixed(2) + ' &sigma;';
      if (elCount) elCount.innerHTML = flagged + '<small>claims</small>';
      if (elRate)  elRate.innerHTML = (flagged / CLAIMS.length * 100).toFixed(1) + '<small>%</small>';

      drawScatter(scatter, CLAIMS, thr);
      drawHist(hist, bins, thr, maxScore);
      if (tblBody) drawTable(tblBody, CLAIMS, thr);
    }

    slider.addEventListener('input', render);
    render();

    /* hover: dots */
    scatter.addEventListener('mousemove', function (ev) {
      var t = ev.target;
      if (!t || t.tagName !== 'circle') { hideTip(); return; }
      var r = CLAIMS[parseInt(t.getAttribute('data-i'), 10)];
      if (!r) return;
      var flagged = r.score >= currentThr;
      showTip(
        '<b>' + esc(r.id) + '</b>' +
        'Cover ' + fmtK(r.cover) + ' &middot; claim ' + fmtK(r.amount) + '<br>' +
        'Ratio ' + (r.amount / r.cover).toFixed(2) + ' &middot; score ' + r.score.toFixed(2) + '&sigma;<br>' +
        '<span>' + (flagged ? 'Flagged for review' : 'Within expected range') + '</span>',
        ev.clientX, ev.clientY);
    });
    scatter.addEventListener('mouseleave', hideTip);

    /* hover: histogram bars */
    hist.addEventListener('mousemove', function (ev) {
      var t = ev.target;
      if (!t || t.getAttribute('data-b') === null) { hideTip(); return; }
      var b = bins[parseInt(t.getAttribute('data-b'), 10)];
      if (!b) return;
      showTip(
        '<b>Score ' + b.lo.toFixed(2) + ' to ' + b.hi.toFixed(2) + '</b>' +
        b.n + ' claims &middot; ' + (b.n / CLAIMS.length * 100).toFixed(1) + '% of the book<br>' +
        '<span>' + (b.lo >= currentThr ? 'At or above the cut' : 'Below the cut') + '</span>',
        ev.clientX, ev.clientY);
    });
    hist.addEventListener('mouseleave', hideTip);
    window.addEventListener('scroll', hideTip, { passive: true });

    /* table toggle */
    var tblBtn = $('#tblBtn'), tbl = $('#tbl');
    if (tblBtn && tbl) {
      tblBtn.addEventListener('click', function () {
        var open = tblBtn.getAttribute('aria-expanded') === 'true';
        tblBtn.setAttribute('aria-expanded', String(!open));
        tbl.hidden = open;
        tblBtn.textContent = open ? 'Show the numbers as a table' : 'Hide the table';
      });
    }
  }());

}());
