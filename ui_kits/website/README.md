# MOTO-ZÜRICH — Website UI kit

A high-fidelity, interactive recreation of the **MOTO-ZÜRICH marketing / save-the-date
website** (German, single-page, scroll-driven). Built with React + inline Babel, styled from
the design-system tokens. It is a *cosmetic* recreation for prototyping — not production code.

## Run it
Open `index.html`. It loads `../../colors_and_type.css` + `styles.css`, then the JSX components.

## What it covers
| Component | File | Notes |
|-----------|------|-------|
| Sticky date-bar marquee | `Header.jsx` (`DateBar`) | Infinite ticker above the header |
| Glass header + nav | `Header.jsx` (`Header`) | Blur header, growing underlines, red CTA, mobile toggle |
| Gradient identity hero | `HeroIdentity.jsx` | Diagonal blue gradient, ghost "2027", wordmark, date badge, slogan |
| Aussteller CTA strip | `HeroIdentity.jsx` (`AusstellerStrip`) | Dark band with red CTA |
| Pillar grid | `PillarSection.jsx` | 4 hover-fill cards, each filling with its signifier color |
| Rückblick + stats + accordion | `RueckblickSection.jsx` | Sequential animated counters (Swiss formatting) + collapsible programme |
| Presse cards | `PressSection.jsx` | Vertical hover-wipe media cards |
| Footer | `Footer.jsx` | Dark footer, white logo, columns, red CTA |
| Helpers | `helpers.jsx` | `FadeIn` (scroll reveal) + `useSequentialCounters` |

## Interactions
- **Animated counters** run **sequentially** when the stats grid scrolls into view (mirrors the
  live site). They use Swiss number formatting (`10'000`, `22'117`) and lazy-show their captions.
- **Programme accordion** — click a row to expand; one open at a time.
- **Hover-fill cards** — pillar cards fill with their pillar color; press cards wipe up to brand.
- **Mobile nav** — the `☰` toggle opens the menu below 900px.
- **Scroll fade-ins** — section leads/labels rise+fade via `FadeIn`.

## Conventions
- Each component file ends with `Object.assign(window, { … })` so the parts are shared across the
  separately-transpiled Babel scripts. Load `helpers.jsx` first.
- Logo paths are relative to this folder: `../../assets/logo-moto-zuerich*.svg`.
- All colors/type come from CSS variables in `../../colors_and_type.css`.

## Known fidelity notes
- This kit reproduces the site's **structure, components and behavior**, not every section of the
  live page (e.g. embedded YouTube/360° tour, the long exhibitor tag lists, and the "Danke" /
  feedback blocks are summarized or omitted). It favors broad, reusable component coverage.
