import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS, EVENT_FACTS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

/**
 * Главная страница — ключевой контент должен сохраниться при миграции.
 */

test.describe('[FN-001] Home page content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[FN-201] Hero headline is present', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/ERLEBEN.*ENTDECKEN.*EINTAUCHEN/i);
  });

  test('[FN-203/204] Hero CTAs link to Bookinea and Pyrus', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.bookineaShop);
    await expectLinkExists(page, EXTERNAL_URLS.pyrusAussteller);
  });

  test('[FN-210..212] Key stats are displayed', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(EVENT_FACTS.stageOneArea);  // 5'740
    await expect(body).toContainText(EVENT_FACTS.halle550Area);  // 4'260
    await expect(body).toContainText(EVENT_FACTS.expectedVisitors); // 10'000+
  });

  test('[FN-220] Opening hours for all three days', async ({ page }) => {
    const body = page.locator('body');
    // Все три дня с временами
    await expect(body).toContainText(/20\.02/);
    await expect(body).toContainText(/21\.02/);
    await expect(body).toContainText(/22\.02/);
    await expect(body).toContainText(/12:00.*22:00/s);
    await expect(body).toContainText(/09:00.*22:00/s);
    await expect(body).toContainText(/09:00.*18:00/s);
  });

  test('[FN-232] Saisonstart Party section with date', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Saisonstart.?Party/i);
    await expect(page.locator('body')).toContainText('21.02.2026');
  });

  test('[FN-233] Three program areas mentioned', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Neuheiten.*Trends/i);
    await expect(body).toContainText(/Live Arena/i);
    await expect(body).toContainText(/Action Zone/i);
  });

  test('[FN-234] StageOne + Halle 550 location mentioned', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/StageOne/i);
    await expect(body).toContainText(/Halle 550/i);
    await expect(body).toContainText(/Oerlikon/i);
  });

  test('[FN-235] ANFAHRT link points to FAQ', async ({ page }) => {
    await expectLinkExists(page, '/faq');
  });

  test('[FN-236] Hallenplan PDF link exists', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.hallenplanPDF, { visible: false });
  });
});

test.describe('[FN-020/FN-021] Home page anchors', () => {
  test('Location anchor exists for navigation', async ({ page }) => {
    await page.goto('/#location-stageone-halle550-zuerich');
    // Якорь должен скроллить к секции с этим id
    const target = page.locator('#location-stageone-halle550-zuerich, [id*="location"]').first();
    await expect(target).toBeAttached({ timeout: 5000 });
  });
});
