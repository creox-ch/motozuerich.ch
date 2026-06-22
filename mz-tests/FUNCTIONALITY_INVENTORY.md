# MOTO-ZÜRICH — Functionality Inventory

Полная инвентаризация функционала текущего сайта `motozuerich.ch` (SendPulse) — служит спецификацией для нового сайта. Всё, что перечислено здесь, должно работать на новом хостинге.

> **Convention:** каждая строка имеет ID вида `[FN-XXX]` — функциональное требование. Этот же ID используется в тестах (`test.describe('[FN-001] ...')`), чтобы трассировка была сквозной.

---

## 1. Структура сайта (URL-маршруты)

### 1.1. Главные страницы

| ID | URL | Назначение |
|---|---|---|
| FN-001 | `/` | Главная страница |
| FN-002 | `/faq` | Gut zu Wissen |
| FN-003 | `/programm` | Programm (Action Zone + Live Arena) |
| FN-004 | `/party` | Saisonstart Party |
| FN-005 | `/aussteller-motozuerich-2026` | Список экспонентов |
| FN-006 | `/mz2026` | Рюкблик MZ 2026 |
| FN-007 | `/team` | Команда |
| FN-008 | `/warum_motozurich` | Warum MOTO-ZÜRICH |
| FN-009 | `/sound` | Sounds der MOTO-ZÜRICH (ZWO) |
| FN-010 | `/medien` | Медиа / пресс-релизы |
| FN-011 | `/impressum` | Импрессум |
| FN-012 | `/agb` | AGB |
| FN-013 | `/datenschutz` | Datenschutz |
| FN-014 | `/volunteers` | Волонтёры |
| FN-015 | `/creators` | Креаторы |

### 1.2. Формы (sub-pages)

| ID | URL | Назначение |
|---|---|---|
| FN-016 | `/media_form` | Аккредитация прессы |
| FN-017 | `/creators_form` | Заявка в Creator Alley |
| FN-018 | `/blogger_form` | Заявка от блогера (Basic-Paket) |

### 1.3. Anchor-ссылки (важно для SEO continuity)

| ID | Anchor | Где |
|---|---|---|
| FN-020 | `/#location-stageone-halle550-zuerich` | Главная |
| FN-021 | `/#Öffnungszeiten_MOTO-ZÜRICH` | Главная |
| FN-022 | `/programm#Programm-LIVE-ARENA` | Программа |
| FN-023 | `/programm#Programm-ACTION-ZONE` | Программа |
| FN-024 | `/programm#hallenplan` | Программа |

---

## 2. Глобальные элементы (на каждой странице)

### 2.1. Хедер
- **FN-100** Логотип MZ кликабельный, ведёт на `/`
- **FN-101** Главная навигация (см. ниже)
- **FN-102** Кнопка `Tickets SICHERN` справа, ведёт на `https://motozuerich.shop.bookinea.app/de`
- **FN-103** Мобильное меню (бургер) на ширине <768px

### 2.2. Главное меню
- **FN-110** Home → `/`
- **FN-111** Besucher (dropdown с 4 пунктами: Location, Öffnungszeiten, Gut zu Wissen, Hallenplan)
- **FN-112** Programm (dropdown: Programm, Live Arena, Action Zone, Event Guide, Saisonstart Party)
- **FN-113** Aussteller (dropdown: Aussteller 2026, Aussteller werden)
- **FN-114** Über uns (dropdown: MZ 2026, Team, Warum, Kontaktiere uns, Sounds)
- **FN-115** Medien → `/medien`

### 2.3. Футер
- **FN-120** Копирайт `© 2026 MOTO-ZÜRICH`
- **FN-121** Соцсети: WhatsApp, Facebook, YouTube, Instagram, LinkedIn, TikTok
- **FN-122** Legal: Impressum, AGB, Datenschutz
- **FN-123** "Nach oben" якорь

### 2.4. Партнёрский блок (над футером)
- **FN-130** Заголовок `PRESENTING PARTNER` + логотип Aargauer Zeitung
- **FN-131** Заголовок `CO-SPONSOR` + логотип MotoScout24
- **FN-132** Заголовок `MEDIENPARTNER` + 9 логотипов (Blick, moto.ch, Radio Zürisee, LogoMedaPartnerRadio1, 1000PS, Radio Argovia, VRS, Moto Lifestyle, Swiss Volunteers)

### 2.5. Метаданные `<head>` (на каждой странице)
- **FN-140** `<title>` — уникальный для каждой страницы
- **FN-141** `<meta name="description">` — уникальный
- **FN-142** `<meta property="og:title">`, `og:description`, `og:image`, `og:url`, `og:type=website`, `og:site_name="MOTO-ZÜRICH"`
- **FN-143** `<meta name="facebook-domain-verification" content="ucqsxq6p2ioz0g4oobo1kugmlnqjmi">` — обязательно на каждой странице
- **FN-144** `<link rel="canonical">` указывает на текущий URL
- **FN-145** `<meta name="viewport">` (responsive)

---

## 3. Главная страница (FN-001)

### 3.1. Hero
- **FN-201** Заголовок `ERLEBEN. ENTDECKEN. EINTAUCHEN.`
- **FN-202** Подзаголовок-стейтмент про SWISS-MOTO
- **FN-203** CTA `Tickets SICHERN` → Bookinea
- **FN-204** CTA `Aussteller WERDEN` → `https://pyrus.com/form/2333138`

### 3.2. Ключевые цифры
- **FN-210** `5'740 m²` — Neuheiten & Trends
- **FN-211** `4'260 m²` — Show & Erlebnis Fläche
- **FN-212** `10'000+` — Besucher erwartet

### 3.3. Открытие
- **FN-220** Даты: `20.02 Freitag` 12:00–22:00, `21.02 Samstag` 09:00–22:00, `22.02 Sonntag` 09:00–18:00

### 3.4. Секции
- **FN-230** Секция "Limitierte Kapazitäten"
- **FN-231** Секция "Warum MOTO-ZÜRICH der neue Saisonstart ist" (4 пункта)
- **FN-232** Секция "Saisonstart-Party" с датой `21.02.2026`
- **FN-233** Секция "Bereiche und Programm" (Neuheiten/Live Arena/Action Zone)
- **FN-234** Секция "Die Location" с инфо о StageOne и Halle 550
- **FN-235** Кнопка `ANFAHRT` → `/faq`
- **FN-236** Hallenplan PDF link → Google Drive

---

## 4. FAQ (FN-002)

- **FN-301** Категория "Anreise" (ÖV, Auto, Motorrad) — 3 блока
- **FN-302** Параграф про ОV с конкретными номерами трамваев/автобусов
- **FN-303** Расстояния: Bahnhof Oerlikon 450м, HB 4.7км, Flughafen 7.2км
- **FN-304** Полный список 6 парковок с адресами и ссылками
- **FN-305** Раздел "Tickets" (онлайн vs касса, потеря, повторный вход)
- **FN-306** Раздел "Studenten/AVH/IV" — про документы
- **FN-307** Раздел "Kinder" (до 12 лет бесплатно)
- **FN-308** Раздел "Hunde" (не разрешены, кроме сервисных)
- **FN-309** Раздел "Garderobe" (Halle 550 Eingang B, цены CHF 3 / CHF 2)
- **FN-310** Раздел "Foodcourt" (Halle 550, AZ13–AZ26)
- **FN-311** Раздел "Bars & Depot" (CHF 2.00 депозит, система с жетонами)
- **FN-312** Раздел "Alkohol/Alterskontrolle"
- **FN-313** Раздел "Rauchen" (Action Zone AZ27/AZ28)
- **FN-314** Раздел "Barrierefreiheit" — лифт справа от Live Arena
- **FN-315** Сан-пост Stand E1 im StageOne
- **FN-316** Notfallnummern: 144, 117, 118, 145
- **FN-317** Ссылка `Fragen Stellen` → Pyrus form 2399268

---

## 5. Programm (FN-003)

### 5.1. Структура
- **FN-401** Раздел "Programm ACTION ZONE" с 7 шоу-блоками
- **FN-402** Раздел "Programm LIVE ARENA" с 9 талк-блоками
- **FN-403** Якорь `#Programm-ACTION-ZONE` работает
- **FN-404** Якорь `#Programm-LIVE-ARENA` работает
- **FN-405** Якорь `#hallenplan` работает
- **FN-406** Event Guide download кнопка → Google Drive
- **FN-407** Event Guide view кнопка → Google Drive
- **FN-408** Hallenplan PDF download → Google Drive
- **FN-409** VIDEO HALLE PLAN кнопка → YouTube

### 5.2. Action Zone шоу (имена + расписание)
- **FN-410** Team Bolliger Racing Truck (вся выставка)
- **FN-411** Team Bolliger Live-Boxenstopp (с временами)
- **FN-412** Michi Stuntrider (с временами)
- **FN-413** Chris Lietsch — Harley-Davidson (с временами)
- **FN-414** Nicola L'Impennatore — Vespa Freestyle (с временами)
- **FN-415** Jesko Raffin & Marc Stockar — Pitbike-Showrennen
- **FN-416** Pitbike-Training для всех
- **FN-417** Noel Rauber — Streetbike Freestyle

### 5.3. Live Arena
- **FN-420** Suse Mühlemeier ("Building Speed")
- **FN-421** Kevin Bolliger (24-Stunden-Rennen)
- **FN-422** Dani Weidmann (1/8 Meilen Drag Racing)
- **FN-423** Mac & Sandra (PANAMERICANA)
- **FN-424** Horst Saiger (TT/Macau/NW200)
- **FN-425** Dominique Aegerter (Live из Phillip Island)
- **FN-426** Race2win Nachwuchs-Spotlight
- **FN-427** Ducati Monster 2026 Premiere (21.02 15:30)
- **FN-428** Isabelle Lötscher (Snowboard & Töff, 21.02 16:30)
- **FN-429** DJane INAMAR (Party times)

---

## 6. Party (FN-004)

- **FN-501** Дата `21. Februar 2026` (Samstag)
- **FN-502** Расписание: 19:30 Warm-up, 22:00 Party
- **FN-503** Блок "Inklusive Party" (3-Tagespass, Sa-Tickets, до 10.02)
- **FN-504** Возрастное ограничение 18+
- **FN-505** Ссылка Registration → Pyrus form 2399255
- **FN-506** Ссылка PARTY-Ticket → Bookinea
- **FN-507** Инфо о DJane INAMAR

---

## 7. Aussteller (FN-005)

- **FN-601** Заголовок "AUSSTELLER 2026" (Neuheiten & Trends)
- **FN-602** ~50 экспонентов с stand-номерами, адресами, ссылками
- **FN-603** Заголовок "AUSSTELLER 2026 ACTION ZONE"
- **FN-604** ~17 экспонентов Action Zone
- **FN-605** Каждый блок: лого + название + Stand + Marken + Adresse + Website + Instagram
- **FN-606** Event Guide download/view ссылки
- **FN-607** Hallenplan preview изображение и ссылка
- **FN-608** Минимум следующие экспоненты должны быть представлены: BMW Schweiz, Ducati Schweiz, Harley-Davidson Switzerland, KTM, SUZUKI Schweiz, Triumph Motorcycles, Zero Motorcycles, Bridgestone, MOTOREX, POLO Motorrad, hostettler moto

---

## 8. MZ2026 Рюкблик (FN-006)

- **FN-701** Заголовок "MOTO-ZÜRICH 2026" + "Neustart mit Wirkung"
- **FN-702** Статистика `87 Aussteller`, `30+ Programmpunkte`, `22'000+ Besucher:innen`
- **FN-703** Ссылка на Google Drive с фото
- **FN-704** Кнопка 3D-модели → `https://my.smartvenue.ch/de/tour/moto-zh-2026`
- **FN-705** Save the Date `MOTO-ZÜRICH 2027` `19.–21. Februar 2027`
- **FN-706** Кнопка/ссылка на Instagram

---

## 9. Team (FN-007)

- **FN-801** Yves Vollenweider — биография (13 лет SWISS-MOTO)
- **FN-802** Kseniia Chudina — биография (маркетинг, диджитал)
- **FN-803** Ivanna Smolyana — Technical Marketing
- **FN-804** Jasmine Vollenweider — Event Coordinator
- **FN-805** Züri Leu Biker — маскот
- **FN-806** Ссылка `Volunteers Team` → `/volunteers`
- **FN-807** Ссылка `Creators Team` → `/creators`
- **FN-808** Контактная секция со ссылкой на форму

---

## 10. Warum MOTO-ZÜRICH (FN-008)

- **FN-901** 12+ Q&A блоков
- **FN-902** Раздел "Wie läuft der Einlass vor Ort (Zeitfenster)?"

---

## 11. Sound (FN-009)

- **FN-1001** 3 аудио-блока: Rock, House 01, House 02
- **FN-1002** Каждый блок имеет download-ссылку на Google Drive
- **FN-1003** Ссылка на ZWO website https://zwo-music.ch

---

## 12. Medien (FN-010)

- **FN-1101** Список пресс-релизов ДО события (≥12 ссылок)
- **FN-1102** Список пресс-релизов ПОСЛЕ события (≥8 ссылок)
- **FN-1103** Инфо о Medienkonferenz (Freitag 20.02.2026, 11:00–12:00, StageOne)
- **FN-1104** Akkreditierung-ссылка → `/media_form`
- **FN-1105** Инфо о Motor Journal 11/2025
- **FN-1106** Инфо о MOTO.CH Magazin 13/2025

---

## 13. Impressum (FN-011)

- **FN-1201** Компания: Vollenweider & Schweizer GmbH
- **FN-1202** Адрес: Bäderstrasse 28, 5400 Baden (AG)
- **FN-1203** Геschäftsführer: Yves Vollenweider
- **FN-1204** E-Mail: team@motozuerich.ch
- **FN-1205** Telefon: +41 77 287 16 34
- **FN-1206** Rechtliche Hinweise: schweizerisches Recht, Kanton Aargau

---

## 14. AGB (FN-012)

- **FN-1301** 12 пронумерованных секций
- **FN-1302** Letzte Aktualisierung: October 30, 2025
- **FN-1303** Контакт: help@motozuerich.ch
- **FN-1304** Раздел про Eintrittskarten (персональные, не передаются)
- **FN-1305** Раздел про Widerrufsrecht (НЕТ для Eintrittskarten)
- **FN-1306** Anwendbares Recht: Schweiz, Kanton Aargau

---

## 15. Datenschutz (FN-013)

- **FN-1401** 11 пронумерованных секций
- **FN-1402** Stand: November 2025
- **FN-1403** Verantwortliche Stelle: Vollenweider & Schweizer GmbH
- **FN-1404** Kontakt: help@motozuerich.ch
- **FN-1405** Раздел про Bild-/Tonaufnahmen
- **FN-1406** Раздел про Social Plugins (Meta, Instagram, Google Analytics)

---

## 16. Volunteers (FN-014)

- **FN-1501** Заголовок "Helfer gesucht für die MOTO-ZÜRICH 2026"
- **FN-1502** Даты: 20.–22. Februar 2026
- **FN-1503** Локации: StageOne (Elias Canetti-Strasse 146) + Halle 550 (Birchstrasse 150)
- **FN-1504** FAQ с 18 вопросами
- **FN-1505** Ссылка ANMELDUNG → Swiss Volunteers
- **FN-1506** WhatsApp-Community ссылка
- **FN-1507** Kontaktformular ссылка

---

## 17. Creators (FN-015)

- **FN-1601** Список 14 подтверждённых креаторов с Instagram-ссылками
- **FN-1602** Секция "Creator Alley — ActionZone" (15 мест, на 2026 FULL)
- **FN-1603** Секция "EXKLUSIVE EINLADUNG FÜR CREATORS" (31.01 14-16h, 20 креаторов)
- **FN-1604** Секция "MOTO-ZÜRICH × MAN'S WORLD" (Ducati Diavel for Bentley)
- **FN-1605** Секция "Basic-Paket" для инфлюенсеров (1000+ followers)
- **FN-1606** Шаблоны giveaway DE и EN
- **FN-1607** Hashtags: #MotoZürich, #MotoZürich2026, #MZ26, #MZ26Awards, #MZ26Foto, #MZ26POV
- **FN-1608** Ссылки на формы заявок

---

## 18. SEO & технические аспекты

### 18.1. Файлы
- **FN-1701** `robots.txt` существует и доступен
- **FN-1702** `sitemap.xml` существует и содержит все ≥15 главных URL
- **FN-1703** `favicon.ico` корректный

### 18.2. Per-page meta
- **FN-1710** Каждая страница имеет уникальный `<title>` (см. inventory таблицу выше)
- **FN-1711** Каждая страница имеет уникальный `<meta description>`
- **FN-1712** Каждая страница имеет канонический URL
- **FN-1713** Каждая страница имеет OG image (можно одну общую для legal-страниц)
- **FN-1714** Все изображения имеют `alt` атрибут

### 18.3. URL preservation (для редиректов)
- **FN-1720** Все старые URL должны быть либо доступны на новом сайте, либо иметь 301 редирект на эквивалент

---

## 19. Tracking & analytics

### 19.1. Обязательные интеграции
- **FN-1801** Google Analytics 4 — property `506151147`
- **FN-1802** Google Tag Manager (если использовался) — нужно сохранить контейнер
- **FN-1803** Meta Pixel — Business asset `768641272864615`
- **FN-1804** Google Ads conversion tracking — account `459-200-7401`
- **FN-1805** Facebook Domain Verification meta tag `ucqsxq6p2ioz0g4oobo1kugmlnqjmi`
- **FN-1806** Google Search Console — нужна re-verification после миграции
- **FN-1807** Google Business Profile location ID `11157236267501453000` — без изменений

### 19.2. Compliance (новые требования при миграции)
- **FN-1810** Cookie consent banner (Cookiebot/Usercentrics/Termly) — обязателен по Swiss FADP / EU GDPR
- **FN-1811** Datenschutz обновлён с актуальными ID трекеров

---

## 20. Внешние интеграции (должны работать)

| ID | Сервис | URL |
|---|---|---|
| FN-1901 | Bookinea — основной shop | `https://motozuerich.shop.bookinea.app/de` |
| FN-1902 | Bookinea — Party ticket | `https://motozuerich.shop.bookinea.app/a/moto-zurich-saisonstart-party-6903` |
| FN-1903 | Pyrus — Aussteller form | `https://pyrus.com/form/2333138` |
| FN-1904 | Pyrus — Kontakt form | `https://pyrus.com/form/2399268` |
| FN-1905 | Pyrus — Party Reg form | `https://pyrus.com/form/2399255` |
| FN-1906 | Swiss Volunteers signup | `https://go.swissvolunteers.ch/discover-events/link/dea88a69e4538d455f1bb291099e49c7d1198aa0` |
| FN-1907 | smartvenue 3D-тур | `https://my.smartvenue.ch/de/tour/moto-zh-2026` |
| FN-1908 | Event Guide PDF | Google Drive `1LnjHCKHGYVMsXE9L1QmDCLv_fH-T6_kk` |
| FN-1909 | Hallenplan PDF | Google Drive `12egHFEgXcwl_MsFdocXTmQFd9aAEtoVt` |
| FN-1910 | Photo gallery | Google Drive folder `1hSLFrg4m-gQ6CCtM1k0k4dcbweCTse9T` |

---

## 21. Социальные сети

| ID | Платформа | URL |
|---|---|---|
| FN-2001 | WhatsApp Channel | `https://www.whatsapp.com/channel/0029VbAqa7tD38CIf5czGN2R` |
| FN-2002 | Facebook | `https://www.facebook.com/motozuerich` |
| FN-2003 | YouTube | `https://www.youtube.com/@motozuerich` |
| FN-2004 | Instagram | `https://www.instagram.com/motozuerich/` |
| FN-2005 | LinkedIn | `https://www.linkedin.com/company/motozuerich` |
| FN-2006 | TikTok | `https://tiktok.me/motozuerich` |

---

## 22. Доступность & responsive

- **FN-2101** Все основные тач-таргеты ≥44px (мобайл)
- **FN-2102** Видимый focus indicator на интерактивных элементах
- **FN-2103** Heading hierarchy (h1 → h2 → h3) логичный
- **FN-2104** Контраст текста ≥ WCAG AA
- **FN-2105** Все интерактивные элементы доступны клавиатурой
- **FN-2106** Mobile menu работает на ширине <768px
- **FN-2107** Изображения масштабируются на разных экранах
- **FN-2108** Lang attribute `<html lang="de">` или `lang="de-CH"`

---

## 23. Производительность

- **FN-2201** Главная страница загружается < 3 сек на 4G
- **FN-2202** LCP < 2.5 сек
- **FN-2203** CLS < 0.1
- **FN-2204** Все изображения сжаты и в современных форматах (webp/avif с фолбэками)
- **FN-2205** Lazy loading для below-the-fold изображений
