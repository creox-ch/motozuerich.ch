/* ============================================================
   MOTO-ZÜRICH — enhancements (home page)
   Countdown · Add-to-calendar · Scroll progress · Card tilt
   Dark theme · DE/EN toggle · Sticky ticket bar
   Self-contained; loaded after the page's own inline script.
   ============================================================ */
(function () {
  var TICKETS = 'https://motozuerich.shop.bookinea.app/de';
  /* Ticketverkauf 2027 läuft noch nicht: Hero-Button und Sticky-Bar sind ausgeblendet.
     Zum Wiedereinschalten hier auf true setzen – sonst nichts nötig. */
  var TICKETS_LIVE = false;
  var EVENT = {
    title: 'MOTO-ZÜRICH 2027',
    start: '20270219', end: '20270222',           // all-day, DTEND exclusive (19–21 Feb)
    target: new Date(2027, 1, 19, 9, 0, 0),         // door opening, 19 Feb 2027 09:00
    location: 'StageOne / Halle 550, Andreasstrasse 70, 8050 Zürich-Oerlikon',
    url: 'https://motozuerich.ch/'
  };
  var UI = {
    de: { cdLabel: 'Bis zur Türöffnung', days: 'Tage', hours: 'Std', mins: 'Min', secs: 'Sek',
          live: 'Jetzt geöffnet — willkommen!', tickets: 'Tickets sichern', cal: 'Zum Kalender',
          calApple: 'Apple · Outlook (.ics)', calGoogle: 'Google Calendar',
          stickyHtml: 'MOTO-ZÜRICH · <b>19.–21. Feb 2027</b>', stickyBtn: 'Tickets sichern',
          desc: 'Der unabhängige Saisonstart der Schweizer Motorradszene. Zürich-Oerlikon.' },
    en: { cdLabel: 'Until doors open', days: 'Days', hours: 'Hrs', mins: 'Min', secs: 'Sec',
          live: 'Now open — welcome!', tickets: 'Get tickets', cal: 'Add to calendar',
          calApple: 'Apple · Outlook (.ics)', calGoogle: 'Google Calendar',
          stickyHtml: 'MOTO-ZÜRICH · <b>Feb 19–21, 2027</b>', stickyBtn: 'Get tickets',
          desc: 'The independent season opener of the Swiss motorcycle scene. Zürich-Oerlikon.' },
    fr: { cdLabel: "Jusqu'à l'ouverture", days: 'Jours', hours: 'Hrs', mins: 'Min', secs: 'Sec',
          live: 'Ouvert — bienvenue !', tickets: 'Billets', cal: 'Ajouter au calendrier',
          calApple: 'Apple · Outlook (.ics)', calGoogle: 'Google Agenda',
          stickyHtml: 'MOTO-ZÜRICH · <b>19–21 fév. 2027</b>', stickyBtn: 'Billets',
          desc: "Le coup d'envoi indépendant de la saison moto suisse. Zürich-Oerlikon." }
  };
  /* default is ALWAYS German; a user's choice only persists for the session */
  var lang = 'de';
  try { lang = sessionStorage.getItem('mzLang') || 'de'; } catch (e) {}
  if (['de','en','fr'].indexOf(lang) < 0) lang = 'de';
  function t() { return UI[lang]; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SCROLL PROGRESS ---------- */
  var bar = document.createElement('div');
  bar.className = 'mz-progress';
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    stickyVis();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- HEADER CONTROLS (lang + theme) ---------- */
  var headerInner = document.querySelector('.header-inner');
  var langBtns = {}, themeBtn = null;
  if (headerInner) {
    var ctrl = document.createElement('div');
    ctrl.className = 'mz-ctrl';
    var seg = document.createElement('div');
    seg.className = 'mz-lang';
    ['de', 'en', 'fr'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = l.toUpperCase();
      b.addEventListener('click', function () { setLang(l, true); });
      seg.appendChild(b); langBtns[l] = b;
    });
    themeBtn = document.createElement('button');
    themeBtn.type = 'button'; themeBtn.className = 'mz-theme';
    themeBtn.setAttribute('aria-label', 'Theme umschalten');
    themeBtn.innerHTML =
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    themeBtn.addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    ctrl.appendChild(seg); ctrl.appendChild(themeBtn);
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
    /* no saved choice → stay light (brand default) */
  })();

  /* ---------- LANGUAGE ---------- */
  function setLang(l, fromUser) {
    lang = (['de','en','fr'].indexOf(l) >= 0) ? l : 'de';
    try { sessionStorage.setItem('mzLang', lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.de) el.dataset.de = el.innerHTML;          // capture original DE once
      var val = (lang === 'de') ? el.dataset.de
              : (lang === 'fr') ? (el.dataset.fr || el.dataset.en || el.dataset.de)
              : el.dataset.en;
      el.innerHTML = val;
    });
    /* A language swap replaces innerHTML, so any heading the scroll-in typewriter
       already animated loses its .char .shown / .hl .revealed state — and the
       observer has unobserved it, so it never returns. On a USER toggle, force the
       final (fully revealed) state so highlight plates + white text never vanish.
       Skip on the initial call so first-load typewriter still plays. */
    if (fromUser) {
      document.querySelectorAll('[data-en]').forEach(function (el) {
        if (el.classList && el.classList.contains('hl')) el.classList.add('revealed');
        if (el.classList && el.classList.contains('hl-soft')) el.classList.add('revealed');
        if (el.classList && el.classList.contains('hl-yellow')) el.classList.add('revealed');
        el.querySelectorAll('.hl, .hl-soft, .hl-yellow').forEach(function (p) { p.classList.add('revealed'); });
        el.querySelectorAll('.char').forEach(function (c) { c.classList.add('shown'); });
      });
    }
    Object.keys(langBtns).forEach(function (k) {
      langBtns[k].classList.toggle('is-active', k === lang);
    });
    renderDynamic();
  }

  /* ---------- HERO: COUNTDOWN + ACTIONS ---------- */
  var cdNums = {}, cdLabelEl = null, cdUnitsEl = null, calBtn = null, stickyTextEl = null, stickyBtnEl = null, calApple = null, calGoogle = null, ticketsBtn = null;
  var heroInner = document.querySelector('.hero-identity-inner');
  var slogan = document.querySelector('.hero-identity-slogan');
  if (heroInner && slogan) {
    var cd = document.createElement('div');
    cd.className = 'mz-countdown';
    cd.innerHTML =
      '<div class="mz-cd-info">' +
        '<div class="mz-cd-label"></div>' +
        '<div class="mz-cd-units">' +
          unit('d') + unit('h') + unit('m') + unit('s') +
        '</div>' +
      '</div>' +
      '<div class="mz-hero-actions">' +
        (TICKETS_LIVE ? '<a class="mz-btn mz-btn-primary" target="_blank" rel="noopener" href="' + TICKETS + '"></a>' : '') +
        '<div class="mz-cal">' +
          '<button class="mz-btn mz-btn-ghost" type="button">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="1"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
            '<span class="mz-cal-txt"></span>' +
          '</button>' +
          '<div class="mz-cal-menu">' +
            '<a class="mz-cal-ics" href="#"></a>' +
            '<a class="mz-cal-g" target="_blank" rel="noopener" href="#"></a>' +
          '</div>' +
        '</div>' +
      '</div>';
    slogan.parentNode.insertBefore(cd, slogan.nextSibling);
    cdLabelEl = cd.querySelector('.mz-cd-label');
    cdUnitsEl = cd.querySelector('.mz-cd-units');
    cdNums = { d: cd.querySelector('[data-u="d"] .mz-cd-num'), h: cd.querySelector('[data-u="h"] .mz-cd-num'),
               m: cd.querySelector('[data-u="m"] .mz-cd-num'), s: cd.querySelector('[data-u="s"] .mz-cd-num') };
    ticketsBtn = cd.querySelector('.mz-btn-primary');
    calBtn = cd.querySelector('.mz-cal');
    var calToggle = cd.querySelector('.mz-cal .mz-btn-ghost');
    calApple = cd.querySelector('.mz-cal-ics');
    calGoogle = cd.querySelector('.mz-cal-g');
    calToggle.addEventListener('click', function (e) { e.stopPropagation(); calBtn.classList.toggle('open'); });
    document.addEventListener('click', function (e) { if (calBtn && !calBtn.contains(e.target)) calBtn.classList.remove('open'); });
    calApple.addEventListener('click', function (e) { e.preventDefault(); downloadICS(); });
  }
  function unit(k) {
    return '<div class="mz-cd-unit" data-u="' + k + '"><div class="mz-cd-num">--</div><span class="mz-cd-u"></span></div>';
  }

  /* ---------- COUNTDOWN TICK ---------- */
  function tick() {
    if (!cdNums.d) return;
    var diff = EVENT.target.getTime() - Date.now();
    if (diff <= 0) {
      cdUnitsEl.innerHTML = '<div class="mz-cd-done">' + t().live + '</div>';
      cdNums = {}; return;
    }
    var s = Math.floor(diff / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    cdNums.d.textContent = d;
    cdNums.h.textContent = pad(h);
    cdNums.m.textContent = pad(m);
    cdNums.s.textContent = pad(s);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  setInterval(tick, 1000); tick();

  /* ---------- ADD TO CALENDAR ---------- */
  function icsText() {
    var dt = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MOTO-ZUERICH//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:mz2027@motozuerich.ch', 'DTSTAMP:' + dt,
      'DTSTART;VALUE=DATE:' + EVENT.start, 'DTEND;VALUE=DATE:' + EVENT.end,
      'SUMMARY:' + EVENT.title, 'DESCRIPTION:' + t().desc,
      'LOCATION:' + EVENT.location, 'URL:' + EVENT.url,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
  }
  function downloadICS() {
    var blob = new Blob([icsText()], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'MOTO-ZUERICH-2027.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
    if (calBtn) calBtn.classList.remove('open');
  }
  function googleUrl() {
    var p = new URLSearchParams({
      action: 'TEMPLATE', text: EVENT.title,
      dates: EVENT.start + '/' + EVENT.end,
      details: t().desc + '\n' + EVENT.url, location: EVENT.location
    });
    return 'https://calendar.google.com/calendar/render?' + p.toString();
  }

  /* ---------- STICKY TICKET BAR ---------- */
  var sticky = null, stickyClosed = false;
  if (TICKETS_LIVE) {
    sticky = document.createElement('div');
    sticky.className = 'mz-sticky';
    sticky.innerHTML =
      '<span class="mz-sticky-text"></span>' +
      '<a class="mz-sticky-btn" target="_blank" rel="noopener" href="' + TICKETS + '"></a>' +
      '<button class="mz-sticky-close" type="button" aria-label="Schliessen">×</button>';
    document.body.appendChild(sticky);
    stickyTextEl = sticky.querySelector('.mz-sticky-text');
    stickyBtnEl = sticky.querySelector('.mz-sticky-btn');
    sticky.querySelector('.mz-sticky-close').addEventListener('click', function () {
      stickyClosed = true; sticky.classList.remove('show'); document.body.classList.remove('mz-sticky-on');
    });
  }
  function stickyVis() {
    if (!sticky || stickyClosed) return;
    var past = window.scrollY > 1000;
    sticky.classList.toggle('show', past);
    document.body.classList.toggle('mz-sticky-on', past);
  }

  /* ---------- DYNAMIC STRINGS (re-rendered on lang change) ---------- */
  function renderDynamic() {
    if (cdLabelEl) cdLabelEl.textContent = t().cdLabel;
    document.querySelectorAll('.mz-cd-unit').forEach(function (u) {
      var k = u.getAttribute('data-u');
      var map = { d: t().days, h: t().hours, m: t().mins, s: t().secs };
      var lab = u.querySelector('.mz-cd-u'); if (lab) lab.textContent = map[k];
    });
    if (ticketsBtn) ticketsBtn.textContent = t().tickets;
    var calTxt = document.querySelector('.mz-cal-txt'); if (calTxt) calTxt.textContent = t().cal;
    if (calApple) calApple.textContent = t().calApple;
    if (calGoogle) { calGoogle.textContent = t().calGoogle; calGoogle.href = googleUrl(); }
    if (stickyTextEl) stickyTextEl.innerHTML = t().stickyHtml;
    if (stickyBtnEl) stickyBtnEl.textContent = t().stickyBtn;
  }

  /* ---------- INIT ---------- */
  setLang(lang);     // applies translations + renders dynamic strings + toggle state
  onScroll();
})();
