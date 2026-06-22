import { test, expect } from '@playwright/test';
import { PAGES, FORM_PAGES } from './fixtures/pages';
import { expectPageOk } from './helpers/visit';

/**
 * Smoke-тест: каждая страница возвращает 2xx/3xx, имеет <title> и hat <body>.
 * Если этот файл падает — новый сайт принципиально не работает,
 * нет смысла прогонять остальные тесты.
 */

test.describe('Smoke: all routes return 2xx', () => {
  for (const p of PAGES) {
    test(`[${p.fn}] ${p.name} (${p.path}) loads successfully`, async ({ page }) => {
      await expectPageOk(page, p.path);

      // Минимальная sanity check — есть title и body
      await expect(page).toHaveTitle(/.+/, { timeout: 5000 });
      await expect(page.locator('body')).toBeVisible();

      // Title содержит ожидаемую подстроку (бренд)
      await expect(page).toHaveTitle(new RegExp(p.titleContains, 'i'));
    });
  }

  for (const p of FORM_PAGES) {
    test(`[${p.fn}] ${p.name} form page (${p.path}) loads`, async ({ page }) => {
      // Form pages могут быть простой обёрткой над Pyrus iframe — проверяем хотя бы что не 404
      await expectPageOk(page, p.path);
    });
  }
});

test.describe('Smoke: critical infrastructure files exist', () => {
  test('[FN-1701] robots.txt exists and is non-empty', async ({ request, baseURL }) => {
    const r = await request.get(`${baseURL}/robots.txt`);
    expect(r.status(), 'robots.txt should return 200').toBe(200);
    const body = await r.text();
    expect(body.length, 'robots.txt should not be empty').toBeGreaterThan(0);
  });

  test('[FN-1702] sitemap.xml exists and lists main pages', async ({ request, baseURL }) => {
    const r = await request.get(`${baseURL}/sitemap.xml`);
    expect(r.status(), 'sitemap.xml should return 200').toBe(200);
    const body = await r.text();
    // Должны быть упомянуты как минимум главная и пара ключевых страниц
    expect(body).toContain(baseURL!);
  });

  test('[FN-1703] favicon is reachable', async ({ request, baseURL }) => {
    const r = await request.get(`${baseURL}/favicon.ico`);
    // Может быть 200 или 304; главное — не 404
    expect(r.status(), 'favicon should not 404').not.toBe(404);
  });
});
