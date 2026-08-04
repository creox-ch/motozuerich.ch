/* ============================================================
   MOTO-ZÜRICH — shared page behaviours
   Used across all pages: mobile nav, video facade, scroll
   fade-ins, heading typewriter + plate reveal, animated
   counters, hash-driven <details> opening.
   (The home hero video/parallax lives inline on that page.)
   ============================================================ */
(function () {
  /* ---- force external / form / ticket links to open in a NEW tab ----
     So clicking a form or ticket link never replaces the site. Any link to
     another origin (pyrus, bookinea, smartvenue, drive, social, the *_form
     pages, …) gets target=_blank; internal page links (FAQ.html, #anchors,
     mailto:, tel:) are left to navigate normally. Runs once on load and via
     event delegation so dynamically added links are covered too. */
  function isNewTabLink(a) {
    var href = a.getAttribute('href');
    if (!href) return false;
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return false;
    if (/_form(\b|\/|$)/i.test(href)) return true;            // creators_form, media_form, blogger_form
    try {
      var url = new URL(href, location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      return url.origin !== location.origin;                  // any other domain → new tab
    } catch (e) { return false; }
  }
  function markLink(a) {
    if (!a || a.dataset.extMarked) return;
    if (!isNewTabLink(a)) return;
    a.target = '_blank';
    var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
    if (rel.indexOf('noopener') === -1) rel.push('noopener');
    if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
    a.setAttribute('rel', rel.join(' '));
    a.dataset.extMarked = '1';
  }
  document.querySelectorAll('a[href]').forEach(markLink);
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a) markLink(a);
  }, true);

  /* ---- mobile nav: close on link click ---- */
  document.querySelectorAll('#mainNav a').forEach(function (a) {
    a.addEventListener('click', function () {
      var nav = document.getElementById('mainNav');
      if (nav) nav.classList.remove('open');
    });
  });

  /* ---- video facade: click loads the YouTube iframe ---- */
  document.querySelectorAll('.video-card[data-embed]').forEach(function (card) {
    card.addEventListener('click', function () {
      if (card.classList.contains('playing')) return;
      var ifr = document.createElement('iframe');
      ifr.src = card.dataset.embed;
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      ifr.allowFullscreen = true;
      card.appendChild(ifr);
      card.classList.add('playing');
    });
  });

  /* ---- scroll fade-ins ---- */
  var faders = document.querySelectorAll('.body-fade');
  if (faders.length) {
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.dataset.delay || '0', 10);
          setTimeout(function () { e.target.classList.add('in'); }, d);
          fio.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    faders.forEach(function (el) { fio.observe(el); });
  }

  /* ---- heading typewriter + plate reveal ----
     Each heading is split into per-character spans. On scroll-in the characters
     "type" one by one; when a character belongs to a highlight plate
     (.hl/.hl-soft/.hl-yellow) the plate's background slides in first, then its
     characters type on top. */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLATE = '.hl, .hl-soft, .hl-yellow, .hl-green';

  function splitChars(element) {
    var childNodes = Array.prototype.slice.call(element.childNodes);
    childNodes.forEach(function (node, idx) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent.replace(/\s+/g, ' ');
        var prev = node.previousSibling;
        var afterBr = prev && prev.nodeType === Node.ELEMENT_NODE && prev.tagName === 'BR';
        if (idx === 0 || afterBr) text = text.replace(/^\s+/, '');
        if (idx === childNodes.length - 1) text = text.replace(/\s+$/, '');
        if (!text.trim()) return;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
          var ch = text[i];
          var span = document.createElement('span');
          span.className = 'char';
          // a regular space (not &nbsp;) keeps the soft-wrap opportunity so
          // long heading lines can break instead of overflowing on phones
          span.textContent = ch;
          frag.appendChild(span);
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        splitChars(node);
      }
    });
  }

  var headings = document.querySelectorAll('.section-title, .rueckblick-title, .page-hero-title');
  headings.forEach(function (h) { splitChars(h); });

  if (headings.length) {
    var titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var title = entry.target;
        titleObserver.unobserve(title);
        var chars = title.querySelectorAll('.char');
        var perChar = reduceMotion ? 0 : 28;
        var plateReveal = reduceMotion ? 0 : 550;
        var delay = 0;
        var seenPlates = new Set();
        chars.forEach(function (char) {
          var plate = char.closest(PLATE);
          if (plate && !seenPlates.has(plate)) {
            seenPlates.add(plate);
            (function (p, d) { setTimeout(function () { p.classList.add('revealed'); }, d); })(plate, delay);
            delay += plateReveal;
          }
          (function (c, d) { setTimeout(function () { c.classList.add('shown'); }, d); })(char, delay);
          delay += perChar;
        });
        title.querySelectorAll(PLATE).forEach(function (plate) {
          if (!seenPlates.has(plate)) {
            (function (p, d) { setTimeout(function () { p.classList.add('revealed'); }, d); })(plate, delay);
            delay += plateReveal;
          }
        });
      });
    }, { threshold: 0.35 });
    headings.forEach(function (h) { titleObserver.observe(h); });
  }

  /* ---- plates in body text (outside headings): just slide the background in ---- */
  var hlObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      setTimeout(function () { el.classList.add('revealed'); }, 80);
      hlObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(PLATE).forEach(function (el) {
    if (el.closest('.section-title, .rueckblick-title, .page-hero-title')) return;
    hlObserver.observe(el);
  });

  /* ---- sequential animated counters ---- */
  function chInt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function deDec(n) { return n.toFixed(1).replace('.', ','); }
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  function fmt(v, f, s) { return (f === 'ch' ? chInt(v) : f === 'dec' ? deDec(v) : Math.round(v)) + (s || ''); }
  function animate(big) {
    return new Promise(function (resolve) {
      var target = parseFloat(big.dataset.target), f = big.dataset.fmt, s = big.dataset.suffix || '', dur = 550, t0 = performance.now();
      (function step() {
        var p = Math.min((performance.now() - t0) / dur, 1);
        big.textContent = fmt(target * ease(p), f, s);
        if (p < 1) { setTimeout(step, 16); }
        else { big.textContent = fmt(target, f, s); big.closest('.num').classList.add('done'); setTimeout(resolve, 280); }
      })();
    });
  }
  var grid = document.querySelector('.nums-grid');
  if (grid) {
    var started = false;
    function runSeq() {
      if (started) return; started = true;
      var cells = Array.prototype.slice.call(grid.querySelectorAll('.num-big'));
      (function next(i) { if (i >= cells.length) return; animate(cells[i]).then(function () { next(i + 1); }); })(0);
    }
    var cio = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { runSeq(); cio.disconnect(); }
    }, { threshold: 0.2 });
    cio.observe(grid);
  }

  /* ---- open targeted <details> on hash ---- */
  function openHashDetails() {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', openHashDetails); openHashDetails();
})();
