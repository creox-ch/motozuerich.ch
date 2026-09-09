import { test, expect } from '@playwright/test';
import { EXTERNAL_URLS, SOCIAL_URLS } from './fixtures/content';
import { PAGES } from './fixtures/pages';
import { expectLinkExists, linkByHref } from './helpers/visit';

/**
 * Тесты глобальной навигации.
 * Хедер/футер должны быть на каждой странице.
 */

test.describe('[FN-100..FN-115] Header navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[FN-100] Logo links to home', async ({ page }) => {
    // Логотип ОБЫЧНО в начале header. Ищем первую кликабельную ссылку на "/"
    const logo = page.locator('header a[href="/"], header a[href$="motozuerich.ch"], header a[href$="motozuerich.ch/"]').first();
    await expect(logo).toBeVisible();
  });

  test('[FN-102] Tickets CTA links to Bookinea', async ({ page }) => {
    await expectLinkExists(page, EXTERNAL_URLS.bookineaShop);
  });

  test('[FN-110..114] Main menu items present', async ({ page }) => {
    // Тестируем по тексту/URL, а не по CSS-классу — устойчиво к редизайну
    const menuLinks = [
      '/',
      '/programm',
      '/aussteller-motozuerich-2026',
      '/medien',
    ];
    for (const href of menuLinks) {
      const link = page.locator(`nav a[href="${href}"], nav a[href$="${href}"]`).first();
      await expect(link, `Nav should have link to ${href}`).toBeAttached();
    }
  });

  test('[FN-111] Besucher dropdown contains FAQ link', async ({ page }) => {
    await expectLinkExists(page, '/faq');
  });

  test('[FN-112] Programm dropdown contains expected items', async ({ page }) => {
    await expectLinkExists(page, '/programm');
  });

  test('[FN-114] Über uns dropdown contains team/sound', async ({ page }) => {
    await expectLinkExists(page, '/team');
    await expectLinkExists(page, '/warum_motozurich');
    await expectLinkExists(page, '/sound');
  });
});

test.describe('[FN-103] Mobile menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Mobile menu toggle is present on narrow viewport', async ({ page }) => {
    await page.goto('/');
    // Ищем кнопку с типичными атрибутами бургер-меню
    const burger = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i], ' +
      'button[aria-expanded], [role="button"][aria-controls*="menu" i], ' +
      'button.menu-toggle, button.hamburger, [class*="burger"], [class*="hamburger"]'
    ).first();
    await expect(burger, 'Mobile viewport should expose a menu toggle button').toBeVisible({ timeout: 5000 });
  });
});

test.describe('[FN-120..123] Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Прокрутить вниз чтобы убедиться что футер в DOM
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  });

  test('[FN-120] Copyright present', async ({ page }) => {
    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toContainText(/MOTO-ZÜRICH/i);
    await expect(footer).toContainText(/2026|2027/);
  });

  test('[FN-121] All 6 social links present', async ({ page }) => {
    for (const [name, url] of Object.entries(SOCIAL_URLS)) {
      const link = linkByHref(page, url);
      await expect(link, `Footer should link to ${name}: ${url}`).toBeAttached();
    }
  });

  test('[FN-122] Legal links present: Impressum, AGB, Datenschutz', async ({ page }) => {
    await expectLinkExists(page, '/impressum');
    await expectLinkExists(page, '/agb');
    await expectLinkExists(page, '/datenschutz');
  });
});

test.describe('Global chrome is present on every page', () => {
  // Проверка нав/футер на нескольких репрезентативных страницах (не всех — это медленно)
  const sample = PAGES.filter(p =>
    ['/', '/faq', '/programm', '/team', '/impressum'].includes(p.path)
  );

  for (const p of sample) {
    test(`[${p.fn}] ${p.name}: header + footer rendered`, async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator('header, [role="banner"]').first()).toBeVisible();
      await expect(page.locator('footer, [role="contentinfo"]').first()).toBeVisible();
    });
  }
});
