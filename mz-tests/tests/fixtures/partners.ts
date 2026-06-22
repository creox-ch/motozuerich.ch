/**
 * Партнёры — должны отображаться над футером на КАЖДОЙ странице.
 */

export interface Partner {
  name: string;
  tier: 'presenting' | 'co-sponsor' | 'medien';
}

export const PARTNERS: Partner[] = [
  // Presenting
  { name: 'Aargauer Zeitung', tier: 'presenting' },

  // Co-Sponsor
  { name: 'MotoScout24', tier: 'co-sponsor' },

  // Medienpartner
  { name: 'Blick',            tier: 'medien' },
  { name: 'moto.ch',          tier: 'medien' },
  { name: 'Radio Zürisee',    tier: 'medien' },
  { name: '1000PS',           tier: 'medien' },
  { name: 'Radio Argovia',    tier: 'medien' },
  { name: 'VRS',              tier: 'medien' },
  { name: 'Moto Lifestyle',   tier: 'medien' },
  { name: 'Swiss Volunteers', tier: 'medien' },
];

/** Названия секций партнёров на сайте — должны быть видимы. */
export const PARTNER_SECTION_HEADINGS = [
  'PRESENTING PARTNER',
  'CO-SPONSOR',
  'MEDIENPARTNER',
] as const;
