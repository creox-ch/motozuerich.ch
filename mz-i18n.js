/* ============================================================
   MOTO-ZÜRICH — shared header control + i18n engine (sub-pages)
   DE/EN/FR switching is live everywhere:
   · elements with data-en/data-fr swap innerHTML (chrome, injected by mz-chrome.js)
   · all other text is translated per text node via window.MZ_DICT
     (per-page dictionary file i18n/dict-*.js, loaded before this script)
   Load AFTER mz-chrome.js and the page dict, BEFORE mz-page.js
   (capture must happen before the typewriter splits headings into chars).
   ============================================================ */
(function () {
  var LANGS = ['de', 'en', 'fr'];
  /* default is ALWAYS German; a user's choice only persists for the session */
  var lang = 'de';
  try { lang = sessionStorage.getItem('mzLang') || 'de'; } catch (e) {}
  if (LANGS.indexOf(lang) < 0) lang = 'de';
  var DICT = window.MZ_DICT || {};
  function lookup(txt, l) {
    var e = DICT[txt.replace(/\s+/g, ' ').trim()];
    if (!e) return null;
    return (l === 'fr' ? (e[1] || e[0]) : e[0]) || null;
  }

  /* ---------- HEADER CONTROL (lang + theme) ---------- */
  var headerInner = document.querySelector('.header-inner');
  var langBtns = {};
  if (headerInner) {
    var ctrl = document.createElement('div');
    ctrl.className = 'mz-ctrl';
    var seg = document.createElement('div');
    seg.className = 'mz-lang';
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = l.toUpperCase();
      b.addEventListener('click', function () { setLang(l, true); });
      seg.appendChild(b);
      langBtns[l] = b;
    });

    var themeBtn = document.createElement('button');
    themeBtn.type = 'button'; themeBtn.className = 'mz-theme';
    themeBtn.setAttribute('aria-label', 'Theme umschalten');
    themeBtn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    themeBtn.addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    ctrl.appendChild(seg);
    ctrl.appendChild(themeBtn);
    headerInner.appendChild(ctrl);

    /* desktop: surface the Aussteller CTA to the right of the controls
       (a clone keeps the in-nav original for the mobile dropdown) */
    var navCta = headerInner.querySelector('nav .nav-cta');
    if (navCta) {
      var deskCta = navCta.cloneNode(true);
      deskCta.classList.add('mz-cta-desktop');
      ctrl.appendChild(deskCta);
    }
  }

  /* ---------- THEME ---------- */
  function setTheme(mode) {
    if (mode === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('mzTheme', mode); } catch (e) {}
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('mzTheme'); } catch (e) {}
    if (saved === 'dark') setTheme('dark');
    else if (saved === 'light') setTheme('light');
  })();

  /* ---------- CAPTURE pristine DE content (pre-typewriter) ----------
     Leaf blocks = elements whose children are all inline. We snapshot
     their innerHTML now; every language render re-derives from this DE
     snapshot, so a switch after the char-split animation still works. */
  var INLINE = { SPAN: 1, B: 1, I: 1, A: 1, BR: 1, STRONG: 1, EM: 1, SMALL: 1, SUP: 1, SUB: 1, U: 1, IMG: 1 };
  var blocks = [];
  (function capture() {
    var all = document.body.querySelectorAll('*');
    var taken = [];
    outer:
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var tag = el.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'IFRAME' || tag === 'SVG') continue;
      for (var k = 0; k < taken.length; k++) if (taken[k].contains(el)) continue outer;
      if (el.hasAttribute('data-en') || el.querySelector('[data-en]')) continue;
      var kids = el.children;
      for (var j = 0; j < kids.length; j++) if (!INLINE[kids[j].tagName]) continue outer;
      if (!(el.textContent || '').trim()) continue;
      taken.push(el);
      blocks.push({ el: el, de: el.innerHTML });
    }
  })();

  function translateHTML(html, l) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      var v = lookup(n.nodeValue, l);
      if (v !== null) {
        var m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/);
        n.nodeValue = (m ? m[1] : '') + v + (m ? m[2] : '');
      }
    }
    return tpl.innerHTML;
  }

  function translateAttrs(l) {
    ['placeholder', 'aria-label', 'alt'].forEach(function (a) {
      var sel = '[' + a + ']';
      document.querySelectorAll(sel).forEach(function (el) {
        var orig = el.getAttribute('data-mz-' + a);
        if (orig === null) { orig = el.getAttribute(a) || ''; el.setAttribute('data-mz-' + a, orig); }
        if (!orig) return;
        var v = (l === 'de') ? orig : (lookup(orig, l) || orig);
        el.setAttribute(a, v);
      });
    });
  }

  /* force final reveal state so typewriter/highlight content never vanishes
     after an innerHTML swap (mirrors the home-page behaviour) */
  function reveal(el) {
    ['hl', 'hl-soft', 'hl-yellow'].forEach(function (c) {
      if (el.classList && el.classList.contains(c)) el.classList.add('revealed');
    });
    el.querySelectorAll('.hl, .hl-soft, .hl-yellow').forEach(function (p) { p.classList.add('revealed'); });
    el.querySelectorAll('.char').forEach(function (c) { c.classList.add('shown'); });
  }

  /* ---------- LANGUAGE ---------- */
  function setLang(l, fromUser) {
    lang = (LANGS.indexOf(l) >= 0) ? l : 'de';
    try { sessionStorage.setItem('mzLang', lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    /* chrome: data-en/data-fr swap */
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.de) el.dataset.de = el.innerHTML;
      el.innerHTML = (lang === 'de') ? el.dataset.de
                   : (lang === 'fr') ? (el.dataset.fr || el.dataset.en || el.dataset.de)
                   : el.dataset.en;
      if (fromUser) reveal(el);
    });
    /* content: dictionary-driven, re-rendered from the DE snapshot */
    blocks.forEach(function (b) {
      if (!document.body.contains(b.el)) return;
      b.el.innerHTML = (lang === 'de') ? b.de : translateHTML(b.de, lang);
      if (fromUser) reveal(b.el);
    });
    translateAttrs(lang);
    Object.keys(langBtns).forEach(function (k) {
      langBtns[k].classList.toggle('is-active', k === lang);
    });
  }

  setLang(lang);
})();
