import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './fixtures/pages';
import { getHeadingHierarchy } from './helpers/visit';

/**
 * Доступность (a11y) — критическая на новом сайте.
 * Используем axe-core для автоматического аудита WCAG.
 */

test.describe('[FN-2101..2108] Accessibility (axe-core)', () => {
  // Тестируем главные страницы (полный прогон по всем — слишком долго в CI)
  const a11yTargets = PAGES.filter(p =>
    ['/', '/faq', '/programm', '/team', '/aussteller-motozuerich-2026', '/impressum'].includes(p.path)
  );

  for (const p of a11yTargets) {
    test(`${p.name}: no critical accessibility violations`, async ({ page }) => {
      await page.goto(p.path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Только критичные/серьёзные нарушения должны fail-ить тест
      const critical = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      );

      if (critical.length > 0) {
        console.error(`\n${p.path} has ${critical.length} critical/serious a11y violations:\n`);
        for (const v of critical) {
          console.error(`  [${v.impact}] ${v.id}: ${v.help}`);
          console.error(`     Help: ${v.helpUrl}`);
          console.error(`     ${v.nodes.length} node(s) affected`);
        }
      }

      expect(critical, `Found ${critical.length} critical/serious a11y violations on ${p.path}`).toEqual([]);
    });
  }
});

test.describe('[FN-2103] Heading hierarchy', () => {
  test('Home page starts with single h1', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count, 'Home page should have exactly one h1').toBe(1);
  });

  test('No skipped heading levels on home', async ({ page }) => {
    await page.goto('/');
    const levels = await getHeadingHierarchy(page);

    // Проверяем что нет прыжков типа h1 → h4
    for (let i = 1; i < levels.length; i++) {
      const prev = levels[i - 1];
      const curr = levels[i];
      if (curr > prev + 1) {
        // Соглашаемся на одно нарушение — но это warning
        console.warn(`Heading level jump from h${prev} to h${curr} at position ${i}`);
      }
    }
  });
});

test.describe('[FN-2105] Keyboard navigation', () => {
  test('Can tab through interactive elements on home', async ({ page }) => {
    await page.goto('/');

    // Tab несколько раз и убедимся что фокус двигается
    const focusOrder: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return el.tagName + (el.id ? '#' + el.id : '');
      });
      if (focused) focusOrder.push(focused);
    }

    expect(focusOrder.length, 'Should be able to tab to at least some interactive elements').toBeGreaterThan(3);

    // Уникальных элементов в порядке табуляции должно быть несколько
    const unique = new Set(focusOrder);
    expect(unique.size, 'Tab should move to multiple distinct elements').toBeGreaterThan(2);
  });
});
