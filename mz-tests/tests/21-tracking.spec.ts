import { test, expect } from '@playwright/test';
import { hasGA4 } from './helpers/visit';
import { TRACKING_IDS } from './fixtures/content';

/**
 * Трекинг — самая частая причина "сайт мигрировали и все метрики обнулились".
 * Этот файл — главный страж того, что ничего не потерялось при переезде.
 */

test.describe('[FN-1801..1805] Analytics scripts present on home page', () => {
  // Der Site nutzt Google Consent Mode v2 (mz-head.js): GA4 (G-1MHSWJYZVN) UND
  // Meta Pixel (1525171172005763) sind verdrahtet, laden aber erst nach Zustimmung.
  // Entscheidung liegt in localStorage['mz-consent-v1'] = {analytics, marketing}.
  // Wir setzen sie via addInitScript VOR den Seitenskripten, damit die Tags real laden
  // — sonst sieht der Test (wie curl) nur den Pre-Consent-Zustand.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try { localStorage.setItem('mz-consent-v1', JSON.stringify({ analytics: true, marketing: true })); } catch (e) {}
    });
    // 'load' statt 'networkidle': die Startseite lädt ein grosses Hero-Video und
    // erreicht networkidle erst nach ~23s (30s-Timeout, flaky).
    await page.goto('/', { waitUntil: 'load' });
  });

  test('[FN-1801] GA4 (gtag) lädt nach Analytics-Zustimmung', async ({ page }) => {
    // Consent-Mode-Verdrahtung ist immer da; nach Zustimmung lädt zusätzlich gtag.js.
    const found = await hasGA4(page);
    expect(found, 'GA4/gtag setup must be present').toBe(true);
    await page.waitForFunction(
      () => Array.from(document.scripts).some(s => /googletagmanager\.com\/gtag\/js/.test(s.src)),
      null, { timeout: 8000 }
    ).catch(() => {});
    const gtagJsLoaded = await page.evaluate(
      () => Array.from(document.scripts).some(s => /googletagmanager\.com\/gtag\/js/.test(s.src))
    );
    expect(gtagJsLoaded, 'gtag.js should load after analytics consent').toBe(true);
  });

  test('[FN-1801] dataLayer is initialized', async ({ page }) => {
    const hasDataLayer = await page.evaluate(() => Array.isArray((window as any).dataLayer));
    expect(hasDataLayer, 'window.dataLayer should be an array (Consent Mode v2)').toBe(true);
  });

  test('[FN-1803] Meta Pixel (fbq) lädt nach Marketing-Zustimmung', async ({ page }) => {
    // Pixel ist in mz-head.js verdrahtet (loadPixel/FB_ID) und lädt bei marketing-consent.
    await page.waitForFunction(() => typeof (window as any).fbq === 'function', null, { timeout: 8000 })
      .catch(() => {});
    const fbqLoaded = await page.evaluate(() => typeof (window as any).fbq === 'function');
    expect(fbqLoaded, 'Meta Pixel (fbq) must load after marketing consent').toBe(true);
  });

  test('[FN-1805] facebook-domain-verification meta tag is on home', async ({ page }) => {
    const fbVerif = await page.locator('meta[name="facebook-domain-verification"]').getAttribute('content');
    expect(fbVerif).toBe(TRACKING_IDS.facebookDomainVerification);
  });
});

test.describe('Analytics fires on key pages too', () => {
  // Главные конверсионные страницы — обязательно должны трекаться
  const keyPages = ['/aussteller-motozuerich-2026', '/programm', '/medien'];

  for (const path of keyPages) {
    test(`GA4 present on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' });
      expect(await hasGA4(page)).toBe(true);
    });
  }
});

test.describe('[FN-1810] Cookie consent banner', () => {
  test('Cookie banner should be visible on first visit', async ({ page, context }) => {
    // Clear cookies to simulate first-time visitor
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Ищем типичные cookie banner паттерны:
    // - Cookiebot: #CybotCookiebotDialog
    // - Usercentrics: #usercentrics-root
    // - Termly: .termly-cookie-banner
    // - Generic: [class*="cookie"], [id*="cookie-banner"]
    const bannerSelectors = [
      '#CybotCookiebotDialog',
      '#usercentrics-root',
      '[class*="cookie-banner" i]',
      '[id*="cookie-banner" i]',
      '[class*="cookie-consent" i]',
      '[id*="cookie-consent" i]',
      '[aria-label*="cookie" i]',
      'dialog:has-text("Cookie")',
      'dialog:has-text("Datenschutz")',
    ];

    const found = await page.locator(bannerSelectors.join(', ')).count();

    // ⚠️ Currently the site does NOT have a cookie banner (gap identified in skill notes).
    // The new site MUST add one. We use a soft check that records the state.
    if (found === 0) {
      console.warn('⚠️ No cookie consent banner detected. This is REQUIRED under Swiss FADP / EU GDPR.');
      // Не делаем fail — пока сайт мигрируется, ожидаем что это закроется
      test.fail(true, 'Cookie consent banner is required for the new site (Swiss FADP / EU GDPR compliance).');
    } else {
      expect(found).toBeGreaterThan(0);
    }
  });
});

test.describe('[FN-1811] Datenschutz reflects actual trackers', () => {
  test('Datenschutz mentions all trackers actually in use', async ({ page }) => {
    await page.goto('/datenschutz');
    const body = page.locator('body');

    // Базовые упоминания
    await expect(body).toContainText(/Google Analytics/i);
    await expect(body).toContainText(/Meta|Facebook/i);

    // ⚠️ После миграции в Datenschutz должны быть конкретные ID:
    // - GA4 Measurement ID (G-XXXXXXXXXX)
    // - Meta Pixel ID
    // Это soft check на будущее
    const text = await body.textContent();
    const hasGA4Id = /G-[A-Z0-9]+/.test(text || '');
    const hasPixelId = /\b\d{15,16}\b/.test(text || '');

    if (!hasGA4Id || !hasPixelId) {
      console.warn(
        `Datenschutz should disclose specific IDs (GA4 Measurement ID, Meta Pixel ID). ` +
        `hasGA4Id=${hasGA4Id}, hasPixelId=${hasPixelId}`
      );
    }
  });
});
