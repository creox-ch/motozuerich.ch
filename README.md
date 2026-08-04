# MOTO-ZÜRICH — Website

Statische Website der MOTO-ZÜRICH (Saisonstart der Schweizer Motorradszene).

## Struktur
- `index.html` — Startseite (DE/EN/FR umschaltbar, Standard: Deutsch)
- `*.html` — Unterseiten (FAQ, Programm, Aussteller, Team, Medien, …)
- `colors_and_type.css`, `motozuerich-page.css`, `mz-enhance.css` — Styles
- `mz-chrome.js` — gemeinsame Navigation/Footer · `mz-i18n.js` — Sprachumschaltung · `mz-page.js` — Seiten-Animationen
- `i18n/dict-*.js` — Übersetzungen EN/FR pro Seite
- `assets/` — Bilder, Logos, Sounds

## Deployment
Reine statische Site — direkt kompatibel mit GitHub Pages:
Settings → Pages → Branch `main`, Ordner `/ (root)`.
