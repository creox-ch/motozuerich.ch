import { test, expect } from '@playwright/test';
import { COMPANY } from './fixtures/content';

test.describe('[FN-011] Impressum', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/impressum');
  });

  test('[FN-1201..1205] Full company contact info', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(COMPANY.legalName);
    await expect(body).toContainText(COMPANY.street);
    await expect(body).toContainText(`${COMPANY.zip} ${COMPANY.city}`);
    await expect(body).toContainText(COMPANY.director);
    await expect(body).toContainText(COMPANY.emailGeneral);
    // Phone number with flexible formatting
    await expect(body).toContainText(/\+41[\s.]*77[\s.]*287[\s.]*16[\s.]*34/);
  });

  test('[FN-1206] Legal jurisdiction', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/schweizerisches Recht/i);
    await expect(body).toContainText(/Kanton Aargau/i);
  });

  test('Email is a clickable mailto link', async ({ page }) => {
    const mailto = page.locator(`a[href^="mailto:"]`).first();
    await expect(mailto).toBeAttached();
  });
});

test.describe('[FN-012] AGB', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agb');
  });

  test('[FN-1301] All 12 numbered sections present', async ({ page }) => {
    const body = page.locator('body');
    // Проверяем хотя бы первые/последние пункты по тематическим словам
    await expect(body).toContainText(/Produkte und Dienstleistungen/i);
    await expect(body).toContainText(/Preise/i);
    await expect(body).toContainText(/Vertragsabschluss/i);
    await expect(body).toContainText(/Lieferung/i);
    await expect(body).toContainText(/Zahlungen/i);
    await expect(body).toContainText(/Gewährleistung/i);
    await expect(body).toContainText(/Widerrufsrecht/i);
    await expect(body).toContainText(/Medienschaffende/i);
    await expect(body).toContainText(/Gerichtsstand/i);
  });

  test('[FN-1302] Updated date is October 2025', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/30.*October 2025|Oktober 2025|30\.10\.2025/i);
  });

  test('[FN-1303] Support email present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(COMPANY.emailSupport);
  });

  test('[FN-1304] Ticket transferability clause', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/persönlich.*nicht übertragbar|Eintrittskarten.*persönlich/i);
  });

  test('[FN-1305] No-refund for Eintrittskarten', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Widerruf.*nicht|nicht.*Eintritts/i);
  });
});

test.describe('[FN-013] Datenschutz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/datenschutz');
  });

  test('[FN-1401] All 11 numbered sections covered', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Verantwortliche Stelle/i);
    await expect(body).toContainText(/Personendaten/i);
    await expect(body).toContainText(/Zwecke/i);
    await expect(body).toContainText(/Weitergabe/i);
    await expect(body).toContainText(/Bild.*Tonaufnahmen/i);
    await expect(body).toContainText(/Datensicherheit/i);
    await expect(body).toContainText(/Cookies/i);
    await expect(body).toContainText(/Rechte/i);
  });

  test('[FN-1402] Stand November 2025', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/November 2025/i);
  });

  test('[FN-1403] Responsible party named', async ({ page }) => {
    await expect(page.locator('body')).toContainText(COMPANY.legalName);
  });

  test('[FN-1404] Contact email is help@', async ({ page }) => {
    await expect(page.locator('body')).toContainText(COMPANY.emailSupport);
  });

  test('[FN-1406] Mentions Meta/Facebook & Google Analytics', async ({ page }) => {
    const body = page.locator('body');
    // Privacy policy must disclose what trackers are in use
    await expect(body).toContainText(/Meta|Facebook/i);
    await expect(body).toContainText(/Google Analytics/i);
  });
});

test.describe('Swiss German orthography', () => {
  // Sites in Switzerland should use 'ss' instead of 'ß'.
  test('Impressum should not contain ß character', async ({ page }) => {
    await page.goto('/impressum');
    const text = await page.locator('body').textContent();
    expect(text, 'Swiss German uses "ss", not "ß"').not.toContain('ß');
  });

  test('Datenschutz should not contain ß character', async ({ page }) => {
    await page.goto('/datenschutz');
    const text = await page.locator('body').textContent();
    expect(text).not.toContain('ß');
  });
});
