import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS, EMERGENCY_NUMBERS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-002] FAQ page content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
  });

  test('[FN-301] Anreise section has 3 modes', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/öffentlich/i);
    await expect(body).toContainText(/Auto/i);
    await expect(body).toContainText(/Motorrad/i);
  });

  test('[FN-302] OV info with tram/bus numbers', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Bahnhof.*Oerlikon/i);
    await expect(body).toContainText(/S2|S3|S6|S7|S8/);
    await expect(body).toContainText(/Tram.*10|Tram.*11/i);
  });

  test('[FN-303] Distances mentioned', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText('450m');
    await expect(body).toContainText('4.7km');
    await expect(body).toContainText('7.2km');
  });

  test('[FN-304] All 6 parking houses listed', async ({ page }) => {
    const body = page.locator('body');
    const parkings = ['Cityport', 'Parkside', 'Center Eleven', 'Jungholz', 'Octavo', 'Accu'];
    for (const p of parkings) {
      await expect(body, `Parking "${p}" should be listed`).toContainText(p);
    }
  });

  test('[FN-307] Kinder bis 12 free', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Kinder.{0,40}12/i);
  });

  test('[FN-308] No dogs (except assistance)', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Hunde/i);
  });

  test('[FN-309] Garderobe prices', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Garderobe/i);
    await expect(body).toContainText(/CHF 3/);
    await expect(body).toContainText(/CHF 2/);
  });

  test('[FN-311] Bar Depot system mentioned', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Depot/i);
    await expect(body).toContainText(/Jeton/i);
  });

  test('[FN-313] Rauchen zone identified', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Rauch/i);
    await expect(body).toContainText(/AZ27|AZ28/);
  });

  test('[FN-315] Sanitätsposten at Stand E1', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Sanitäts.{0,30}E1/i);
  });

  test('[FN-316] All 4 emergency numbers listed', async ({ page }) => {
    const body = page.locator('body');
    for (const [name, num] of Object.entries(EMERGENCY_NUMBERS)) {
      await expect(body, `Emergency number for ${name} (${num}) should be listed`).toContainText(num);
    }
  });

  test('[FN-317] Fragen Stellen link to Pyrus', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.pyrusKontakt);
  });
});
