# MOTO-ZÜRICH — Design System

> Brand & UI foundations for **MOTO-ZÜRICH**, the independent season-opener of the Swiss
> motorcycle scene. Annual exhibition in **Zürich-Oerlikon, 19.–21. Februar 2027**.

This folder is a design system: brand context, color + type foundations, real logo assets,
a documented visual language, and a high-fidelity recreation of the marketing website as a
reusable UI kit. Use it to build on-brand artifacts (landing pages, save-the-dates, decks,
prototypes) without re-deriving the brand each time.

---

## 1. What is MOTO-ZÜRICH?

MOTO-ZÜRICH is the **independent season kickoff** (Saisonauftakt) of the Swiss motorcycle
community — urban, curated and approachable. Not a trade-fair giant and not a mass spectacle,
but a real meeting point for people who *live* motorcycles. It runs three days across
**StageOne + Halle 550** in Zürich-Oerlikon.

- **Premiere:** 20.–22. February 2026 — 10,000 m² of event space, 92 brands/dealers/acts,
  **22,117 visitors** (more than double the expectation).
- **Next edition:** **19.–21. February 2027** — "wird grösser" (getting bigger).
- **Language:** German (`de`), addressing the Swiss motorcycle scene. Swiss number
  formatting uses an apostrophe thousands separator (e.g. `10'000`, `22'117`).
- **Tone:** confident, community-first, anti-hype.

### The four event pillars (each has a color signifier)
| # | Pillar | Where | Signifier color |
|---|--------|-------|-----------------|
| 01 | **Kuratierte Markenwelt** (curated brand world) | EG · StageOne | `--brand` blue |
| 02 | **Live Arena** (talks, interviews, premieres) | Bühne · StageOne | `--brand-light` |
| 03 | **Action Zone** (stunt shows, motorsport) | OG · Halle 550 | `--action-yellow` |
| 04 | **Saisonstart-Party** (DJ sets, drinks) | Chicago Bar | `--night` |

### Products represented
There is **one primary product**: the **static marketing / save-the-date website**
(German, single-page, scroll-driven). It is rebuilt as a UI kit under `ui_kits/website/`.
There is no app, dashboard, or docs site.

---

## 2. Sources

The system was derived from the materials the user provided:

- **Codebase:** `MZ/motozuerich_2027_v2 2.html` — a single self-contained static HTML page
  (the live 2027 site, German). All colors, type, components, copy and animation behavior
  documented here were read directly from this file. *(Mounted read-only; not assumed present
  for future readers.)*
- **Uploaded brand assets** (in `uploads/`, copied into `assets/`):
  - `Logo MOTO-ZÜRICH …​.svg` — the official wordmark + sport-bike emblem (Cyrillic filename;
    the live site also ships it base64-inlined). Re-saved as
    `assets/logo-moto-zuerich.svg` (+ `-white`, `-blue` variants).
  - Partner / media logos: Allianz, Blick, MotoScout24, moto-lifestyle, Radio Zürisee,
    Radio Switzerland (Virgin), Radio Argovia → `assets/partners/`.

---

## 3. Content fundamentals (voice & copy)

**Language:** German (Swiss audience). Swiss spelling — **`ss` not `ß`** (e.g. "grösser",
"Strassenkurse"). Numbers use the **apostrophe separator**: `5'740 m²`, `22'117`.

**Address:** Second person plural / community ("wir", "unsere Besucher:innen"). The brand
speaks as the organizers ("wir nehmen alle Hinweise … ernst"). Inclusive forms are used
deliberately: **`Besucher:innen`, `Fahrer:innen`** (colon gender-inclusive spelling).

**Casing:** Headlines and section titles are **ALL-CAPS** display. The brand name is always
**`MOTO-ZÜRICH`** (hyphenated, caps, with Umlaut). Editions are written `MZ2026` / `MZ2027`
in shorthand and `MOTO-ZÜRICH 2027` in full.

**Tone:** Confident, curated, anti-hype. Defined by contrast — it repeatedly states what it is
*not*:
- *"Kein Jahrmarkt, kein Massenspektakel, sondern ein echter Treffpunkt …"*
  (no funfair, no mass spectacle, but a real meeting point)
- *"Statt Messe-Gigantismus setzen wir auf Qualität, Nähe und Erlebnis: kompakt statt
  überdimensioniert, inhaltlich relevant statt überladen, persönlich statt anonym."*

**Bold for emphasis:** Key phrases inside paragraphs are wrapped in `<b>` and rendered in
`--brand-dark`. Used sparingly — one or two emphases per paragraph (a number, a claim, a place).

**Eyebrows / labels** (mono, all-caps, tracked): set context before a headline, often with a
middot separator — e.g. `DAS EVENT`, `ÜBER DAS EVENT · FÜR ALLE, DIE NOCH NICHT DABEI WAREN`,
`PRESSE · BERICHTERSTATTUNG 2026`, `SAVE THE DATE · ZÜRICH-OERLIKON`.

**Recurring slogans / motifs:**
- **"Erleben. Entdecken. Eintauchen."** — three-word claim (Experience. Discover. Immerse.),
  each word on its own line, final period in accent color.
- **"Save the Date"**, **"Wird grösser"** — running ticker phrases.
- **"DANKE"** — oversized gratitude block to community/partners.

**No emoji.** The brand never uses emoji. Arrows (`→`) are the only glyph decoration, used on
CTAs and "read more" links. Bullet dots (`●`, `·`) separate ticker/eyebrow items.

**CTAs** are short, imperative, mono-cased: `AUSSTELLER WERDEN →` (become an exhibitor),
`FEEDBACK TEILEN`, `ARTIKEL LESEN →`.

---

## 4. Visual foundations

**Overall feel:** Editorial, high-contrast, Swiss-poster discipline. Big ALL-CAPS IBM Plex Sans
headlines, mono labels, generous whitespace, and a strict grid of hairline-bordered cards. Dark
"night" hero/footer bookends wrap clean white content blocks.

### Color
- **Primary** is `--brand` #2F65A0 (a confident mid-blue). Deepened to `--brand-dark`/`--brand-darker`
  for hero gradients and emphasis, brightened to `--brand-light` #549EF0 on dark surfaces.
- **Two accents, used as signifiers, never decoration:** `--swiss-red` #C10D0D is reserved for
  the highest-priority CTA (header + footer "Aussteller werden"); `--action-yellow` #FAF143 marks
  the Action Zone and highlight plates.
- **Backgrounds:** white (`--bg`) and a barely-there `--bg-alt` #f5f7fa for alternating blocks.
  Dark sections use `--night` #0a1929.
- **Max two background colors** per surface run; let the hairline grid and type carry the rhythm.

### Type
- Three families, strict roles: **IBM Plex Sans** (display/headlines/stats, 700),
  **IBM Plex Mono** (labels, eyebrows, CTAs, meta — always UPPERCASE + tracked),
  **Nunito Sans** (body, 400–900). See `colors_and_type.css`.
- Headlines are fluid `clamp()` and ALL-CAPS with tight negative tracking (`-0.01…-0.02em`)
  and sub-1.0 line-height (0.88–0.95) for poster density.
- Mono labels carry wide positive tracking (`0.12–0.22em`).

### Backgrounds & texture
- **No photographic full-bleed hero by default** — the identity hero is a deep
  **diagonal blue gradient** (`135deg, --brand-darker → --brand → --brand-dark`) with a giant
  ghosted **"2027"** numeral bleeding off the bottom-right corner at ~5% white. (The live build
  optionally layers a darkened photo behind it.)
- **Ghost numerals / monograms** are a signature: oversized `2027`, `MZ`, a faint `★`, set at
  4–6% opacity, clipped by the section, `pointer-events:none`. They add depth without imagery.
- **No gradients on content cards.** Cards are flat white with hairline borders; color arrives
  only on hover.

### Animation
- **Easing:** almost everything uses `cubic-bezier(0.16, 1, 0.3, 1)` (a soft "expo-out" ease)
  over ~0.2–0.9s. Counters use a quad/expo ease-out over 550ms.
- **Scroll-in:** `.body-fade` elements rise + fade (`translateY(6px)` → 0, opacity 0 → 1),
  staggered by a `data-delay` attribute.
- **Highlight marks** (`.hl`): a colored plate wipes in horizontally (`scaleX 0 → 1`), then the
  headline letters type in one-by-one (`.char` opacity stagger) — a signature reveal.
- **Counters** animate **sequentially**, one number finishing before the next starts, then the
  caption fades up. Triggered by `IntersectionObserver` at 25% visibility.
- **Marquee:** the sticky date bar scrolls its track infinitely (`translateX 0 → -50%`, 40s linear).
- **No bounces, no springs, no infinite decorative loops** on content (only the date ticker loops).

### Hover & press states
- **Cards (`.what-card`, `.press-card`):** the whole card **fills with brand color on hover**
  (white→blue, or a vertical wipe via a `::before` that slides up), text inverts to white, and
  the eyebrow flips to the accent (`--action-yellow` or `--brand-light`). Each pillar card fills
  with *its own* signifier color.
- **CTAs:** darken (`--swiss-red` → `--swiss-red-dark`) and **nudge** (`translateY(-1px)` or
  `translateX(4px)`); the inner arrow slides `translateX(4px)`.
- **Nav links:** an underline grows from width 0 → 100% (expo ease); color shifts to `--brand`.
- **Stat cells:** background tints to `--brand-soft` on hover; the icon rotates slightly.
- No explicit shrink/scale-down press state — interactions are color + translate.

### Borders, cards, shadows
- **Hairline system, not shadows.** The look is built on 1px borders in `--line` /
  `--line-strong`. Grids (`.what-grid`, `.nums-grid`, `.press-grid`) share internal hairlines;
  `border-right`/`border-bottom` are stripped on edge cells.
- **Sharp corners.** Border-radius is **0** almost everywhere — buttons, cards, plates, badges,
  inputs are all rectangular. This is core to the Swiss-poster identity.
- **Minimal elevation.** Drop shadows are essentially absent in content; depth comes from color
  blocks, ghost numerals, and the dark/light section rhythm. (A blurred translucent header is the
  one exception — see below.)
- **Accent bars:** dark sections (e.g. the claim) get a vertical 6px gradient bar on the left edge
  (`--brand → --brand-light → --action-yellow`).

### Transparency & blur
- The **sticky header** is `rgba(255,255,255,0.96)` with `backdrop-filter: blur(14px)` — the only
  glass surface. It sits below a `--brand` sticky **date bar** at the very top.
- Highlight plates use solid fills, not translucency. Imagery (when present) is darkened with a
  cool overlay to keep text legible; overall imagery vibe is **cool, urban, slightly desaturated**.

### Layout rules
- Content max-width **1440px**, gutter padding **32px**, section vertical padding **110px**
  (mobile less). Alternating blocks (`.block` / `.block-alt`) toggle the `--bg-alt` background
  with top/bottom hairlines.
- Fixed elements: the date bar (`top:0`) and header (`top:39px`) are both sticky and stacked.

---

## 5. Iconography

**The brand barely uses icons — by design.** The system is typographic. What exists:

- **Logo / emblem:** a single custom **sport-bike silhouette** locked up with the
  `MOTO / ZÜRICH` wordmark (IBM Plex Sans–style caps). Files in `assets/`:
  - `logo-moto-zuerich.svg` — blue emblem + near-black wordmark (light backgrounds)
  - `logo-moto-zuerich-white.svg` — all white (dark backgrounds / hero / footer)
  - `logo-moto-zuerich-blue.svg` — all `--brand` blue (monochrome use)
  > The live site inlines this same SVG as base64 and recolors it per context via CSS. These
  > extracted files use **inline `fill` attributes** (the original relied on an internal
  > `<style>` block, which gets stripped when SVGs are re-saved).
- **No icon font, no icon library, no SVG icon set.** There is no Lucide/Heroicons/Font Awesome
  usage in the codebase. The few stat cells reference a `.num-icon` slot but the shipped build
  leaves it text-driven.
- **Glyphs as icons:** the **arrow `→`** (CTAs, links, "Rückblick"), the **middot `·`** and
  **bullet `●`** (eyebrow/ticker separators), a faint **`★`** as a background decoration, and the
  hamburger **`☰`** for mobile nav. These are Unicode characters, not assets.
- **Numbers as graphics:** oversized index numerals (`01`–`04`) sit behind pillar cards at low
  opacity; the year `2027` and monogram `MZ` are used as giant ghost type.
- **No emoji, ever.**

**Partner / media logos** (`assets/partners/`) are real third-party SVGs, shown as a single-color
"presented by / media" strip — keep them monochrome-friendly and evenly sized.

If you need a UI glyph the brand doesn't ship, prefer a **thin, geometric** line icon and keep it
sparse — but first ask whether type or an arrow can do the job instead.

---

## 6. Index — what's in this folder

| Path | What it is |
|------|------------|
| `README.md` | This file — context, voice, visual foundations, iconography, index. |
| `colors_and_type.css` | CSS variables for colors + type, plus semantic `.mz-*` classes. |
| `SKILL.md` | Agent-Skills entry point (for use in Claude Code). |
| `assets/` | Logo variants (`logo-moto-zuerich*.svg`). |
| `assets/partners/` | Partner & media logos (Allianz, Blick, MotoScout24, radios, …). |
| `preview/` | Design-system **cards** (color, type, spacing, components) shown in the DS tab. |
| `ui_kits/website/` | High-fidelity recreation of the marketing site — `index.html` + JSX components. |

### Using it
- For **throwaway artifacts** (decks, mocks, save-the-dates): copy assets out, pull tokens from
  `colors_and_type.css`, and follow the rules above.
- For **production work**: read this README to become fluent in the brand, then reuse the UI-kit
  components and tokens.
