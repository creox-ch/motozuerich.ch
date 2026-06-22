/* ============================================================
   MOTO-ZÜRICH — shared chrome (date bar, header/nav, partners,
   footer). Injected into every sub-page so navigation lives in
   ONE place. Set <body data-page="faq"> to mark the active nav.
   Load BEFORE mz-page.js.
   ============================================================ */
(function () {
  var HOME = 'MOTO-ZÜRICH 2027.html';
  var page = document.body.getAttribute('data-page') || '';

  /* dropdown nav — groups mirror the original site, every page reachable */
  var EVENT_GUIDE = 'https://drive.google.com/uc?export=download&id=1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk';
  var nav = [
    { id: 'home', label: 'Home', href: HOME },
    { label: 'Besucher', children: [
      { id: 'faq', label: 'Gut zu Wissen', href: 'FAQ.html' },
      { label: 'Anreise & Parking',      href: 'FAQ.html#parking' },
      { label: 'Hallenplan',             href: 'Programm.html#hallenplan' },
      { id: 'party', label: 'Saisonstart Party', href: 'Party.html' }
    ]},
    { id: 'programm', label: 'Programm', href: 'Programm.html', children: [
      { label: 'Programm 2027',     href: 'Programm.html' },
      { label: 'Live Arena',        href: 'Programm.html#live-arena' },
      { label: 'Action Zone',       href: 'Programm.html#action-zone' },
      { label: 'Act vorschlagen',   href: 'https://pyrus.com/form/2399268', ext: true }
    ]},
    { id: 'aussteller', label: 'Aussteller', href: 'Aussteller.html', children: [
      { label: 'Aussteller werden', href: 'Aussteller.html' },
      { label: 'Anfrage senden',    href: 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027' }
    ]},
    { label: 'Über uns', children: [
      { id: 'rueckblick', label: 'MOTO-ZÜRICH 2026', href: 'Rueckblick-2026.html' },
      { id: 'team',  label: 'Team',                  href: 'Team.html' },
      { id: 'warum', label: 'Warum die MOTO-ZÜRICH', href: 'Warum.html' },
      { id: 'volunteers', label: 'Volunteers',        href: 'Volunteers.html' },
      { id: 'creators',   label: 'Creators',          href: 'Creators.html' },
      { id: 'sound', label: 'Sounds der MOTO-ZÜRICH', href: 'Sound.html' },
      { label: 'Kontaktiere uns', href: 'https://pyrus.com/form/2399268', ext: true }
    ]},
    { id: 'medien', label: 'Medien', href: 'Medien.html' }
  ];

  var AUSSTELLER_MAIL = 'mailto:yves@motozuerich.ch?subject=Aussteller-Anfrage%20MOTO-Z%C3%9CRICH%202027';
  var TICKETS = 'https://motozuerich.shop.bookinea.app/de';
  var CONTACT_FORM = 'https://pyrus.com/form/2399268';

  function childLink(c) {
    var act = c.id && c.id === page ? ' class="is-active"' : '';
    var tgt = c.ext ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + c.href + '"' + act + tgt + '>' + c.label + '</a></li>';
  }
  var navItems = nav.map(function (n) {
    if (n.children) {
      var groupActive = n.id === page || n.children.some(function (c) { return c.id === page; });
      var topCls = 'nav-top' + (groupActive ? ' nav-active' : '');
      var top = n.href
        ? '<a href="' + n.href + '" class="' + topCls + '">' + n.label + '<span class="nav-caret"></span></a>'
        : '<button type="button" class="' + topCls + '">' + n.label + '<span class="nav-caret"></span></button>';
      return '<li class="has-sub">' + top + '<ul class="submenu">' + n.children.map(childLink).join('') + '</ul></li>';
    }
    var active = n.id === page ? ' class="nav-active" aria-current="page"' : '';
    return '<li><a href="' + n.href + '"' + active + '>' + n.label + '</a></li>';
  }).join('');

  // build date bar track (3 repeats)
  var seg = '<span>MOTO-ZÜRICH 2027</span><span>19.–21. Februar 2027</span><span>Wird grösser</span><span>Save the Date</span>';
  var dateBar =
    '<div class="date-bar"><div class="date-bar-track">' + seg + seg + seg + '</div></div>';

  var header =
    '<header class="header"><div class="header-inner">' +
      '<a href="' + HOME + '" class="logo-link" aria-label="MOTO-ZÜRICH Home">' +
        '<img class="logo-svg" src="assets/logo-moto-zuerich.svg" alt="MOTO-ZÜRICH" />' +
      '</a>' +
      '<button class="nav-mobile-toggle" aria-label="Menü" onclick="document.getElementById(\'mainNav\').classList.toggle(\'open\')">☰</button>' +
      '<nav id="mainNav"><ul>' + navItems +
        '<li><a href="' + AUSSTELLER_MAIL + '" class="nav-cta">Aussteller werden →</a></li>' +
      '</ul></nav>' +
    '</div></header>';

  var partners =
    '<section class="partners-strip"><div class="partners-strip-inner">' +
      '<div class="partners-strip-label">Partner &amp; Medienpartner 2026</div>' +
      '<div class="partners-strip-logos">' +
        '<img src="assets/partners/Allianz.svg" alt="Allianz" title="Presenting Partner · Allianz" />' +
        '<img src="assets/partners/blick-logo.svg" alt="Blick" title="Medienpartner · Blick" />' +
        '<span class="partner-logo-text" title="Moto.ch"><b>Moto</b><small>.ch</small></span>' +
        '<span class="partner-logo-text" title="1000PS"><b>1000PS</b><small>.ch</small></span>' +
        '<img src="assets/partners/MotoScout24.svg" alt="MotoScout24" />' +
        '<img src="assets/partners/Radio-Zurisee.svg" alt="Radio Zürisee" />' +
        '<img src="assets/partners/Radio-Switzerland-Virgin.svg" alt="Radio Switzerland" />' +
        '<img src="assets/partners/Radio-Argovva.svg" alt="Radio Argovia" />' +
        '<span class="partner-logo-text" title="moto-lifestyle.ch"><b>moto-lifestyle</b><small>.ch</small></span>' +
      '</div>' +
    '</div></section>';

  var footer =
    '<footer><div class="footer-inner">' +
      '<div class="footer-brand">' +
        '<img class="footer-logo" src="assets/logo-moto-zuerich-white.svg" alt="MOTO-ZÜRICH" />' +
        '<p class="footer-tagline">Der unabhängige Saisonstart der Schweizer Motorradszene.<br />Urban. Kuratiert. Nahbar.</p>' +
        '<div class="footer-social" aria-label="Social Media">' +
          '<a href="https://www.instagram.com/motozuerich/" target="_blank" rel="noopener">IG</a>' +
          '<a href="https://www.facebook.com/motozuerich" target="_blank" rel="noopener">FB</a>' +
          '<a href="https://www.youtube.com/@motozuerich" target="_blank" rel="noopener">YT</a>' +
          '<a href="https://www.linkedin.com/company/motozuerich" target="_blank" rel="noopener">LI</a>' +
          '<a href="https://tiktok.me/motozuerich" target="_blank" rel="noopener">TT</a>' +
          '<a href="https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R" target="_blank" rel="noopener">WA</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-col"><h4>Besuch</h4><ul>' +
        '<li><a href="Programm.html">Programm</a></li>' +
        '<li><a href="Aussteller.html">Aussteller</a></li>' +
        '<li><a href="Party.html">Saisonstart-Party</a></li>' +
        '<li><a href="FAQ.html">Gut zu Wissen</a></li>' +
        '<li><a href="' + TICKETS + '" target="_blank" rel="noopener">Tickets</a></li>' +
      '</ul></div>' +
      '<div class="footer-col"><h4>Über uns</h4><ul>' +
        '<li><a href="Rueckblick-2026.html">MOTO-ZÜRICH 2026</a></li>' +
        '<li><a href="Team.html">Team</a></li>' +
        '<li><a href="Warum.html">Warum MOTO-ZÜRICH</a></li>' +
        '<li><a href="Sound.html">Sounds</a></li>' +
        '<li><a href="Medien.html">Medien</a></li>' +
      '</ul>' +
      '<a href="' + AUSSTELLER_MAIL + '" class="footer-cta">Aussteller werden <span>→</span></a></div>' +
      '<div class="footer-col"><h4>Kontakt</h4><ul>' +
        '<li><a href="mailto:team@motozuerich.ch">team@motozuerich.ch</a></li>' +
        '<li><a href="mailto:help@motozuerich.ch">help@motozuerich.ch</a></li>' +
        '<li><a href="tel:+41772871634">+41 77 287 16 34</a></li>' +
        '<li><a href="Volunteers.html">Volunteers</a></li>' +
        '<li><a href="Creators.html">Creators</a></li>' +
      '</ul></div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<div><a href="Impressum.html">Impressum</a><a href="AGB.html">AGB</a><a href="Datenschutz.html">Datenschutz</a>' +
        '<a href="#" onclick="if(window.mzOpenConsent){window.mzOpenConsent();}return false;">Cookie-Einstellungen</a></div>' +
      '<div>© 2026 MOTO-ZÜRICH · Saisonstart Schweiz</div>' +
    '</div></footer>';

  var headerHTML = dateBar + header;
  var footerHTML = partners + footer;

  /* mount: header at the very top of <body>, footer/partners at the end */
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
