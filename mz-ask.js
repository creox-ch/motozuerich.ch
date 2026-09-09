/* ============================================================
   MOTO-ZÜRICH — mz-ask.js
   «Frage stellen»-Widget: ?-Button unten rechts, erscheint nach dem
   Scrollen. Panel = die wichtigsten Fragen als Schnellantworten +
   Formular für eine eigene Frage.
   · Als LETZTES Script laden (nach mz-i18n.js / mz-page.js), damit der
     i18n-Capture das Widget nicht erfasst. Sprache folgt <html lang>.
   · BACKEND-HOOK: window.MZ_ASK_ENDPOINT (POST JSON {question, email,
     page, lang}). Ohne Endpoint: mailto an MAIL + Link zum Kontaktformular.
   ============================================================ */
(function () {
  if (document.getElementById('mz-ask-fab')) return;
  var ENDPOINT = window.MZ_ASK_ENDPOINT || 'https://slswiss-tickets.vercel.app/api/forms';
  var START = Date.now();
  var MAIL = 'team@motozuerich.ch';
  var FORM = '/kontakt';

  var T = {
    de: { eyebrow: 'MOTO-ZÜRICH 2027 · Hilfe', title: 'Fragen? Wir helfen.', hot: 'Die häufigsten Fragen', more: 'Mehr dazu →',
          ask: 'Deine Frage', ph: 'Was möchtest du wissen?', mail: 'Deine E-Mail', send: 'Frage senden →',
          note: 'Wir melden uns per E-Mail.', errQ: 'Bitte eine Frage eingeben.', errM: 'Bitte gültige E-Mail eingeben.',
          ok: 'Danke! Deine Frage ist bei uns – wir melden uns per E-Mail.', okMail: 'Dein E-Mail-Programm öffnet sich mit deiner Frage. Falls nichts passiert:',
          form: 'Zum Kontaktformular →', faq: 'Alle Antworten (FAQ) →', open: 'Frage stellen', close: 'Schliessen', subject: 'Frage über motozuerich.ch',
          consent: 'Meine Angaben dürfen zur Beantwortung meiner Frage verarbeitet werden.', errC: 'Bitte die Einwilligung bestätigen.' },
    en: { eyebrow: 'MOTO-ZÜRICH 2027 · Help', title: 'Questions? We help.', hot: 'Most asked', more: 'Read more →',
          ask: 'Your question', ph: 'What would you like to know?', mail: 'Your email', send: 'Send question →',
          note: 'We reply by email.', errQ: 'Please enter a question.', errM: 'Please enter a valid email.',
          ok: 'Thanks! We have your question and will reply by email.', okMail: 'Your mail app opens with your question. If nothing happens:',
          form: 'Contact form →', faq: 'All answers (FAQ) →', open: 'Ask a question', close: 'Close', subject: 'Question via motozuerich.ch',
          consent: 'My details may be processed to answer my question.', errC: 'Please confirm the consent.' },
    fr: { eyebrow: 'MOTO-ZÜRICH 2027 · Aide', title: 'Des questions ? On vous aide.', hot: 'Questions fréquentes', more: 'En savoir plus →',
          ask: 'Votre question', ph: 'Que souhaitez-vous savoir ?', mail: 'Votre e-mail', send: 'Envoyer →',
          note: 'Nous répondons par e-mail.', errQ: 'Veuillez saisir une question.', errM: 'Veuillez saisir un e-mail valide.',
          ok: 'Merci ! Nous avons bien reçu votre question et répondrons par e-mail.', okMail: 'Votre messagerie s’ouvre avec votre question. Si rien ne se passe :',
          form: 'Formulaire de contact →', faq: 'Toutes les réponses (FAQ) →', open: 'Poser une question', close: 'Fermer', subject: 'Question via motozuerich.ch',
          consent: 'Mes données peuvent être traitées pour répondre à ma question.', errC: 'Veuillez confirmer le consentement.' }
  };
  /* Schnellantworten – kurz, verlinkt auf die Seite mit Details */
  var Q = [
    { href: '/faq',
      q: { de: 'Wann und wo findet die MOTO-ZÜRICH 2027 statt?', en: 'When and where is MOTO-ZÜRICH 2027?', fr: 'Quand et où a lieu MOTO-ZÜRICH 2027 ?' },
      a: { de: '<b>19.–21. Februar 2027</b> im StageOne und in der Halle 550, Zürich-Oerlikon. Öffnungszeiten: Fr 09–20, Sa 09–20, So 09–17 Uhr.',
           en: '<b>19–21 February 2027</b> at StageOne and Halle 550, Zürich-Oerlikon. Opening hours: Fri 09–20, Sat 09–20, Sun 09–17.',
           fr: '<b>19–21 février 2027</b> au StageOne et à la Halle 550, Zurich-Oerlikon. Horaires : ve 09–20, sa 09–20, di 09–17.' } },
    { href: '/tickets',
      q: { de: 'Gibt es schon Tickets?', en: 'Are tickets available yet?', fr: 'Y a-t-il déjà des billets ?' },
      a: { de: 'Noch nicht – der Ticketshop öffnet im <b>November 2026</b>. Kinder bis 12 Jahre haben in Begleitung eines Erwachsenen freien Eintritt.',
           en: 'Not yet – the ticket shop opens in <b>November 2026</b>. Children up to 12 enter free when accompanied by an adult.',
           fr: 'Pas encore – la billetterie ouvre en <b>novembre 2026</b>. Entrée gratuite pour les enfants jusqu’à 12 ans accompagnés d’un adulte.' } },
    { href: '/faq#parking',
      q: { de: 'Wie komme ich hin – ÖV und Parking?', en: 'How do I get there – transit and parking?', fr: 'Comment venir – transports et parking ?' },
      a: { de: 'Am besten mit dem ÖV: Der <b>Bahnhof Oerlikon</b> liegt in unmittelbarer Nähe. Das StageOne hat keine eigenen Parkplätze – öffentliche Parkhäuser und Motorrad-Abstellplätze gibt es in der Umgebung.',
           en: 'Best by public transport: <b>Oerlikon station</b> is right nearby. StageOne has no parking of its own – public car parks and motorcycle bays are close by.',
           fr: 'Idéalement en transports publics : la <b>gare d’Oerlikon</b> est à deux pas. Le StageOne n’a pas de parking propre – parkings publics et places moto à proximité.' } },
    { href: '/programm',
      q: { de: 'Was läuft im Programm?', en: 'What’s on the programme?', fr: 'Quel est le programme ?' },
      a: { de: '<b>Live Arena</b> mit Talks und Interviews, die neue <b>Indoor-FMX-Show</b> in der Action Zone (Mat Rebeaud, Mike Pfister) und das <b>Adventure Camp</b> in Hall D.',
           en: '<b>Live Arena</b> with talks and interviews, the new <b>indoor FMX show</b> in the Action Zone (Mat Rebeaud, Mike Pfister) and the <b>Adventure Camp</b> in Hall D.',
           fr: '<b>Live Arena</b> avec talks et interviews, le nouveau <b>show FMX indoor</b> dans l’Action Zone (Mat Rebeaud, Mike Pfister) et l’<b>Adventure Camp</b> en Hall D.' } },
    { href: '/standflaechen',
      q: { de: 'Ich möchte ausstellen – wie geht das?', en: 'I want to exhibit – how does it work?', fr: 'Je veux exposer – comment faire ?' },
      a: { de: 'Alle freien Flächen mit Massen und Preisen findest du im <b>Standflächen-Plan</b>. Anfrage direkt aus der Karte oder per E-Mail an <a href="mailto:yves@motozuerich.ch">yves@motozuerich.ch</a>.',
           en: 'All available spaces with dimensions and prices are in the <b>booth-space plan</b>. Enquire straight from the map or by email to <a href="mailto:yves@motozuerich.ch">yves@motozuerich.ch</a>.',
           fr: 'Toutes les surfaces libres avec dimensions et prix sont dans le <b>plan des surfaces</b>. Demande directement depuis le plan ou par e-mail à <a href="mailto:yves@motozuerich.ch">yves@motozuerich.ch</a>.' } },
    { href: '/volunteers',
      q: { de: 'Mitmachen als Volunteer oder Creator?', en: 'Join as a volunteer or creator?', fr: 'Participer comme bénévole ou créateur ?' },
      a: { de: '<b>Volunteers</b> unterstützen an Bar, Einlass und Infodesk – mit Zertifikat und Tageseintritten. <b>Creators</b> zeigen ihre Perspektive im <a href="/creators">Online-Foto-Wettbewerb 2027</a>.',
           en: '<b>Volunteers</b> help at the bar, entrance and info desk – with a certificate and day passes. <b>Creators</b> show their view in the <a href="/creators">online photo contest 2027</a>.',
           fr: 'Les <b>bénévoles</b> aident au bar, à l’entrée et à l’infodesk – certificat et entrées à la clé. Les <b>créateurs</b> participent au <a href="/creators">concours photo en ligne 2027</a>.' } }
  ];

  function lang() { var l = (document.documentElement.getAttribute('lang') || 'de').slice(0, 2); return T[l] ? l : 'de'; }
  function t(k) { return T[lang()][k]; }

  /* ---------- DOM ---------- */
  var fab = document.createElement('button');
  fab.type = 'button'; fab.id = 'mz-ask-fab'; fab.className = 'mz-ask-fab';
  fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'mz-ask');
  fab.innerHTML = '<span class="mz-ask-fab-q" aria-hidden="true">?</span><span class="mz-ask-fab-x" aria-hidden="true">×</span>';

  var panel = document.createElement('div');
  panel.id = 'mz-ask'; panel.className = 'mz-ask'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.hidden = true;
  panel.innerHTML =
    '<div class="mz-ask-head"><span class="mz-ask-eyebrow" data-k="eyebrow"></span><h3 class="mz-ask-title" data-k="title"></h3></div>' +
    '<div class="mz-ask-hot"><div class="mz-ask-label" data-k="hot"></div><div class="mz-ask-list" id="mz-ask-list"></div></div>' +
    '<form class="mz-ask-form" id="mz-ask-form" novalidate>' +
      '<label class="mz-ask-label" for="mz-ask-q" data-k="ask"></label>' +
      '<textarea id="mz-ask-q" rows="3" required></textarea>' +
      '<label class="mz-ask-label" for="mz-ask-mail" data-k="mail"></label>' +
      '<input id="mz-ask-mail" type="email" autocomplete="email" required />' +
      '<label class="mz-ask-consent"><input type="checkbox" id="mz-ask-consent" /><span data-k="consent"></span></label>' +
      '<input id="mz-ask-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />' +
      '<div class="mz-ask-err" id="mz-ask-err" hidden></div>' +
      '<button type="submit" class="mz-ask-send" data-k="send"></button>' +
      '<div class="mz-ask-note" data-k="note"></div>' +
    '</form>' +
    '<div class="mz-ask-done" id="mz-ask-done" hidden></div>' +
    '<div class="mz-ask-foot"><a href="/faq" data-k="faq"></a><a href="' + FORM + '" data-k="form"></a></div>';

  var list = panel.querySelector('#mz-ask-list');
  Q.forEach(function (item, i) {
    var w = document.createElement('div'); w.className = 'mz-ask-item';
    w.innerHTML = '<button type="button" class="mz-ask-q" aria-expanded="false" aria-controls="mz-ask-a' + i + '"><span data-q="' + i + '"></span><span class="mz-ask-plus" aria-hidden="true">+</span></button>' +
      '<div class="mz-ask-a" id="mz-ask-a' + i + '" hidden><p data-a="' + i + '"></p><a class="mz-ask-more" href="' + item.href + '" data-k="more"></a></div>';
    list.appendChild(w);
  });

  function applyLang() {
    var L = lang();
    panel.querySelectorAll('[data-k]').forEach(function (el) { el.innerHTML = T[L][el.getAttribute('data-k')]; });
    panel.querySelectorAll('[data-q]').forEach(function (el) { el.textContent = Q[+el.getAttribute('data-q')].q[L]; });
    panel.querySelectorAll('[data-a]').forEach(function (el) { el.innerHTML = Q[+el.getAttribute('data-a')].a[L]; });
    panel.querySelector('#mz-ask-q').placeholder = T[L].ph;
    panel.querySelector('#mz-ask-mail').placeholder = 'name@mail.ch';
    fab.setAttribute('aria-label', panel.hidden ? T[L].open : T[L].close);
    fab.title = panel.hidden ? T[L].open : T[L].close;
  }
  applyLang();
  new MutationObserver(applyLang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  /* ---------- Sichtbarkeit: nach dem Scrollen ---------- */
  var shown = false;
  function reveal() { if (shown) return; shown = true; fab.classList.add('on'); }
  function onScroll() {
    if (window.scrollY > Math.min(560, window.innerHeight * 0.6)) { reveal(); window.removeEventListener('scroll', onScroll); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  /* Seite kaum scrollbar → nach kurzer Zeit trotzdem anbieten */
  setTimeout(function () {
    var se = document.scrollingElement || document.documentElement;
    if (se.scrollHeight <= window.innerHeight + 240) reveal();
  }, 3000);

  /* ---------- Öffnen / Schliessen ---------- */
  function setOpen(o) {
    panel.hidden = !o;
    fab.classList.toggle('open', o);
    fab.setAttribute('aria-expanded', o ? 'true' : 'false');
    applyLang();
    if (o) { requestAnimationFrame(function () { panel.classList.add('in'); }); }
    else panel.classList.remove('in');
  }
  fab.addEventListener('click', function () { setOpen(panel.hidden); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });
  document.addEventListener('click', function (e) {
    if (panel.hidden) return;
    if (panel.contains(e.target) || fab.contains(e.target)) return;
    setOpen(false);
  });

  /* Schnellantworten auf-/zuklappen (eine offen) */
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.mz-ask-q'); if (!b) return;
    var open = b.getAttribute('aria-expanded') === 'true';
    list.querySelectorAll('.mz-ask-q').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = true; });
    if (!open) { b.setAttribute('aria-expanded', 'true'); document.getElementById(b.getAttribute('aria-controls')).hidden = false; }
  });

  /* ---------- Senden ---------- */
  var form = panel.querySelector('#mz-ask-form'), err = panel.querySelector('#mz-ask-err'), done = panel.querySelector('#mz-ask-done');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = form.querySelector('#mz-ask-q').value.trim(), m = form.querySelector('#mz-ask-mail').value.trim();
    if (!q) { err.textContent = t('errQ'); err.hidden = false; form.querySelector('#mz-ask-q').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) { err.textContent = t('errM'); err.hidden = false; form.querySelector('#mz-ask-mail').focus(); return; }
    if (!form.querySelector('#mz-ask-consent').checked) { err.textContent = t('errC'); err.hidden = false; return; }
    err.hidden = true;
    var payload = { question: q, email: m, page: location.pathname + location.hash, lang: lang() };
    var btn = form.querySelector('.mz-ask-send'); btn.disabled = true;
    function finish(html) { form.hidden = true; done.innerHTML = html; done.hidden = false; }
    if (ENDPOINT) {
      var sub = { source: 'motozuerich', form_key: 'ask', email: m, consent: true, source_url: location.href, hp: (form.querySelector('#mz-ask-hp') || {}).value || '', elapsed_ms: Date.now() - START, payload: { Frage: q, Seite: payload.page, Sprache: payload.lang } };
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
        .then(function (r) { return r.ok ? r.json() : { ok: false }; })
        .then(function (d) { if (d && d.ok) finish('<p>' + t('ok') + '</p>'); else { btn.disabled = false; err.textContent = t('okMail'); err.hidden = false; mailFallback(payload); } })
        .catch(function () { btn.disabled = false; err.textContent = t('okMail'); err.hidden = false; mailFallback(payload); });
    } else {
      mailFallback(payload);
      finish('<p>' + t('okMail') + '</p><a href="' + FORM + '">' + t('form') + '</a>');
    }
  });
  function mailFallback(p) {
    var body = p.question + '\n\n—\n' + p.email + '\n' + location.href;
    window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(t('subject')) + '&body=' + encodeURIComponent(body);
  }
})();
