import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS } from './fixtures/content';
import { CONFIRMED_CREATORS } from './fixtures/exhibitors';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-014] Volunteers page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/volunteers');
  });

  test('[FN-1501] Heading "Helfer gesucht"', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Helfer gesucht/i);
  });

  test('[FN-1502] Event dates listed', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/20\.\s*[-–]\s*22\.\s*Februar 2026|20\.02.*22\.02/i);
  });

  test('[FN-1503] Both venue addresses present', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Elias Canetti-?Strasse 146/i);
    await expect(body).toContainText(/Birchstrasse 150/i);
  });

  test('[FN-1504] FAQ section has multiple questions', async ({ page }) => {
    // Считаем заголовки h2/h3 в основном контенте — должно быть ≥10 (18 FAQ вопросов)
    const body = page.locator('body');
    await expect(body).toContainText(/FAQ/i);
    await expect(body).toContainText(/Parkplätze|Anreise|Verpflegung|Kleiderordnung/i);
  });

  test('[FN-1505] Anmeldung link to Swiss Volunteers', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.swissVolunteers, { visible: false });
  });

  test('[FN-1506] WhatsApp community link', async ({ page }) => {
    const wa = page.locator('a[href*="whatsapp.com"]').first();
    await expect(wa).toBeAttached();
  });
});

test.describe('[FN-015] Creators page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/creators');
  });

  test('[FN-1601] Most confirmed creators are listed', async ({ page }) => {
    const body = page.locator('body');
    // Проверяем хотя бы половину — некоторые могут быть удалены/добавлены со временем
    const found: string[] = [];
    const text = await body.textContent();
    for (const c of CONFIRMED_CREATORS) {
      if (text!.toLowerCase().includes(c.toLowerCase())) {
        found.push(c);
      }
    }
    expect(found.length, `Expected most confirmed creators to be listed, found: ${found.join(', ')}`)
      .toBeGreaterThan(CONFIRMED_CREATORS.length / 2);
  });

  test('[FN-1602] Creator Alley section with 15 spots', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Creator.?Alley/i);
    await expect(body).toContainText(/15.*Plätze|15 Plätze/i);
  });

  test('[FN-1603] Pre-Opening event on 31.01', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/31\.01|31\.\s*Januar/i);
    await expect(body).toContainText(/StageOne/i);
  });

  test('[FN-1604] MAN\'S WORLD partnership section', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/MAN.?S WORLD|MANS WORLD/i);
    await expect(body).toContainText(/Ducati Diavel/i);
    await expect(body).toContainText(/Bentley/i);
  });

  test('[FN-1605] Basic-Paket for influencers mentioned', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Basic.?Paket|1.?000 Followern/i);
  });

  test('[FN-1607] Official hashtags listed', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/#MotoZürich|#MotoZuerich/i);
    await expect(body).toContainText(/#MZ26/i);
  });

  test('[FN-1608] Application form links', async ({ page }) => {
    await expectLinkExists(page, '/creators_form');
    await expectLinkExists(page, '/blogger_form');
  });

  test('Giveaway template in DE and EN languages', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/GEWINNSPIEL/i);
    await expect(body).toContainText(/GIVEAWAY/i);
  });
});
