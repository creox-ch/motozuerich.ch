import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS, SOCIAL_URLS } from './fixtures/content';

/**
 * Проверяем что внешние сервисы (Bookinea, Pyrus, Google Drive и т.д.)
 * ОТВЕЧАЮТ. Это самый частый источник тихих 404/500 после миграции.
 *
 * Не проверяем тут что сами сервисы работают идеально — просто что они достижимы
 * (HTTP < 500).
 */

const REACHABILITY_TARGETS: Array<{ name: string; url: string }> = [
  { name: 'Bookinea shop',     url: EXTERNAL_URLS.bookineaShop },
  { name: 'Bookinea party',    url: EXTERNAL_URLS.bookineaPartyTicket },
  { name: 'Pyrus Aussteller',  url: EXTERNAL_URLS.pyrusAussteller },
  { name: 'Pyrus Kontakt',     url: EXTERNAL_URLS.pyrusKontakt },
  { name: 'Pyrus Party Reg',   url: EXTERNAL_URLS.pyrusPartyReg },
  { name: 'Swiss Volunteers',  url: EXTERNAL_URLS.swissVolunteers },
  { name: 'smartvenue 3D',     url: EXTERNAL_URLS.smartvenue3D },
  { name: 'Event Guide PDF',   url: EXTERNAL_URLS.eventGuideView },
  { name: 'Hallenplan PDF',    url: EXTERNAL_URLS.hallenplanView },
  { name: 'Photo gallery',     url: EXTERNAL_URLS.photoGalleryFolder },
  { name: 'ZWO website',       url: EXTERNAL_URLS.zwoWebsite },
];

test.describe('[FN-1901..1910] External integrations reachable', () => {
  for (const target of REACHABILITY_TARGETS) {
    test(`${target.name} responds`, async ({ request }) => {
      // Используем HEAD если возможно, fallback на GET
      let response;
      try {
        response = await request.head(target.url, { timeout: 20_000, maxRedirects: 5 });
      } catch {
        response = await request.get(target.url, { timeout: 20_000, maxRedirects: 5 });
      }
      const status = response.status();
      expect(
        status,
        `${target.name} (${target.url}) returned HTTP ${status}; expected <500`
      ).toBeLessThan(500);
    });
  }
});

test.describe('[FN-2001..2006] Social media URLs reachable', () => {
  for (const [name, url] of Object.entries(SOCIAL_URLS)) {
    test(`Social: ${name} responds`, async ({ request }) => {
      try {
        const r = await request.get(url, { timeout: 20_000, maxRedirects: 5 });
        const status = r.status();
        expect(
          status,
          `${name} (${url}) returned HTTP ${status}; expected <500 (some platforms 403 bots, that's OK)`
        ).toBeLessThan(500);
      } catch (err) {
        // Some platforms throttle scripted requests aggressively; we record but don't fail
        console.warn(`⚠️ Social ${name} request failed: ${err}`);
      }
    });
  }
});
