# Enterprise Data Platform

Русскоязычный сайт и портал документации для [enterprisedataplatform.ru](https://enterprisedataplatform.ru).

Независимый архитектурный проект, посвящённый корпоративным платформам данных. Репозиторий содержит статический сайт с каталогом документации, а не готовую платформу данных или сертифицированный продукт. Сайт собирается на Next.js App Router и React; статьи документации используют MDX.

## Документация

Документация сайта доступна по маршрутам `/docs/` и `/docs/overview/`. Документы для разработки и эксплуатации репозитория находятся в каталоге `docs/`.

| Документ | Назначение |
|---|---|
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | Подготовка окружения, первый запуск, настройка VS Code и устранение ошибок macOS и npm |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Полный процесс развёртывания, CI/CD, DNS, HTTPS, диагностика и откат |
| [GITHUB-PAGES.md](docs/GITHUB-PAGES.md) | Настройка GitHub Pages для текущего проекта, собственного домена и путей статических ресурсов |
| [ROADMAP.md](docs/ROADMAP.md) | Первоначальные этапы развития проекта |
| [IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) | План развития сайта и портала документации |
| [IMPLEMENTATION-STATE.md](docs/IMPLEMENTATION-STATE.md) | Журнал реализации и результатов проверок |
| [IMPLEMENTATION-FIX-VALIDATION.md](docs/IMPLEMENTATION-FIX-VALIDATION.md) | Результаты итоговой проверки документации и открытые вопросы |
| [Архив исправлений документации](docs/archive/documentation-fixes/README.md) | Исторические задания FIX и план их выполнения |
| [ADR 0001](docs/adr/0001-documentation-engine.md) | Решение о движке документации |
| [AGENTS.md](AGENTS.md) | Инструкции для работы агентов в репозитории |
| [VALIDATION.md](docs/VALIDATION.md) | Исторические результаты проверок стартовой версии |
| [REFERENCES.md](docs/REFERENCES.md) | Архитектурные и визуальные референсы |

При первом знакомстве с проектом начните с [GETTING_STARTED.md](docs/GETTING_STARTED.md). Для публикации используйте [DEPLOYMENT.md](docs/DEPLOYMENT.md) совместно с [GITHUB-PAGES.md](docs/GITHUB-PAGES.md). При расхождениях в примерах workflow ориентируйтесь на фактическую конфигурацию `.github/workflows/ci.yml`.

## Быстрый просмотр без Node.js

Откройте `preview/index.html` в браузере. Это исторический автономный снимок главной страницы. Он не отражает последующие изменения сайта и документации и не заменяет проверку актуальной сборки.

## Локальная разработка

Требуется Node.js 22+ и npm. Для работы с репозиторием также потребуется Git.

Проверьте окружение:

```bash
node --version
npm --version
git --version
```

В корне проекта выполните:

```bash
npm ci
npm test
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

`package-lock.json` хранится в репозитории; `npm ci` устанавливает зависимости по lock-файлу. Точные версии определяются `package.json` и lock-файлом.

### macOS и Visual Studio Code

Рекомендуется хранить рабочие проекты в `~/Projects`, а не в защищённых каталогах `Downloads`, `Desktop` или `Documents`.

Если встроенный терминал VS Code возвращает `Operation not permitted` при чтении каталога Downloads, полностью закройте VS Code (`Cmd + Q`) и выполните в обычном Terminal.app:

```bash
tccutil reset SystemPolicyDownloadsFolder com.microsoft.VSCode
```

Затем снова откройте VS Code и разрешите доступ к Downloads при появлении системного запроса. Этот способ помог устранить проблему доступа при первоначальной настройке проекта.

Если `npm run build` завершается ошибкой `sh: next: command not found`, установите зависимости командой `npm ci`. Глобальная установка Next.js не требуется.

Подробнее: [Начало работы](docs/GETTING_STARTED.md).

## Сборка и проверка

```bash
npm test
npm run build
npm run check:export
npm run preview
```

Next.js экспортирует сайт в `out/`. Это статические HTML/CSS/JS-файлы, которые можно разместить на GitHub Pages, Nginx, S3-совместимом хостинге или CDN. Node.js в production не требуется.

`npm run preview` запускает локальный HTTP-сервер для `out/`. Используйте его для проверки результата сборки перед публикацией. Не редактируйте `out/` вручную: изменения необходимо вносить в исходники.

Для проверки размещения под префиксом GitHub Pages выполните сборку и проверку с одинаковым `NEXT_PUBLIC_BASE_PATH`, затем восстановите обычный экспорт:

```bash
NEXT_PUBLIC_BASE_PATH=/edp-test npm run build
NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export
```

При просмотре сборки с префиксом запустите `NEXT_PUBLIC_BASE_PATH=/edp-test npm run preview` и откройте `http://localhost:3000/edp-test/`. Для проверки адаптивности и поведения навигации используйте браузер: сборка и автоматические тесты не заменяют визуальную приёмку.

Демонстрационные маршруты `/docs/style-preview/` исключены из sitemap и помечены `noindex`, но входят в `out/` и доступны по прямому адресу. Перед публикацией отдельно решите, должны ли они входить в релиз.

## Публикация

### GitHub Pages — основной вариант

Целевой домен: [https://enterprisedataplatform.ru](https://enterprisedataplatform.ru).

Проект предусматривает автоматический workflow `.github/workflows/ci.yml`: pull request проверяет проект, push в `main` собирает и публикует `out/`. Для собственного домена и временного URL GitHub Pages предусмотрено автоматическое определение `basePath`.

Первоначальная настройка:

1. Загрузите проект в репозиторий GitHub, включая `package-lock.json`.
2. Откройте **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Запустите предусмотренный проектом workflow (либо выполните push в `main`).
4. Проверьте результат сборки и публикации во вкладке **Actions**.
5. Настройте собственный домен, DNS и HTTPS согласно документации.

Дальнейшие изменения публикуются через GitHub Actions после push в `main` при успешной сборке.

Подробные инструкции:

- [GitHub Pages, DNS и HTTPS](docs/GITHUB-PAGES.md) — настройки текущего проекта.
- [Развёртывание и эксплуатация](docs/DEPLOYMENT.md) — полный процесс, CI/CD, диагностика и откат.

GitHub Pages используется для демонстрационного статического сайта. При переходе к коммерческому сервису или появлении серверных функций необходимо пересмотреть выбор хостинга и условия его использования.

### Docker — альтернативный вариант

```bash
docker build -t edp-website:0.2 .
docker run --rm -p 8080:80 edp-website:0.2
```

Откройте [http://localhost:8080](http://localhost:8080). TLS настраивается на внешнем reverse proxy или ingress; конфигурация Nginx внутри контейнера обслуживает HTTP.

## Структура проекта

```text
enterprise-data-platform/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── DEPLOYMENT.md
│   ├── GETTING_STARTED.md
│   ├── GITHUB-PAGES.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── IMPLEMENTATION-STATE.md
│   ├── IMPLEMENTATION-FIX-VALIDATION.md
│   ├── adr/
│   └── archive/
├── preview/
│   └── index.html
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── content/
│   └── lib/
├── AGENTS.md
├── package.json
├── package-lock.json
└── README.md
```

Основные точки изменения:

| Файл или каталог | Назначение |
|---|---|
| `src/content/site.mjs` | Тексты модулей, сценариев, FAQ, домен, email |
| `src/app/page.jsx` | Порядок секций главной страницы |
| `src/app/docs/` | Каталог, MDX-статьи и стили документации |
| `src/content/docs/navigation.mjs` | Реестр документации и статусы публикации |
| `src/app/layout.jsx` | SEO, метаданные, Open Graph |
| `src/app/globals.css` | Дизайн-токены, сетки, адаптивность |
| `src/components/` | React-компоненты страницы |
| `src/lib/paths.mjs` | Префиксы путей для GitHub Pages |
| `public/` | Оригинальная векторная графика, favicon, OG |
| `.github/workflows/ci.yml` | Проверки, сборка и публикация |
| `docs/` | Техническая документация |
| `preview/` | Автономный снимок для быстрого просмотра |
| `AGENTS.md` | Правила работы в проекте |

## Работа над проектом

Начните с [AGENTS.md](AGENTS.md), затем изучите относящиеся к задаче части [плана реализации](docs/IMPLEMENTATION-PLAN.md) и последние записи [журнала](docs/IMPLEMENTATION-STATE.md). Исторические результаты проверок не заменяют запуск проверок текущего состояния.

Вносите небольшие изменения, проверяйте `git diff`, тесты, сборку и экспорт. Для изменений интерфейса дополнительно проверяйте сайт в браузере. Не публикуйте изменения и не меняйте настройки GitHub или DNS без согласования.

Не добавляйте в Git `node_modules/`, `.next/`, `out/`, секреты и локальные конфигурации с учётными данными.

## Источники и подход

- [AXIVO Website](https://github.com/axivo/website) — архитектурный референс Next.js/React, компонентный подход и ориентация на документацию. AXIVO использует также Nextra, Tailwind и Cloudflare; в MVP эти зависимости намеренно не добавлены. Исходный код AXIVO не копировался.
- [Arenadata](https://arenadata.tech/ru) — референс структуры продуктового лендинга: компоненты, логическая схема, сценарии и FAQ. Тексты, визуальные материалы и бренд Arenadata не использованы.

Дополнительная информация: [REFERENCES.md](docs/REFERENCES.md).

## Перед публикацией

- [ ] Подтвердить позиционирование, тексты, перечень реально доступных услуг и продуктов.
- [ ] Подтвердить работоспособность контактного email из `src/content/site.mjs`; ссылка использует `mailto:`, сбор данных на сайте не реализован.
- [ ] Выполнить `npm ci`, `npm test`, сборку и `npm run check:export`.
- [ ] Проверить собранный `out/` через `npm run preview`, включая адаптивность, ссылки и ресурсы.
- [ ] Проверить CI/CD, DNS, TLS, Open Graph и SEO.
- [ ] При включении форм или аналитики подготовить применимые юридические документы и согласия.
- [ ] Зафиксировать результаты фактических проверок в относящейся к задаче документации.

[VALIDATION.md](docs/VALIDATION.md) сохраняет результаты первоначальной подготовки. Последующие локальные проверки описаны в [журнале реализации](docs/IMPLEMENTATION-STATE.md); состояние реального деплоя следует проверять отдельно.

## Ограничения MVP

Нет внешних шрифтов, аналитики, трекеров, сторонних CDN, вымышленных кейсов клиентов или сертификатов. Названия open-source технологий приведены как возможные компоненты архитектуры; это не подтверждение партнёрства или наличия реализованных интеграций.
