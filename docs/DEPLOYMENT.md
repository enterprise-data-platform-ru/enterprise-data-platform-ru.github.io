# Enterprise Data Platform — развёртывание на GitHub Pages

Цель: автоматическая публикация статического сайта Next.js на https://enterprisedataplatform.ru после изменения ветки `main`.

Примеры предполагают репозиторий `letenkov/enterprise-data-platform` и npm. Если имя репозитория или владелец отличаются, подставь свои значения. Это инструкция, а не подтверждение уже выполненной настройки.

## 1. Схема развёртывания

```text
macOS / VS Code / Qwen Code
           |
       git push
           |
     GitHub (main)
           |
     GitHub Actions
       npm ci
       npm run build
           |
        out/
           |
      GitHub Pages
           |
   enterprisedataplatform.ru (HTTPS)
```

GitHub Pages обслуживает только статические файлы. Node.js используется для сборки в CI, а не для работы сайта. SSR на каждый запрос, Server Actions и серверные API требуют отдельного хостинга. Для публичной демонстрации или документации проекта Pages подходит; если сайт предназначен для ведения онлайн-бизнеса, коммерческих транзакций или коммерческого SaaS, используй подходящий другой хостинг согласно [ограничениям GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## 2. Проверка локальной сборки

Выполни из корня проекта:

```bash
node -v
npm -v
git status
cat package.json
```

Если есть `package-lock.json`:

```bash
npm ci
```

Если lock-файла ещё нет:

```bash
npm install
```

Добавь `package-lock.json` в Git. Используй поддерживаемую LTS-версию Node.js, совместимую с `engines` и версиями зависимостей проекта (в примере CI используется Node.js 22).

### Настройка Next.js

В существующем `next.config.mjs` (или другом используемом файле конфигурации) объедини текущие настройки со следующими:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

Не создавай второй конфигурационный файл, если первый уже существует. Для собственного домена в корне сайта `basePath` и `assetPrefix` обычно не нужны; убери значения, добавляющие `/enterprise-data-platform`, если они остались от шаблона проектного URL GitHub Pages. Если нужно также поддерживать публикацию по URL `https://letenkov.github.io/enterprise-data-platform/` без собственного домена, это отдельный вариант сборки с `basePath` и корректными путями к ресурсам.

```bash
npm run build
test -f out/index.html && echo 'Static export OK'
python3 -m http.server 8000 --directory out
```

Открой http://localhost:8000 и проверь меню, изображения, CSS и переходы. Останови сервер через Ctrl+C. Не используй `next start` для статического экспорта.

В `.gitignore` должны быть исключены `node_modules/`, `.next/`, `out/`, локальные `.env*` с секретами. Не исключай `package-lock.json`. Всё, что попадает в статические файлы, публично.

## 3. Подготовка репозитория GitHub

Если репозиторий ещё не создан, создай его через https://github.com/new. Для бесплатного GitHub Pages выбирай Public; для частного репозитория нужен подходящий платный план GitHub, а опубликованный сайт обычно всё равно публичный. Не размещай секреты и закрытые данные.

Проверь локальную конфигурацию:

```bash
git status
git remote -v
git branch --show-current
```

Для нового локального проекта без Git выполни `git init -b main`. Если `origin` ещё не существует, добавь его:

```bash
git remote add origin git@github.com:letenkov/enterprise-data-platform.git
```

Если `origin` уже есть, проверь его, не добавляй повторно. Для SSH заранее настрой ключ в GitHub; при необходимости используй HTTPS URL. Если удалённый репозиторий уже имеет историю, сначала синхронизируй её, не используй принудительный push.

Для нового репозитория загрузи исходники (после проверки `git status` и `.gitignore`):

```bash
git add .
git commit -m "Initialize Enterprise Data Platform website"
git push -u origin main
```

Для существующего репозитория пропусти инициализацию и используй обычный commit/push. Если основная ветка называется иначе, адаптируй команды и workflow.

## 4. Включение GitHub Pages

1. Открой репозиторий → **Settings → Pages**.
2. В разделе **Build and deployment → Source** выбери **GitHub Actions**.
3. Не выбирай публикацию из ветки `gh-pages` или папки `docs` — в этой схеме публикуется артефакт сборки.
4. Проверь, что Actions разрешены в настройках репозитория.

## 5. GitHub Actions workflow

Проверь, нет ли уже workflow для Pages в `.github/workflows/`. Используй один процесс публикации, чтобы исключить конфликт нескольких deployment jobs.

Создай или обнови `.github/workflows/deploy.yml`:

```yaml
name: Deploy website to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: npm ci

      - name: Build static website
        run: npm run build

      - name: Check export
        run: test -f out/index.html

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

В этом варианте настройки Next.js контролируются в репозитории, поэтому `static_site_generator: next` не используется. Отдельный PAT или SSH-ключ в Secrets для публикации не нужен: используется штатный `GITHUB_TOKEN`. Для усиления supply-chain security можно закрепить используемые Actions по проверенным commit SHA и обновлять их через Dependabot.

## 6. Подтверждение владения доменом

До перенаправления домена на GitHub Pages рекомендуется подтвердить владение:

1. Открой настройки личного аккаунта GitHub → **Pages** (для организации — её настройки Pages).
2. Нажми **Add a domain** и введи `enterprisedataplatform.ru`.
3. Скопируй выданные GitHub имя TXT-записи и уникальное значение.
4. Добавь TXT в DNS-панели провайдера домена. Не придумывай значение токена; используй выданное GitHub. Если DNS-панель автоматически дописывает домен, введи только относительное имя.
5. Нажми **Verify** после обновления DNS. Сохрани TXT-запись и после подтверждения.

## 7. Подключение собственного домена

В репозитории открой **Settings → Pages → Custom domain**. Введи `enterprisedataplatform.ru` (без `https://` и без завершающего `/`) и нажми Save. Только после этого направляй DNS на GitHub Pages. Проверка DNS в интерфейсе может пока завершаться ошибкой — это нормально до внесения записей.

Открой DNS-панель провайдера, обслуживающего авторитетные NS домена (например, REG.RU, если DNS обслуживает он). Укажи записи:

| Тип | Имя | Значение | TTL, сек |
|---|---|---|---:|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | letenkov.github.io. | 3600 |

Для IPv6 при необходимости добавь все четыре AAAA:

| Тип | Имя | Значение |
|---|---|---|
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |

`@` — корень домена. CNAME для `www` указывает на владельца репозитория без имени репозитория и протокола. При наличии корректных записей GitHub Pages перенаправит `www` на основной домен. Удали только конфликтующие старые A/AAAA/CNAME для этих имён, сохрани MX, TXT и другие записи, необходимые почте и сторонним сервисам. Не добавляй wildcard `*` на GitHub Pages. Если DNS провайдер поддерживает проксирование, для первоначальной настройки используй DNS-only.

При публикации через Actions файл `CNAME` в репозитории не управляет доменом и не требуется: домен задаётся через Settings → Pages.

### Проверка DNS

```bash
dig +short NS enterprisedataplatform.ru
dig +short A enterprisedataplatform.ru
dig +short AAAA enterprisedataplatform.ru
dig +short CNAME www.enterprisedataplatform.ru
dig @1.1.1.1 +short A enterprisedataplatform.ru
```

Проверь, что A-записи соответствуют таблице, а CNAME возвращает `letenkov.github.io.`. DNS может обновляться до 24 часов.

## 8. Первый деплой и HTTPS

```bash
npm ci
npm run build
git status
git add .github/workflows/deploy.yml
# Добавь также изменённый файл next.config.*, package-lock.json и документацию,
# если они действительно менялись. Проверь содержимое индекса.
git diff --cached --stat
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

В GitHub открой вкладку Actions → Deploy website to GitHub Pages. Проверь успешное завершение jobs `build` и `deploy`. Можно запустить workflow вручную через Run workflow, выбрав `main`.

В Settings → Pages дождись успешной проверки DNS и выпуска сертификата, затем включи **Enforce HTTPS**. Выпуск сертификата может потребовать дополнительного времени (иногда до 24 часов). Самостоятельно приобретать TLS-сертификат не нужно.

```bash
curl -IL https://enterprisedataplatform.ru/
curl -IL https://www.enterprisedataplatform.ru/
curl -IL http://enterprisedataplatform.ru/
```

Ожидаемый результат: основной HTTPS URL возвращает 200; HTTP и www перенаправляются на основной HTTPS URL. Проверь также сайт в браузере и отсутствие ошибок загрузки в DevTools → Network.

## 9. Повседневная разработка

```bash
git switch main
git pull --ff-only
npm ci
npm run dev
```

Для изменений используй отдельную ветку, локальную проверку и pull request:

```bash
git switch -c feature/update-landing
# Внести изменения
npm run build
git add <изменённые-файлы>
git commit -m "Update landing page"
git push -u origin feature/update-landing
```

После merge в `main` сайт публикуется автоматически. Для отката создай revert-коммит для проблемного изменения и отправь его в `main` через обычный процесс review (для merge-коммита учитывай выбор mainline). Не переписывай публичную историю.

## 10. Диагностика

| Симптом | Что проверить |
|---|---|
| `sh: next: command not found` | Установить зависимости через `npm ci` или `npm install` при отсутствии lock-файла. |
| `npm ci` завершается ошибкой | Согласованность package.json и package-lock.json, версия Node.js. |
| `out/` отсутствует | `output: 'export'` и лог `npm run build`. |
| `404` на главной | Выбран ли GitHub Actions, успешен ли deploy, есть ли `out/index.html`. |
| `404` на CSS/JS/картинках | Ошибочный `basePath`/`assetPrefix`, пути к файлам, регистр имён. |
| `Resource not accessible by integration` | Права workflow, разрешения Actions, ограничения environment. |
| `DNS check unsuccessful` | Авторитетные NS, A/AAAA/CNAME, отсутствие конфликтов. |
| `Enforce HTTPS` недоступен | DNS, сертификат, ограничения CAA (при наличии должен быть разрешён letsencrypt.org). |
| `Operation not permitted` в терминале VS Code | macOS TCC; см. ниже. |

### Проверенное решение проблемы доступа к Downloads на macOS

Если VS Code не может прочитать рабочую папку и Homebrew сообщает, что текущая директория недоступна, полностью закрой VS Code и из обычного Terminal.app выполни:

```bash
tccutil reset SystemPolicyDownloadsFolder com.microsoft.VSCode
```

Снова открой VS Code и разреши доступ к Downloads при запросе macOS. При необходимости проверь System Settings → Privacy & Security → Files and Folders. Для рабочих репозиториев предпочтительно использовать `~/Projects`, а не `~/Downloads`. Не меняй UNIX-права рекурсивно для обхода TCC.

## 11. Чек-лист готовности

- [ ] Репозиторий создан, исходники и lock-файл находятся в Git.
- [ ] Локальная сборка создаёт `out/index.html`.
- [ ] В Settings → Pages выбран GitHub Actions.
- [ ] Домен подтверждён в настройках владельца репозитория.
- [ ] Custom domain сохранён, DNS настроен.
- [ ] Workflow `build` и `deploy` завершается успешно.
- [ ] HTTPS работает, Enforce HTTPS включён.
- [ ] WWW и HTTP перенаправляются на основной HTTPS URL.
- [ ] CSS, изображения и внутренние ссылки работают.
- [ ] Изменения в main автоматически публикуются.
- [ ] В Git и публичных файлах отсутствуют секреты.

## Документация

- [Next.js — Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [GitHub Pages — Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages — Custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub — Next.js starter workflow](https://github.com/actions/starter-workflows/blob/main/pages/nextjs.yml)
- [GitHub Pages — Custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages — Verify domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [GitHub Pages — HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
