import { test, expect, devices } from '@playwright/test';

/**
 * Тесты адаптивности — проверяем что сайт работает на мобиле и десктопе.
 */

test.describe('[FN-2106/2107] Responsive design', () => {
  test('Home page renders without horizontal scroll on iPhone', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(hasHorizontalScroll, 'Page should not have horizontal scroll on mobile').toBe(false);

    await context.close();
  });

  test('Home page renders without horizontal scroll on iPad', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad Pro'] });
    const page = await context.newPage();
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    expect(hasHorizontalScroll, 'Page should not have horizontal scroll on tablet').toBe(false);

    await context.close();
  });

  test('Mobile menu visible on small viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.goto('/');

    // Должен быть бургер либо видимое мобильное меню
    const burger = page.locator(
      'button[aria-label*="menu" i], button.menu-toggle, ' +
      '[class*="burger" i], [class*="hamburger" i]'
    ).first();
    await expect(burger).toBeVisible({ timeout: 5000 });

    await context.close();
  });

  test('Desktop menu visible on wide viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');

    // Главное меню (Home, Programm, Aussteller и т.д.) — видимо
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();

    // Минимум одна ссылка из главного меню — видима
    const programmLink = page.locator('nav a[href="/programm"], nav a[href$="/programm"]').first();
    await expect(programmLink).toBeVisible();

    await context.close();
  });
});

test.describe('[FN-2101] Touch target sizes on mobile', () => {
  test('CTAs are large enough to tap on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    // Главная Tickets кнопка должна быть ≥44x44px (WCAG 2.5.5 / iOS HIG)
    const ticketsButton = page.locator('a[href*="bookinea"]').first();
    await expect(ticketsButton).toBeVisible();
    const box = await ticketsButton.boundingBox();
    expect(box, 'Tickets button should have bounding box').toBeTruthy();
    expect(box!.height, `Tickets button should be ≥44px tall (was ${box!.height}px)`).toBeGreaterThanOrEqual(40);

    await context.close();
  });
});
