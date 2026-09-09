/**
 * Каноничный список всех страниц сайта.
 * Source of truth для smoke-тестов и SEO-проверок.
 */

export interface PageDef {
  /** Functional requirement ID (matches FUNCTIONALITY_INVENTORY.md) */
  fn: string;
  /** Path relative to BASE_URL */
  path: string;
  /** Expected substring in <title> (case-insensitive) */
  titleContains: string;
  /** Human-readable name for test descriptions */
  name: string;
  /** Whether the page must include site nav + footer */
  hasGlobalChrome: boolean;
}

export const PAGES: PageDef[] = [
  { fn: 'FN-001', path: '/',                              name: 'Home',         titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-002', path: '/faq',                           name: 'FAQ',          titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-003', path: '/programm',                      name: 'Programm',     titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-005', path: '/aussteller-motozuerich-2026',   name: 'Aussteller',   titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-006', path: '/mz2026',                        name: 'MZ2026',       titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-007', path: '/team',                          name: 'Team',         titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-008', path: '/warum_motozurich',              name: 'Warum',        titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-009', path: '/sound',                         name: 'Sound',        titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-010', path: '/medien',                        name: 'Medien',       titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-011', path: '/impressum',                     name: 'Impressum',    titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-012', path: '/agb',                           name: 'AGB',          titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-013', path: '/datenschutz',                   name: 'Datenschutz',  titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-014', path: '/volunteers',                    name: 'Volunteers',   titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-015', path: '/creators',                      name: 'Creators',     titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-021', path: '/kontakt',                       name: 'Kontakt',      titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
  { fn: 'FN-022', path: '/tickets',                       name: 'Tickets',      titleContains: 'MOTO-ZÜRICH', hasGlobalChrome: true },
];

/** Form sub-pages. Alte externe Formular-Seiten (media_form/creators_form/blogger_form)
 * wurden Sept. 2026 durch die einheitliche Kundenanfrage /kontakt ersetzt (läuft über PAGES). */
export const FORM_PAGES: PageDef[] = [];
