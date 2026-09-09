import { test, expect } from '@playwright/test';

/**
 * Базовые проверки производительности.
 * Полные Lighthouse-аудиты лучше делать отдельным workflow — здесь только
 * быстрые проверки которые быстро ловят регрессы.
 */

test.describe('[FN-2201..2205] Performance basics', () => {
  test('Home loads within 8 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'load' });
    const elapsed = Date.now() - start;
    expect(elapsed, `Home page took ${elapsed}ms to load`).toBeLessThan(8000);
  });

  test('Home page returns < 2MB initial HTML', async ({ request, baseURL }) => {
    const r = await request.get(baseURL!);
    const text = await r.text();
    const sizeKb = Math.round(text.length / 1024);
    // 2MB — generous upper bound; новый сайт должен быть гораздо меньше
    expect(sizeKb, `Initial HTML is ${sizeKb}KB`).toBeLessThan(2048);
  });

  test('No critical console errors on home', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/', { waitUntil: 'load' });

    // Игнорируем известный noise от third-party (типа fb pixel в dev режиме)
    const critical = errors.filter(e =>
      !e.toLowerCase().includes('non-passive') &&
      !e.toLowerCase().includes('preload') &&
      !e.toLowerCase().includes('favicon')
    );

    if (critical.length > 0) {
      console.error('Console errors:', critical);
    }
    expect(critical, `Found ${critical.length} critical console errors`).toEqual([]);
  });

  test('Core Web Vitals: LCP & CLS in acceptable range', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    // Ждём чуть-чуть чтобы LCP стабилизировался
    await page.waitForTimeout(2000);

    const metrics = await page.evaluate(() => {
      return new Promise<{ lcp: number; cls: number }>((resolve) => {
        let lcp = 0;
        let cls = 0;

        // LCP via PerformanceObserver
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1] as any;
            lcp = last.startTime || last.renderTime || 0;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {}

        // CLS via PerformanceObserver
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) cls += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch {}

        setTimeout(() => resolve({ lcp, cls }), 3000);
      });
    });

    // FN-2202: LCP < 2.5s (good), < 4s (needs improvement)
    if (metrics.lcp > 0) {
      expect(metrics.lcp, `LCP is ${metrics.lcp}ms; should be < 4000ms`).toBeLessThan(4000);
    }
    // FN-2203: CLS < 0.1 (good), < 0.25 (needs improvement)
    expect(metrics.cls, `CLS is ${metrics.cls}; should be < 0.25`).toBeLessThan(0.25);
  });
});

test.describe('Image loading checks', () => {
  test('No broken images on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return imgs
        // Nur echt gebrochene Bilder: nicht-leerer src, geladen, aber 0px.
        // Lazy-Platzhalter mit leerem src (src="") sind NICHT gebrochen.
        .filter(img => img.currentSrc && img.complete && img.naturalWidth === 0)
        .map(img => img.src);
    });

    if (brokenImages.length > 0) {
      console.error('Broken images:', brokenImages);
    }
    expect(brokenImages, 'No images should fail to load').toEqual([]);
  });
});
