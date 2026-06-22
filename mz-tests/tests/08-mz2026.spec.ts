import { test, expect } from '@playwright/test';
import { EVENT_FACTS, EXTERNAL_URLS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-006] MZ2026 Rückblick page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mz2026');
  });

  test('[FN-701] Heading and statement', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/MOTO-ZÜRICH 2026/i);
    await expect(body).toContainText(/Neustart/i);
  });

  test('[FN-702] All three key statistics displayed', async ({ page }) => {
    const body = page.locator('body');
    await expect(body, '87 Aussteller').toContainText(EVENT_FACTS.exhibitors2026);
    await expect(body, '30+ Programmpunkte').toContainText(EVENT_FACTS.programItems2026);
    await expect(body, "22'000+ Besucher").toContainText(EVENT_FACTS.visitors2026);
  });

  test('[FN-703] Photo gallery link to Google Drive', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.photoGalleryFolder, { visible: false });
  });

  test('[FN-704] 3D model link to smartvenue', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.smartvenue3D, { visible: false });
  });

  test('[FN-705] Save the Date 2027', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/MOTO-ZÜRICH 2027/i);
    await expect(body).toContainText(EVENT_FACTS.dates2027);
  });

  test('[FN-706] Instagram link present', async ({ page }) => {
    const link = page.locator('a[href*="instagram.com/motozuerich"]').first();
    await expect(link).toBeAttached();
  });
});
