# MOTO-ZÜRICH — E2E Tests

End-to-end тесты сайта **motozuerich.ch**. Эти тесты — спецификация функционала текущего сайта (SendPulse) в исполняемой форме. Прогоняй их против нового сайта на каждом этапе миграции, чтобы убедиться что ничего не потерялось.

---

## Что внутри

- **`FUNCTIONALITY_INVENTORY.md`** — полная инвентаризация всех фич текущего сайта с уникальными ID `[FN-XXX]`. Главный документ — на нём основаны все тесты.
- **`tests/`** — Playwright-тесты (TypeScript). Каждый тест помечен соответствующим `[FN-XXX]` ID для трассировки.
- **`tests/fixtures/`** — тестовые данные (страницы, экспоненты, партнёры, URL внешних сервисов).
- **`tests/helpers/`** — вспомогательные функции.
- **`.github/workflows/e2e.yml`** — CI: на каждый PR + ежедневный мониторинг прода.
- **`manual-qa-checklist.md`** — чек-лист для ручной проверки того, что автотесты не покрывают (визуальный дизайн, реальная отправка форм, оплата и т.д.).

---

## Быстрый старт

### 1. Установка

```bash
npm install
npm run install:browsers
```

### 2. Запуск против продакшена

```bash
npm test
```

По умолчанию `BASE_URL=https://motozuerich.ch`.

### 3. Запуск против другого окружения

```bash
# Локальный dev
BASE_URL=http://localhost:3000 npm test

# Staging
BASE_URL=https://staging.motozuerich.ch npm test

# Vercel/Netlify preview
BASE_URL=https://motozuerich-pr-42.vercel.app npm test
```

### 4. Отладка

```bash
# UI режим — лучший способ дебажить
npm run test:ui

# Только smoke-тесты (быстро)
npm run test:smoke

# Только SEO/мета-теги
npm run test:seo

# Только трекинг
npm run test:tracking

# Только мобильные браузеры
npm run test:mobile

# Headed режим (видишь как браузер тыкает)
npm run test:headed

# Debug одного теста
npm run test:debug -- tests/03-home.spec.ts
```

### 5. Отчёты

После прогона:

```bash
npm run report
```

Открывается HTML-отчёт с трейсами, скриншотами и видео упавших тестов.

---

## Структура тестов

| Файл | Что проверяет | FN ID |
|---|---|---|
| `01-smoke.spec.ts` | Все страницы возвращают 2xx, есть title и body, robots.txt и sitemap.xml существуют | FN-001..018, FN-1701..1703 |
| `02-navigation.spec.ts` | Хедер, главное меню, мобильное меню, футер, соцссылки, legal-ссылки | FN-100..123 |
| `03-home.spec.ts` | Главная — hero, цифры, openings, секции | FN-201..236 |
| `04-faq.spec.ts` | FAQ — все секции, парковки, экстренные номера | FN-301..317 |
| `05-programm.spec.ts` | Программа — Action Zone, Live Arena, якоря, расписания | FN-401..429 |
| `06-party.spec.ts` | Party — дата, расписание, ссылки на регистрацию | FN-501..507 |
| `07-aussteller.spec.ts` | Экспоненты — ключевые бренды, stand-номера, ссылки | FN-601..608 |
| `08-mz2026.spec.ts` | Рюкблик 2026 + Save the Date 2027 | FN-701..706 |
| `09-team.spec.ts` | Команда — все 4 человека, маскот, подстраницы | FN-801..808 |
| `10-warum-sound-medien.spec.ts` | Warum/Sound/Medien страницы | FN-901..1106 |
| `11-legal.spec.ts` | Impressum/AGB/Datenschutz + Swiss German orthography | FN-1201..1406 |
| `12-volunteers-creators.spec.ts` | Volunteers FAQ, Creators (alley/MAN'S WORLD/Basic-Paket) | FN-1501..1608 |
| `15-partners.spec.ts` | Партнёрский блок на каждой странице | FN-130..132 |
| `20-seo.spec.ts` | Мета-теги, OG, canonical, viewport, FB domain verification, alt-атрибуты | FN-140..145, FN-1710..1714 |
| `21-tracking.spec.ts` | GA4, Meta Pixel, dataLayer, cookie banner, Datenschutz-disclosure | FN-1801..1811 |
| `22-external.spec.ts` | Bookinea, Pyrus, Google Drive, Swiss Volunteers, smartvenue, соцсети | FN-1901..2006 |
| `23-a11y.spec.ts` | axe-core WCAG-аудит, иерархия заголовков, клавиатурная навигация | FN-2101..2108 |
| `24-responsive.spec.ts` | Мобайл/десктоп/планшет, тач-таргеты | FN-2106..2107 |
| `25-performance.spec.ts` | Загрузка <8с, LCP/CLS, нет битых картинок, нет JS-ошибок | FN-2201..2205 |

---

## CI/CD (GitHub Actions)

Workflow `.github/workflows/e2e.yml`:

1. **На каждый PR** → прогон против staging (URL из secret `STAGING_URL`, иначе fallback на продакшен)
2. **На push в main** → прогон против продакшена
3. **Каждый день в 06:00 UTC** (cron) → продакшн-мониторинг. Если что-то сломалось — алёрт.
4. **Ручной запуск** (workflow_dispatch) → можно указать любой BASE_URL и фильтр тестов

Прогоняется по 3 проектам параллельно: `desktop-chrome`, `desktop-firefox`, `mobile-chrome`. Можно расширить в `playwright.config.ts`.

### Настройка secrets в GitHub

В Settings → Secrets and variables → Actions:

- `STAGING_URL` (optional) — URL preview-сборки нового сайта для PR-тестов

---

## Стратегия миграции с этими тестами

1. **Перед началом миграции:** прогнать тесты против `https://motozuerich.ch` — это baseline. Какие-то тесты могут упасть на текущем сайте — это OK, это известные gaps (например, отсутствующий cookie banner). Зафиксировать как baseline.

2. **Во время разработки нового сайта:** прогонять тесты против локального dev / Vercel preview / staging. Каждый зелёный тест = одна фича перенесена корректно.

3. **Перед cutover:** все тесты должны быть зелёными на новом окружении. Plus прогнать `manual-qa-checklist.md`.

4. **После cutover:** ежедневный cron в CI ловит регрессы в продакшене.

---

## Известные ограничения тестов

- **Тесты идут против рендеренного DOM**, не визуального дизайна. Они НЕ проверяют что сайт красивый — для этого `manual-qa-checklist.md` и visual regression (например, Percy/Chromatic).
- **Тесты НЕ отправляют формы Pyrus** — не хотим спамить production. Проверяем только что ссылка ведёт на нужный URL.
- **Тесты НЕ покупают тикеты на Bookinea** — то же самое.
- **Tracking-тесты** проверяют наличие скриптов, не корректность событий. Для проверки конкретных конверсий используй Google Tag Assistant и Meta Events Manager.

---

## Как добавить новый тест

1. Найди или добавь функциональное требование в `FUNCTIONALITY_INVENTORY.md` с ID `[FN-XXXX]`
2. Найди подходящий `.spec.ts` файл или создай новый
3. Используй ID в названии теста: `test('[FN-XXXX] description', ...)`
4. Используй helpers из `tests/helpers/visit.ts` для типовых проверок
5. Тестовые данные — в `tests/fixtures/`

---

## Локальная разработка тестов

```bash
# Записать новый тест через рекордер
npx playwright codegen https://motozuerich.ch

# Запустить только один файл
npx playwright test tests/03-home.spec.ts

# Запустить только тесты с определённым FN ID
npx playwright test --grep "FN-203"

# UI mode для пошаговой отладки
npm run test:ui
```

---

## Связь с migration-проектом

Этот тест-проект — компаньон к `motozuerich_migration_export.zip` (контент-экспорт SendPulse). Используй их вместе:

1. `motozuerich_migration_export.zip` → перенести контент на новый сайт
2. `mz-tests/` → убедиться что новый сайт работает так же, как старый
