/* ============================================================
   MOTO-ZÜRICH — shared <head> tracking + consent manager.
   Loaded SYNCHRONOUSLY in <head> of EVERY page (home + subs) so
   nothing is missed (does NOT rely on mz-chrome.js, which skips
   the home page and loads at end of body).

   - Google Consent Mode v2 (all denied by default)
   - GA4 (gtag.js)            — Measurement ID G-1MHSWJYZVN
   - Meta (Facebook) Pixel    — ID 1525171172005763
   - German cookie banner (Akzeptieren / Ablehnen / Einstellungen)
   Tags are loaded + fired ONLY after the user grants consent.
   ============================================================ */
(function () {
  var GA_ID = 'G-1MHSWJYZVN';
  var FB_ID = '1525171172005763';
  var STORE = 'mz-consent-v1';

  /* ---- schema.org (Organization + Event) — Rich Results, auf jeder Seite ---- */
  try {
    var _ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://motozuerich.ch/#org',
          name: 'MOTO-ZÜRICH',
          url: 'https://motozuerich.ch/',
          logo: 'https://motozuerich.ch/assets/logo-moto-zuerich.svg'
        },
        {
          '@type': 'Event',
          name: 'MOTO-ZÜRICH 2027',
          startDate: '2027-02-19',
          endDate: '2027-02-21',
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          url: 'https://motozuerich.ch/',
          image: 'https://motozuerich.ch/assets/og/home.png',
          description: 'Der unabhängige Saisonauftakt der Schweizer Motorradszene – urban, kuratiert und nahbar.',
          location: {
            '@type': 'Place',
            name: 'StageOne & Halle 550',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Zürich-Oerlikon',
              addressRegion: 'ZH',
              addressCountry: 'CH'
            }
          },
          organizer: { '@id': 'https://motozuerich.ch/#org' }
        }
      ]
    };
    var _lds = document.createElement('script');
    _lds.type = 'application/ld+json';
    _lds.text = JSON.stringify(_ld);
    document.head.appendChild(_lds);
  } catch (e) {}

  /* ---- Consent Mode v2: define gtag + default everything denied ---- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('js', new Date());

  var gaLoaded = false;
  var pixelLoaded = false;

  function loadGA() {
    if (gaLoaded) return; gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadPixel() {
    if (pixelLoaded) return; pixelLoaded = true;
    /* standard Meta Pixel bootstrap — only injected on consent */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', FB_ID);
    window.fbq('track', 'PageView');
  }

  /* ---- read / write the stored decision ---- */
  function readConsent() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); }
    catch (e) { return null; }
  }
  function writeConsent(c) {
    try { localStorage.setItem(STORE, JSON.stringify(c)); } catch (e) {}
  }

  /* ---- apply a decision: update Consent Mode + (un)load tags ---- */
  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    if (c.analytics) loadGA();
    if (c.marketing) loadPixel();
  }

  /* ============================================================
     COOKIE BANNER  (sharp corners, no shadow, brand blue/red)
     ============================================================ */
  function buildBanner(existing) {
    var pref = existing || { analytics: true, marketing: true };

    var style = document.createElement('style');
    style.textContent = [
      '.mzc-banner{position:fixed;left:0;right:0;bottom:0;z-index:9000;',
      'background:#fff;border-top:3px solid var(--brand,#2F65A0);',
      'font-family:var(--font-body,system-ui,sans-serif);color:#14202e;}',
      '.mzc-inner{max-width:1440px;margin:0 auto;padding:24px 32px;',
      'display:flex;gap:28px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;}',
      '.mzc-text{flex:1 1 460px;min-width:280px;}',
      '.mzc-label{font-family:var(--font-mono,monospace);font-weight:700;font-size:11px;',
      'letter-spacing:.18em;text-transform:uppercase;color:var(--brand,#2F65A0);margin:0 0 8px;}',
      '.mzc-copy{font-size:14px;line-height:1.55;color:#45566a;margin:0;}',
      '.mzc-copy a{color:var(--brand-dark,#1f4571);text-decoration:underline;}',
      '.mzc-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}',
      '.mzc-btn{font-family:var(--font-mono,monospace);font-weight:700;font-size:13px;',
      'letter-spacing:.06em;text-transform:uppercase;border-radius:0;cursor:pointer;',
      'padding:13px 22px;border:1px solid transparent;transition:background .2s,color .2s,transform .2s;}',
      '.mzc-btn:hover{transform:translateY(-1px);}',
      '.mzc-accept{background:var(--swiss-red,#C10D0D);color:#fff;border-color:var(--swiss-red,#C10D0D);}',
      '.mzc-accept:hover{background:var(--swiss-red-dark,#960909);border-color:var(--swiss-red-dark,#960909);}',
      '.mzc-reject{background:#fff;color:var(--brand,#2F65A0);border-color:var(--brand,#2F65A0);}',
      '.mzc-reject:hover{background:var(--brand,#2F65A0);color:#fff;}',
      '.mzc-settings{background:none;color:#5a6b7e;border-color:transparent;text-decoration:underline;padding:13px 8px;}',
      '.mzc-settings:hover{color:var(--brand,#2F65A0);}',
      '.mzc-panel{flex:1 1 100%;display:none;border-top:1px solid var(--line,rgba(47,101,160,.15));',
      'margin-top:18px;padding-top:18px;}',
      '.mzc-panel.open{display:block;}',
      '.mzc-row{display:flex;gap:16px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--line,rgba(47,101,160,.15));}',
      '.mzc-row:last-of-type{border-bottom:0;}',
      '.mzc-row-main{flex:1;}',
      '.mzc-row-name{font-family:var(--font-mono,monospace);font-weight:700;font-size:12px;',
      'letter-spacing:.1em;text-transform:uppercase;color:#14202e;margin:0 0 3px;}',
      '.mzc-row-desc{font-size:13px;line-height:1.5;color:#5a6b7e;margin:0;}',
      '.mzc-toggle{appearance:none;-webkit-appearance:none;width:46px;height:24px;flex:none;',
      'background:#c9d4e0;border-radius:0;position:relative;cursor:pointer;transition:background .2s;margin-top:2px;}',
      '.mzc-toggle:checked{background:var(--brand,#2F65A0);}',
      '.mzc-toggle:disabled{opacity:.5;cursor:not-allowed;}',
      '.mzc-toggle::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;',
      'background:#fff;transition:transform .2s;}',
      '.mzc-toggle:checked::after{transform:translateX(22px);}',
      '.mzc-panel-actions{margin-top:16px;}',
      '@media(max-width:720px){.mzc-inner{padding:20px;gap:16px;}.mzc-actions{width:100%;}',
      '.mzc-accept,.mzc-reject{flex:1;text-align:center;}}'
    ].join('');
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'mzc-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie-Einstellungen');
    bar.innerHTML =
      '<div class="mzc-inner">' +
        '<div class="mzc-text">' +
          '<p class="mzc-label">Cookies &amp; Datenschutz</p>' +
          '<p class="mzc-copy">Wir verwenden Cookies und Tracking-Technologien (Google Analytics 4, ' +
          'Meta-Pixel), um die Nutzung unserer Website zu analysieren und unsere Inhalte zu verbessern. ' +
          'Diese werden nur mit Ihrer Einwilligung geladen. Mehr dazu in der ' +
          '<a href="datenschutz">Datenschutzerklärung</a>.</p>' +
        '</div>' +
        '<div class="mzc-actions">' +
          '<button type="button" class="mzc-btn mzc-settings" data-mzc="settings">Einstellungen</button>' +
          '<button type="button" class="mzc-btn mzc-reject" data-mzc="reject">Ablehnen</button>' +
          '<button type="button" class="mzc-btn mzc-accept" data-mzc="accept">Akzeptieren</button>' +
        '</div>' +
        '<div class="mzc-panel" data-mzc-panel>' +
          '<div class="mzc-row">' +
            '<div class="mzc-row-main">' +
              '<p class="mzc-row-name">Notwendig</p>' +
              '<p class="mzc-row-desc">Für den Betrieb der Website technisch erforderlich. Immer aktiv.</p>' +
            '</div>' +
            '<input class="mzc-toggle" type="checkbox" checked disabled aria-label="Notwendig" />' +
          '</div>' +
          '<div class="mzc-row">' +
            '<div class="mzc-row-main">' +
              '<p class="mzc-row-name">Statistik</p>' +
              '<p class="mzc-row-desc">Google Analytics 4 — anonymisierte Messung der Seitennutzung.</p>' +
            '</div>' +
            '<input class="mzc-toggle" type="checkbox" data-mzc-pref="analytics"' + (pref.analytics ? ' checked' : '') + ' aria-label="Statistik" />' +
          '</div>' +
          '<div class="mzc-row">' +
            '<div class="mzc-row-main">' +
              '<p class="mzc-row-name">Marketing</p>' +
              '<p class="mzc-row-desc">Meta-Pixel — Reichweitenmessung und Werbung auf Facebook/Instagram.</p>' +
            '</div>' +
            '<input class="mzc-toggle" type="checkbox" data-mzc-pref="marketing"' + (pref.marketing ? ' checked' : '') + ' aria-label="Marketing" />' +
          '</div>' +
          '<div class="mzc-panel-actions">' +
            '<button type="button" class="mzc-btn mzc-reject" data-mzc="save">Auswahl speichern</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);

    function close() { bar.parentNode && bar.parentNode.removeChild(bar); }

    function decide(c) { writeConsent(c); apply(c); close(); }

    bar.addEventListener('click', function (e) {
      var act = e.target.getAttribute && e.target.getAttribute('data-mzc');
      if (!act) return;
      if (act === 'accept') {
        decide({ analytics: true, marketing: true, ts: Date.now() });
      } else if (act === 'reject') {
        decide({ analytics: false, marketing: false, ts: Date.now() });
      } else if (act === 'settings') {
        bar.querySelector('[data-mzc-panel]').classList.toggle('open');
      } else if (act === 'save') {
        var prefs = {};
        bar.querySelectorAll('[data-mzc-pref]').forEach(function (t) {
          prefs[t.getAttribute('data-mzc-pref')] = t.checked;
        });
        decide({ analytics: !!prefs.analytics, marketing: !!prefs.marketing, ts: Date.now() });
      }
    });

    /* expose a re-open hook (e.g. a "Cookie-Einstellungen" footer link) */
    window.mzOpenConsent = function () {
      close();
      buildBanner(readConsent());
      var p = document.querySelector('[data-mzc-panel]');
      if (p) p.classList.add('open');
    };
  }

  /* ---- boot: apply prior decision, else show the banner ---- */
  function boot() {
    var stored = readConsent();
    if (stored && typeof stored.analytics === 'boolean') {
      apply(stored);          // honour earlier choice, no banner
      window.mzOpenConsent = function () { buildBanner(stored); };
    } else {
      buildBanner(null);      // first visit — ask
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   MOTO-ZÜRICH — persistent music mini-player.
   One <audio> for the whole site; playback state is stored in
   localStorage and resumed on the next page, so a track keeps
   going while the visitor navigates. A small floating player
   (play/pause · progress · close ✕) appears whenever a track
   is active. Public API: window.MZMusic.{play,toggle,stop,seek,get}.
   ============================================================ */
(function () {
  if (window.MZMusic) return;
  var KEY = 'mzMusicState';
  var CSS =
    '.mzmp{position:fixed;left:20px;bottom:20px;z-index:1200;display:flex;align-items:center;gap:14px;' +
    'background:var(--brand,#0a1929);color:#fff;padding:12px 14px;border-radius:14px;' +
    'box-shadow:0 16px 44px rgba(10,25,41,.42);font-family:var(--font-mono,ui-monospace,monospace);' +
    'width:332px;max-width:calc(100vw - 40px);animation:mzmpIn .32s cubic-bezier(.16,1,.3,1);transition:transform .5s cubic-bezier(.5,0,.2,1),opacity .5s}' +
    '.mzmp.mzmp-out{animation:mzmpOut .5s cubic-bezier(.5,0,.2,1) forwards;pointer-events:none}' +
    '@keyframes mzmpIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}' +
    '@keyframes mzmpOut{from{transform:none;opacity:1}to{transform:translateX(-130%);opacity:0}}' +
    '.mzmp[hidden]{display:none}' +
    '.mzmp-toggle{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:none;' +
    'background:var(--action-yellow,#f5c518);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .2s}' +
    '.mzmp-toggle:hover{transform:scale(1.06)}' +
    '.mzmp-toggle::before{content:"";border-style:solid;border-width:7px 0 7px 12px;border-color:transparent transparent transparent #141414;margin-left:3px}' +
    '.mzmp[data-state="playing"] .mzmp-toggle::before{border-width:0;border-left:4px solid #141414;border-right:4px solid #141414;border-radius:1px;width:5px;height:14px;margin-left:0}' +
    '.mzmp-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:7px}' +
    '.mzmp-name{font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}' +
    '.mzmp-name:hover{text-decoration:underline}' +
    '.mzmp-row{display:flex;align-items:center;gap:9px}' +
    '.mzmp-bar{position:relative;flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.24);cursor:pointer;overflow:hidden}' +
    '.mzmp-bar span{position:absolute;left:0;top:0;bottom:0;width:0;background:var(--action-yellow,#f5c518);border-radius:2px}' +
    '.mzmp-time{font-size:11px;color:rgba(255,255,255,.7);min-width:34px;text-align:right;letter-spacing:.04em}' +
    '.mzmp-close{flex:0 0 auto;width:27px;height:27px;border-radius:50%;border:none;background:rgba(255,255,255,.12);' +
    'color:#fff;font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}' +
    '.mzmp-close:hover{background:rgba(255,255,255,.26)}' +
    '@media(max-width:560px){.mzmp{left:12px;right:12px;bottom:12px;width:auto}}';

  var audio = null, ui = null, els = {}, saveT = 0, gestureHook = null;
  var curSrc = '', curName = '';

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function write(s) { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch (e) {} }
  function fmt(t) { if (!isFinite(t) || t < 0) return '0:00'; var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  function snapshot() { return { src: audio ? (audio.currentSrc || audio.src) : null, name: curName, playing: !!(audio && !audio.paused), time: audio ? audio.currentTime : 0, duration: audio ? audio.duration : 0 }; }
  function emit() { try { window.dispatchEvent(new CustomEvent('mz-music-change', { detail: snapshot() })); } catch (e) {} }
  function persist() { if (!audio || !curSrc) return; write({ src: curSrc, name: curName, time: audio.currentTime || 0, playing: !audio.paused }); }

  function buildUI() {
    if (ui) return;
    if (!document.getElementById('mz-music-style')) {
      var st = document.createElement('style'); st.id = 'mz-music-style'; st.textContent = CSS; document.head.appendChild(st);
    }
    ui = document.createElement('div'); ui.className = 'mzmp'; ui.setAttribute('hidden', '');
    ui.innerHTML =
      '<button class="mzmp-toggle" type="button" aria-label="Wiedergabe umschalten"></button>' +
      '<div class="mzmp-main"><div class="mzmp-name"></div>' +
      '<div class="mzmp-row"><div class="mzmp-bar" role="slider" aria-label="Wiedergabeposition"><span></span></div><div class="mzmp-time">0:00</div></div></div>' +
      '<button class="mzmp-close" type="button" aria-label="Musik schliessen">\u00d7</button>';
    document.body.appendChild(ui);
    els.toggle = ui.querySelector('.mzmp-toggle');
    els.name = ui.querySelector('.mzmp-name');
    els.bar = ui.querySelector('.mzmp-bar');
    els.fill = ui.querySelector('.mzmp-bar span');
    els.time = ui.querySelector('.mzmp-time');
    els.close = ui.querySelector('.mzmp-close');
    els.toggle.addEventListener('click', toggle);
    els.close.addEventListener('click', stop);
    els.bar.addEventListener('click', function (e) { var r = els.bar.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); });
    /* clicking the player (except play / close / seek-bar) opens the Sound page */
    ui.addEventListener('click', function (e) {
      if (e.target.closest('.mzmp-toggle, .mzmp-close, .mzmp-bar')) return;
      window.location.href = 'Sound.html';
    });
  }
  function showUI() { buildUI(); if (ui) ui.classList.remove('mzmp-out'); ui.hidden = false; }
  function syncUI() {
    if (!ui) return;
    ui.setAttribute('data-state', audio && !audio.paused ? 'playing' : 'paused');
    els.name.textContent = curName || 'Track';
    els.fill.style.width = (audio && audio.duration ? (audio.currentTime / audio.duration * 100) : 0) + '%';
    els.time.textContent = fmt(audio ? audio.currentTime : 0);
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(); audio.preload = 'metadata';
    audio.addEventListener('timeupdate', function () { syncUI(); emit(); var n = Date.now(); if (n - saveT > 1000) { saveT = n; persist(); } });
    audio.addEventListener('play', function () { syncUI(); emit(); persist(); });
    audio.addEventListener('pause', function () { syncUI(); emit(); persist(); });
    audio.addEventListener('loadedmetadata', function () { syncUI(); emit(); });
    audio.addEventListener('ended', function () { slideOut(); });
    return audio;
  }

  function play(src, name) {
    ensureAudio(); showUI();
    if (curSrc !== src) { curSrc = src; curName = name || 'Track'; audio.src = src; audio.currentTime = 0; }
    else if (name) { curName = name; }
    var p = audio.play(); if (p && p.catch) p.catch(function () { syncUI(); });
    syncUI();
  }
  function toggle() { if (!audio || !curSrc) return; if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } else { audio.pause(); } }
  function seek(ratio) { if (!audio || !audio.duration) return; audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration; syncUI(); emit(); }
  function stop() {
    if (audio) { audio.pause(); try { audio.removeAttribute('src'); audio.load(); } catch (e) {} }
    if (ui) ui.hidden = true;
    curSrc = ''; curName = ''; write(null); emit();
  }
  /* track finished on its own — glide the player off-screen to the left, then clear */
  function slideOut() {
    if (!ui || ui.hidden) { stop(); return; }
    ui.classList.add('mzmp-out');
    setTimeout(function () { ui.classList.remove('mzmp-out'); stop(); }, 520);
  }

  function restore() {
    var s = read(); if (!s || !s.src) return;
    ensureAudio(); curSrc = s.src; curName = s.name || 'Track'; audio.src = s.src; showUI(); syncUI();
    var applyTime = function () { try { if (s.time) audio.currentTime = s.time; } catch (e) {} audio.removeEventListener('loadedmetadata', applyTime); syncUI(); };
    audio.addEventListener('loadedmetadata', applyTime);
    if (s.playing) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () {
        /* autoplay blocked on fresh load — show the player paused.
           Do NOT hook the next click: starting music on an unrelated
           tap anywhere feels uncontrolled. User presses ▶ to resume. */
        if (audio) audio.pause();
        syncUI();
      });
    }
  }

  window.addEventListener('pagehide', persist);
  document.addEventListener('visibilitychange', function () { if (document.hidden) persist(); });
  window.MZMusic = { play: play, toggle: toggle, stop: stop, seek: seek, get: snapshot };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore);
  else restore();
})();
