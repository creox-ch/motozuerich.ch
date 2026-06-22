import { test, expect } from '@playwright/test';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-007] Team page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team');
  });

  test('[FN-801] Yves Vollenweider mentioned with role context', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Yves Vollenweider/i);
    await expect(body).toContainText(/SWISS-MOTO/i);
    await expect(body).toContainText(/13 Jahre/i);
  });

  test('[FN-802] Kseniia Chudina mentioned with role', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Kseniia Chudina/i);
    await expect(body).toContainText(/Marketing|Social Media|digital/i);
  });

  test('[FN-803] Ivanna Smolyana mentioned', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Ivanna Smolyana/i);
  });

  test('[FN-804] Jasmine Vollenweider as Event Coordinator', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Jasmine Vollenweider/i);
    await expect(body).toContainText(/Event Coordinator/i);
  });

  test('[FN-805] Züri Leu Biker mascot mentioned', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Züri Leu/i);
  });

  test('[FN-806/807] Sub-page links to volunteers and creators', async ({ page }) => {
    await expectLinkExists(page, '/volunteers');
    await expectLinkExists(page, '/creators');
  });

  test('[FN-808] Contact form link present', async ({ page }) => {
    await expectLinkExists(page, 'pyrus.com/form/2399268');
  });
});
