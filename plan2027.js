/* MOTO-ZÜRICH — plan2027.js
   Gemeinsame Engine für die beiden Karten des Geländes 2027:
   Besucherplan (data-planmode="visitor") und Standflächen (data-planmode="space").
   Geometrie + Daten: plan2027-data.js (window.MZ27). Grafik: assets/plan-2027.svg.
   Prinzip: identische Interaktion (Hotspots, Suche, Panel, Mobile-Sheet),
   unterschiedliche Anzeige je Modus. */
(function () {
  var DATA = window.MZ27;
  if (!DATA) return;
  var MODE = document.body.getAttribute('data-planmode') === 'space' ? 'space' : 'visitor';
  var plan = document.getElementById('plan'), box = document.querySelector('.plan-box');
  var pop = document.getElementById('pop'), scrim = document.getElementById('scrim'), det = document.getElementById('det');
  var S = DATA.stands, selEl = null, selId = null, hotEls = {};
  var hoverable = window.matchMedia('(hover:hover)').matches;
  function isMobile() { return window.matchMedia('(max-width:760px)').matches; }
  function t(de, en, fr) { var l = (localStorage.getItem('mz-lang') || 'de'); return l === 'en' ? en : l === 'fr' ? fr : de; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function el(id) { return document.getElementById(id); }
  function row(k, v) { return '<div class="plan-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }

  var AREA = {
    h550: 'Halle 550', halld: 'Hall D · Adventure Camp',
    eg: t('StageOne · Erdgeschoss', 'StageOne · ground floor', 'StageOne · rez-de-chaussée'),
    og: t('StageOne · Galerie', 'StageOne · gallery', 'StageOne · galerie')
  };
  var COL = { h550: 'var(--brand)', halld: '#2e9e4f', eg: 'var(--brand)', og: 'var(--brand)' };
  var COL_BAR = '#cb6a15';

  /* ---------- Hotspots ---------- */
  /* Schräg stehende Stände (H26, H27) sind im Plan keine Rechtecke, sondern
     leicht verzogene Vierecke — die bekommen ein exaktes SVG-Polygon. */
  var NS = 'http://www.w3.org/2000/svg', pgSvg = null;
  function polyLayer() {
    if (pgSvg) return pgSvg;
    pgSvg = document.createElementNS(NS, 'svg');
    pgSvg.setAttribute('viewBox', '0 0 ' + DATA.W + ' ' + DATA.H);
    pgSvg.setAttribute('preserveAspectRatio', 'none');
    pgSvg.setAttribute('aria-hidden', 'true');
    pgSvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:8';
    plan.appendChild(pgSvg);
    return pgSvg;
  }
  Object.keys(S).forEach(function (id) {
    var p = S[id], e;
    /* Verkaufsplan: Bars / Food / Service sind nicht buchbar — gar kein Hotspot,
       keine Rahmen, kein Fond (H08, H09, H10, D15, D16, E2A, E9 …) */
    if (MODE === 'space' && (p.st === 'bar' || p.st === 'intern')) return;
    if (p.pg) {
      e = document.createElementNS(NS, 'polygon');
      e.setAttribute('points', p.pg.map(function (pt) { return pt[0] + ',' + pt[1]; }).join(' '));
      e.setAttribute('class', 'plan-pg st-' + p.st + ' z-' + p.z);
      e.style.pointerEvents = 'auto';
      polyLayer().appendChild(e);
      e.setAttribute('data-stand', id);
      hotEls[id] = e;
      e.addEventListener('click', function (ev) { ev.stopPropagation(); select(id, e); });
      e.addEventListener('mouseenter', function () { preview(id, e); });
      e.addEventListener('mouseleave', hidePreview);
      return;
    }
    e = document.createElement('div');
    e.className = 'plan-hot st-' + p.st + ' z-' + p.z;
    e.style.left = p.x + '%'; e.style.top = p.y + '%'; e.style.width = p.w + '%'; e.style.height = p.h + '%';
    if (p.r) { e.style.transform = 'rotate(' + p.r + 'deg)'; e.style.transformOrigin = 'top left'; }
    e.setAttribute('data-stand', id);
    e.setAttribute('title', id + (p.n ? ' · ' + p.n : ''));
    hotEls[id] = e;
    e.addEventListener('click', function (ev) { ev.stopPropagation(); select(id, e); });
    e.addEventListener('mouseenter', function () { preview(id, e); });
    e.addEventListener('mouseleave', hidePreview);
    plan.appendChild(e);
  });

  /* ---------- POI-Layer (nur Besucherplan) ---------- */
  var POIG = {
    ways: { de: 'Ein- & Ausgänge', en: 'Entrances & exits', fr: 'Entrées & sorties', k: ['in', 'out', 'kasse', 'pass'] },
    food: { de: 'Food & Bars', en: 'Food & bars', fr: 'Food & bars', k: ['food'] },
    show: { de: 'FMX Show', en: 'FMX show', fr: 'Show FMX', k: ['fmx'] },
    help: { de: 'Sanität', en: 'First aid', fr: 'Secours', k: ['san'] }
  };
  var poiEls = [];
  if (MODE === 'visitor') {
    var pois = (DATA.pois || []).slice();
    Object.keys(S).forEach(function (id) {
      var p = S[id];
      if (p.st === 'bar' || (p.st === 'intern' && /food|bar/i.test(p.n || ''))) {
        pois.push({ t: p.n || 'BAR', k: 'food', x: p.x + p.w / 2, y: p.y + p.h / 2, mid: true });
      }
    });
    pois.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'plan-poi k-' + p.k;
      d.style.left = p.x + '%'; d.style.top = p.y + '%';
      d.innerHTML = '<i></i><span>' + p.t + '</span>';
      d.setAttribute('data-k', p.k);
      poiEls.push(d); plan.appendChild(d);
    });
  }
  function setPoi(group) {
    var keys = group && POIG[group] ? POIG[group].k : null;
    poiEls.forEach(function (d) { d.classList.toggle('on', !!keys && keys.indexOf(d.getAttribute('data-k')) >= 0); });
    var chips = document.querySelectorAll('#poichips button[data-poi]');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('on', chips[i].getAttribute('data-poi') === group);
  }
  var chipsBox = el('poichips');
  if (chipsBox) {
    chipsBox.innerHTML = Object.keys(POIG).map(function (g) {
      return '<button type="button" data-poi="' + g + '">' + t(POIG[g].de, POIG[g].en, POIG[g].fr) + '</button>';
    }).join('');
    chipsBox.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-poi]'); if (!b) return;
      setPoi(b.classList.contains('on') ? null : b.getAttribute('data-poi'));
    });
  }

  /* ---------- Preis-Gate (Backend-Vorlage) ----------
     Preise auf /standflaechen sind erst nach E-Mail-Bestätigung sichtbar.
     BACKEND-HOOK: `requestAccess(email)` ist der einzige Punkt, den das
     Backend ersetzen muss. Vertrag:
       POST /api/price-access  Body {email: string}
       Antwort {ok: true}  → Preise freischalten (z.B. nach Double-Opt-In
       per Bestätigungslink kann der Link auf /standflaechen?priceok=1 zeigen —
       der Query-Param wird unten ebenfalls akzeptiert).
     Aktuell MOCK: jede plausible E-Mail schaltet sofort frei (kein Request). */
  var GATE = (function () {
    var KEY = 'mz27_price_email';
    function unlocked() { return MODE !== 'space' || !!localStorage.getItem(KEY); }
    function requestAccess(email, extra) {
      extra = extra || {};
      var body = {
        email: email,
        firma: extra.firma || '',
        consent: true,
        marketing_consent: !!extra.marketing_consent,
        stand_id: extra.stand_id || null,
        hp: extra.hp || '',
        quelle: { page: 'standflaechen', lang: (document.documentElement.lang || 'de'), ref: document.referrer || '', ts: new Date().toISOString() }
      };
      return fetch('/api/price-access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }).then(function (res) { return res.ok ? res.json() : { ok: false }; })
        .catch(function () { return { ok: false }; });
    }
    function unlock(email, extra) {
      return requestAccess(email, extra).then(function (r) {
        if (r && r.ok) { try { localStorage.setItem(KEY, email); } catch (e) {} rerender(); }
        return r;
      });
    }
    var hooks = [];
    function onChange(fn) { hooks.push(fn); }
    function rerender() { hooks.forEach(function (f) { try { f(); } catch (e) {} }); }
    /* Bestätigungslink-Variante: /standflaechen?priceok=1&email=… */
    try {
      var q = new URLSearchParams(location.search);
      if (q.get('priceok') === '1') localStorage.setItem(KEY, q.get('email') || 'bestaetigt');
    } catch (e) {}
    return { unlocked: unlocked, unlock: unlock, onChange: onChange, requestAccess: requestAccess };
  })();
  window.MZ_PRICE_GATE = GATE;
  function gateHtml(id) {
    return '<div class="plan-gate" data-stand="' + (id || '') + '">' +
      '<div class="plan-gate-t">' + t('Preise sind nach Eingabe deiner E-Mail sichtbar.', 'Prices are visible after entering your email.', 'Les prix sont visibles après saisie de votre e-mail.') + '</div>' +
      '<input class="plan-gate-mail" type="email" autocomplete="email" placeholder="name@firma.ch" aria-label="E-Mail" />' +
      '<input class="plan-gate-mail plan-gate-firma" type="text" autocomplete="organization" placeholder="' + t('Firma (optional)', 'Company (optional)', 'Entreprise (optionnel)') + '" aria-label="Firma" />' +
      '<label class="plan-gate-mkt"><input type="checkbox" class="plan-gate-mktcb" /> ' + t('Infos &amp; Neuigkeiten per E-Mail (optional)', 'Updates by email (optional)', 'Infos par e-mail (optionnel)') + '</label>' +
      '<input class="plan-gate-hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
      '<button type="button" class="plan-gate-btn">' + t('Preis anzeigen', 'Show price', 'Afficher le prix') + '</button>' +
      '<div class="plan-gate-consent">' + t('Mit dem Absenden stimmst du der Bearbeitung deiner Angaben zur Kontaktaufnahme zu. ', 'By submitting you agree to your data being processed so we can contact you. ', 'En envoyant, tu acceptes le traitement de tes données pour te recontacter. ') + '<a href="/datenschutz" target="_blank" rel="noopener">' + t('Datenschutz', 'Privacy', 'Confidentialité') + '</a></div>' +
      '<div class="plan-gate-err" hidden>' + t('Bitte gültige E-Mail eingeben.', 'Please enter a valid email.', 'Veuillez saisir un e-mail valide.') + '</div></div>';
  }
  /* Gate-Klicks: in der Capture-Phase behandeln UND stoppen, damit der
     Dokument-Listener das offene Sheet/Panel nicht schliesst */
  document.addEventListener('click', function (ev) {
    var g = ev.target.closest('.plan-gate'); if (!g) return;
    ev.stopPropagation();
    var b = ev.target.closest('.plan-gate-btn'); if (!b) return;
    var inp = g.querySelector('.plan-gate-mail'), err = g.querySelector('.plan-gate-err');
    var em = (inp.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.hidden = false; inp.focus(); return; }
    err.hidden = true; b.disabled = true;
    var firmaEl = g.querySelector('.plan-gate-firma'), mktEl = g.querySelector('.plan-gate-mktcb'), hpEl = g.querySelector('.plan-gate-hp');
    GATE.unlock(em, {
      firma: firmaEl ? (firmaEl.value || '').trim() : '',
      marketing_consent: mktEl ? !!mktEl.checked : false,
      hp: hpEl ? (hpEl.value || '') : '',
      stand_id: g.getAttribute('data-stand') || null
    }).then(function (r) { if (!r || !r.ok) { b.disabled = false; err.hidden = false; } });
  }, true);

  /* ---------- Metadaten pro Stand ---------- */
  function meta(id) {
    var p = S[id], m = { id: id, area: AREA[p.z], col: COL[p.z], rows: '', priceHtml: '', info: '', links: null, logo: null, mail: false, st: p.st };
    var size = (p.m ? p.m + ' m' : null), m2 = p.m2 ? p.m2 + ' m²' : null;
    if (p.st === 'taken') {
      m.title = p.n; m.logo = p.lg || null;
      m.info = p.i || t('Aussteller 2027 · ' + m.area + '.', 'Exhibitor 2027 · ' + m.area + '.', 'Exposant 2027 · ' + m.area + '.');
      m.links = p.ln || null;
      if (MODE === 'space') {
        /* belegt: nur wer hier steht — keine Masse / m², keine Preise */
        m.priceHtml = '<div class="plan-price" style="font-size:19px">' + t('Belegt 2027', 'Booked 2027', 'Occupé 2027') + '</div>';
      }
    } else if (p.st === 'bar' || p.st === 'intern') {
      m.title = p.n || (p.st === 'bar' ? 'Bar' : t('Interne Fläche', 'Internal area', 'Surface interne'));
      m.col = COL_BAR;
      m.info = t('Gastro- und Servicefläche des Veranstalters — nicht im Verkauf.', 'Catering / service area of the organiser — not for sale.', 'Surface gastro / service de l’organisateur — non commercialisée.');
    } else {
      m.title = MODE === 'space' ? t('Frei – verfügbar', 'Free – available', 'Libre – disponible') : t('Noch frei', 'Still available', 'Encore libre');
      if (MODE === 'space') {
        m.rows = (size ? row(t('Masse', 'Dimensions', 'Dimensions'), size) : '') + (m2 ? row(t('Fläche', 'Area', 'Surface'), m2) : '');
        m.priceHtml = !GATE.unlocked() ? gateHtml(id) : (p.p
          ? '<div class="plan-price">CHF ' + fmt(p.p) + ' <small>' + t('exkl. MwSt.', 'excl. VAT', 'hors TVA') + '</small></div>'
          : '<div class="plan-price" style="font-size:19px">' + t('Preis auf Anfrage', 'Price on request', 'Prix sur demande') + '</div>');
        m.mail = true;
      } else {
        m.title = t('Wird noch vergeben', 'Coming soon', 'Bientôt attribué');
        m.col = '#8b96a2';
        m.info = t('Hier entsteht noch ein Stand — der Aussteller folgt.', 'A booth is still to come here — exhibitor to follow.', 'Un stand arrive ici — exposant à venir.');
      }
    }
    return m;
  }

  function logoInto(bx, img, logo) {
    var grid = bx.querySelector('.plan-logogrid');
    if (!logo) { bx.style.display = 'none'; img.classList.remove('ld'); img.removeAttribute('src'); if (grid) grid.remove(); return; }
    /* Массив = композиция: первый логотип во всю ширину, остальные —
       сетка 2×2 одинаковых ячеек под ним (HTML, не склеенная картинка) */
    if (Array.isArray(logo)) {
      bx.style.display = 'block';
      img.style.display = 'none'; img.classList.remove('ld'); img.removeAttribute('src');
      if (!grid) { grid = document.createElement('div'); grid.className = 'plan-logogrid'; bx.appendChild(grid); }
      grid.innerHTML = '<div class="plg-main"><img alt="" src="assets/logos/' + logo[0] + '"></div>' +
        '<div class="plg-grid">' + logo.slice(1).map(function (f) {
          return '<div class="plg-cell"><img alt="" src="assets/logos/' + f + '"></div>';
        }).join('') + '</div>';
      return;
    }
    if (grid) grid.remove();
    img.style.display = '';
    bx.style.display = 'block'; img.classList.remove('ld');
    img.onload = function () {
      img.classList.add('ld');
      /* картинка целиком, строго в своей пропорции: рамка обнимает её по высоте */
      bx.style.aspectRatio = 'auto';
    };
    img.src = 'assets/logos/' + logo;
  }
  function setLoc(stripeEl, locEl, m) {
    stripeEl.style.background = m.col;
    locEl.textContent = 'Stand ' + m.id + ' · ' + m.area;
    locEl.style.background = m.col;
    locEl.style.color = '#fff';
  }
  function mailHref(id) {
    return 'mailto:yves@motozuerich.ch?subject=' + encodeURIComponent('Standanfrage MOTO-ZÜRICH 2027 – Stand ' + id);
  }
  function linksHtml(links) {
    return links.map(function (l) {
      return '<a class="pd-link" target="_blank" rel="noopener" href="' + l[1] + '"><span>' + l[0] + '</span><span aria-hidden="true">→</span></a>';
    }).join('');
  }

  /* ---------- Hover-Vorschau (Desktop) ---------- */
  function preview(id, e) {
    if (!hoverable || isMobile() || selEl === e) return;
    var m = meta(id);
    logoInto(el('c-logobox'), el('c-logo'), m.logo);
    el('c-name').textContent = m.title;
    setLoc(el('c-stripe'), el('c-loc'), m);
    el('c-hint').textContent = '';
    el('c-extra').innerHTML = MODE === 'space' ? m.rows : '';
    el('c-cta').style.display = 'none';
    place(e);
  }
  function hidePreview() { if (hoverable && !isMobile()) pop.classList.remove('open'); }

  function fillDetail(id) {
    var m = meta(id); det.classList.add('on');
    logoInto(el('d-logobox'), el('d-logo'), m.logo);
    el('d-name').textContent = m.title;
    setLoc(el('d-stripe'), el('d-loc'), m);
    el('d-rows').innerHTML = m.rows + m.priceHtml;
    el('d-info').textContent = m.info || '';
    el('d-links').innerHTML = m.links ? linksHtml(m.links) : '';
    var cta = el('d-cta'); cta.style.display = m.mail ? 'block' : 'none';
    if (m.mail) el('d-mail').href = mailHref(id);
    var alt = el('d-alt');
    if (alt) alt.style.display = (MODE === 'visitor' && m.st === 'free') ? 'block' : 'none';
    if (window.matchMedia('(max-width:980px)').matches) {
      var r = det.getBoundingClientRect();
      if (r.top > window.innerHeight - 140) window.scrollTo({ top: Math.max(0, window.pageYOffset + r.top - 90), behavior: 'smooth' });
    }
  }
  function fillSheet(id) {
    var m = meta(id);
    logoInto(el('c-logobox'), el('c-logo'), m.logo);
    el('c-name').textContent = m.title;
    setLoc(el('c-stripe'), el('c-loc'), m);
    el('c-hint').textContent = m.info || '';
    var lh = m.links ? linksHtml(m.links) : '';
    el('c-extra').innerHTML = m.rows + m.priceHtml + (lh ? '<div class="pd-links" style="margin-top:14px">' + lh + '</div>' : '');
    var cta = el('c-cta'); cta.style.display = m.mail ? 'block' : 'none';
    if (m.mail) el('c-mail').href = mailHref(id);
    var sh = el('c-show'); if (sh) { sh.hidden = false; sh.setAttribute('data-id', id); }
    pop.scrollTop = 0;
    if (window.MZ_MAP) window.MZ_MAP.centerStand(id);
  }
  function place(e) {
    if (isMobile()) return;
    var hr = e.getBoundingClientRect(), br = box.getBoundingClientRect();
    pop.classList.add('open');
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var cx = hr.left - br.left + hr.width / 2;
    var left = Math.max(8, Math.min(cx - pw / 2, br.width - pw - 8));
    var top = hr.bottom - br.top + 14, below = false;
    if (top + ph > br.height - 8 && hr.top - br.top - ph - 14 > 8) { top = hr.top - br.top - ph - 14; below = true; }
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
    pop.classList.toggle('below', below);
    pop.style.setProperty('--arrow-x', Math.max(16, Math.min(cx - left - 6, pw - 28)) + 'px');
  }
  /* Karten-Pin: springt beim Auswählen auf den Stand — Verkaufsplan: freie
     Flächen, Besucherplan: Aussteller */
  var pin = document.createElement('div');
  pin.className = 'plan-pin';
  pin.innerHTML = '<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 1C7.8 1 2 6.8 2 14c0 9.6 13 23 13 23s13-13.4 13-23C28 6.8 22.2 1 15 1z" fill="currentColor"/><path d="M6.5 9.5C7.8 6.2 10.9 4 14.4 4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".55"/><circle cx="15" cy="14" r="5.2" fill="#fff"/></svg>';
  plan.appendChild(pin);
  function movePin(id) {
    var want = id && MODE === 'space' && S[id].st === 'free';
    if (!want) { pin.classList.remove('on'); return; }
    var p = S[id];
    pin.style.left = (p.x + p.w / 2) + '%';
    pin.style.top = (p.y + p.h * 0.12) + '%';
    pin.classList.remove('green', 'grey');
    if (p.z === 'halld') pin.classList.add('green');
    pin.classList.remove('on'); void pin.offsetWidth; pin.classList.add('on');
  }
  function select(id, e) {
    selId = id;
    if (selEl) selEl.classList.remove('sel');
    /* SVG-Polygone kennen classList ebenfalls — kein Sonderfall nötig */
    selEl = null;
    if (e) { e.classList.add('sel'); selEl = e; }
    movePin(e ? id : null);
    if (isMobile()) { fillSheet(id); pop.classList.add('open'); scrim.classList.add('open'); }
    else { pop.classList.remove('open'); fillDetail(id); }
  }
  function close() {
    pop.classList.remove('open'); scrim.classList.remove('open');
    movePin(null);
    selId = null;
    if (selEl) { selEl.classList.remove('sel'); selEl = null; }
  }
  el('pop-close').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('click', function (ev) {
    if (pop.classList.contains('open') && !pop.contains(ev.target) && !ev.target.classList.contains('plan-hot')) close();
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') close(); });

  /* ---------- Suche ---------- */
  (function () {
    var input = el('ps-input'), results = el('ps-results'), clr = el('ps-clear');
    if (!input) return;
    var index = Object.keys(S).filter(function (id) { return hotEls[id]; }).map(function (id) {
      var p = S[id], m = meta(id);
      return { id: id, area: m.area, label: p.n || m.title, search: (id + ' ' + (p.n || '') + ' ' + m.title + ' ' + m.area).toLowerCase() };
    });
    var cur = -1;
    function render(list) {
      cur = -1;
      if (!input.value.trim()) { results.hidden = true; return; }
      if (!list.length) { results.innerHTML = '<li class="ps-empty">' + t('Nichts gefunden', 'No matches', 'Aucun résultat') + '</li>'; results.hidden = false; return; }
      results.innerHTML = list.slice(0, 40).map(function (it) {
        return '<li data-id="' + it.id + '"><span class="ps-id">' + it.id + '</span><span class="ps-lbl">' + it.label + '</span></li>';
      }).join('');
      results.hidden = false;
    }
    function query(q) {
      q = q.trim().toLowerCase(); if (!q) return [];
      return index.filter(function (it) { return it.search.indexOf(q) >= 0; })
        .sort(function (a, b) { return a.id.localeCompare(b.id, undefined, { numeric: true }); });
    }
    function goTo(id) {
      var e = hotEls[id]; if (!e) return;
      results.hidden = true;
      if (isMobile()) { input.blur(); if (window.MZ_TABS) window.MZ_TABS('map'); }
      var r = box.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.pageYOffset + r.top - 72), behavior: 'smooth' });
      if (isMobile() && window.MZ_MAP) window.MZ_MAP.zoomToStand(id);
      select(id, e);
      e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash');
      setTimeout(function () { e.classList.remove('flash'); }, 1200);
    }
    input.addEventListener('input', function () { clr.hidden = !input.value; render(query(input.value)); });
    input.addEventListener('focus', function () { if (input.value) render(query(input.value)); });
    input.addEventListener('keydown', function (ev) {
      if (results.hidden) return;
      var items = results.querySelectorAll('li[data-id]');
      if (ev.key === 'ArrowDown') { ev.preventDefault(); cur = Math.min(cur + 1, items.length - 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); cur = Math.max(cur - 1, 0); }
      else if (ev.key === 'Enter') { ev.preventDefault(); var pick = cur >= 0 ? items[cur] : items[0]; if (pick) goTo(pick.getAttribute('data-id')); return; }
      else if (ev.key === 'Escape') { results.hidden = true; return; }
      for (var i = 0; i < items.length; i++) items[i].classList.toggle('on', i === cur);
    });
    results.addEventListener('click', function (ev) { var li = ev.target.closest('li[data-id]'); if (li) { ev.stopPropagation(); goTo(li.getAttribute('data-id')); } });
    clr.addEventListener('click', function () { input.value = ''; clr.hidden = true; results.hidden = true; input.focus(); });
    document.addEventListener('click', function (ev) { if (!el('plan-search').contains(ev.target)) results.hidden = true; });
    window.MZ_GOTO = goTo;
  })();

  /* ---------- Filter (nur Standflächen) ---------- */
  var filtBox = el('filters');
  if (filtBox && MODE === 'space') {
    filtBox.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-filt]'); if (!b) return;
      var f = b.getAttribute('data-filt'), on = !b.classList.contains('on');
      var bs = filtBox.querySelectorAll('button[data-filt]');
      for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', bs[i] === b && on);
      plan.classList.toggle('only-free', on && f === 'free');
      plan.classList.toggle('only-big', on && f === 'big');
      plan.classList.toggle('only-small', on && f === 'small');
    });
  }

  /* ---------- Mobile: Pan / Pinch / Zonen ---------- */
  var ASPECT = DATA.W / DATA.H;
  var MAP = (function () {
    var scale = 0.01, tx = 0, ty = 0, fit = 1, MAX = 7; /* стартовый scale < fit → первый refit ставит ровно fit (карта целиком, с воздухом) */
    function on() { return window.matchMedia('(max-width:760px)').matches; }
    function dm() { return { vw: box.clientWidth, vh: box.clientHeight, pw: plan.offsetWidth, ph: plan.offsetHeight }; }
    function calcFit() { var m = dm(); fit = (m.ph && m.vh) ? Math.min(m.vw / m.pw, m.vh / m.ph) * 0.92 : 1; return fit; }
    function clamp() {
      var m = dm(), w = m.pw * scale, h = m.ph * scale;
      tx = w <= m.vw ? (m.vw - w) / 2 : Math.min(0, Math.max(m.vw - w, tx));
      ty = h <= m.vh ? (m.vh - h) / 2 : Math.min(0, Math.max(m.vh - h, ty));
    }
    function sizeBox() {
      if (box.classList.contains('full')) { box.style.height = ''; box.style.aspectRatio = ''; return; }
      var pw = box.clientWidth; if (!pw) return;
      var ph = pw / ASPECT;
      /* Karte deutlich höher als das natürliche Seitenverhältnis: füllt bis ~68vh,
         der Plan wird auf die Boxhöhe skaliert (fit>1) und ist horizontal pannbar */
      var base = Math.round(Math.min(window.innerHeight * 0.62, ph * 1.55));
      box.style.aspectRatio = 'auto';
      box.style.height = base + 'px';
    }
    function apply() {
      if (!on()) { plan.style.transform = ''; plan.style.transition = ''; box.style.touchAction = ''; box.style.height = ''; box.style.aspectRatio = ''; return; }
      sizeBox(); clamp();
      plan.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      var m = dm();
      box.style.touchAction = (m.ph * scale > m.vh + 1) ? 'none' : 'pan-y';
    }
    function smooth(v) { plan.style.transition = v ? 'transform .28s cubic-bezier(.22,.61,.36,1)' : 'none'; }
    function glide(fn) { smooth(true); fn(); setTimeout(function () { smooth(false); }, 320); }
    function zoomAt(cx, cy, ns, anim) {
      ns = Math.min(MAX, Math.max(fit, ns));
      var run = function () { var k = ns / scale; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; scale = ns; apply(); };
      anim ? glide(run) : run();
    }
    function center(px, py, ns) { var m = dm(); scale = Math.min(MAX, Math.max(fit, ns)); tx = m.vw / 2 - m.pw * px / 100 * scale; ty = m.vh / 2 - m.ph * py / 100 * scale; apply(); }
    function toRect(r) {
      if (!on()) return; var m = dm(); if (!m.vw) return;
      var rw = m.pw * r.w / 100 * 1.06, rh = m.ph * r.h / 100 * 1.06;
      glide(function () { center(r.l + r.w / 2, r.t + r.h / 2, Math.min(m.vw / rw, m.vh / rh)); });
    }
    function reset() { if (!on()) return; glide(function () { calcFit(); scale = fit; apply(); }); }
    function refit() { if (!on()) { box.style.height = ''; box.style.aspectRatio = ''; plan.style.transform = ''; return; } var m = dm(); if (!m.vw) return; sizeBox(); calcFit(); if (scale < fit) scale = fit; apply(); }
    function zoomToStand(id) { if (!on()) return; var p = S[id]; if (!p) return; glide(function () { center(p.x + p.w / 2, p.y + p.h / 2, Math.max(2.6, scale)); }); }
    function centerStand(id) { if (!on()) return; var p = S[id]; if (!p) return; glide(function () { center(p.x + p.w / 2, p.y + p.h / 2, scale); }); }
    var pts = {}, sd = 0, ss = 1, smid = null, st = null, moved = false, lastTap = 0, ltx = 0, lty = 0;
    function rel(tc) { var r = box.getBoundingClientRect(); return { x: tc.clientX - r.left, y: tc.clientY - r.top }; }
    box.addEventListener('touchstart', function (e) {
      if (!on()) return;
      if (e.target.closest && e.target.closest('.plan-pop')) return; /* тачи внутри шита = его скролл, не пан карты */
      moved = false; smooth(false);
      for (var i = 0; i < e.changedTouches.length; i++) { var tc = e.changedTouches[i]; pts[tc.identifier] = rel(tc); }
      var ids = Object.keys(pts);
      if (ids.length === 2) { var a = pts[ids[0]], b2 = pts[ids[1]]; sd = Math.hypot(a.x - b2.x, a.y - b2.y) || 1; ss = scale; smid = { x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2 }; st = { tx: tx, ty: ty }; }
      else if (ids.length === 1) { st = { tx: tx, ty: ty, x: pts[ids[0]].x, y: pts[ids[0]].y }; }
    }, { passive: false });
    box.addEventListener('touchmove', function (e) {
      if (!on()) return;
      if (e.target.closest && e.target.closest('.plan-pop')) return;
      for (var i = 0; i < e.changedTouches.length; i++) { var tc = e.changedTouches[i]; if (pts[tc.identifier]) pts[tc.identifier] = rel(tc); }
      var ids = Object.keys(pts), m = dm();
      if (ids.length === 2 && sd) {
        e.preventDefault(); moved = true;
        var a = pts[ids[0]], b2 = pts[ids[1]];
        var ns = Math.min(MAX, Math.max(fit, ss * (Math.hypot(a.x - b2.x, a.y - b2.y) / sd)));
        tx = smid.x - (smid.x - st.tx) * (ns / ss); ty = smid.y - (smid.y - st.ty) * (ns / ss); scale = ns; apply();
      } else if (ids.length === 1 && st) {
        var p = pts[ids[0]], dx = p.x - st.x, dy = p.y - st.y;
        var canX = m.pw * scale > m.vw + 1, canY = m.ph * scale > m.vh + 1;
        if (!canX && !canY) return;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        if (!canY && Math.abs(dy) > Math.abs(dx) * 1.2) return;
        e.preventDefault(); moved = true;
        if (canX) tx = st.tx + dx;
        if (canY) ty = st.ty + dy;
        apply();
      }
    }, { passive: false });
    box.addEventListener('touchend', function (e) {
      if (e.target.closest && e.target.closest('.plan-pop')) return;
      var was = moved;
      for (var i = 0; i < e.changedTouches.length; i++) delete pts[e.changedTouches[i].identifier];
      var n = Object.keys(pts).length;
      if (n < 2) sd = 0;
      if (!n) st = null;
      if (!on()) return;
      if (!was && !n && e.changedTouches.length === 1) {
        var now = Date.now(), p = rel(e.changedTouches[0]);
        if (now - lastTap < 330 && Math.hypot(p.x - ltx, p.y - lty) < 32) { zoomAt(p.x, p.y, scale < fit * 1.7 ? fit * 2.8 : fit, true); lastTap = 0; }
        else { lastTap = now; ltx = p.x; lty = p.y; }
      }
    });
    plan.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(refit, 150); });
    window.addEventListener('orientationchange', function () { setTimeout(function () { reset(); }, 350); });
    if (document.readyState === 'complete') refit(); else window.addEventListener('load', refit);
    setTimeout(refit, 400);
    return { toRect: toRect, reset: reset, refit: refit, zoomAt: zoomAt, zoomToStand: zoomToStand, centerStand: centerStand, get scale() { return scale; }, get fit() { return fit; } };
  })();
  window.MZ_MAP = MAP;
  window.MZ_PLAN = { select: select, meta: meta, hotEls: hotEls, close: close, isMobile: isMobile, mode: MODE };

  /* ---------- Zonen-Buttons, Vollbild, Zoom-UI ---------- */
  var ov = el('planov');
  if (ov) ov.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-zone]'); if (!b) return;
    var z = DATA.zones[b.getAttribute('data-zone')];
    if (z && window.MZ_MAP) window.MZ_MAP.toRect(z); else if (window.MZ_MAP) window.MZ_MAP.reset();
    var tip = el('plantip'); if (tip) tip.classList.add('gone');
  });
  var fs = el('mfull');
  function toggleFull(v) {
    if (!box) return;
    box.classList.toggle('full', v); document.body.classList.toggle('mz-mapfull', v);
    if (fs) { fs.textContent = v ? '✕' : '⤢'; }
    if (window.MZ_MAP) setTimeout(function () { window.MZ_MAP.refit(); }, 70);
  }
  if (fs) fs.addEventListener('click', function () { toggleFull(!box.classList.contains('full')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('full')) toggleFull(false); });
  ['zin', 'zout', 'zreset'].forEach(function (id) {
    var b = el(id); if (!b) return;
    b.addEventListener('click', function () {
      if (!window.MZ_MAP) return;
      var r = box.getBoundingClientRect();
      if (id === 'zreset') window.MZ_MAP.reset();
      else window.MZ_MAP.zoomAt(r.width / 2, r.height / 2, window.MZ_MAP.scale * (id === 'zin' ? 1.7 : 1 / 1.7), true);
      var tip = el('plantip'); if (tip) tip.classList.add('gone');
    });
  });
  var tip = el('plantip');
  if (tip && box) { box.addEventListener('touchstart', function () { tip.classList.add('gone'); }, { passive: true }); setTimeout(function () { tip.classList.add('gone'); }, 7000); }
  if (pop) new MutationObserver(function () {
    document.body.classList.toggle('mz-sheet', pop.classList.contains('open') && isMobile());
  }).observe(pop, { attributes: true, attributeFilter: ['class'] });
  var show = el('c-show');
  if (show) show.addEventListener('click', function () {
    var id = show.getAttribute('data-id'); if (!id) return;
    if (window.MZ_TABS) window.MZ_TABS('map');
    if (window.MZ_MAP) window.MZ_MAP.zoomToStand(id);
    pop.classList.remove('open');
    scrim.classList.remove('open');
    if (!box.classList.contains('full')) { var r = box.getBoundingClientRect(); window.scrollTo({ top: Math.max(0, window.pageYOffset + r.top - 64), behavior: 'smooth' }); }
  });

  /* ---------- Mobile-Tabs + Liste ---------- */
  var root = el('planroot'), tabs = el('mtabs'), list = el('mlist');
  /* Im Listen-Modus ist .plan-flex ausgeblendet — das Bottom-Sheet liegt aber
     darin. Also wandert es solange an den Body (mobil ohnehin position:fixed)
     und kommt für die Karte / Desktop wieder in die .plan-box zurück. */
  function popHome() { if (pop && pop.parentElement !== box) box.appendChild(pop); }
  function popFloat() { if (pop && pop.parentElement !== document.body) document.body.appendChild(pop); }
  window.addEventListener('resize', function () { if (!isMobile()) popHome(); });
  function setTab(mode) {
    if (!tabs || !root) return;
    root.classList.toggle('list-mode', mode === 'list');
    if (mode === 'list') popFloat(); else popHome();
    var bs = tabs.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-mtab') === mode);
    if (mode === 'map' && window.MZ_MAP) setTimeout(function () { window.MZ_MAP.refit(); }, 30);
  }
  window.MZ_TABS = setTab;
  if (tabs) tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-mtab]'); if (b) setTab(b.getAttribute('data-mtab')); });
  function buildList() {
  if (list) {
    var order = MODE === 'space'
      ? [['h550', 'Halle 550'], ['halld', AREA.halld], ['og', AREA.og], ['eg', AREA.eg]]
      : [['eg', AREA.eg], ['og', AREA.og], ['h550', 'Halle 550'], ['halld', AREA.halld]];
    var html = '';
    order.forEach(function (g) {
      var ids = Object.keys(S).filter(function (id) {
        if (S[id].z !== g[0]) return false;
        return MODE === 'space' ? !!hotEls[id] : true;
      }).sort(function (a, b) {
        if (MODE === 'visitor') {
          var an = S[a].st === 'taken' ? 0 : 1, bn = S[b].st === 'taken' ? 0 : 1;
          if (an !== bn) return an - bn;
        }
        return a.localeCompare(b, undefined, { numeric: true });
      });
      if (!ids.length) return;
      html += '<div class="ml-h">' + g[1] + ' · ' + ids.length + '</div>';
      ids.forEach(function (id) {
        var p = S[id], m = meta(id), cls = '', sub = '', right = '';
        if (p.st === 'taken') { cls = ' is-taken'; sub = MODE === 'space' ? t('belegt 2027', 'booked 2027', 'occupé 2027') : m.area; right = MODE === 'space' ? '—' : ''; }
        else if (p.st === 'bar' || p.st === 'intern') { cls = ' is-zone'; sub = t('Gastro / Service', 'Catering / service', 'Gastro / service'); }
        else {
          sub = (p.m ? p.m + ' m' : '') + (p.m2 ? ' · ' + p.m2 + ' m²' : '');
          right = MODE === 'space' ? (!GATE.unlocked() ? '•••' : (p.p ? 'CHF ' + fmt(p.p) : t('Anfrage', 'On request', 'Sur demande'))) : '';
        }
        html += '<button type="button" class="ml-row' + cls + ' z-' + p.z + '" data-id="' + id + '"><span class="ml-id">' + id + '</span>' +
          '<span class="ml-tx"><span class="ml-t">' + m.title + '</span>' + (sub ? '<span class="ml-s">' + sub + '</span>' : '') + '</span>' +
          (right ? '<span class="ml-p">' + right + '</span>' : '') + '</button>';
      });
    });
    list.innerHTML = html;
    list.setAttribute('data-built', '1');
    if (!list.getAttribute('data-wired')) {
      list.setAttribute('data-wired', '1');
      list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-id]'); if (!b) return;
      /* nicht bis zum Dokument-Listener durchlassen — der würde das gerade
         geöffnete Bottom-Sheet sofort wieder schliessen */
      e.stopPropagation();
      var id = b.getAttribute('data-id');
      select(id, hotEls[id]);
    });
    }
  }
  }
  buildList();

  /* ---------- Preistabelle (nur Standflächen) ---------- */
  var tb = el('price-rows');
  function buildTable() {
  if (tb && MODE === 'space') {
    var locked = !GATE.unlocked();
    var keys = Object.keys(S).filter(function (id) { return S[id].st === 'free'; })
      .sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
    tb.innerHTML = (locked ? '<tr class="pt-gate"><td colspan="5">' + gateHtml() + '</td></tr>' : '') +
      keys.map(function (id) {
      var p = S[id];
      return '<tr data-stand="' + id + '"><td class="pt-id">' + id + '</td>' +
        '<td><span class="pt-pill">' + t('Frei', 'Free', 'Libre') + '</span></td>' +
        '<td>' + (p.m ? p.m + ' m' : '—') + '</td>' +
        '<td>' + (p.m2 ? p.m2 + ' m²' : '—') + '</td>' +
        '<td class="pt-price">' + (locked ? '•••' : (p.p ? 'CHF ' + fmt(p.p) : t('Auf Anfrage', 'On request', 'Sur demande'))) + '</td></tr>';
    }).join('');
    if (!tb.getAttribute('data-wired')) {
      tb.setAttribute('data-wired', '1');
      tb.addEventListener('click', function (ev) {
      var tr = ev.target.closest('tr[data-stand]'); if (!tr) return;
      ev.stopPropagation();
      if (window.MZ_GOTO) window.MZ_GOTO(tr.getAttribute('data-stand'));
    });
    }
  }
  }
  buildTable();
  /* Nach Freischaltung alles neu zeichnen (Liste, Tabelle, offenes Panel) */
  GATE.onChange(function () {
    buildList(); buildTable();
    if (selId) { if (isMobile()) fillSheet(selId); else if (det) fillDetail(selId); }
  });
  var accBtn = el('acc-btn'), accBody = el('acc-body');
  if (accBtn && accBody) accBtn.addEventListener('click', function () {
    var exp = accBtn.getAttribute('aria-expanded') === 'true';
    accBtn.setAttribute('aria-expanded', String(!exp));
    var acc = accBtn.closest('.plan-acc'); if (acc) acc.classList.toggle('open', !exp);
    if (exp) accBody.setAttribute('hidden', ''); else accBody.removeAttribute('hidden');
  });

  /* ---------- Zähler im Kopf ---------- */
  var stat = el('plan-stats');
  if (stat) {
    var all = Object.keys(S), free = all.filter(function (i) { return S[i].st === 'free'; }).length;
    var taken = all.filter(function (i) { return S[i].st === 'taken'; }).length;
    stat.innerHTML = MODE === 'space'
      ? '<b>' + free + '</b> ' + t('freie Flächen', 'available spaces', 'surfaces libres') + ' · <b>' + taken + '</b> ' + t('belegt', 'booked', 'occupées')
      : '<b>' + taken + '</b> ' + t('Aussteller bestätigt', 'exhibitors confirmed', 'exposants confirmés') + ' · ' + t('Stand', 'as of', 'état') + ' ' + (DATA.asof || 'August 2026');
  }
})();
