import { Page, expect, Locator } from '@playwright/test';

/**
 * Найти ссылку по её href (точное совпадение или substring).
 * Работает независимо от текста ссылки или класса.
 */
export function linkByHref(page: Page, href: string): Locator {
  return page.locator(`a[href="${href}"], a[href*="${href}"]`).first();
}

/**
 * Подтвердить, что ссылка с указанным href существует и видима на странице.
 * Для внешних ссылок проверяем только наличие href (не открываем — это медленно).
 */
export async function expectLinkExists(page: Page, hrefOrSubstr: string, opts: { visible?: boolean } = {}) {
  const { visible = true } = opts;
  const link = linkByHref(page, hrefOrSubstr);
  await expect(link, `Link with href containing "${hrefOrSubstr}" should exist`).toHaveCount(
    await link.count() > 0 ? await link.count() : 1,
    { timeout: 5000 }
  );
  if (visible) {
    await expect(link).toBeVisible();
  }
}

/**
 * Проверить наличие подстроки в body (case-insensitive).
 * Использует toContainText но через getByText для устойчивости.
 */
export async function expectTextOnPage(page: Page, text: string, opts: { exact?: boolean } = {}) {
  const locator = opts.exact
    ? page.getByText(text, { exact: true })
    : page.getByText(text);
  await expect(locator.first(), `Page should contain text: "${text}"`).toBeVisible({ timeout: 5000 });
}

/**
 * Проверить, что HTTP-ответ страницы — успешный (2xx).
 * Используем для smoke-тестов чтобы быстро обнаружить 404/500.
 */
export async function expectPageOk(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `Response for ${path} should be defined`).toBeTruthy();
  const status = response!.status();
  expect(status, `${path} returned HTTP ${status}, expected 2xx or 3xx`).toBeLessThan(400);
}

/**
 * Получить значение meta-тега по name или property.
 */
export async function getMetaContent(page: Page, nameOrProperty: string): Promise<string | null> {
  return page.evaluate((selector) => {
    const el = document.querySelector(
      `meta[name="${selector}"], meta[property="${selector}"]`
    );
    return el ? el.getAttribute('content') : null;
  }, nameOrProperty);
}

/**
 * Получить значение canonical link.
 */
export async function getCanonical(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const link = document.querySelector('link[rel="canonical"]');
    return link ? link.getAttribute('href') : null;
  });
}

/**
 * Проверить, есть ли на странице GA4-скрипт (gtag.js или GTM).
 * Возвращает true если найден ЛЮБОЙ из распространённых паттернов.
 */
export async function hasGA4(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    const inlineMatch = scripts.some(s =>
      /gtag\(|G-[A-Z0-9]+|googletagmanager\.com\/gtag\/js|googletagmanager\.com\/gtm\.js/.test(s.textContent || '')
    );
    const srcMatch = scripts.some(s =>
      /googletagmanager\.com|google-analytics\.com/.test(s.src || '')
    );
    // Also check for global gtag function or dataLayer array
    const globalMatch = typeof (window as any).gtag === 'function'
      || Array.isArray((window as any).dataLayer);
    return inlineMatch || srcMatch || globalMatch;
  });
}

/**
 * Проверить, есть ли Meta Pixel (fbq) на странице.
 */
export async function hasMetaPixel(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    const inlineMatch = scripts.some(s =>
      /fbq\(|connect\.facebook\.net\/.*fbevents\.js/.test(s.textContent || '')
    );
    const srcMatch = scripts.some(s =>
      /connect\.facebook\.net/.test(s.src || '')
    );
    const globalMatch = typeof (window as any).fbq === 'function';
    return inlineMatch || srcMatch || globalMatch;
  });
}

/**
 * Проверить, что изображение реально загрузилось (а не битая ссылка).
 */
export async function imageActuallyLoaded(img: Locator): Promise<boolean> {
  return img.evaluate((el: HTMLImageElement) => {
    return el.complete && el.naturalWidth > 0 && el.naturalHeight > 0;
  });
}

/**
 * Проверить иерархию заголовков h1 → h2 → h3 (нет пропусков уровней).
 */
export async function getHeadingHierarchy(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => parseInt(h.tagName.slice(1), 10));
  });
}
