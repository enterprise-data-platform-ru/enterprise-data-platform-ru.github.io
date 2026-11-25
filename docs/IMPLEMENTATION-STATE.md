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

`src/lib/paths.mjs` (текущий контракт, **A01 не выполнялся**):
- `normalizeBasePath(value)` — нормализация и валидация префикса (запрет `..`, `//`, схем).
- `basePath` — вычисляется из `NEXT_PUBLIC_BASE_PATH` на момент сборки.
- `assetPath(path)` — добавляет `basePath` к локальным root-relative путям.
- Отдельной функции формирования `href` для кросс-страничной навигации **пока нет** — это задача A01. Существующий `<a>` в компонентах не использует префикс (проверяется в A01/A02).

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

**A01 — Единый помощник для ссылок** (зависимость: A00, завершена).
- Читать/изменять: `src/lib/paths.mjs`, `tests/paths.test.mjs`.
- Сохранить `normalizeBasePath`, `basePath`, `assetPath` и их контракт.
- Добавить чистую функцию формирования `href` с параметром префикса: `#platform` → `/#platform` (пустой basePath) и `/edp/#platform` (префикс); `/docs/` → `/docs/` или `/edp/docs/`.
- Не применять префикс к внешним `https://` и `mailto:`; запрет двойного префикса и небезопасных схем; явный контракт входных значений.
- Не применять ручной префикс к `next/link`; сохранить обычные `<a>`.
- Коммит (по плану): `fix: centralize cross-page navigation paths`.
- **A01 не выполнялся в рамках A00.**
