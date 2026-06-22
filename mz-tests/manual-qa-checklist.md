# Manual QA Checklist — MOTO-ZÜRICH

Что автотесты **не покрывают** — нужно проверить руками перед cutover на новый хостинг. Этот чек-лист — компаньон к Playwright-тестам.

> Прогоняй после того как `npm test` стал зелёным на staging. Проходи по списку в порядке сверху вниз, отмечая `[x]`.

---

## 1. Визуальный дизайн (нужны человеческие глаза)

- [ ] Главная страница в десктопе выглядит цельно (не "разъезжается", шрифты грузятся, нет пустых блоков)
- [ ] Главная страница на iPhone 14 — все секции читаемы, кнопки удобно нажать
- [ ] Главная страница на iPad — переход между mobile- и desktop-layouts корректен
- [ ] Hero-картинка не обрезает важные элементы на любых соотношениях сторон
- [ ] Hover-эффекты на ссылках/кнопках выглядят корректно (десктоп)
- [ ] Партнёрские логотипы все на месте, не растянуты/не сжаты, прозрачные PNG не имеют рамки
- [ ] Шрифты MZ-брендинга загружаются (нет FOUT/FOIT с системным шрифтом надолго)
- [ ] Цвета корпоративные: проверь по [бренд-гайду](https://motozuerich.ch) — synthwave/яркие акценты соответствуют
- [ ] Кириллица в Datenschutz/Impressum (если есть) рендерится корректно
- [ ] Umlauts (ö ä ü) рендерятся без замены на ?

## 2. Кросс-браузерные проверки (то что Playwright не словил)

- [ ] Safari на macOS — все страницы открываются
- [ ] Safari на iOS (физическое устройство) — формы Pyrus не ломаются
- [ ] Chrome на Android — мобильное меню работает плавно
- [ ] Firefox — нет регрессов в анимациях

## 3. Реальная отправка форм (НЕ ДЕЛАТЬ В АВТОТЕСТАХ — спам)

- [ ] `/media_form` — отправить тестовую заявку аккредитации, дождаться письма-подтверждения, проверить что заявка пришла в Pyrus
- [ ] `/creators_form` — то же самое для креатор-формы
- [ ] `/blogger_form` — то же для блогер-формы
- [ ] Pyrus 2333138 (Aussteller) — отправить тестовую заявку, проверить роутинг в Pyrus
- [ ] Pyrus 2399268 (Kontakt) — отправить тестовое сообщение
- [ ] Pyrus 2399255 (Party Reg) — отправить тестовую регистрацию
- [ ] Все формы возвращают понятный success-state после отправки
- [ ] При ошибке (например, не заполнен обязательный email) — показывается понятная ошибка

## 4. Покупка тикета на Bookinea

- [ ] Кнопка "Tickets SICHERN" на главной открывает корректный shop
- [ ] Кнопка PARTY-Ticket открывает shop для party-ticket
- [ ] Реальная покупка тикета: дойти до экрана оплаты, ввести тестовую карту (если есть тестовый режим), проверить что email с тикетом приходит
- [ ] Возврат с Bookinea на сайт после покупки (если такой flow есть)
- [ ] UTM/source-параметры передаются в Bookinea (важно для атрибуции)

## 5. Трекинг — обязательно проверить вручную

### 5.1 Google Tag Assistant
- [ ] Установить расширение [Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
- [ ] Открыть новый сайт — Tag Assistant должен показать GA4 (G-XXXXXXXXXX), GTM (GTM-XXXXXXX если используется)
- [ ] Все ID совпадают с тем что было на старом SendPulse-сайте (зафиксированы в `FUNCTIONALITY_INVENTORY.md` § 19)
- [ ] При переходе между страницами GA4 фиксирует page_view-события
- [ ] Клик по "Tickets SICHERN" регистрируется (custom event или outbound click)

### 5.2 Google Analytics 4
- [ ] В GA4 → Realtime — видны посещения нового сайта
- [ ] Property `506151147` получает данные
- [ ] Conversion events настроены (минимум: ticket_click, form_submit)

### 5.3 Meta Events Manager
- [ ] [Meta Events Manager](https://business.facebook.com/events_manager) → asset `768641272864615`
- [ ] PageView fires при каждом просмотре страницы
- [ ] Test Events Tool показывает корректные события с нового домена
- [ ] Domain verification остаётся валидной (FB-meta tag должен быть на каждой странице, проверяет автотест FN-143)

### 5.4 Google Search Console
- [ ] Property `https://motozuerich.ch/` — обновить верификацию после миграции (если нужно)
- [ ] Submit обновлённый sitemap.xml
- [ ] URL Inspection для главных страниц — все индексируются корректно
- [ ] Coverage report не показывает массовых 404 после cutover

### 5.5 Google Ads
- [ ] Conversion tracking всё ещё работает (account `459-200-7401`)
- [ ] Если использовался Google Ads pixel — он на новом сайте

## 6. Редиректы со старого сайта

- [ ] Если меняется URL-схема — настроены 301-редиректы со старых URL на новые. Минимум для:
  - `/aussteller-motozuerich-2026` (длинный URL — кандидат на упрощение)
  - Все три формы (`/media_form`, `/creators_form`, `/blogger_form`)
- [ ] Проверить редиректы из старого `sitemap.xml` (что в SendPulse) — все ведут на 200 на новом сайте

## 7. Email и domain

- [ ] `team@motozuerich.ch` принимает почту после миграции (если меняется хостинг почты)
- [ ] `help@motozuerich.ch` принимает почту
- [ ] SPF/DKIM/DMARC записи корректны (проверить через mxtoolbox.com)
- [ ] Письма от Bookinea со ссылками на motozuerich.ch не попадают в спам
- [ ] DNS записи: A/CNAME для motozuerich.ch указывают на новый хостинг
- [ ] HTTPS-сертификат валиден, не self-signed, не истёк

## 8. Производительность (то что не вошло в автоматический Lighthouse)

- [ ] Запустить [PageSpeed Insights](https://pagespeed.web.dev/) для главной — mobile/desktop баллы ≥ 80
- [ ] [GTmetrix](https://gtmetrix.com/) — full waterfall, проверить нет ли долгих third-party скриптов
- [ ] WebPageTest из Frankfurt/Zurich location — TTFB < 600ms
- [ ] Изображения переведены в современные форматы (webp/avif) — проверить через DevTools Network
- [ ] Lazy loading работает для below-the-fold картинок

## 9. Cookie consent banner (НОВОЕ требование)

> ⚠️ Текущий сайт **не имеет** cookie banner — это нарушение Swiss FADP и GDPR. На новом сайте обязательно добавить.

- [ ] Cookie banner появляется на первом визите
- [ ] Кнопки "Alle akzeptieren" / "Nur notwendige" / "Einstellungen" есть
- [ ] До нажатия "Akzeptieren" — НЕ грузятся GA4, Meta Pixel, и другие tracking-скрипты
- [ ] После "Nur notwendige" — tracking не загружается даже после перезагрузки страницы
- [ ] После "Alle akzeptieren" — tracking активируется и работает на всех последующих страницах
- [ ] Выбор сохраняется в cookie/localStorage (понятный срок жизни, минимум 6 месяцев)
- [ ] Cookie-настройки можно поменять позже (ссылка в футере или в Datenschutz)
- [ ] Datenschutz обновлён с актуальными ID трекеров (GA4 G-XXXXXXXXXX, Meta Pixel ID)

## 10. Контент-чек на новом сайте

> Открыть каждую страницу глазами и сравнить со старой версией. Автотесты ловят отсутствие текста, но не визуальные различия в форматировании.

- [ ] `/` — Hero, цифры, openings, секции "Warum MOTO-ZÜRICH"
- [ ] `/faq` — все ↓парковки, ↓emergency numbers, форматирование таблиц
- [ ] `/programm` — расписание Action Zone и Live Arena с правильными датами/временами
- [ ] `/party` — корректные время, дата, DJ-инфо
- [ ] `/aussteller-motozuerich-2026` — все экспоненты, stand-номера, ссылки на их сайты
- [ ] `/mz2026` — статистика, фото, ссылка на 3D-тур работает
- [ ] `/team` — фото команды, биографии
- [ ] `/warum_motozurich` — все Q&A
- [ ] `/sound` — все 3 аудио-файла скачиваются
- [ ] `/medien` — все ссылки на пресс-материалы открываются
- [ ] `/impressum` — все данные компании
- [ ] `/agb` — все 12 секций
- [ ] `/datenschutz` — все 11 секций + cookie banner mentioned
- [ ] `/volunteers` — FAQ, ссылка на Swiss Volunteers
- [ ] `/creators` — все 14 креаторов, MAN'S WORLD-партнёрство

## 11. Доступность (то что axe-core пропускает)

- [ ] Screen reader тест (VoiceOver на Mac, NVDA на Windows) — главная страница читается логично
- [ ] Tab-навигация — focus visible, порядок логичный
- [ ] Esc закрывает модалки/dropdown-меню
- [ ] Reduced motion: при `prefers-reduced-motion` анимации убираются
- [ ] Контраст текста ≥ 4.5:1 для нормального, ≥ 3:1 для крупного (Chrome DevTools Contrast)

## 12. Печать и share

- [ ] Print preview главной — выглядит читаемо (если есть print stylesheet)
- [ ] Share в Facebook/LinkedIn — корректная OG-картинка, заголовок, описание
- [ ] Share в WhatsApp — preview корректный
- [ ] Telegram-link preview работает

## 13. Сценарии посетителя

> Прогнать end-to-end как обычный пользователь:

- [ ] **Сценарий A:** Зашёл с Google → нашёл программу → купил тикет на Bookinea
- [ ] **Сценарий B:** Зашёл с Instagram → перешёл на /creators → отправил заявку
- [ ] **Сценарий C:** Зашёл с QR-кода на флаере → попал на /faq → нашёл парковку
- [ ] **Сценарий D:** Хочет стать экспонентом → перешёл на /aussteller → отправил Pyrus-форму
- [ ] **Сценарий E:** Журналист → /medien → подал заявку на аккредитацию

## 14. Final cutover checklist

- [ ] Все автотесты зелёные на staging (минимум desktop-chrome, mobile-chrome)
- [ ] Все пункты выше отмечены
- [ ] Бэкап старого сайта сделан (motozuerich_migration_export.zip + SendPulse admin)
- [ ] Stakeholders (Yves, Kseniia) визуально approve
- [ ] DNS TTL снижен до 5 минут за сутки до cutover (для быстрого отката)
- [ ] План отката готов: вернуть DNS на SendPulse если новый сайт сломается
- [ ] После cutover: cron-мониторинг в GitHub Actions активен, алёрты приходят
- [ ] После cutover: проверить через 24 часа что GA4/Meta Pixel получают данные, нет дропа трафика

---

## Что НЕ нужно проверять (это в автотестах)

- HTTP 200 на всех страницах → `01-smoke.spec.ts`
- Все meta-теги на месте → `20-seo.spec.ts`
- Tracking-скрипты загружены → `21-tracking.spec.ts`
- Внешние ссылки достижимы → `22-external.spec.ts`
- Базовая a11y → `23-a11y.spec.ts`
- Mobile menu появляется → `24-responsive.spec.ts`
- Нет битых картинок и JS-ошибок → `25-performance.spec.ts`
- Конкретные тексты на странцах (даты, имена, цифры) → 03..15 spec-файлы
