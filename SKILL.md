---
name: moto-zuerich-design
description: Use this skill to generate well-branded interfaces and assets for MOTO-ZÜRICH (the independent season-opener of the Swiss motorcycle scene, an annual exhibition in Zürich-Oerlikon), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files
(`colors_and_type.css` for tokens, `assets/` for logos + partner marks, `preview/` for the
design-system cards, `ui_kits/website/` for the recreated site components).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy assets
and read the rules here to become an expert in designing with this brand.

Key reminders for MOTO-ZÜRICH:
- **German (de), Swiss audience.** Use `ss` not `ß`; format numbers with apostrophes (`10'000`,
  `22'117`); use inclusive `:innen` forms. The brand is always written **MOTO-ZÜRICH**.
- **Voice:** confident, curated, anti-hype — defined by what it is *not* ("kein Jahrmarkt …").
  No emoji; arrows (`→`) are the only glyph decoration.
- **Look:** Swiss-poster discipline — big ALL-CAPS IBM Plex Sans headlines, IBM Plex Mono labels,
  Nunito Sans body, a hairline-bordered grid, **sharp corners (radius 0), almost no shadows**.
  Dark "night" hero/footer bookend clean white blocks.
- **Color:** brand blue `#2F65A0` leads; Swiss red `#C10D0D` is reserved for the top CTA; action
  yellow `#FAF143` marks the Action Zone / highlights. Ghost numerals (`2027`, `MZ`) at 4–6%.
- **Motion:** expo-out easing `cubic-bezier(0.16,1,0.3,1)`; scroll fade-ins; sequential animated
  counters; cards that fill with color on hover. No bounces or springs.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some clarifying questions, and act as an expert designer who outputs HTML artifacts
_or_ production code, depending on the need.
