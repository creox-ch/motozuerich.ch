/**
 * External integrations & social URLs — must be preserved across migration.
 */

export const EXTERNAL_URLS = {
  // Bookinea — ticketing
  bookineaShop:       'https://motozuerich.shop.bookinea.app/de',
  bookineaPartyTicket:'https://motozuerich.shop.bookinea.app/a/moto-zurich-saisonstart-party-6903',

  // Pyrus — forms
  pyrusAussteller:    'https://pyrus.com/form/2333138',
  pyrusKontakt:       'https://pyrus.com/form/2399268',
  pyrusPartyReg:      'https://pyrus.com/form/2399255',

  // Swiss Volunteers
  swissVolunteers:    'https://go.swissvolunteers.ch/discover-events/link/dea88a69e4538d455f1bb291099e49c7d1198aa0',

  // smartvenue 3D tour
  smartvenue3D:       'https://my.smartvenue.ch/de/tour/moto-zh-2026',

  // Google Drive PDFs and assets
  eventGuidePDF:      'https://drive.google.com/uc?export=download&id=1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk',
  eventGuideView:     'https://drive.google.com/file/d/1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk/view',
  hallenplanPDF:      'https://drive.google.com/uc?export=download&id=12egHFEgXcwl_MsFdocXTmQFd9aAEtoVt',
  hallenplanView:     'https://drive.google.com/file/d/12egHFEgXcwl_MsFdocXTmQFd9aAEtoVt/view',
  photoGalleryFolder: 'https://drive.google.com/drive/folders/1hSLFrg4m-gQ6CCtM1k0k4dcbweCTse9T',

  // ZWO audio downloads
  zwoRock:            'https://drive.google.com/uc?export=download&id=1ubPjl-Pm5MqUyzKiRSd_OwE0Da_XPosi',
  zwoHouse01:         'https://drive.google.com/uc?export=download&id=1QTQvfTouJ3MUdNgvXTJ8veFtgtuqN0pz',
  zwoHouse02:         'https://drive.google.com/uc?export=download&id=1AL690o_f5iUlW6c8keJJaMpRQNM2Upsf',
  zwoWebsite:         'https://zwo-music.ch',
} as const;

/** Social media URLs in the footer. */
export const SOCIAL_URLS = {
  whatsapp:  'https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R',
  facebook:  'https://www.facebook.com/motozuerich',
  youtube:   'https://www.youtube.com/@motozuerich',
  instagram: 'https://www.instagram.com/motozuerich/',
  linkedin:  'https://www.linkedin.com/company/motozuerich',
  tiktok:    'https://tiktok.me/motozuerich',
} as const;

/** Tracking IDs that must be re-implemented on new platform. */
export const TRACKING_IDS = {
  ga4PropertyId:                '506151147',
  googleAdsAccount:             '459-200-7401',
  metaBusinessAsset:            '768641272864615',
  facebookDomainVerification:   'ucqsxq6p2ioz0g4oobo1kugmlnqjmi',
  facebookPageId:               '729195176942958',
  instagramHandle:              '@motozuerich',
  searchConsoleProperty:        'https://motozuerich.ch/',
  googleBusinessProfileLocation:'11157236267501453000',
} as const;

/** Key event details — date, capacity, location. */
export const EVENT_FACTS = {
  // 2026 event (past)
  dates2026:       '20.–22. Februar 2026',
  visitors2026:    "22'000+",
  exhibitors2026:  '87',
  programItems2026:'30+',

  // 2027 event (upcoming)
  dates2027:       '19.–21. Februar 2027',

  // Capacity & space
  stageOneArea:    "5'740",  // m²
  halle550Area:    "4'260",  // m²
  expectedVisitors:"10'000+",

  // Opening hours 2026
  friOpen:  '12:00',
  friClose: '22:00',
  satOpen:  '09:00',
  satClose: '22:00',
  sunOpen:  '09:00',
  sunClose: '18:00',
} as const;

/** Company contact info — present in Impressum/AGB/Datenschutz. */
export const COMPANY = {
  legalName:    'Vollenweider & Schweizer GmbH',
  street:       'Bäderstrasse 28',
  zip:          '5400',
  city:         'Baden',
  canton:       'AG',
  country:      'Schweiz',
  director:     'Yves Vollenweider',
  emailGeneral: 'team@motozuerich.ch',
  emailSupport: 'help@motozuerich.ch',
  phone:        '+41 77 287 16 34',
  jurisdiction: 'Kanton Aargau',
} as const;

/** Swiss German orthography note: site uses 'ss' instead of 'ß' throughout. */
export const ORTHOGRAPHY_FORBIDDEN = ['ß']; // should never appear on the site

/** Notfallnummern in FAQ */
export const EMERGENCY_NUMBERS = {
  sanitaet:   '144',
  polizei:    '117',
  feuerwehr:  '118',
  toxZentrum: '145',
} as const;
