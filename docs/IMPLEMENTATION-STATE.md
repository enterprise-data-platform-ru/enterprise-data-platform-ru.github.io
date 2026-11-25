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

Следующая задача: **B03 — реестр документации и маршруты** (зависимость: B02).
