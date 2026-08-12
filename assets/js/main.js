/* ═══════════════════════════════════════════════════════════════════
   Bryan Opoku Mawunyo Kofi
   Strategy and research analyst, energy systems and development

   1. theme          light / dark, remembered
   2. reveal         on-scroll fade, respects reduced motion
   3. filters        research dossiers by theme
   4. copy email
   5. systems map    node selection, edge tracing, side panel
   6. DSM panel      the load-shift schematic

   HONESTY NOTE
   The load curve in section 6 is an idealised daily shape used to show
   the mechanism a demand-side intervention depends on. It is NOT data
   from the Tema Central study, and the page says so directly above the
   chart. If you edit this file, keep that notice accurate.
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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    items.forEach(function (el) { io.observe(el); });
  }());

  /* ──────────────────── 3. filters ──────────────────── */
  (function filters() {
    var btns  = $$('.fbtn');
    var items = $$('.dos');
    var count = $('#filterCount');
    if (!btns.length) return;

    function apply(f) {
      var shown = 0;
      items.forEach(function (el) {
        var hit = (f === 'all') || el.getAttribute('data-cat') === f;
        el.hidden = !hit;
        if (hit) shown++;
      });
      if (count) {
        count.textContent = f === 'all'
          ? 'Showing all ' + shown + ' programmes'
          : 'Showing ' + shown + ' of ' + items.length + ' programmes';
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

  /* ────────────────── 4. copy email ────────────────── */
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

  /* ══════════ 4b. method x programme matrix ══════════
     Built here rather than hand-written as SVG so the rows stay easy to
     edit. A cell is filled only where the CV states the method was used
     on that programme. Nothing is scored, weighted or estimated. */
  (function matrix() {
    var host = $('#mtxRows');
    if (!host) return;

    var COLS = [360, 490, 620, 750];   // energy, food, sovereign, adoption
    var ROWS = [
      ['Multi-source data integration',    [1, 1, 1, 0]],
      ['Comparative analysis',             [0, 1, 1, 0]],
      ['Longitudinal analysis',            [0, 1, 1, 0]],
      ['Statistical analysis',             [1, 1, 1, 1]],
      ['Machine learning',                 [0, 0, 1, 0]],
      ['Systems and ecosystem mapping',    [1, 0, 1, 1]],
      ['Framework and architecture design',[1, 1, 1, 0]],
      ['Evidence gap analysis',            [0, 1, 0, 0]]
    ];

    var s = '';
    ROWS.forEach(function (row, i) {
      var cy = 70 + i * 38;
      s += '<text class="mx-row" x="0" y="' + (cy + 4.5) + '">' + row[0] + '</text>';
      s += '<text class="mx-n" x="300" y="' + (cy + 4) + '" text-anchor="end">' +
           row[1].reduce(function (a, b) { return a + b; }, 0) + '</text>';
      row[1].forEach(function (on, c) {
        var x = COLS[c] - 14;
        s += '<rect class="' + (on ? 'mx-on' : 'mx-off') + '" x="' + x + '" y="' + (cy - 14) +
             '" width="28" height="28" rx="8"/>';
      });
      if (i < ROWS.length - 1) {
        s += '<line class="mx-rule" x1="0" y1="' + (cy + 19) + '" x2="800" y2="' + (cy + 19) + '"/>';
      }
    });
    host.innerHTML = s;
  }());

  /* ═════════════════ 5. the systems map ═════════════════ */
  (function systemsMap() {
    var svg = $('#smap');
    if (!svg) return;

    var elLbl   = $('#smLbl');
    var elTitle = $('#smTitle');
    var elText  = $('#smText');

    var DEFAULT = {
      lbl: 'The model',
      title: 'Six forces, one behaviour',
      text: 'Household electricity use is usually described as a habit. It is better described as a rational response to six conditions the household does not control. Studying any one of them alone explains very little, which is why the study integrated appliance survey data, consumption records, tariff schedules, meteorological data and energy-sector information into a single picture.'
    };

    var NODES = {
      core: {
        lbl: 'At the centre',
        title: 'Household energy behaviour',
        text: 'What people actually do: what they own, when they run it, and what they know about what it costs. Every arrow on this map ends here, which is why an intervention aimed at only one of them tends to underperform its business case.'
      },
      tariff: {
        lbl: 'Price signal',
        title: 'Tariff structure',
        text: 'The price a household faces, and more importantly whether that price is legible at the moment a decision is made. A tariff that only becomes visible on a bill weeks later is a weak signal, however well designed it is on paper.'
      },
      appliance: {
        lbl: 'Physical stock',
        title: 'Appliance stock',
        text: 'What is already in the home sets the ceiling on what any behavioural change can achieve. A household cannot shift load it has no appliance to shift, and cannot become efficient past the efficiency of the equipment it owns.'
      },
      income: {
        lbl: 'Constraint',
        title: 'Household income',
        text: 'Determines which efficiency options exist at all, and how hard a tariff change actually bites. It is also why the same policy produces opposite outcomes in two households on the same street.'
      },
      weather: {
        lbl: 'External driver',
        title: 'Weather and season',
        text: 'Temperature and season drive cooling load, which is where a large share of the peak sits. This is the variable most often left out of household-level analysis, and leaving it out makes the rest look like noise.'
      },
      grid: {
        lbl: 'Supply side',
        title: 'Grid conditions',
        text: 'Reliability changes behaviour. Where supply is uncertain, households plan around outages rather than around price, and a tariff-based intervention is competing with a stronger signal it did not account for.'
      },
      info: {
        lbl: 'The cheap gap',
        title: 'Information',
        text: 'What the household knows about its own consumption. Usually the largest gap and the cheapest to close, and the one that makes every other lever on this map work better than it does alone.'
      }
    };

    var nodes = $$('.nd', svg);
    var edges = $$('.ed', svg);
    var active = null;

    function clear() {
      active = null;
      nodes.forEach(function (n) { n.classList.remove('on'); });
      edges.forEach(function (e) { e.classList.remove('lit', 'dim'); });
      if (elLbl)   elLbl.textContent   = DEFAULT.lbl;
      if (elTitle) elTitle.textContent = DEFAULT.title;
      if (elText)  elText.textContent  = DEFAULT.text;
    }

    function select(id) {
      if (active === id) { clear(); return; }
      active = id;
      nodes.forEach(function (n) { n.classList.toggle('on', n.getAttribute('data-node') === id); });
      edges.forEach(function (e) {
        var hit = e.getAttribute('data-a') === id || e.getAttribute('data-b') === id;
        e.classList.toggle('lit', hit);
        e.classList.toggle('dim', !hit);
      });
      var d = NODES[id];
      if (!d) return;
      if (elLbl)   elLbl.textContent   = d.lbl;
      if (elTitle) elTitle.textContent = d.title;
      if (elText)  elText.textContent  = d.text;
    }

    nodes.forEach(function (n) {
      var id = n.getAttribute('data-node');
      n.addEventListener('click', function () { select(id); });
      n.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(id); }
      });
      // hover previews the tracing without committing the side panel
      n.addEventListener('mouseenter', function () {
        if (active) return;
        edges.forEach(function (e) {
          var hit = e.getAttribute('data-a') === id || e.getAttribute('data-b') === id;
          e.classList.toggle('lit', hit);
          e.classList.toggle('dim', !hit);
        });
      });
      n.addEventListener('mouseleave', function () {
        if (active) return;
        edges.forEach(function (e) { e.classList.remove('lit', 'dim'); });
      });
    });

    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') clear(); });
  }());

  /* ═════════════ 6. demand-side management panel ═════════════ */
  (function dsm() {
    var svg = $('#dsm');
    var slider = $('#shiftable');
    if (!svg || !slider) return;

    /* An idealised urban daily load shape, indexed so the evening peak is
       1.00. Deliberately schematic: the point is the mechanism, not a
       measurement. Hours 0 to 23. */
    var BASE = [
      0.42, 0.38, 0.35, 0.34, 0.36, 0.45,
      0.62, 0.70, 0.66, 0.60, 0.58, 0.60,
      0.63, 0.62, 0.60, 0.63, 0.72, 0.88,
      1.00, 0.98, 0.90, 0.78, 0.62, 0.50
    ];
    var PEAK_HOURS = [17, 18, 19, 20, 21];        // where the load is taken from
    var FILL_HOURS = [1, 2, 3, 4, 10, 11, 12, 13, 14]; // where it goes
    var FLOOR = 0.60;                              // load below this is not shiftable

    function managed(share) {
      var out = BASE.slice();
      var moved = 0;
      PEAK_HOURS.forEach(function (h) {
        var above = Math.max(0, BASE[h] - FLOOR);
        var take = above * share;
        out[h] = BASE[h] - take;
        moved += take;
      });
      var each = moved / FILL_HOURS.length;
      FILL_HOURS.forEach(function (h) { out[h] = BASE[h] + each; });
      return { curve: out, moved: moved };
    }

    var elPeak  = $('#roPeak');
    var elShift = $('#roShift');
    var elTotal = $('#roTotal');
    var elVal   = $('#shiftv');
    var tblBody = $('#tblBody');

    var W = 560, H = 260, m = { t: 16, r: 16, b: 34, l: 42 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var Y_MAX = 1.15;

    var px = function (h) { return m.l + (h / 23) * pw; };
    var py = function (v) { return m.t + ph - (v / Y_MAX) * ph; };

    function linePath(arr) {
      return arr.map(function (v, h) { return (h ? 'L' : 'M') + px(h).toFixed(1) + ',' + py(v).toFixed(1); }).join('');
    }
    function areaPath(arr) {
      return linePath(arr) + 'L' + px(23).toFixed(1) + ',' + py(0).toFixed(1) +
             'L' + px(0).toFixed(1) + ',' + py(0).toFixed(1) + 'Z';
    }

    function render() {
      var share = parseInt(slider.value, 10) / 100;
      var res = managed(share);
      var curve = res.curve;

      var basePeak = Math.max.apply(null, BASE);
      var newPeak  = Math.max.apply(null, curve);
      var baseSum  = BASE.reduce(function (a, b) { return a + b; }, 0);
      var newSum   = curve.reduce(function (a, b) { return a + b; }, 0);

      if (elVal)   elVal.textContent = Math.round(share * 100) + '%';
      if (elPeak)  elPeak.innerHTML  = ((1 - newPeak / basePeak) * 100).toFixed(1) + '<small>% lower</small>';
      if (elShift) elShift.innerHTML = (res.moved / baseSum * 100).toFixed(1) + '<small>% of daily total</small>';
      if (elTotal) elTotal.innerHTML = ((newSum - baseSum) / baseSum * 100).toFixed(1) + '<small>% change</small>';

      var s = '';
      // recessive grid, hairline and solid
      [0, 0.25, 0.5, 0.75, 1.0].forEach(function (v) {
        s += '<line class="grid" x1="' + m.l + '" y1="' + py(v).toFixed(1) + '" x2="' + (m.l + pw) + '" y2="' + py(v).toFixed(1) + '"/>';
        s += '<text class="axl" x="' + (m.l - 8) + '" y="' + (py(v) + 3.5).toFixed(1) + '" text-anchor="end">' + v.toFixed(2) + '</text>';
      });

      s += '<path class="ar-1" d="' + areaPath(BASE) + '"/>';
      s += '<path class="ln ln-1" d="' + linePath(BASE) + '"/>';
      s += '<path class="ln ln-2" d="' + linePath(curve) + '"/>';

      // a marker on each peak, ringed against the surface
      var newPeakHour = curve.indexOf(newPeak);
      s += '<circle class="mk mk-1" cx="' + px(18).toFixed(1) + '" cy="' + py(BASE[18]).toFixed(1) + '" r="4.5"/>';
      s += '<circle class="mk mk-2" cx="' + px(newPeakHour).toFixed(1) + '" cy="' + py(newPeak).toFixed(1) + '" r="4.5"/>';

      // one direct label only, on the story the chart is telling
      if (share > 0.02) {
        s += '<text class="dlab" x="' + (px(18) + 9).toFixed(1) + '" y="' + (py(BASE[18]) - 8).toFixed(1) + '">peak ' + ((1 - newPeak / basePeak) * 100).toFixed(0) + '% lower</text>';
      }

      s += '<line class="axis" x1="' + m.l + '" y1="' + (m.t + ph) + '" x2="' + (m.l + pw) + '" y2="' + (m.t + ph) + '"/>';
      [0, 6, 12, 18, 23].forEach(function (h) {
        var lab = h === 23 ? '23:00' : (h < 10 ? '0' + h : h) + ':00';
        s += '<text class="axl" x="' + px(h).toFixed(1) + '" y="' + (m.t + ph + 16) + '" text-anchor="' + (h === 0 ? 'start' : h === 23 ? 'end' : 'middle') + '">' + lab + '</text>';
      });
      s += '<text class="axl" x="' + m.l + '" y="' + (m.t - 4) + '" text-anchor="start">Indexed load</text>';

      svg.innerHTML = s;
      svg.setAttribute('aria-label',
        'Two daily load curves over 24 hours. The as-is curve peaks at 18:00 at an indexed load of 1.00. ' +
        'With ' + Math.round(share * 100) + ' per cent of evening load shifted, the peak falls by ' +
        ((1 - newPeak / basePeak) * 100).toFixed(1) + ' per cent while total daily energy changes by ' +
        ((newSum - baseSum) / baseSum * 100).toFixed(1) + ' per cent. The same figures are in the table below.');

      if (tblBody) {
        tblBody.innerHTML = BASE.map(function (v, h) {
          var d = curve[h] - v;
          return '<tr><td>' + (h < 10 ? '0' + h : h) + ':00</td>' +
                 '<td>' + v.toFixed(2) + '</td>' +
                 '<td>' + curve[h].toFixed(2) + '</td>' +
                 '<td>' + (d === 0 ? '0.00' : (d > 0 ? '+' : '') + d.toFixed(2)) + '</td></tr>';
        }).join('');
      }
    }

    slider.addEventListener('input', render);
    render();

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
