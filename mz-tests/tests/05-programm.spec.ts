import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS } from './fixtures/content';
import { PROGRAM_SHOWS } from './fixtures/exhibitors';
import { expectLinkExists } from './helpers/visit';

test.describe('[FN-003] Programm page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/programm');
  });

  test('[FN-401/402] Has both Action Zone and Live Arena sections', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toContainText(/Action Zone/i);
    await expect(body).toContainText(/Live Arena/i);
  });

  test('[FN-403] Live Arena anchor scrolls into view', async ({ page }) => {
    await page.goto('/programm#Programm-LIVE-ARENA');
    const target = page.locator('#Programm-LIVE-ARENA, [id*="LIVE-ARENA" i], [id*="liveArena" i]').first();
    await expect(target).toBeAttached({ timeout: 5000 });
  });

  test('[FN-404] Action Zone anchor scrolls into view', async ({ page }) => {
    await page.goto('/programm#Programm-ACTION-ZONE');
    const target = page.locator('#Programm-ACTION-ZONE, [id*="ACTION-ZONE" i], [id*="actionZone" i]').first();
    await expect(target).toBeAttached({ timeout: 5000 });
  });

  test('[FN-405] Hallenplan anchor exists', async ({ page }) => {
    await page.goto('/programm#hallenplan');
    const target = page.locator('#hallenplan, [id*="hallenplan" i]').first();
    await expect(target).toBeAttached({ timeout: 5000 });
  });

  test('[FN-406/407] Event Guide links present', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.eventGuidePDF, { visible: false });
  });

  test('[FN-408] Hallenplan PDF download link', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.hallenplanPDF, { visible: false });
  });

  test('[FN-409] Hallenplan video link to YouTube', async ({ page }) => {
    // Любая YouTube ссылка
    const yt = page.locator('a[href*="youtu.be"], a[href*="youtube.com"]').first();
    await expect(yt).toBeAttached();
  });
});

test.describe('[FN-410..417] Action Zone shows', () => {
  test('All Action Zone shows are listed', async ({ page }) => {
    await page.goto('/programm');
    const body = page.locator('body');
    for (const show of PROGRAM_SHOWS.actionZone) {
      await expect(body, `Action Zone show "${show}" should be present`).toContainText(show);
    }
  });

  test('Show times include all three event days', async ({ page }) => {
    await page.goto('/programm');
    const body = page.locator('body');
    // Расписание должно ссылаться на даты
    await expect(body).toContainText(/20\.02/);
    await expect(body).toContainText(/21\.02/);
    await expect(body).toContainText(/22\.02/);
  });
});

test.describe('[FN-420..429] Live Arena talks', () => {
  test('All Live Arena talks are listed', async ({ page }) => {
    await page.goto('/programm');
    const body = page.locator('body');
    for (const show of PROGRAM_SHOWS.liveArena) {
      await expect(body, `Live Arena talk "${show}" should be present`).toContainText(show);
    }
  });

  test('[FN-427] Ducati Monster Premiere at specific time', async ({ page }) => {
    await page.goto('/programm');
    await expect(page.locator('body')).toContainText(/Ducati Monster/i);
    await expect(page.locator('body')).toContainText('15:30');
  });
});
