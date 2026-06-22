import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS } from './fixtures/content';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-004] Party page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/party');
  });

  test('[FN-501] Party date is 21. Februar 2026', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/21\.\s*Februar 2026|21\.02\.2026/i);
  });

  test('[FN-502] Schedule mentions warm-up and party start times', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/19:30/);
    await expect(body).toContainText(/22:00/);
  });

  test('[FN-503] Inklusive Party section lists 3-Tagespass + Samstag', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/3-?Tagespass/i);
    await expect(body).toContainText(/Samstag|21\.02/i);
  });

  test('[FN-504] Age restriction 18+', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/18\+|ab 18/i);
  });

  test('[FN-505] Registration link to Pyrus', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.pyrusPartyReg);
  });

  test('[FN-506] Party Ticket link to Bookinea', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.bookineaPartyTicket);
  });

  test('[FN-507] DJane INAMAR mentioned', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/INAMAR/i);
  });
});
