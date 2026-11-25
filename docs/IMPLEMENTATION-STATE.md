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

Следующая: **A04 — SEO и доступность страницы документации** (`src/app/docs/page.jsx`, `sitemap.js`, при необходимости `layout.jsx`).
