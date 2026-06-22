import { test, expect } from '@playwright/test';
import { KEY_EXHIBITORS } from './fixtures/exhibitors';
import { EXTERNAL_URLS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-005] Aussteller page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/aussteller-motozuerich-2026');
  });

  test('[FN-601/603] Two main sections present', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/AUSSTELLER 2026/i);
    await expect(body).toContainText(/Action Zone/i);
  });

  test('[FN-606] Event Guide download link', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.eventGuidePDF, { visible: false });
  });

  test('[FN-608] Key major brands are present', async ({ page }) => {
    const body = page.locator('body');
    const mustHave = KEY_EXHIBITORS.filter(e => e.zone === 'neuheiten');
    for (const exh of mustHave.slice(0, 10)) {  // первые 10 для скорости
      await expect(body, `Exhibitor "${exh.name}" should be listed`).toContainText(exh.name);
    }
  });

  test('Action Zone exhibitors are present', async ({ page }) => {
    const body = page.locator('body');
    const azExhibitors = KEY_EXHIBITORS.filter(e => e.zone === 'actionzone');
    for (const exh of azExhibitors) {
      await expect(body, `Action Zone exhibitor "${exh.name}" should be listed`).toContainText(exh.name);
    }
  });

  test('Stand numbers follow expected format (E##, S##, G##, K##, AZ##)', async ({ page }) => {
    const text = await page.locator('body').textContent();
    expect(text, 'Page should contain stand numbers').toBeTruthy();
    const standPattern = /\b(E\d{1,2}[A-Z]?|S\d{1,2}|G\d{1,2}[A-Z]?|K\d|AZ\d{2})\b/g;
    const matches = text!.match(standPattern);
    expect(matches, 'Should find multiple stand numbers').not.toBeNull();
    expect(matches!.length, 'Should have at least 30 stand numbers').toBeGreaterThan(30);
  });

  test('Total exhibitor count is in expected range (~60+)', async ({ page }) => {
    // Считаем уникальные стенды
    const text = await page.locator('body').textContent();
    const stands = new Set((text!.match(/\b(E\d{1,2}[A-Z]?|S\d{1,2}|G\d{1,2}[A-Z]?|K\d|AZ\d{2})\b/g) || []));
    expect(stands.size, 'Should have at least 40 unique stand designations').toBeGreaterThan(40);
  });

  test('External websites: at least 30 exhibitor websites linked', async ({ page }) => {
    const allLinks = page.locator('a[href^="http"]:not([href*="motozuerich"]):not([href*="bookinea"]):not([href*="pyrus"]):not([href*="instagram"]):not([href*="facebook"]):not([href*="drive.google"])');
    const count = await allLinks.count();
    expect(count, 'Should have many external exhibitor website links').toBeGreaterThan(30);
  });
});
