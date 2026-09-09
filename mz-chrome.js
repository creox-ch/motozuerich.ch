/* ============================================================
   MOTO-ZÜRICH — shared chrome (date bar, header/nav, partners,
   footer). Injected into every sub-page so navigation lives in
   ONE place. Set <body data-page="faq"> to mark the active nav.
   Load BEFORE mz-page.js.
   ============================================================ */
(function () {
  var HOME = '/';
  var page = document.body.getAttribute('data-page') || '';

  /* dropdown nav — groups mirror the original site, every page reachable */
  var EVENT_GUIDE = 'https://drive.google.com/uc?export=download&id=1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk';
  var nav = [
    { id: 'home', label: 'Home', en: 'Home', fr: 'Accueil', href: HOME },
    { label: 'Besucher', en: 'Visitors', fr: 'Visiteurs', children: [
      { id: 'tickets', label: 'Tickets', en: 'Tickets', fr: 'Billets', href: '/tickets' },
      { id: 'faq', label: 'Gut zu Wissen', en: 'Good to Know', fr: 'Bon à savoir', href: '/faq' },
      { label: 'Anreise & Parking', en: 'Getting There & Parking', fr: 'Accès & parking', href: '/faq#parking' },
      { id: 'besucherplan', label: 'Hallenplan', en: 'Floor Plan', fr: 'Plan des halles', href: '/besucherplan' }
    ]},
    { id: 'programm', label: 'Programm', en: 'Programme', fr: 'Programme', href: '/programm', children: [
      { label: 'Programm 2027', en: 'Programme 2027', fr: 'Programme 2027', href: '/programm' },
      { label: 'Live Arena',        href: '/programm#live-arena' },
      { label: 'Action Zone',       href: '/programm#action-zone' },
      { label: 'Adventure Camp',    href: '/programm#adventure-camp' },
      { label: 'Act vorschlagen', en: 'Suggest an Act', fr: 'Proposer un act', href: '/kontakt' }
    ]},
    { id: 'aussteller', label: 'Aussteller', en: 'Exhibitors', fr: 'Exposants', href: '/aussteller-motozuerich-2026', children: [
      { label: 'Aussteller werden', en: 'Become an Exhibitor', fr: 'Devenir exposant', href: '/aussteller-motozuerich-2026' },
      { id: 'standflaechen', label: 'Standflächen 2027', en: 'Booth Spaces 2027', fr: 'Surfaces 2027', href: '/standflaechen' },
      { label: 'Anfrage senden', en: 'Send Enquiry', fr: 'Envoyer une demande', href: 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027' }
    ]},
    { label: 'Über uns', en: 'About Us', fr: 'À propos', children: [
      { id: 'rueckblick', label: 'MOTO-ZÜRICH 2026', href: '/mz2026' },
      { id: 'team',  label: 'Team',                  href: '/team' },
      { id: 'warum', label: 'Warum die MOTO-ZÜRICH', en: 'Why MOTO-ZÜRICH', fr: 'Pourquoi MOTO-ZÜRICH', href: '/warum_motozurich' },
      { id: 'volunteers', label: 'Volunteers',        href: '/volunteers' },
      { id: 'creators', label: 'Creators',            href: '/creators' },
      { id: 'sound', label: 'Sounds der MOTO-ZÜRICH', en: 'Sounds of MOTO-ZÜRICH', fr: 'Les sons de MOTO-ZÜRICH', href: '/sound' },
      { id: 'kontakt', label: 'Kontaktiere uns', en: 'Contact Us', fr: 'Contactez-nous', href: '/kontakt' }
    ]},
    { id: 'medien', label: 'Medien', en: 'Media', fr: 'Médias', href: '/medien' }
  ];

  var AUSSTELLER_CTA = '/standflaechen'; /* «Aussteller werden»-CTA → Standflächen-Plan (Entscheid Ivanna 09.09, war mailto) */
  var TICKETS = 'https://motozuerich.shop.bookinea.app/de';
  /* Ticketverkauf 2027 läuft noch nicht: Menü-CTA und Desktop-Header-CTA sind aus; Menü «Besucher › Tickets»
     und Footer-Link zeigen auf die Info-Seite /tickets (Verkaufsstart November 2026).
     Zum Wiedereinschalten hier auf true setzen – und dasselbe Flag in mz-enhance.js
     (Hero-Button + Sticky-Bar) sowie die zwei <li> in «MOTO-ZÜRICH 2027.html» (index.html im Repo). */
  var TICKETS_LIVE = false;
  var CONTACT_FORM = '/kontakt'; /* eigene Kundenanfrage-Seite (ersetzt Pyrus 2399268) */

  // emit data-en/data-fr only when a translation exists (DE is the captured base)
  function i18n(o, suffix) {
    suffix = suffix || '';
    return (o.en ? ' data-en="' + o.en + suffix + '"' : '') + (o.fr ? ' data-fr="' + o.fr + suffix + '"' : '');
  }
  function childLink(c) {
    var act = c.id && c.id === page ? ' class="is-active"' : '';
    var tgt = c.ext ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + c.href + '"' + act + tgt + i18n(c) + '>' + c.label + '</a></li>';
  }
  var CARET = '<span class=nav-caret></span>';
  var navItems = nav.map(function (n) {
    if (n.children) {
      var groupActive = n.id === page || n.children.some(function (c) { return c.id === page; });
      var topCls = 'nav-top' + (groupActive ? ' nav-active' : '');
      var top = n.href
        ? '<a href="' + n.href + '" class="' + topCls + '"' + i18n(n, CARET) + '>' + n.label + '<span class="nav-caret"></span></a>'
        : '<button type="button" class="' + topCls + '"' + i18n(n, CARET) + '>' + n.label + '<span class="nav-caret"></span></button>';
      return '<li class="has-sub">' + top + '<ul class="submenu">' + n.children.map(childLink).join('') + '</ul></li>';
    }
    var active = n.id === page ? ' class="nav-active" aria-current="page"' : '';
    return '<li><a href="' + n.href + '"' + active + i18n(n) + '>' + n.label + '</a></li>';
  }).join('');

  // build date bar track (3 repeats)
  var seg = '<span>MOTO-ZÜRICH 2027</span><span data-en="February 19–21, 2027" data-fr="19–21 février 2027">19.–21. Februar 2027</span><span>Save the Date</span>';
  var dateBar =
    '<div class="date-bar"><div class="date-bar-track">' + seg + seg + seg + '</div></div>';

  var header =
    '<header class="header"><div class="header-inner">' +
      '<a href="' + HOME + '" class="logo-link" aria-label="MOTO-ZÜRICH Home">' +
        '<img class="logo-svg" src="assets/logo-moto-zuerich.svg" alt="MOTO-ZÜRICH" />' +
      '</a>' +
      '<button class="nav-mobile-toggle" aria-label="Menü" aria-expanded="false" onclick="window.mzNavToggle()">☰</button>' +
      '<nav id="mainNav"><ul>' + navItems +
        (TICKETS_LIVE ? '<li class="nav-tickets-li"><a href="' + TICKETS + '" target="_blank" rel="noopener" class="nav-cta nav-cta-tickets" data-en="Get Tickets →" data-fr="Billets →">Tickets sichern →</a></li>' : '') +
        '<li><a href="' + AUSSTELLER_CTA + '" class="nav-cta" data-en="Become an Exhibitor →" data-fr="Devenir exposant →">Aussteller werden →</a></li>' +
      '</ul></nav>' +
    '</div></header>';

  var partners =
    '<section class="partners-strip partners-cat"><div class="partners-cat-inner">' +
      '<div class="partner-group partner-group-lead">' +
        '<div class="partner-group-h" data-en="Presenting Partner" data-fr="Partenaire présentateur">Presenting Partner</div>' +
        '<div class="partner-group-logos"><a href="https://www.allianz.ch" target="_blank" rel="noopener" aria-label="Allianz"><img src="assets/partners/Allianz.svg" alt="Allianz" /></a></div>' +
      '</div>' +
      '<div class="partner-group partner-group-lead">' +
        '<div class="partner-group-h" data-en="Co-Sponsor" data-fr="Co-sponsor">Co-Sponsor</div>' +
        '<div class="partner-group-logos"><a href="https://www.motoscout24.ch" target="_blank" rel="noopener" aria-label="MotoScout24"><img src="assets/partners/MotoScout24.svg" alt="MotoScout24" /></a></div>' +
      '</div>' +
      '<div class="partner-group partner-group-lead partner-group-sv">' +
        '<div class="partner-group-h" data-en="Partner" data-fr="Partenaire">Partner</div>' +
        '<div class="partner-group-logos"><a href="https://www.swissvolunteers.ch" target="_blank" rel="noopener"><img src="assets/partners/Swiss-Volunteers.svg" alt="Swiss Volunteers" /></a></div>' +
      '</div>' +
      '<div class="partner-group partner-group-media">' +
        '<div class="partner-group-h" data-en="Media Partners" data-fr="Partenaires médias">Medienpartner</div>' +
        '<div class="partner-group-logos">' +
          '<span class="pk-cell"><a href="https://www.blick.ch" target="_blank" rel="noopener" aria-label="Blick"><img src="assets/partners/blick-logo.svg" alt="Blick" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.1000ps.ch" target="_blank" rel="noopener" aria-label="1000PS.ch"><img src="assets/partners/1000ps.png" alt="1000PS.ch" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.moto.ch" target="_blank" rel="noopener" aria-label="Moto.ch"><img src="assets/partners/moto-ch.png" alt="Moto.ch" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.moto-lifestyle.ch" target="_blank" rel="noopener" aria-label="moto-lifestyle.ch"><img src="assets/partners/moto-lifestyle.png" alt="moto-lifestyle.ch" /></a></span>' +
        '</div>' +
        '<div class="partner-group-h partner-group-h-sub" data-en="Radio Partners" data-fr="Partenaires radio">Radiopartner</div>' +
        '<div class="partner-group-logos partner-group-logos-radio">' +
          '<span class="pk-cell"><a href="https://www.argovia.ch" target="_blank" rel="noopener" aria-label="Radio Argovia"><img src="assets/partners/Radio-Argovva.svg" alt="Radio Argovia" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.radiozuerisee.ch" target="_blank" rel="noopener" aria-label="Radio Zürisee"><img src="assets/partners/Radio-Zurisee.svg" alt="Radio Zürisee" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.radio1.ch" target="_blank" rel="noopener" aria-label="Radio 1 · FM 93.6"><img src="assets/partners/radio-1.png" alt="Radio 1 · FM 93.6" /></a></span>' +
          '<span class="pk-cell"><a href="https://www.virginradio.ch" target="_blank" rel="noopener" aria-label="Virgin Radio Switzerland"><img src="assets/partners/Radio-Switzerland-Virgin.svg" alt="Virgin Radio Switzerland" /></a></span>' +
        '</div>' +
      '</div>' +
    '</div></section>';

  var footer =
    '<footer><div class="footer-inner">' +
      '<div class="footer-brand">' +
        '<p class="footer-tagline" data-en="The independent season opener of the Swiss motorcycle scene.<br />Urban. Curated. Approachable." data-fr="Le coup d&#39;envoi indépendant de la scène moto suisse.<br />Urbain. Sélectif. Accessible.">Der unabhängige Saisonstart der Schweizer Motorradszene.<br />Urban. Kuratiert. Nahbar.</p>' +
        '<div class="footer-social" aria-label="Social Media">' +
          '<a href="https://www.instagram.com/motozuerich" target="_blank" rel="noopener" aria-label="Instagram"><svg aria-hidden="true"><use href="#ic-instagram"></use></svg></a>' +
          '<a href="https://www.facebook.com/motozuerich" target="_blank" rel="noopener" aria-label="Facebook"><svg aria-hidden="true"><use href="#ic-facebook"></use></svg></a>' +
          '<a href="https://www.youtube.com/@motozuerich" target="_blank" rel="noopener" aria-label="YouTube"><svg aria-hidden="true"><use href="#ic-youtube"></use></svg></a>' +
          '<a href="https://www.linkedin.com/company/motozuerich" target="_blank" rel="noopener" aria-label="LinkedIn"><svg aria-hidden="true"><use href="#ic-linkedin"></use></svg></a>' +
          '<a href="https://www.tiktok.com/@motozuerich" target="_blank" rel="noopener" aria-label="TikTok"><svg aria-hidden="true"><use href="#ic-tiktok"></use></svg></a>' +
          '<a href="https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R" target="_blank" rel="noopener" aria-label="WhatsApp"><svg aria-hidden="true"><use href="#ic-whatsapp"></use></svg></a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-mark">' +
        '<a href="' + HOME + '" class="footer-logo-link" aria-label="MOTO-ZÜRICH Home"><img class="footer-logo" src="assets/logo-moto-zuerich-white.svg" alt="MOTO-ZÜRICH" /></a>' +
        '<div class="footer-date" data-en="February 19–21<br />2027" data-fr="19–21 février<br />2027">19.–21. Februar<br />2027</div>' +
      '</div>' +
      '<div class="footer-actions">' +
        '<a href="' + AUSSTELLER_CTA + '" class="footer-cta" data-en="Become an exhibitor <span>→</span>" data-fr="Devenir exposant <span>→</span>">Aussteller werden <span>→</span></a>' +
        '<a href="/kontakt" class="footer-cta footer-cta-ghost" data-en="Contact us <span>→</span>" data-fr="Contactez-nous <span>→</span>">Kontaktiere uns <span>→</span></a>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<div><a href="/impressum" data-en="Imprint" data-fr="Mentions légales">Impressum</a><a href="/datenschutz" data-en="Privacy" data-fr="Confidentialité">Datenschutz</a><a href="/agb" data-en="Terms" data-fr="CGV">AGB</a>' +
        '<a href="#" onclick="if(window.mzOpenConsent){window.mzOpenConsent();}return false;" data-en="Cookie Settings" data-fr="Paramètres cookies">Cookie-Einstellungen</a></div>' +
      '<div data-en="© 2026 MOTO-ZÜRICH · Season Opener Switzerland" data-fr="© 2026 MOTO-ZÜRICH · Coup d&#39;envoi Suisse">© 2026 MOTO-ZÜRICH · Saisonstart Schweiz</div>' +
    '</div></footer>';

  var headerHTML = dateBar + header;
  var footerHTML = partners + footer;

  /* mount: header at the very top of <body>, footer/partners at the end */
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  /* ===== mobile fullscreen menu: toggle + accordion groups ===== */
  window.mzNavToggle = function () {
    var nav = document.getElementById('mainNav');
    /* fixed-inside-header breaks (backdrop-filter makes .header the containing block) — mount the overlay on <body> */
    if (nav.parentNode !== document.body) { nav._mzHome = nav.parentNode; document.body.appendChild(nav); }
    var open = nav.classList.toggle('open');
    document.body.classList.toggle('mz-nav-lock', open);
    var btn = document.querySelector('.nav-mobile-toggle');
    if (btn) { btn.textContent = open ? '✕' : '☰'; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    if (!open) {
      nav.querySelectorAll('li.sub-open').forEach(function (li) { li.classList.remove('sub-open'); });
      if (nav._mzHome) nav._mzHome.appendChild(nav); /* back into the header for desktop layout */
    }
  };
  document.getElementById('mainNav').addEventListener('click', function (e) {
    var isMobile = window.matchMedia('(max-width: 980px)').matches;
    var top = e.target.closest('li.has-sub > .nav-top');
    if (top && isMobile) {
      /* group headers expand/collapse instead of navigating */
      e.preventDefault();
      var li = top.parentNode;
      var wasOpen = li.classList.contains('sub-open');
      this.querySelectorAll('li.sub-open').forEach(function (o) { o.classList.remove('sub-open'); });
      if (!wasOpen) li.classList.add('sub-open');
      return;
    }
    /* tapping a real link closes the menu */
    if (isMobile && e.target.closest('a') && this.classList.contains('open')) window.mzNavToggle();
  });

  /* Social-Icons: ein SVG-Sprite (assets/social-icons.svg) für alle Seiten, einmal geladen.
     Die Footer-Links referenzieren die Symbole per <use href="#ic-…">. */
  if (!document.getElementById('mz-social-sprite')) {
    fetch('assets/social-icons.svg').then(function (r) { return r.ok ? r.text() : ''; }).then(function (svg) {
      if (!svg || document.getElementById('mz-social-sprite')) return;
      var d = document.createElement('div'); d.id = 'mz-social-sprite'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      d.innerHTML = svg; document.body.appendChild(d);
    }).catch(function () {});
  }
})();
