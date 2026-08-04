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
      { id: 'faq', label: 'Gut zu Wissen', en: 'Good to Know', fr: 'Bon à savoir', href: 'FAQ' },
      { label: 'Anreise & Parking', en: 'Getting There & Parking', fr: 'Accès & parking', href: 'FAQ#parking' },
      { id: 'gesamtplan', label: 'Hallenplan', en: 'Floor Plan', fr: 'Plan des halles', href: 'Gesamtplan' }
    ]},
    { id: 'programm', label: 'Programm', en: 'Programme', fr: 'Programme', href: 'Programm', children: [
      { label: 'Programm 2027', en: 'Programme 2027', fr: 'Programme 2027', href: 'Programm' },
      { label: 'Live Arena',        href: 'Programm#live-arena' },
      { label: 'Action Zone',       href: 'Programm#action-zone' },
      { label: 'Act vorschlagen', en: 'Suggest an Act', fr: 'Proposer un act', href: 'https://pyrus.com/form/2399268', ext: true }
    ]},
    { id: 'aussteller', label: 'Aussteller', en: 'Exhibitors', fr: 'Exposants', href: 'Aussteller', children: [
      { label: 'Aussteller werden', en: 'Become an Exhibitor', fr: 'Devenir exposant', href: 'Aussteller' },
      { label: 'Anfrage senden', en: 'Send Enquiry', fr: 'Envoyer une demande', href: 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027' }
    ]},
    { label: 'Über uns', en: 'About Us', fr: 'À propos', children: [
      { id: 'rueckblick', label: 'MOTO-ZÜRICH 2026', href: 'Rueckblick-2026' },
      { id: 'team',  label: 'Team',                  href: 'Team' },
      { id: 'warum', label: 'Warum die MOTO-ZÜRICH', en: 'Why MOTO-ZÜRICH', fr: 'Pourquoi MOTO-ZÜRICH', href: 'Warum' },
      { id: 'volunteers', label: 'Volunteers',        href: 'Volunteers' },
      { id: 'creators', label: 'Creators',            href: 'Creators' },
      { id: 'sound', label: 'Sounds der MOTO-ZÜRICH', en: 'Sounds of MOTO-ZÜRICH', fr: 'Les sons de MOTO-ZÜRICH', href: 'Sound' },
      { label: 'Kontaktiere uns', en: 'Contact Us', fr: 'Contactez-nous', href: 'https://pyrus.com/form/2399268', ext: true }
    ]},
    { id: 'medien', label: 'Medien', en: 'Media', fr: 'Médias', href: 'Medien' }
  ];

  var AUSSTELLER_MAIL = 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027';
  var TICKETS = 'https://motozuerich.shop.bookinea.app/de';
  var CONTACT_FORM = 'https://pyrus.com/form/2399268';

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
  var seg = '<span>MOTO-ZÜRICH 2027</span><span data-en="February 19–21, 2027" data-fr="19–21 février 2027">19.–21. Februar 2027</span><span data-en="Getting bigger" data-fr="Voir plus grand">Wird grösser</span><span>Save the Date</span>';
  var dateBar =
    '<div class="date-bar"><div class="date-bar-track">' + seg + seg + seg + '</div></div>';

  var header =
    '<header class="header"><div class="header-inner">' +
      '<a href="' + HOME + '" class="logo-link" aria-label="MOTO-ZÜRICH Home">' +
        '<img class="logo-svg" src="assets/logo-moto-zuerich.svg" alt="MOTO-ZÜRICH" />' +
      '</a>' +
      '<button class="nav-mobile-toggle" aria-label="Menü" onclick="document.getElementById(\'mainNav\').classList.toggle(\'open\')">☰</button>' +
      '<nav id="mainNav"><ul>' + navItems +
        '<li><a href="' + AUSSTELLER_MAIL + '" class="nav-cta" data-en="Become an Exhibitor →" data-fr="Devenir exposant →">Aussteller werden →</a></li>' +
      '</ul></nav>' +
    '</div></header>';

  var partners =
    '<section class="partners-strip partners-cat"><div class="partners-cat-inner">' +
      '<div class="partner-group partner-group-lead">' +
        '<div class="partner-group-h" data-en="Presenting Partner" data-fr="Partenaire présentateur">Presenting Partner</div>' +
        '<div class="partner-group-logos"><img src="assets/partners/Allianz.svg" alt="Allianz" /></div>' +
      '</div>' +
      '<div class="partner-group partner-group-lead">' +
        '<div class="partner-group-h" data-en="Co-Sponsor" data-fr="Co-sponsor">Co-Sponsor</div>' +
        '<div class="partner-group-logos"><img src="assets/partners/MotoScout24.svg" alt="MotoScout24" /></div>' +
      '</div>' +
      '<div class="partner-group partner-group-media">' +
        '<div class="partner-group-h" data-en="Media Partners" data-fr="Partenaires médias">Medienpartner</div>' +
        '<div class="partner-group-logos">' +
          '<span class="pk-cell"><img src="assets/partners/blick-logo.svg" alt="Blick" /></span>' +
          '<span class="pk-cell"><span class="partner-logo-text" title="1000PS.ch"><b>1000PS</b><small>.ch</small></span></span>' +
          '<span class="pk-cell"><span class="partner-logo-text" title="Moto.ch"><b>Moto</b><small>.ch</small></span></span>' +
          '<span class="pk-cell"><img src="assets/partners/Radio-Argovva.svg" alt="Radio Argovia" /></span>' +
          '<span class="pk-cell"><img src="assets/partners/Radio-Zurisee.svg" alt="Radio Zürisee" /></span>' +
          '<span class="pk-cell"><span class="partner-logo-text" title="Radio 1"><b>RADIO 1</b><small>FM 93.6</small></span></span>' +
          '<span class="pk-cell"><img src="assets/partners/Radio-Switzerland-Virgin.svg" alt="Virgin Radio Switzerland" /></span>' +
          '<span class="pk-cell"><span class="partner-logo-text" title="moto-lifestyle.ch"><b>moto-lifestyle</b><small>.ch</small></span></span>' +
          '<span class="pk-cell"><span class="partner-logo-text" title="Swiss Volunteers"><b>SWISS VOLUNTEERS</b><small>gaz energie</small></span></span>' +
        '</div>' +
      '</div>' +
    '</div></section>';

  var footer =
    '<footer><div class="footer-inner">' +
      '<div class="footer-brand">' +
        '<a href="' + HOME + '" class="footer-logo-link" aria-label="MOTO-ZÜRICH Home"><img class="footer-logo" src="assets/logo-moto-zuerich-white.svg" alt="MOTO-ZÜRICH" /></a>' +
        '<p class="footer-tagline" data-en="The independent season opener of the Swiss motorcycle scene.<br />Urban. Curated. Approachable." data-fr="Le coup d&#39;envoi indépendant de la scène moto suisse.<br />Urbain. Sélectif. Accessible.">Der unabhängige Saisonstart der Schweizer Motorradszene.<br />Urban. Kuratiert. Nahbar.</p>' +
        '<div class="footer-social" aria-label="Social Media">' +
          '<a href="https://www.instagram.com/motozuerich" target="_blank" rel="noopener">IG</a>' +
          '<a href="https://www.facebook.com/motozuerich" target="_blank" rel="noopener">FB</a>' +
          '<a href="https://www.youtube.com/@motozuerich" target="_blank" rel="noopener">YT</a>' +
          '<a href="https://www.linkedin.com/company/motozuerich" target="_blank" rel="noopener">LI</a>' +
          '<a href="https://www.tiktok.com/@motozuerich" target="_blank" rel="noopener">TT</a>' +
          '<a href="https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R" target="_blank" rel="noopener">WA</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-col"><h4 data-en="Visit" data-fr="Visite">Besuch</h4><ul>' +
        '<li><a href="Programm" data-en="Programme" data-fr="Programme">Programm</a></li>' +
        '<li><a href="Aussteller" data-en="Exhibitors" data-fr="Exposants">Aussteller</a></li>' +
        '<li><a href="FAQ" data-en="Good to Know" data-fr="Bon à savoir">Gut zu Wissen</a></li>' +
        '<li><a href="' + TICKETS + '" target="_blank" rel="noopener" data-en="Tickets" data-fr="Billets">Tickets</a></li>' +
      '</ul></div>' +
      '<div class="footer-col"><h4 data-en="About Us" data-fr="À propos">Über uns</h4><ul>' +
        '<li><a href="Rueckblick-2026">MOTO-ZÜRICH 2026</a></li>' +
        '<li><a href="Team">Team</a></li>' +
        '<li><a href="Warum" data-en="Why MOTO-ZÜRICH" data-fr="Pourquoi MOTO-ZÜRICH">Warum MOTO-ZÜRICH</a></li>' +
        '<li><a href="Sound" data-en="Sounds" data-fr="Sons">Sounds</a></li>' +
        '<li><a href="Medien" data-en="Media" data-fr="Médias">Medien</a></li>' +
      '</ul>' +
      '<a href="' + AUSSTELLER_MAIL + '" class="footer-cta" data-en="Become an exhibitor <span>→</span>" data-fr="Devenir exposant <span>→</span>">Aussteller werden <span>→</span></a></div>' +
      '<div class="footer-col"><h4 data-en="Contact" data-fr="Contact">Kontakt</h4><ul>' +
        '<li><a href="mailto:team@motozuerich.ch">team@motozuerich.ch</a></li>' +
        '<li><a href="mailto:help@motozuerich.ch">help@motozuerich.ch</a></li>' +
        '<li><a href="Volunteers">Volunteers</a></li>' +
        '<li><a href="Creators">Creators</a></li>' +
      '</ul></div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<div><a href="Impressum" data-en="Imprint" data-fr="Mentions légales">Impressum</a><a href="AGB" data-en="Terms" data-fr="CGV">AGB</a><a href="Datenschutz" data-en="Privacy" data-fr="Confidentialité">Datenschutz</a>' +
        '<a href="#" onclick="if(window.mzOpenConsent){window.mzOpenConsent();}return false;" data-en="Cookie Settings" data-fr="Paramètres cookies">Cookie-Einstellungen</a></div>' +
      '<div data-en="© 2026 MOTO-ZÜRICH · Season Opener Switzerland" data-fr="© 2026 MOTO-ZÜRICH · Coup d&#39;envoi Suisse">© 2026 MOTO-ZÜRICH · Saisonstart Schweiz</div>' +
    '</div></footer>';

  var headerHTML = dateBar + header;
  var footerHTML = partners + footer;

  /* mount: header at the very top of <body>, footer/partners at the end */
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
