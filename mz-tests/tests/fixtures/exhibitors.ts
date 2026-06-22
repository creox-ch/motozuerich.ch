/**
 * Список ключевых экспонентов для проверки на странице /aussteller-motozuerich-2026.
 * Полный список (50+ Neuheiten + 17 Action Zone) — в pages/05_aussteller.md.
 */

export interface Exhibitor {
  name: string;
  stand?: string;
  brands?: string[];
  website?: string;
  zone: 'neuheiten' | 'actionzone';
}

/** Минимум — эти экспоненты ОБЯЗАНЫ присутствовать на странице. */
export const KEY_EXHIBITORS: Exhibitor[] = [
  // Major motorcycle brands
  { name: 'BMW',                stand: 'E17',  brands: ['BMW'],            zone: 'neuheiten' },
  { name: 'Ducati',             stand: 'E15A', brands: ['Ducati'],         zone: 'neuheiten' },
  { name: 'Harley-Davidson',    stand: 'E23',  brands: ['Harley-Davidson'],zone: 'neuheiten' },
  { name: 'KTM',                stand: 'E1',   brands: ['KTM'],            zone: 'neuheiten' },
  { name: 'SUZUKI',             stand: 'E15B', brands: ['SUZUKI'],         zone: 'neuheiten' },
  { name: 'Triumph',            stand: 'S4',   brands: ['Triumph'],        zone: 'neuheiten' },
  { name: 'Zero',               stand: 'S5',   brands: ['Zero'],           zone: 'neuheiten' },
  { name: 'FANTIC',             stand: 'S10',  brands: ['FANTIC'],         zone: 'neuheiten' },
  { name: 'CFMOTO',             stand: 'S1',   brands: ['CFMOTO'],         zone: 'neuheiten' },

  // Major accessories/parts
  { name: 'Bridgestone',        stand: 'E12',  brands: ['Bridgestone'],    zone: 'neuheiten' },
  { name: 'MOTOREX',            stand: 'S8',   brands: ['Motorex'],        zone: 'neuheiten' },
  { name: 'Alpinestars',        stand: 'E11',  brands: ['Alpinestars'],    zone: 'neuheiten' }, // via Mototrend
  { name: 'POLO',               stand: 'S9',                                zone: 'neuheiten' },
  { name: 'HELITE',             stand: 'E4',                                zone: 'neuheiten' },

  // Dealers
  { name: 'hostettler moto',    stand: 'E20',                               zone: 'neuheiten' },
  { name: "Biker's Life",       stand: 'E14A',                              zone: 'neuheiten' },
  { name: 'Hans Leupi',         stand: 'K2',                                zone: 'neuheiten' },

  // Action Zone
  { name: 'Team Bolliger',      stand: 'AZ11', zone: 'actionzone' },
  { name: 'Saiger Racing',      stand: 'AZ02', zone: 'actionzone' },
  { name: 'Domi Aegerter',      stand: 'AZ03', zone: 'actionzone' },
  { name: 'Raclette Factory',   stand: 'AZ26', zone: 'actionzone' },
  { name: 'McSands',            stand: 'AZ10', zone: 'actionzone' },
  { name: 'MV Agusta Club',     stand: 'AZ20', zone: 'actionzone' },
];

/** Подтверждённые креаторы — должны быть перечислены на /creators. */
export const CONFIRMED_CREATORS = [
  'Unclerides',
  'Reto Simeon',
  'StrixxRider',
  'Shadowrider',
  'sh_sukki',
  'Cartel Motorsport',
  'Shinobi_zx6r',
  'Mira',
  'ms.bikerblondie',
  'Jack Zemo',
  '6th.redline',
  'joker18',
  'Stellastorm',
  'ACRIDER',
] as const;

/** Программные шоу — должны быть на странице /programm с расписанием. */
export const PROGRAM_SHOWS = {
  actionZone: [
    'Team Bolliger',
    'Michi Stuntrider',
    'Chris Lietsch',
    "Nicola L'Impennatore", // Vespa Freestyle
    'Jesko Raffin',
    'Marc Stockar',
    'Noel Rauber',
    'Pitbike',
  ],
  liveArena: [
    'Suse Mühlemeier',
    'Kevin Bolliger',
    'Dani Weidmann',
    'Mac & Sandra',
    'Horst Saiger',
    'Dominique Aegerter',
    'Race2win',
    'Ducati Monster',
    'INAMAR',
  ],
} as const;
