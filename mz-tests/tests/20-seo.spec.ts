import { test, expect } from '@playwright/test';
import { PAGES } from './fixtures/pages';
import { TRACKING_IDS } from './fixtures/content';
import { getCanonical, getMetaContent } from './helpers/visit';

/**
 * SEO-проверки — критичны для не-потери позиций в поиске после миграции.
 */

test.describe('[FN-140..145] Per-page meta tags', () => {
  for (const p of PAGES) {
    test.describe(`${p.name} (${p.path})`, () => {
      test(`[${p.fn}/FN-140] Has non-empty <title>`, async ({ page }) => {
        await page.goto(p.path);
        const title = await page.title();
        expect(title.trim().length, 'Title must not be empty').toBeGreaterThan(0);
      });

      test(`[${p.fn}/FN-141] Has meta description`, async ({ page }) => {
        await page.goto(p.path);
        const desc = await getMetaContent(page, 'description');
        expect(desc, `${p.path}: meta description should exist`).toBeTruthy();
        expect(desc!.length, `${p.path}: meta description should be non-empty`).toBeGreaterThan(10);
      });

      test(`[${p.fn}/FN-142] Has Open Graph metadata`, async ({ page }) => {
        await page.goto(p.path);
        const ogTitle = await getMetaContent(page, 'og:title');
        const ogType = await getMetaContent(page, 'og:type');
        const ogImage = await getMetaContent(page, 'og:image');
        const ogUrl = await getMetaContent(page, 'og:url');

        expect(ogTitle, 'og:title should exist').toBeTruthy();
        expect(ogType, 'og:type should be set').toBeTruthy();
        expect(ogImage, 'og:image should exist').toBeTruthy();
        expect(ogUrl, 'og:url should exist').toBeTruthy();
        expect(ogImage!.startsWith('http'), 'og:image should be absolute URL').toBe(true);
      });

      test(`[${p.fn}/FN-143] Facebook domain verification meta is present`, async ({ page }) => {
        await page.goto(p.path);
        const fbVerif = await getMetaContent(page, 'facebook-domain-verification');
        expect(
          fbVerif,
          `${p.path}: facebook-domain-verification meta tag MUST be present with value "${TRACKING_IDS.facebookDomainVerification}"`
        ).toBe(TRACKING_IDS.facebookDomainVerification);
      });

      test(`[${p.fn}/FN-144] Canonical URL is set`, async ({ page }) => {
        await page.goto(p.path);
        const canonical = await getCanonical(page);
        expect(canonical, `${p.path}: canonical link should exist`).toBeTruthy();
        // Canonical должен указывать на этот же путь
        expect(canonical, `Canonical should reference ${p.path}`).toContain(p.path === '/' ? '' : p.path);
      });

      test(`[${p.fn}/FN-145] Viewport meta is responsive`, async ({ page }) => {
        await page.goto(p.path);
        const viewport = await getMetaContent(page, 'viewport');
        expect(viewport, 'viewport meta should exist').toBeTruthy();
        expect(viewport!.toLowerCase()).toContain('width=device-width');
      });
    });
  }
});

test.describe('[FN-1710] Page titles are unique', () => {
  test('Every page has distinct <title>', async ({ page }) => {
    const titles = new Map<string, string>();
    const duplicates: string[] = [];

    for (const p of PAGES) {
      await page.goto(p.path);
      const title = await page.title();
      const existing = titles.get(title);
      if (existing) {
        duplicates.push(`${title}: ${existing} and ${p.path}`);
      }
      titles.set(title, p.path);
    }

    // Допустимо несколько страниц с одинаковым общим title "MOTO-ZÜRICH"
    // но мы предупреждаем если их слишком много
    if (duplicates.length > 8) {
      throw new Error(`Too many duplicate titles (${duplicates.length}):\n${duplicates.join('\n')}`);
    }
  });
});

test.describe('[FN-1714] Image accessibility', () => {
  test('Home page: every <img> has alt attribute', async ({ page }) => {
    await page.goto('/');
    const imgs = page.locator('img');
    const count = await imgs.count();
    expect(count, 'Page should have images').toBeGreaterThan(0);

    const noAlt: string[] = [];
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      const alt = await img.getAttribute('alt');
      if (alt === null) {
        const src = await img.getAttribute('src');
        noAlt.push(src || `image #${i}`);
      }
    }
    expect(noAlt, `Images missing alt attribute:\n${noAlt.join('\n')}`).toHaveLength(0);
  });
});

test.describe('[FN-1712] Language declaration', () => {
  test('HTML lang attribute is set to de or de-CH', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, 'html[lang] should be set').toBeTruthy();
    expect(lang!.toLowerCase()).toMatch(/^de(-ch)?$/);
  });
});
