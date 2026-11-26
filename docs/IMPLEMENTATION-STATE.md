# Состояние реализации — baseline (задача A00)

Задача: **A00 — Инвентаризация и базовая проверка**.
Дата проверки: 25.11.2026. Рабочая ветка: `main`. Коммит A00 (по плану): `docs: record website implementation baseline`.
Изменён только этот файл; исходный код сайта не изменён. `git push` не выполнялся.

## 1. Среда и зависимости

| Параметр | Значение |
|---|---|
| Node (локально) | v26.13.1 |
| npm | 11.20.0 |
| `engines.node` | `>=22` — локальная версия совместима |
| Node в CI | `22` (`setup-node@v4`) |
| next (package.json) | `^16.2.0` |
| react / react-dom | `^19.2.0` / `^19.2.0` |
| next (package-lock.json) | `16.4.6` |
| react (package-lock.json) | `19.3.1` |
| name / version | `enterprise-data-platform` / `0.2.0` |
| lock-файл | `package-lock.json` присутствует; `npm ci` в CI используется |

Зависимости уже установлены (`node_modules/` существует), lock-файл не изменялся — `npm ci` локально не переполняли.

## 2. Конфигурация Next.js

`next.config.mjs`:
- `output: 'export'` — статический экспорт подтверждён.
- `basePath` берётся из `src/lib/paths.mjs` (из `NEXT_PUBLIC_BASE_PATH`).
- `trailingSlash: true`, `images: { unoptimized: true }`, `poweredByHeader: false` — соответствует ограничениям GitHub Pages из плана.
- Серверного runtime, API routes, middleware, SSR/ISR не обнаружено.

`src/lib/paths.mjs` (контракт после A01):
- `normalizeBasePath(value)` — нормализация и валидация префикса (запрет `..`, `//`, схем).
- `basePath` — вычисляется из `NEXT_PUBLIC_BASE_PATH` на момент сборки.
- `assetPath(path)` — добавляет `basePath` к локальным root-relative путям.
- **A01**: добавлена чистая `linkHref(href, prefix = basePath)` для обычных `<a href>`:
  - абсолютный путь `/docs/` → `/docs/` или `/edp/docs/`;
  - голый якорь `#platform` → `/#platform` или `/edp/#platform`;
  - внешние `http(s):`, `mailto:`, `tel:` — без изменения;
  - небезопасные схемы (`javascript:`, `data:`, `vbscript:`, protocol-relative `//host`) и относительные пути — ошибка;
  - уже префиксованный путь не дублируется. Компоненты при этом не переключены на `linkHref` (переносится в A02), `next/link` не используется.

## 3. GitHub Actions

`.github/workflows/ci.yml` (`main`, `pull_request`, `workflow_dispatch`):
- `npm ci` (или `npm install` при отсутствии lock-файла).
- `npm test`.
- `npm run build` + `npm run check:export` с `NEXT_PUBLIC_BASE_PATH` из `configure-pages` (пусто на custom domain, путь репозитория на project site).
- Публикация артефакта `out/` и `deploy-pages`. Permissions и publish-ветка `main` — не менялись.

## 4. Команды и статический экспорт

Скрипты (`package.json`): `dev`, `build`, `preview` (`scripts/serve.mjs`), `test` (`node --test tests/*.test.mjs`), `check:export` (`scripts/check-export.mjs`).

Результаты базовых проверок из раздела 10 (код возврата = 0 везде):

| Команда | Результат |
|---|---|
| `npm test` | 10 passed, 0 failed |
| `NEXT_PUBLIC_BASE_PATH='' build` + `check:export` | OK, 5 local asset references, basePath=/ |
| `NEXT_PUBLIC_BASE_PATH=/edp-test build` + `check:export` | OK, 5 local asset references, basePath=/edp-test |
| Восстановление production-артефакта (`'' build` + `check:export`) | OK, basePath=/ (текущий `out/`) |
| `git diff --check` | чисто (пробелов/конфликтов нет) |
| `git diff --stat` | нет изменений по отслеживаемым файлам |

`check-export.mjs` проверяет наличие `index.html`, `404.html`, `platform.svg`, `favicon.svg`, `og.png`, `robots.txt`, `sitemap.xml`, корректность `basePath` в ссылках и canonical-домен.

## 5. Тесты

`tests/paths.test.mjs` и `tests/content.test.mjs` (всего 10 тестов, проходят):
- `paths`: root-пути для custom domain, нормализация project-пути, отклонение невалидных префиксов, согласованность `basePath`/`output`/`assetPath` для обоих режимов хостинга.
- **A01 добавлено**: 3 теста `linkHref` (якоря/пути для пустого и непустого basePath, отсутствие двойного префикса, пропуск внешних ссылок и отклонение небезопасных схем). Итого 13/13.
- `content`: уникальность ID секций, полнота модулей, сценарии, контакты (не настроены или валидны), обязательные поля доков, наличие локальных визуальных ассетов, якоря и домен.

## 6. Структура

- `src/app`: `page.jsx`, `layout.jsx`, `globals.css`, `robots.js`, `sitemap.js`, `docs/`.
- `scripts`: `check-export.mjs`, `serve.mjs`.
- `docs`: `DEPLOYMENT`, `GETTING_STARTED`, `GITHUB-ORGANIZATION`, `GITHUB-PAGES`, `IMPLEMENTATION-PLAN`, `REFERENCES`, `ROADMAP`, `VALIDATION`, `IMPLEMENTATION-STATE` (этот файл).

## 7. Предыдущий аудит

Отдельного документа аудита не обнаружено. Временный файл `docs/IMPLEMENTATION.txt` (копия промпта A00) к моменту проверки был удалён. Замечаний для сверки с устранением нет.

## 8. Обнаруженные проблемы и блокеры

- Блокеров нет. Все проверки из раздела 10 проходят, исходный код не изменялся.
- Наблюдения (не блокируют, в backlog):
  - Локальная Node v26 против `engines >=22` — совместимо, но CI фиксирует Node 22; локально и в CI версии различаются.
  - В `git status` не отследены `docs/IMPLEMENTATION-PLAN.md` и новый `docs/IMPLEMENTATION-STATE.md` — по условию A00 коммиты не создаём; зафиксировать в репозиторий можно на этапе владельца.
  - Функция формирования `href` отсутствует — ожидается в A01; не исправлять в A00.

## 9. Следующая задача

**A01 — завершена.** Добавлен `linkHref` в `src/lib/paths.mjs` и тесты в `tests/paths.test.mjs`; контракт `normalizeBasePath`/`basePath`/`assetPath` сохранён, компоненты не изменены, 13/13 тестов, сборки `''` и `/edp-test` и `check:export` проходят. Коммит по плану (выполняется владельцем): `fix: centralize cross-page navigation paths`. В этой сессии коммит не создавался, `git push` не выполнялся.

Следующая выполнена: **A02 — Header и мобильное меню (завершена)**.
- `src/components/Header.jsx`: все пункты десктопной и мобильной навигации и CTA «Обсудить проект» через `linkHref` (A01). CTA ведёт на глобальный якорь главной `#contact` → `/#contact` / `/edp/#contact`.
- Добавлен простой статический проп `activeSection` (совпадает с raw `href` пункта): активному пункту ставится `aria-current="page"`. Header остался Server Component; `details/summary` для мобильного меню сохранено.
- `src/app/docs/page.jsx`: передан `activeSection="/docs/"` — на `/docs/` подсвечивается пункт «Документация» (десктоп + мобильный).
- Тест `tests/header.test.mjs` (новый, node `--test`): контракт навигации и подсветки. Итого 16/16 (было 13).
- Проверки: сборка `''` и `/edp-test` + `check:export` — OK; DOM `aria-current="page"` на `docs/index.html` = 2, на `index.html` = 0; якоря `/#platform…` и `href=/docs/|/edp-test/docs/`. `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `fix: make header navigation work across pages`.

Следующая выполнена: **A03 — Footer и логотип (завершена)**.
- `src/components/Icon.jsx` (только `Logo`): логотип ведёт на главную через `linkHref('/')` (был локальный `#top`); доступное имя обновлено на «Enterprise Data Platform — на главную». SVG и `Icon` не тронуты.
- `src/components/Footer.jsx`: навигация и FAQ переведены на `linkHref` (были инлайновые `${basePath}${h}` и `href="#faq"`); `basePath`-импорт убран.
- Тест `tests/footer.test.mjs` (новый, node `--test`): контракт навигации подвала, якоря FAQ и home-цели бренда. Итого 19/19 (было 16).
- Проверки: сборка `''` и `/edp-test` + `check:export` — OK; DOM `class="brand" href="/"|/edp-test/`, FAQ `href="/#faq"|/edp-test/#faq`, `#top` больше нет, footer `href="/edp-test/docs/"`. `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `fix: correct footer and brand links`.

Следующая выполнена: **A04 — SEO и доступность страницы документации (завершена)**.
- `src/app/docs/page.jsx`: добавлен skip-link (`<a class="skip-link" href="#main">К содержимому</a>`) и `id="main"` на `<main>`; добавлена компактная навигационная цепочка «Главная / Документация» (`nav.docs-breadcrumb`, `linkHref('/')` для «Главная», `aria-current="page"` на текущем), без несуществующих маршрутов; упоминание «контактной формы» заменено ссылкой на контактный блок (`linkHref('#contact')` → `/#contact` / `/edp-test/#contact`), без утверждения о подтверждённом адресе. Canonical и метаданные не менялись — уже ссылаются на production-домен (`metadataBase = site.url`, `alternates.canonical = '/docs/'` → `https://enterprisedataplatform.ru/docs/`), проверено для обоих режимов.
- `src/app/sitemap.js`: добавлен маршрут `/docs/` (priority 0.8); root-маршрут сохранён. Локации — production-домен, тестовый путь не утекает.
- `src/app/globals.css`: минимальные стили `.docs-breadcrumb` (без изменения существующего дизайна).
- Тест `tests/docs.test.mjs` (новый, node `--test`): breadcrumb-ссылка «Главная», ссылка контакта `#contact` (оба basePath) и покрытие sitemap. Итого 22/22 (было 19).
- Проверки: `npm test` 22/22; сборка `''` и `/edp-test` + `check:export` — OK (5 local asset refs); DOM `out/docs/index.html`: `skip-link` + `main id="main"` присутствуют, `class="docs-breadcrumb"` с `href="/"`|`/edp-test/` на «Главная», контакт `href="/#contact"`|`/edp-test/#contact` «контактный блок», слова «контактную форму» отсутствуют (0), canonical `https://enterprisedataplatform.ru/docs/` в обоих режимах, `sitemap.xml` содержит `/docs/`, структура заголовков: 1×h1 + 4×h2. `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `fix: improve documentation SEO and accessibility`.

Следующая выполнена: **A05 — Проверка статического экспорта всех страниц (завершена)**.
- `scripts/check-export.mjs` переписан: перебирает все HTML-файлы в `out/` (5 файлов: `index.html`, `404.html`, `404/index.html`, `docs/index.html`, `_not-found/index.html`), извлекает `href`/`src` из каждого (после удаления `<script>` блоков), проверяет:
  - обязательные файлы (`index.html`, `404.html`, `platform.svg`, `favicon.svg`, `og.png`, `robots.txt`, `sitemap.xml`, `docs/index.html`);
  - корректность `basePath` (при непустом basePath все root-relative ссылки должны начинаться с `basePath/`);
  - существование целевого файла (индексные маршруты → `index.html`);
  - наличие якоря `id="..."` в целевой странице;
  - пропуск внешних URL, `mailto:`, `tel:`, `data:`, `javascript:`, `vbscript:`, protocol-relative `//host`;
  - `sitemap.xml` содержит root-URL и `/docs/`-URL.
- `tests/export.test.mjs` (новый, 8 тестов, node `--test`): положительный сценарий (root и nested basePath), отклонение при отсутствии страницы, отсутствии якоря, отсутствии файла, отсутствии `docs/index.html`, отсутствии `/docs/` в sitemap, отсутствии basePath.
- Итого 30/30 тестов (было 22).
- Проверки: `npm test` 30/30; `npm run build` + `check:export` (basePath=``) — OK, 59 asset refs / 5 HTML файлов; `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `test: validate links across static website export`.

Следующая выполнена: **A06 — Контрольная точка навигации (автопроверки пройдены, ручная проверка отложена)**. Контрольная точка, изменения кода нет.
- Автоматические проверки (в этой сессии):
  - `npm test` — 30/30 pass.
  - `NEXT_PUBLIC_BASE_PATH='' build` + `check:export` — OK, 59 local asset refs / 5 HTML файлов, basePath=/.
  - `NEXT_PUBLIC_BASE_PATH='/edp-test' build` + `check:export` — OK, 59 local asset refs / 5 HTML файлов, basePath=/edp-test (отдельная проверка, как требует A06).
  - Восстановление production-экспорта: `NEXT_PUBLIC_BASE_PATH='' build` + `check:export` — OK, basePath=/ (текущий `out/`).
  - `git diff --check` — чисто; отслеживаемых изменений в `git status` нет.
- Ручная проверка в браузере (главная, `/docs/`, логотип, пункты меню, CTA, Footer при ~390 и 1440 px; прямая загрузка и обновление `/docs/`): **NOT RUN** — браузер недоступен в этой среде; не подменяется статическим анализом. Отложена владельцу.
- Приёмка A06: обе сборки и проверки экспорта пройдены; ручная проверка явно отложена владельцу. Публикация — отдельный PR/коммитный набор только после ручного подтверждения владельцем. `git push` не выполнялся.
- Коммит по плану (владельцем): отдельный набор без собственного commit message из плана (точка — релиз-маркер); при необходимости: `chore: navigation checkpoint (A06)`.

Следующая выполнена: **B01 — ADR выбора движка документации (завершена)**.
- Создан `docs/adr/0001-documentation-engine.md`: сравнение Nextra и Next.js + локальный MDX; рекомендация — вариант B (Next.js + MDX) при условии успешного PoC; условия отказа и план B02 описаны.
- Пакеты не установлены, исходный код сайта не изменён. Совместимость с Next.js 16 / React 19 / `output: 'export'` **не проверялась** (нет доступа к сети) — перенесено в B02.
- Подтверждение владельца — ожидается (чек-лист в конце ADR).
- Проверки: `npm test` 30/30; `build` + `check:export` (basePath=``) — OK, 59 local asset refs / 5 HTML файлов; `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `docs: record documentation engine decision`.

Следующая задача: **B02 — Изолированный PoC движка (завершена)**.
- Ветка: `feat/docs-poc` (от `main`).
- Установлены `@next/mdx@16.4.6` и `@mdx-js/react@3.1.1`; `@mdx-js/loader` **не требуется** — используется экспериментальный `mdxRs` (Rust-компилятор) через `experimental.mdxRs: true` в `next.config.mjs`.
- `next.config.mjs`: добавлен `withMDX` из `@next/mdx`, `pageExtensions` с `md`/`mdx`, `experimental.mdxRs: true`.
- `mdx-components.js` (корень проекта): экспорт `useMDXComponents()`.
- `src/app/docs/poc/page.mdx`: тестовая страница (H1/H2/H3, python-блок кода, список, **жирный**/_курсив_, относительная ссылка `../`, blockquote, frontmatter `title`/`description`).
- **Критерий стоп — пройден**: новых транзитивных зависимостей **2** (`csstype`, `source-map`), предел — 10. Вариант с `@mdx-js/loader` (103 пакета) отклонён.
- `npm test` — 30/30. Сборка `''` и `/edp-test` + `check:export` — OK (62 local asset refs / 6 HTML). `git diff --check` — чисто.
- `out/docs/poc/index.html`: 6×h[123], 1×pre/code, 6×li, 1×a, 1×blockquote. `main` не изменён.
- `git push` не выполнялся. Коммит по плану (владельцем): `feat: prototype static MDX documentation`.
- **Блокер**: подтверждение ADR-решения владельцем (чек-лист в `docs/adr/0001-documentation-engine.md`) — не получено.

Следующая выполнена: **B03 — реестр документации и маршруты (завершена)**.
- `src/content/docs/navigation.mjs` (новый): единый источник истины — slug, title, section, order, status (`published`/`draft`/`planned`), source. Контроль дублей slug при инициализации (бросает исключение). Хелперы `getDocsNav()` (сортировка по order), `getPublishedDocs()` (только `published`), `docPath(slug)` → `/docs/<slug>/`. Маршруты — файловая маршрутизация (page.mdx), динамический сегмент и `generateStaticParams` не нужны.
- `src/app/docs/overview/page.mdx` + `layout.jsx` (новые): первая реальная статья «Обзор платформы» (`published`); layout переиспользует фирменный Header/Footer. Черновики/планы (`architecture`, `components`) маршрутов не создают.
- Временный PoC-URL удалён: `src/app/docs/poc/` (layout + page.mdx) удалён, ссылок на `poc` в `src`/`tests` нет.
- `src/app/docs/page.jsx`: блок «Опубликованные материалы» строится только из `getPublishedDocs()`, ссылки через `linkHref(docPath(slug))` (оба basePath).
- `src/app/sitemap.js`: статьи добавляются только из `getPublishedDocs()` (priority 0.7); root и `/docs/` сохранены. `src/app/globals.css`: ограниченные стили `.docs-published*` (без изменения дизайна главной).
- Тесты `tests/docs.test.mjs` (4 новых): уникальность slug, published-маршруты и исключение draft/plans, черновики/планы не публикуются, sitemap содержит только published (overview) без утечки `/edp-test`. Итого 34/34 (было 30).
- Проверки: `npm test` 34/34; сборка `''` и `/edp-test` + `check:export` — OK (83 local asset refs / 6 HTML файлов в обоих режимах). Прямой URL после экспорта: `out/docs/overview/index.html` присутствует, h1 «Обзор платформы». Sitemap в режиме `/edp-test` ссылается только на production-домен (утечки `/edp-test` нет). Восстановлен production-экспорт (`'' build` + `check:export`, basePath=/). `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `feat: define static documentation route registry`.

- B04 (этого коммита) завершён: общий layout документации с тремя областями (sidebar / статья / оглавление), переиспользованы Header/Footer, убрано дублирование.

Следующая задача: **B05 — Sidebar и активный маршрут (завершена)**.
- `src/content/docs/navigation.mjs`: добавлен чистый хелпер `getSidebarNav(currentSlug = '')` — дерево из `getPublishedDocs()`, сгруппированное по `section` (порядок по `order`); черновики/планы исключены (активных ссылок нет); текущая статья помечается `active`, её группа `open`. Порядок независим от `currentSlug`.
- `src/components/DocsSidebar.jsx` (новый, Server Component): рендерит `<aside class="docs-sidebar">` с группами через нативные `<details>`/`<summary>` (клавиатурно доступны, сворачиваются на узком экране). Активная статья — `aria-current="page"` + нецветовой глиф-маркер `●` (`docs-nav-marker`, `aria-hidden`); не опирается только на цвет. Ссылки через `linkHref(docPath(slug))`.
- `src/app/docs/overview/layout.jsx`: инлайновый плоский список заменён на `<DocsSidebar currentSlug="overview" />`; структура shell (sidebar / article / toc) и Header/Footer сохранены, `main id="main"` не дублируется. Неназначенный TOC оставлен без изменений (B06).
- `src/app/globals.css`: добавлены ограниченные селекторы `.docs-nav-group`, `.docs-nav-summary`, `.docs-nav-items`, `.docs-nav-item`, `.docs-nav-marker`, `.docs-nav-item.is-active a`; существующие стили главной не тронуты.
- Тесты `tests/docs.test.mjs` (3 новых): группировка published и исключение draft/planned, пометка активной статьи + раскрытие её группы, порядок групп по реестру. Итого 37/37 (было 34).
- Проверки: `npm test` 37/37; сборка `''` и `/edp-test` + `check:export` — OK (84 local asset refs / 6 HTML файлов в обоих режимах). Восстановлен production-экспорт (`'' build` + `check:export`, basePath=/). DOM `out/docs/overview/index.html`: 1×`docs-nav-group`, 1×`<details open>` (раскрыта группа «Обзор»), 1×`docs-nav-item is-active` с `aria-current="page"` и маркером `●`; ссылок на `docs/architecture`/`docs/components` нет (0). `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `feat: add documentation sidebar navigation`.

Следующая выполнена: **B06 — Breadcrumbs, оглавление и переходы между статьями (завершена)**.
- `src/content/docs/navigation.mjs`: добавлен чистый хелпер `getArticleNav(currentSlug = '')` → `{current, prev, next}`; соседи берутся строго из порядка `getPublishedDocs()`, поэтому переход не может вести на плановый раздел или черновик; отсутствующий сосед — `null` (пджер не рисует пустую сторону, нет нерабочих кнопок).
- `src/components/DocsBreadcrumb.jsx` (новый, Server Component): `<nav class="docs-breadcrumb" aria-label="Хлебные крошки">` — «Главная» (`linkHref('/')`) / «Документация» (`linkHref('/docs/')`) / текущая статья (`aria-current="page"`, без ссылки на себя). Крошки ведут только на существующие маршруты; при отсутствии `currentSlug` показывает «Документация».
- `src/components/DocsArticleNav.jsx` (новый, Server Component): переходы «← Предыдущая / Следующая →» через `getArticleNav`; при отсутствии соседей (одна опубликованная статья) компонент ничего не рендерит.
- `src/lib/heading-slug.mjs` (новый, чистые функции): `slugifyHeading` (кириллица сохраняется, пунктуация удаляется, пробелы → дефис, детерминировано) и `uniqueHeadingId` (дедупликация с суффиксом `-1`, `-2`).
- `src/components/DocsToc.jsx` (новый, Client Component): оглавление собирается из реальных заголовков `h2`/`h3` в `main#main` (через `buildToc`) — не может «отстать» от контента; при отсутствии `id` у заголовка назначается стабильный уникальный `id`. Обёртка `<aside class="docs-toc">` с заголовком «На этой странице» и `aria-label="Оглавление"`.
- `src/app/docs/overview/layout.jsx`: хардкод-оглавление (`#naznachenie`, `#granitsy`) заменено на динамический `<DocsToc scopeId="main" />`; добавлены `<DocsBreadcrumb currentSlug="overview" />` (в начале `main`) и `<DocsArticleNav currentSlug="overview" />` (в конце). Структура shell и `main id="main"` сохранены.
- `src/app/globals.css`: `scroll-margin-top:96px` на `.docs-article h2/h3` (компенсация липкой шапки 76px), `.docs-toc-item.is-sub` (отступ для h3), ограниченные стили пджера `.docs-article-nav`/`.docs-article-prev`/`.docs-article-next`/`.docs-article-dir`/`.docs-article-title`; существующий дизайн не тронут.
- Тесты `tests/docs.test.mjs` (4 новых): breadcrumb-ссылки «Главная»/«Документация» через `linkHref` (оба basePath), пджер использует только published-соседи (draft/planned исключены), пджер исключает `architecture`/`components`, кириллический slug детерминирован и дедуплицирован. Итого 41/41 (было 37).
- Проверки: `npm test` 41/41; `npm run build` + `check:export` (basePath=``) — OK (85 local asset refs / 6 HTML). `git diff --check` — чисто. DOM `out/docs/overview/index.html`: `class="docs-breadcrumb"` с `href="/"` на «Главная», якоря заголовков `id="naznachenie"`/`id="granitsy"` сохранены, `aside.docs-toc` с заголовком «На этой странице», пджер `docs-article-nav` отсутствует (одна опубликованная статья — корректно). `git push` не выполнялся.
- Коммит по плану (владельцем): `feat: add documentation breadcrumbs, table of contents, and article pager`.

Следующая выполнена: **B07 — Главная страница документации (завершена)**.
- `src/content/site.mjs`: каждой карточке каталога (`docs[]`) добавлен `slug`, связывающий её с реестром (`A`→`architecture`, `B`→`components`, `C`→`security`, `D`→`operations`); тексты/темы не изменены.
- `src/content/docs/navigation.mjs`: добавлены чистые хелперы `getSectionStatus(slug)` (реестровый статус; отсутствующий в реестре slug → `planned` — каталог не рисует мёртвых ссылок) и `getGettingStarted()` (первая опубликованная статья, приоритет у `overview`; `null`, если published-статей нет).
- `src/app/docs/page.jsx` (переписан как навигационный хаб): hero с breadcrumb «Главная / Документация»; блок «Начать работу» ведёт на реальную опубликованную статью (через `getGettingStarted()` + `linkHref`); каталог `.docs-grid` — у опубликованного раздела карточка становится ссылкой на материал (`.docs-card-link` + CTA «Читать →»), у планового раздела — статичный `article` с бейджем «Скоро» и без ссылки; секция «Опубликованные материалы» строится только из `getPublishedDocs()`. Мёртвых/фейковых ссылок нет. Все пути через `linkHref`/`assetPath` (оба basePath).
- `src/app/globals.css`: ограниченные стили `.docs-start`, `.docs-start-link` (+ mobile `flex-direction:column`), `.docs-card-link`, `.docs-card-cta`, `.docs-soon`; существующий дизайн не тронут.
- Тесты `tests/docs.test.mjs` (5 новых): каталог связан с реестром через `slug`, `getSectionStatus` отличает published от будущих, опубликованные карточки дают ссылку (а `architecture`/`components` — нет), инвариант «published-карточка имеет запись в реестре», `getGettingStarted` разрешается на реальную опубликованную статью. Итого 46/46 (было 41).
- Проверки: `npm test` 46/46; `npm run build` + `check:export` (basePath=``) — OK (87 local asset refs / 6 HTML). Контрольная точка на `/edp-test` не запускалась (это B08): разовая проверка `NEXT_PUBLIC_BASE_PATH=/edp-test` + `check:export` — OK (87 refs / 6 HTML), `sitemap.xml` без утечки `/edp-test` (0), prefix в `docs/index.html` только в путях бандлов (корректно), production-экспорт восстановлен. DOM `out/docs/index.html`: блок «Начать работу» (`docs-start`/`GETTING STARTED`) есть, все 4 карточки помечены «Скоро» (`.docs-soon`), единственная реальная ссылка на материал — `href="/docs/overview/"`, ссылок на несуществующие `docs/architecture`/`docs/components` нет. `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `feat: turn documentation landing into a navigation hub`.

Следующая выполнена: **FIX-01 — Рендер MDX и метаданные документации (завершена)**.
- `src/app/docs/overview/layout.jsx`: добавлен штатный экспорт `export const metadata` Next.js с уникальными `title` (`Обзор платформы — Enterprise Data Platform`), `description` и `alternates.canonical` (`https://enterprisedataplatform.ru/docs/overview/`). Структура shell, импорт компонентов и `main id="main"` сохранены без изменений.
- `src/app/docs/overview/page.mdx`: удалён блок YAML frontmatter (`title`/`description`). Корневая причина: `@next/mdx` (`mdxRs`) и цепочка сборки не разбирают frontmatter (нет `gray-matter`), поэтому он рендерился как видимый текст в теле статьи (подтверждено в `out/docs/overview/index.html` до исправления). В `.mdx` body оставлен ровно один `H1`.
- Тесты `tests/docs.test.mjs` (4 новых): нет ведущего блока frontmatter, нет строк `title:`/`description:` в теле, layout экспортирует `metadata` с `title`/`description`/`canonical`, ровно один `H1` в теле статьи. Итого 50/50 (было 46).
- Проверки: `npm test` 50/50; статический экспорт проходит при пустом `basePath` и при `/edp-test` (по 87 local asset refs / 6 HTML), `check:export` — OK в обоих режимах; `sitemap.xml` и `canonical` без утечки `/edp-test`. Восстановлен production-экспорт (`'' build` + `check:export`, basePath=/). DOM `out/docs/overview/index.html`: `<title>` и `name="description"` уникальны, `rel="canonical"` на продакшн-домен, ровно 1×`<h1>`, строк frontmatter в видимом теле нет. `git diff --check` — чисто. `git push` не выполнялся.
- Коммит по плану (владельцем): `fix(docs): correct MDX rendering and article metadata`.

Следующая выполнена: **B08 — Контрольная точка движка (автопроверки пройдены, ручная проверка в браузере отложена)**. Контрольная точка этапа B01–B07, изменения кода нет.
- Автоматические проверки (в этой сессии):
  - `npm test` — 50/50 pass.
  - `NEXT_PUBLIC_BASE_PATH='' build` + `check:export` — OK, 87 local asset refs / 6 HTML, basePath=/.
  - `NEXT_PUBLIC_BASE_PATH='/edp-test' build` + `check:export` — OK, 87 local asset refs / 6 HTML, basePath=/edp-test.
  - Восстановление production-экспорта (`'' build` + `check:export`) — OK, basePath=/ (текущий `out/`).
  - `git diff --check` — чисто; отслеживаемых изменений в `git status` нет (изменён только `AGENTS.md`, не мой/предсуществующий; `out`/`.next`/`node_modules` в ignore).
- Отсутствие публикации PoC: в `src/app/docs/` только `layout.jsx`, `overview/`, `page.jsx`; ссылок на `poc` в `src`/`tests` нет; в обоих экспортах `out/docs/poc/index.html` отсутствует, руты `/docs`, `/docs/overview` без PoC.
- Прямая загрузка статьи: `out/docs/overview/index.html` (оба basePath) самодостаточна — 1×`<h1>`, все `href` с корректным префиксом (`/edp-test/…` в вложенном режиме), canonical/sitemap — только production-домен (утечки `/edp-test` нет).
- Клавиатурная навигация (проверено по структуре DOM, не в браузере): `a.skip-link[href="#main"]` + `main id="main"`; нативный `details`/`summary` в сайдбаре (клавиатурно сворачивается); `aria-current="page"` на активной статье/breadcrumb; якоря заголовков `id="naznachenie"`/`id="granitsy"`; TOC — Client Component (контейнер в статике, элементы строятся в браузере); пджер `docs-article-nav` отсутствует (одна опубликованная статья — корректно).
- Ручная проверка в браузере (прямая загрузка `/docs/overview/`, клавиатурный Tab/Focus по skip-link, сайдбару, TOC и пджеру, обновление страницы): **NOT RUN** — браузер недоступен в этой среде; не подменяется статическим анализом. Отложено владельцу.
- Приёмка B08: оба basePath и `check:export` пройдены, PoC не публикуется, одна содержательная статья доступна и самодостаточна; ручная проверка в браузере явно отложена владельцу. Ошибок, требующих корректирующей задачи, не обнаружено. `git push` не выполнялся.
- Коммит по плану (владельцем): контрольная точка без собственного commit message из плана; при необходимости: `chore: documentation engine checkpoint (B08)`.

Следующая выполнена: **FIX-02 — Изоляция CSS документации (завершена)**.
- `src/app/docs/docs.css` (новый): в него перенесены все стили раздела документации из `src/app/globals.css` — блок от комментария `/* ── Docs page ── */` до конца файла: `.docs-page`, `.docs-hero`, `.docs-breadcrumb`, `.docs-list`/`.docs-grid`/`.docs-card`/`.docs-topics`, `.docs-note`, `.docs-published`, `.docs-shell`/`.docs-sidebar`/`.docs-nav-*`, `.docs-article`/`.docs-toc`/`.docs-toc-item`, `.docs-article-nav`/`.docs-article-prev`/`.docs-article-next`, `.docs-start*`, `.docs-card-link`/`.docs-card-cta`, `.docs-soon`, а также связанные media queries (`@media(max-width:820px)`, `@media(min-width:820px)`, `@media(min-width:1100px)`, два `@media(max-width:640px)`). Дублирующих селекторов не создано — стили удалены из `globals.css`, не скопированы.
- `src/app/globals.css`: удалён блок документации (строки 852–1133); файл завершается блоком `@media(max-width:820px)` для сценариев. Стили главной страницы и `:root`/CSS-переменные не тронуты (переменные `--radius`, `--green`, `--paper`, `--line` и др. остаются в `globals.css` и доступны `docs.css` через `:root`).
- `src/app/docs/layout.jsx`: добавлен `import './docs.css';` (globals.css подключён в root layout и применяется ко всем страницам; docs.css подключён в docs layout и применяется вложенным образом к страницам раздела /docs/). JSX-компонент не изменён — добавлен только импорт CSS.
- Исправлена синтаксическая ошибка: в блоке `.docs-article-prev, .docs-article-next` были пропущены точки с запятой после `border-radius`, `color` и `text-decoration`. Селектор восстановлен в корректном виде: `border-radius:var(--radius);color:var(--green);text-decoration:none;`. Подтверждено в собранном `out/_next/static/chunks/*.css` — оба docs-страница (`out/docs/index.html`, `out/docs/overview/index.html`) подключают чанк с исправленным селектором.
- Визуальное оформление не изменялось: перенос и исправление синтаксиса не меняют рассчитанные значения свойств.
- Проверки: `npm test` — 50/50 pass (не добавлялось и не удалялось тестов). `npm run build` — успешно (Next.js 16, Turbopack), 6 статических маршрутов. `npm run check:export` — OK, 89 local asset references / 6 HTML, basePath=/ (число refs выросло с 87 до 89 из-за отдельного CSS-чанка документации). Баланс скобок в `docs.css` — 75/75. `git diff --check` — чисто. `git push` не выполнялся.
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в этой среде; подмена статическим анализом DOM/сборки (подключение чанка и корректный синтаксис) выполнена, ручная проверка в браузере отложена владельцу.
- Коммит по плану (владельцем): `refactor(docs): isolate documentation styles and fix CSS syntax`.

Следующая выполнена: **FIX-03 — Единый layout документации (завершена)**.
- `src/components/DocsLayout.jsx` (новый): общий 3-колоночный каркас — `docs-shell` (CSS grid) с `DocsSidebar` (слева), `<main id="main" class="docs-article">` (центр, принимает `children`) и `DocsToc` (справа). Параметр `currentSlug` передаётся в сайдбар и TOC. Параметр `mainClass` (default `'docs-article'`) позволяет странице задать собственный класс main-колонки. Каталог передаёт `currentSlug=""` — в сайдбаре ни один пункт не подсвечен. Статья передаёт `currentSlug="overview"` — активный пункт подсвечивается.
- `src/app/docs/layout.jsx`: переименована из `DocsLayout` в `DocsRootLayout`. Обёртки `docs-shell`/`DocsSidebar`/`DocsToc` из JSX удалены — они предоставлены `DocsLayout`. Родительский layout рендерит `Header` → `DocsLayout currentSlug=""` → `Footer`. Каталог (`page.jsx`) и статьи (`overview/layout.jsx`) вложены внутрь `DocsLayout` через `children`.
- `src/app/docs/page.jsx` (каталог /docs/): удалены собственные layout-обёртки (`docs-page`, `docs-shell`, `docs-sidebar`). Содержимое обёрнуто в `<div className="docs-catalog">` (CSS `display:contents` — секции тянутся на всю ширину main). Карточки `.docs-card` используют новые классы `.docs-card-tag`/`.docs-card-status`/`.docs-cards`/`.docs-card--published`, добавленные в `docs.css`.
- `src/app/docs/overview/layout.jsx` (статьи /docs/*): удалены дублирующие `docs-shell`/`DocsSidebar`/`DocsToc` — единую сетку предоставляет `DocsLayout` из родительского layout. Остались только `DocsBreadcrumb` + `children` (MDX-контент) + `DocsArticleNav`. Метаданные `metadata` (title/description/canonical) сохранены без изменений.
- `src/app/docs/docs.css`: добавлен блок FIX-03 — `.docs-article > .docs-catalog {display:contents}` и стили для каталог-классов (`.docs-cards`, `.docs-card-tag`, `.docs-card-status`, `.docs-card--published`, `.docs-list-intro`, `.docs-start-empty`, `.docs-start-link`, `.arrow`).
- Не затронуты: `globals.css`, `src/app/layout.jsx`, `Header.jsx`, `Footer.jsx`, конфигурация Next.js/MDX, `next.config.mjs`, `package.json`, опубликованные маршруты (`/`, `/docs`, `/docs/overview`, `sitemap.xml`, `robots.txt`).
- Проверки: `npm test` — 50/50 pass. `npm run build` — успешно (Next.js 16, Turbopack), 6 статических маршрутов (`/`, `/_not-found`, `/docs`, `/docs/overview`, `/robots.txt`, `/sitemap.xml`). `npm run check:export` — OK, 88 local asset references / 6 HTML, basePath=/. `git diff --check` — чисто. `git push` не выполнялся.
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в этой среде; подмена статическим анализом (HTML-структура `out/docs/index.html` и `out/docs/overview/index.html` подтверждена: каталог содержит `docs-catalog` > `docs-hero`/`docs-start`/`docs-list`/`docs-published`/`docs-note` внутри `docs-article`; статья содержит `docs-breadcrumb` > `h1` > MDX-контент внутри `docs-article`; `docs-shell` с 3 колонками `docs-sidebar`/`docs-article`/`docs-toc` общий для обеих страниц). Ручная проверка в браузере отложена владельцу.
- Коммит по плану (владельцем): `refactor(docs): unify docs layout with shared 3-column shell`.

Следующая выполнена: **FIX-03-R1 — Корректировка единого layout и метаданных документации (завершена, автопроверки пройдены)**.
- Базовый коммит: `6b7f48e` (`refactor(docs): unify docs layout with shared 3-column shell`), ветка `main`. Установка выполнена пакетом `edp-fix-03-r1/apply.py` (вариант (а), по согласованию владельца — готовые исходники из пакета признаны каноническими; текущие незакоммиченные локальные правки 6 файлов были перезаписаны точной целевой версией, резервная копия сделана в `/tmp/edp-fix03r1-ownerbackup-*`).
- `src/app/docs/page.jsx`: восстановлен `export const metadata` (title `Документация — Enterprise Data Platform`, description об архитектуре/компонентах/безопасности/эксплуатации, `alternates.canonical` на продакшн-домен). Каталог рендерится внутри общего `DocsLayout`; локальная обёртка 3-колоночного каркаса не дублируется.
- `src/app/docs/layout.jsx`: общий 3-колоночный каркас `DocsLayout` (сайдбар + `main#main.docs-article` + TOC) предоставляется единожды родителем; дочерние страницы не переопределяют `docs-shell`/`DocsSidebar`/`DocsToc`.
- `src/app/docs/overview/layout.jsx`: сохранены штатные метаданные и структура `main id="main"`; локальные обёртки каркаса удалены (единый shell из родителя).
- `src/components/DocsLayout.jsx`, `src/components/DocsSidebar.jsx`: приведены к канонической версии пакета (единый каркас, подсветка активной статьи через `currentSlug`, доступность сайдбара).
- `src/components/DocsBreadcrumb.jsx` (новый): хлебные крошки `Главная / Документация / <статья>` через `linkHref` (оба basePath), `aria-label="Хлебные крошки"`, `aria-current="page"` на текущей статье.
- `src/app/docs/docs.css`: ограниченные стили каталога и каркаса; дублирующих селекторов нет.
- `tests/docs-layout.test.mjs` (новый): контракт единого каркаса (единая `docs-shell`, подсветка `currentSlug`, доступность). `tests/docs.test.mjs`: одна строка проверки карточки заменена `assert.equal(href, '/docs-base/docs/${card.slug}/')` — опубликованная карточка разрешается на свою статью. Итого `npm test` — 0 fail.
- Не затронуты (read-only контракты совпадают с проверенным SHA): `DocsArticleNav.jsx`, `DocsToc.jsx`, `paths.mjs`, `site.mjs`, `navigation.mjs`, `app/layout.jsx`, `globals.css`, `overview/page.mdx`, `package.json`.
- Проверки (пакет `edp-fix-03-r1/verify.sh`, exit 0): `apply.py --check-installed` PASS; `git diff --check` PASS; `npm test` PASS (fail 0, cancelled 0, skipped 0, todo 0); production `build`+`check:export` PASS (basePath=/, 91 local asset refs / 6 HTML); `verify.py` HTML PASS /docs/ и /docs/overview/ (basePath=/); project `build`+`check:export` PASS (basePath=/edp-test, 91 refs / 6 HTML); `verify.py` HTML PASS (basePath=/edp-test); восстановление production `build`+`check:export`+HTML PASS (basePath=/). Production-экспорт восстановлен (текущий `out/`).
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в этой среде; подмена статическим анализом (HTML-контракт `out/docs/` и `out/docs/overview/` в обоих basePath) выполнена, ручная проверка в браузере отложена владельцу.
- `git push` не выполнялся.
- Коммит по плану (владельцем): `fix(docs): resolve shared layout and metadata regressions`.

Следующая выполнена: **FIX-05-R1 — GFM-таблицы и callout-блоки в MDX-документации (автопроверки пройдены)**. Дата: 26.11.2026. Ветка `main`, базовый коммит `8516307` (FIX-05).
- Причина: таблицы Markdown и блоки callout не рендерились (mdxRs работал без GFM; компонент `Note` был заменён).
- `next.config.mjs`: `experimental.mdxRs: true` → `experimental.mdxRs: { mdxType: 'gfm' }` — включён GFM-парсинер (таблицы, strikethrough, task-lists). Зависимости не менялись, `remark-gfm` не устанавливался.
- `mdx-components.js`: переписаны `DocsTable` (обёртка `div.docs-table-scroll` c `role="region"`, `tabIndex`, `aria-label`, вложенный `table`) и `DocsCallout` (заменил `Note`): проп `type` (`note`/`warning`/`danger`/`tip`, дефолт `note`), карта `calloutTitles` (Примечание/Внимание/Опасность/Рекомендация), классы `docs-callout` / `docs-callout--{type}`, опциональный заголовок в `p.docs-callout-title`, `createElement` без JSX. В `components` выводится как `DocsCallout`.
- `DocsTable` фильтрует неэлементные children: GFM-компиляция передаёт в `<table>` whitespace-текстовые узлы (`"\n"`), что вызывает hydration error (`whitespace text nodes cannot be a child of <table>`). Устранено через `Children.toArray(children).filter(isValidElement)` — в `<table>` доходят только секционные элементы. Проверено отдельным node-скриптом (5 узлов → 2 элемента, строк нет).
- `tests/docs.test.mjs`: устаревший тест `Note (callout) component` обновлён под новый API (`DocsCallout`, `type`, `calloutTitles`, `docs-callout--`); всего 67 тестов.
- `src/app/docs/style-preview/page.mdx`: обновлены вызовы `<note variant>` → `<DocsCallout type>`.
- CSS callout (`.docs-callout`, `--warning`, `--danger`, `--tip`, `.docs-callout-title`) и table-scroll уже присутствуют в `docs.css` (FIX-05), не изменены.
- Проверки: `git diff --check` PASS; `npm test` 67/67 PASS; `build`+`check:export` PASS (basePath=/, 124 local asset refs / 7 HTML); style-preview HTML: 1 `docs-table-scroll` + `<table>`, 5 callout-блоков c вариантами и заголовками (дефолтные заголовки корректны), 0 `<note>`.
- Dev-сервер перезапущен после смены `next.config.mjs` (один чистый инстанс на :3000, HTTP 200 на `/docs/style-preview/`).
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в среде; не подменено сборкой. Статичный HTML-контракт подтверждён.
- `git push` не выполнялся. Отдельная от FIX-06.
- Коммит по плану (владельцем после проверки): `fix(docs): enable GFM tables and callout blocks in MDX`.

Следующая выполнена: **FIX-05-R2 — устранение hydration error при рендеринге MDX-таблиц (автопроверки пройдены, браузерная проверка отложена)**. Дата: 26.11.2026. Ветка `main`, базовый коммит `cde326d` (FIX-05-R1).
- Причина: после включения GFM на странице `/docs/style-preview/` оставался hydration error — Rust MDX compiler расставляет whitespace-текстовые узлы (`"\n"`) внутри структурных элементов таблицы (`<table>`, `<thead>`, `<tbody>`, `<tr>`), а React запрещает такие узлы как детей этих HTML-элементов. Ошибка смещалась по уровням: сначала `<table>`, затем `<thead>`, затем `<tbody>`.
- Корень: подкомпоненты по уровням не срабатывали, потому что mdxRs НЕ передаёт вложенные `tbody`/`tr` через зарегистрированные компоненты — whitespace остаётся внутри уже собранного дерева. Попробованные и отклонённые пути: `isValidElement` (удаляет осмысленный текст ячеек), отдельная регистрация `thead`/`tbody`/`tr` (не вызываются mdxRs).
- `mdx-components.js` (итоговое решение): чистка на уровне `<table>`. `DocsTable` рекурсивно перестраивает всё дерево таблицы через `cleanTableChildren`/`rebuildTableElement` и набор `TABLE_STRUCTURE_TAGS` (`thead`, `tbody`, `tfoot`, `tr`, `caption`, `colgroup`, `col`): убирает whitespace-only строки на каждом структурном уровне, не трогая содержимое ячеек (`th`/`td` не переопределены — п. 7 задания). Подкомпоненты по уровням удалены (не нужны и не вызываются).
- Markdown-таблицы проходят через `DocsTable` и очищаются полностью; нативная JSX-таблица (стр. 240 `page.mdx`) записана в одну строку без whitespace и не требует чистки.
- `tests/docs.test.mjs`: регрессионные тесты переписаны под рекурсивный подход — определение `cleanTableChildren`/`rebuildTableElement`/`TABLE_STRUCTURE_TAGS`, запрет отдельной регистрации `thead`/`tbody`/`tr`, запрет переопределения `th`/`td`; поведенческий тест `DocsTable removes whitespace on every table level and keeps cell content` прогоняет реальный компонент `table` и проверяет, что whitespace-узлов на структурных уровнях нет, а содержимое ячеек сохранено. Устаревшие assertion на `isValidElement`, `normalizeTableChildren`, подкомпоненты по уровням удалены. Всего 69 тестов.
- `docs.css` не изменялся (п. 6). `mdxType: 'gfm'` сохранён. Зависимости не устанавливались. `suppressHydrationWarning` не использован. SSR не отключался. Тестовая страница не удалялась.
- Проверки: `git diff --check` PASS; `npm test` 69/69 PASS; `build`+`check:export` PASS (basePath=/, 126 local asset refs / 7 HTML); style-preview HTML структурно корректен: 4 `<table>` (3 Markdown + 1 нативная JSX), 4 `<thead>`, 4 `<tbody>`, 19 `<tr>` (сбалансированы), содержимое ячеек сохранено. Рекурсивная нормализация подтверждена изолированным прогоном в Node (whitespace на уровнях `table`/`tbody`/`tr` удалён, содержимое `A`/`B`/`CPU` сохранено).
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в среде. Согласно FIX-05-R2 проблема НЕ объявлена устранённой окончательно. Dev-сервер перезапущен владельцем (новый pid на :3000): отдаёт 200 на `/`, `/docs/`, `/docs/style-preview/`, HTML содержит 4 `<table>`, в логе ошибок компиляции нет. Браузерная проверка hydration (отсутствие `whitespace text node` в консоли) остаётся за владельцем — headless-браузер в среде недоступен.
- `git commit` и `git push` НЕ выполнялись (запрещено заданием). Изменения в `git`: `M mdx-components.js`, `M tests/docs.test.mjs`, `M docs/IMPLEMENTATION-STATE.md`.
- Коммит по плану (владельцем после браузерной проверки): `fix(docs): normalize MDX table children recursively to prevent hydration errors`.

Следующая выполнена: **FIX-05 + визуальное согласование каталога (часть FIX-04, стили)** — установка готового пакета стилей и автопроверки пройдены (дата 26.11.2026).
- Базовый коммит: `dfba4f2` (`fix(docs): resolve shared layout and metadata regressions`), ветка `main`; предусловие FIX-03-R1 установлено. Установка выполнена пакетом `edp-docs-style-v2/install.sh` (preflight `apply.py` без изменений → `--apply` → `--check-installed`), бэкап исходных файлов в `/var/folders/.../edp-docs-style-backup-44zxs330`.
- Изменены только два файла (read-only контракты manifest `contracts` совпали с проверяемым SHA и не перезаписаны): `src/app/docs/docs.css` и `mdx-components.js`. Изменения в `git`: `M src/app/docs/docs.css` (+190/−16), `M mdx-components.js` (+17/−... ); пользовательские незакоммиченные файлы не тронуты.
- Проверки (`edp-docs-style-v2/verify.sh`, exit 0): `git diff --check` PASS; `npm test` PASS — 53/53 (fail 0, cancelled 0, skipped 0, todo 0); production `build`+`check:export` PASS (basePath=/, 91 local asset refs / 6 HTML); `verify-html.py` HTML PASS /docs/ и /docs/overview/ (basePath=/); project `build`+`check:export` PASS (basePath=/edp-test, 91 refs / 6 HTML); `verify-html.py` HTML PASS (basePath=/edp-test); восстановление production `build`+`check:export`+HTML PASS (basePath=/). Production-экспорт восстановлен (текущий `out/`).
- Согласование с владельцем: перед сборкой был остановлен запущенный `next dev` (конкурирующий процесс Next.js на том же `.next/`); сборки выполнялись без него. Dev-сервер останавливал владелец по запросу.
- VISUAL_VALIDATION: NOT_RUN — реальная проверка в браузере не проводилась (браузер недоступен в среде); подмена статическим HTML-контрактным анализом (`verify-html.py` в обоих basePath, контракт пропущен как «not browser validation»).
- Статус FIX-04: НЕ объявлен выполненным — структурное упрощение каталога остаётся отдельной задачей. План не изменён, не переходили к другим FIX. `git push` не выполнялся.
- Коммит по плану (владельцем после проверки): `style(docs): unify catalog and MDX typography`.

Следующая выполнена: **FIX-05 — Аудит и дополнение стиля MDX-документов (автоматические проверки пройдены)**. Дата: 26.11.2026. Ветка `main`, базовый коммит `1e326b4` (merge FIX-04).
- Аудит установленного комплекта `edp-docs-style-v2`: CSS-правила из спецификации FIX-05 §6–§14 уже присутствуют в `src/app/docs/docs.css` после установки (commit `8516307`). Селекторы ограничены `#docs-content`, используются токены `--ink`, `--muted`, `--green`, `--line`, `--white`, `--mono`, `--dark`.
- FIX-04 overlay на `docs.css` (`.docs-start-card` и связанные классы) — намеренное наложение после установки, не отклонение от style-kit. SHA `docs.css` сместился с manifest `323e2765…` на `50b38825…` — ожидаемое расхождение.
- Добавлен компонент `Note` (callout) в `mdx-components.js`: `variant` (info/warning/danger/tip), `role="note"`, класс `docs-callout` / `docs-callout--{variant}`, опциональный `docs-callout-title`. Использует `createElement` (без JSX), экспортируется в `components` как `note`. SHA `mdx-components.js` сместился с manifest `6d2cb1ae…` на `71be52d9…` — ожидаемое расхождение.
- Добавлено 8 регрессионных тестов в `tests/docs.test.mjs` (53→61, итого 67 с учётом ранее существующих): scoping `#docs-content` (h1–h4, p, ul, ol, a, blockquote, pre, table, img, figure, callout variants); отсутствие утечки в глобальные селекторы; DocsTable ARIA region wrapper; Note (callout) компонент; дизайн-токены; table scroll wrapper + zebra striping; code block + inline code; callout variants.
- Не изменены: `globals.css`, `DocsLayout.jsx`, `Sidebar`, `TOC`, `src/app/docs/page.jsx` (каталог FIX-04), опубликованный MDX-контент, `overview/page.mdx`.
- Проверки: `git diff --check` PASS; `npm test` 67/67 PASS; `build`+`check:export` PASS (basePath=/, 91 local asset refs / 6 HTML).
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в среде; не подменено сборкой. Статичный HTML-контракт подтверждён.
- `git push` не выполнялся. Отдельная от FIX-04 structural catalog и FIX-06.
- Коммит по плану (владельцем после проверки): `style(docs): standardize technical documentation typography`.

Следующая выполнена: **FIX-05-R3 — Единое выравнивание контента документации (автопроверки пройдены, браузерная проверка отложена)**. Дата: 26.11.2026. Ветка `main`.
- Причина: на страницах `/docs/` (каталог) и `/docs/overview/` (статья) горизонтальный отступ между Sidebar и основным контентом различался — у `.docs-article` и `.docs-catalog` стояло `margin-inline: auto` при разной максимальной ширине (статья 820px, каталог 1100px), из-за чего контент центрировался и левые границы расходились.
- `src/app/docs/docs.css`: в правиле `.docs-article, .docs-catalog` заменено `margin-inline: auto` на `margin-inline: 0 auto` (левая граница контента прижата к началу main-колонки, правый отступ остаётся авто). Единое выравнивание при одинаковом viewport.
- Сохранено: max-width статьи `var(--docs-content-width)` = 820px; max-width каталога 1100px; padding `.docs-main` (`32px 40px 64px`); адаптивные breakpoints (`1199px`, `899px`, `820px`, `639px`); ширина Sidebar `256px` (`224px` при `max-width:1199px`) и TOC `224px`.
- Не изменялись (read-only): `DocsLayout.jsx`, `globals.css`, MDX-компоненты (`mdx-components.js`), типографика; зависимости не устанавливались.
- `git diff --check` — чисто. `npm test` — 69/69 PASS (fail 0, cancelled 0, skipped 0, todo 0). Изменён только `src/app/docs/docs.css` (одна строка) и этот журнал.
- VISUAL_VALIDATION: NOT_RUN — браузер недоступен в среде; подмена статическим анализом: правка ограничена одной декларацией margin, не затрагивает layout-сетку `docs-shell`, padding и breakpoints, поэтому адаптивность и отсутствие горизонтального переполнения сохраняются. Ручная проверка обеих страниц при одинаковом viewport и масштабе 100% отложена владельцу.
- `git commit` и `git push` не выполнялись (запрещено заданием). Не переходили к следующим FIX.

### Изменённые файлы (последний раз)

| Файл | Статус | Замечание |
|---|---|---|
| `mdx-components.js` | M | Добавлен компонент `Note` (callout): `variant` (info/warning/danger/tip), `role="note"`, классы `docs-callout` / `docs-callout--{variant}`, опциональный `docs-callout-title`. Использует `createElement`, экспортируется в `components` как `note`. SHA `71be52d9…` (manifest `6d2cb1ae…`, расхождение ожидаемо). |
| `tests/docs.test.mjs` | M | Добавлено 8 регрессионных тестов (53→61, итого 67): scoping `#docs-content` (h1–h4, p, ul, ol, a, blockquote, pre, table, img, figure, callout variants), отсутствие утечки в глобальные селекторы, DocsTable ARIA region wrapper, Note компонент, дизайн-токены, table scroll + zebra, code block + inline code, callout variants. |
| `docs/IMPLEMENTATION-STATE.md` | M | Этот файл. Записи FIX-05 и FIX-05-R3 добавлены; таблица обновлена под FIX-05-R3. |
| `src/app/docs/docs.css` | M | FIX-05-R3: в `.docs-article, .docs-catalog` `margin-inline: auto` → `margin-inline: 0 auto` (единое выравнивание левых границ статьи и каталога). Одна строка. |
| `src/app/globals.css` | — | Не изменён (read-only). |
| `src/components/DocsLayout.jsx` | — | Не изменён (read-only, SHA `e4961fdd…`). |
| `src/app/docs/page.jsx` | — | Не изменён (каталог FIX-04, read-only). |
| `src/app/docs/overview/page.mdx` | — | Не изменён (опубликованный MDX-контент, read-only). |

Следующая выполнена: **FIX-04 — Компактный каталог документации (завершена, автопроверки пройдены)**. Дата: 26.11.2026. Рабочая ветка: `fix/fix-04-compact-catalog`.

### Изменения

- `src/app/docs/page.jsx`: полная переписанная структура. Убран маркетинговый hero (`.docs-hero`), длинная вводная часть (`.docs-start`). Новая структура: `docs-lead` (краткая подсказка), `docs-start-card` (один блок "Начните здесь" с ссылкой на `getGettingStarted()`), `docs-cards` (сетка карточек из `docs` массива `site.mjs` с бейджем статуса `getSectionStatus()`, topics, published-карточки как `<a>`, non-published как `<article>`), `docs-published` (раздел "Другие материалы" — опубликованные документы, не вошедшие в каталог, с дедупликацией `getGettingStarted()` и каталог-слегов), `docs-note` (подсказка про контакт). Все ссылки через `linkHref`. `DocsLayout` не изменён.
- `src/app/docs/docs.css`: заменён блок старых стилей (`.docs-hero`, `.docs-start`, `.docs-start-link`, `.docs-list-intro`, `.docs-start-empty`, `.arrow`) на новые: `.docs-lead`, `.docs-start-card`, `.docs-start-label`, `.docs-cards`, `.docs-card`, `.docs-card--published`, `.docs-topics`, `.docs-topic`, `.docs-card-status`, `.docs-note`, `.docs-published`. Мобильная адаптация: `@media (max-width: 639px)` — `.docs-cards` в одну колонку, gap 14px. Все токены из `globals.css` (`--green`, `--ink`, `--muted`, `--line`, `--mono`, `--docs-note`, `--docs-sidebar-bg`, `--docs-active`).
- `tests/docs.test.mjs`: добавлены 7 регрессионных тестов: (1) компактная структура — нет `.docs-hero`, есть `.docs-start-card` и `.docs-cards`; (2) использование `getGettingStarted`/`getSectionStatus`; (3) CSS определяет новые классы; (4) дедупликация getting-started из "Других материалов"; (5) корректные статусы (Доступно/В разработке/Скоро); (6) один H1, нет hero и старых `.docs-start`.

### Автопроверки

- `npm test` — 59/59 PASS (fail 0, cancelled 0, skipped 0, todo 0).
- `npm run build` — production сборка успешно (7 routes: `/`, `/_not-found`, `/docs`, `/docs/overview`, `/robots.txt`, `/sitemap.xml` + static assets).
- `npm run check:export` — PASS (91 local asset references, 6 HTML files, basePath=/).
- `git diff --check` — whitespace clean.
- Ветка: `fix/fix-04-compact-catalog`. Изменены 4 файла: `src/app/docs/page.jsx`, `src/app/docs/docs.css`, `tests/docs.test.mjs`, `docs/IMPLEMENTATION-STATE.md`.
- `git push` не выполнялся. Отдельная от других FIX. Отдельная от реорганизации доменов (FIX-02).
