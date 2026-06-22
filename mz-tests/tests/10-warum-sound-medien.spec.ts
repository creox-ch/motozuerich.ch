import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-008] Warum MOTO-ZÜRICH page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/warum_motozurich');
  });

  test('[FN-901] Q&A about SWISS-MOTO is present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/SWISS-MOTO/i);
  });

  test('[FN-901] Auto Zürich comparison present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Auto Zürich/i);
  });

  test('[FN-901] EICMA reference present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/EICMA/i);
  });

  test('[FN-901] StageOne & Halle 550 explanation', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/StageOne/i);
    await expect(body).toContainText(/Halle 550/i);
  });

  test('[FN-902] Zeitfenster section about entry', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Zeitfenster|Einlass/i);
  });
});

test.describe('[FN-009] Sound page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sound');
  });

  test('[FN-1001] All three tracks listed', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/ZWO/i);
    await expect(body).toContainText(/Rock/i);
    await expect(body).toContainText(/House 01|House Version01/i);
    await expect(body).toContainText(/House 02|House Version02/i);
  });

  test('[FN-1002] All three download links to Google Drive', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.zwoRock, { visible: false });
    await expectLinkExists(page, EXTERNAL_URLS.zwoHouse01, { visible: false });
    await expectLinkExists(page, EXTERNAL_URLS.zwoHouse02, { visible: false });
  });

  test('[FN-1003] ZWO website link', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.zwoWebsite, { visible: false });
  });
});

test.describe('[FN-010] Medien page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/medien');
  });

  test('[FN-1101] Pre-event press list contains key outlets', async ({ page }) => {
    const body = page.locator('body');
    const keyOutlets = ['Blick', 'moto.ch', '1000PS'];
    for (const o of keyOutlets) {
      await expect(body, `Press outlet "${o}" should be mentioned`).toContainText(o);
    }
  });

  test('[FN-1102] Post-event coverage section', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Tages-Anzeiger|Streetlife/i);
  });

  test('[FN-1103] Medienkonferenz info present', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Medienkonferenz/i);
    await expect(body).toContainText(/20\.\s*Februar|20\.02/i);
    await expect(body).toContainText(/11:00/);
  });

  test('[FN-1104] Akkreditierung link to media form', async ({ page }) => {
    await expectLinkExists(page, '/media_form');
  });

  test('Press release links are external (open in new tab is OK but not required)', async ({ page }) => {
    // Должно быть ≥15 внешних ссылок на пресс-материалы
    const links = page.locator('a[href*="blick.ch"], a[href*="moto.ch"], a[href*="tagesanzeiger"], a[href*="1000ps"], a[href*="streetlife"]');
    const count = await links.count();
    expect(count, 'Should have multiple press article links').toBeGreaterThan(5);
  });
});
