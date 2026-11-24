# GitHub Organization — Enterprise Data Platform

Руководство по первоначальной настройке организации `enterprise-data-platform-ru` и развитию репозиториев. Для существующего Next.js-лендинга, GitHub Actions, macOS, VS Code и Qwen Code.

## 1. Целевая структура

Организация: https://github.com/enterprise-data-platform-ru

Сайт: https://enterprisedataplatform.ru

| Repository | Description (для поля GitHub) | Visibility | Этап |
|---|---|---|---|
| `.github` | Organization profile and shared community health files | Public | P0 |
| `enterprise-data-platform-ru.github.io` | Official project website and architecture showcase for Enterprise Data Platform | Public | P0 |
| `architecture` | Reference architecture, design decisions and C4 diagrams | Public после ревью | P1 |
| `platform` | Enterprise data platform reference implementation | Private | P1 |
| `infrastructure` | Infrastructure as code and GitOps for platform environments | Private | P1 |
| `helm-charts` | Reusable Helm charts for platform components | Public после ревью | P2 |
| `examples` | Reproducible data pipelines and integration examples | Public после ревью | P2 |
| `benchmarks` | Reproducible performance benchmarks and experiments | Public после ревью | P2 |
| `docs` | Public technical documentation portal | Public | P2 |
| `labs` | Experimental prototypes and technical investigations | Private первоначально | P2 |

Создать сейчас только P0. На P1 начать с минимальной реализации; `infrastructure` можно первоначально хранить внутри `platform`, а `architecture` — в `platform/docs/`. Выносить в отдельные репозитории, когда появятся самостоятельные версии, владельцы, права или циклы поставки. Не создавать отдельный репозиторий под каждый сторонний компонент.

## 2. Профиль и безопасность организации

Открыть https://github.com/organizations/enterprise-data-platform-ru/settings/profile (или Organization → Settings → Profile).

| Поле | Рекомендуемое значение |
|---|---|
| Display name | Enterprise Data Platform |
| Description | Независимый архитектурный проект и референсная реализация современной корпоративной платформы данных. |
| Website | https://enterprisedataplatform.ru |
| Email | Только действующий публичный адрес проекта, если есть |
| Location | Необязательно |
| Avatar | Собственный логотип проекта |

Не указывать несуществующих клиентов, партнёрства, юридическое лицо или сертификаты.

В Organization → Settings:

- **Member privileges**: Base permissions = No permission; публичные репозитории всё равно доступны на чтение. Создание репозиториев и изменение visibility — только владельцы, насколько позволяет тариф.
- **Repository defaults**: default branch = `main` (если раздел присутствует).
- **Security / Authentication security**: включить требование 2FA после проверки собственного доступа, recovery codes и доступа других участников. Предпочтительны passkey, security key или TOTP.
- **Actions → General**: разрешить GitHub Actions; ограничить разрешённые Actions доверенными источниками, убедившись, что все зависимости существующего `ci.yml` разрешены. Workflow permissions = Read repository contents and packages permissions. Не разрешать Actions создавать и одобрять PR без реальной необходимости.
- **Pages**: разрешить публичные Pages, если настройка доступна; здесь же верифицировать домен (раздел 6).
- **People / Teams**: один владелец на старте допустим; позже добавить резервного владельца только при наличии доверенного человека. Не использовать общий аккаунт. Команды `maintainers`, `contributors` создавать при появлении участников.
- Не включать платные security-функции и runners без проверки Billing. На Free некоторые настройки доступны только публичным репозиториям, организационные rulesets требуют Team или Enterprise.

## 3. Репозиторий сайта

Форма: https://github.com/organizations/enterprise-data-platform-ru/repositories/new

| Поле | Значение |
|---|---|
| Owner | `enterprise-data-platform-ru` |
| Repository name | `enterprise-data-platform-ru.github.io` |
| Description | Official project website and architecture showcase for Enterprise Data Platform |
| Visibility | Public |
| Template | No template |
| Add README | Off |
| Add .gitignore | None |
| Add license | None на этом шаге |

Нажать Create repository. Репозиторий оставляем пустым, поскольку README, .gitignore и исходники уже находятся локально. Лицензию определить осознанно перед дальнейшим распространением: Apache-2.0 или MIT для оригинального открытого кода; отдельные условия для текстов/графики при необходимости. Отсутствие лицензии не делает код open source.

Имя `<organization>.github.io` создаёт основной сайт организации в корне URL https://enterprise-data-platform-ru.github.io/ . Это упрощает `basePath` Next.js. Альтернатива — репозиторий `website`, но его обычный Pages URL будет содержать `/website/`. Не создавать оба репозитория для одной копии сайта.

### 3.1. Подготовка локального проекта

Перейти в существующую директорию проекта (уточнить путь при необходимости):

```bash
cd ~/Downloads/enterprise-data-platform
# либо cd ~/Projects/enterprise-data-platform
node --version
npm --version
```

При ошибке `Operation not permitted` в VS Code закрыть приложение Cmd+Q, выполнить в обычном Terminal.app:

```bash
tccutil reset SystemPolicyDownloadsFolder com.microsoft.VSCode
```

Открыть VS Code, разрешить доступ к Downloads. Предпочтительно хранить исходники в `~/Projects`.

```bash
# При наличии package-lock.json:
npm ci
# Если lock-файла ещё нет, вместо npm ci выполнить npm install
npm test
npm run build
npm run preview
```

Проверить `out/index.html`, стили и навигацию. Зафиксировать `package-lock.json` в Git. Не публиковать `node_modules/`, `.next/`, `out/`, реальные `.env*`, приватные ключи, kubeconfig, токены, Terraform state. Проверить также ранее созданную историю Git: удаление файла из рабочего дерева не удаляет его из истории. При обнаружении секрета — отозвать/заменить его до публикации.

### 3.2. Авторизация и первый push

```bash
brew install gh
# если gh ещё не установлен
gh auth login
gh auth status
```

В существующем проекте:

```bash
git status
git remote -v
```

Если Git ещё не инициализирован:

```bash
git init -b main
```

После ревью содержимого и .gitignore:

```bash
git add .
git diff --cached --stat
git diff --cached --name-only
git commit -m "chore: initialize enterprise data platform website"
```

Если коммит уже существует и изменений нет, повторный commit не нужен. Убедиться, что текущая ветка — именно ветка, которую нужно публиковать как `main` (`git branch --show-current`); при необходимости `git branch -m main`, если такой ветки ещё нет.

Если `origin` отсутствует:

```bash
git remote add origin https://github.com/enterprise-data-platform-ru/enterprise-data-platform-ru.github.io.git
```

Если `origin` уже есть, проверить адрес. Если нужно сохранить связь со старым репозиторием, переименовать его, предварительно убедившись, что имя `previous-origin` свободно:

```bash
git remote rename origin previous-origin
git remote add origin https://github.com/enterprise-data-platform-ru/enterprise-data-platform-ru.github.io.git
```

Для HTTPS при необходимости `gh auth setup-git`. Затем:

```bash
git push -u origin main
```

Не использовать `--force`. Если удалённый репозиторий уже содержит коммиты, сначала изучить `git fetch origin` и историю; не перезаписывать их вслепую.

Альтернатива созданию пустого репозитория через веб: из локального проекта с проверенным коммитом и без `origin` выполнить `gh repo create enterprise-data-platform-ru/enterprise-data-platform-ru.github.io --public --source=. --remote=origin --push --description 'Official project website and architecture showcase for Enterprise Data Platform'`. Не выполнять, если репозиторий уже создан через веб.

## 4. Репозиторий .github

Создать через ту же форму:

- Repository name: `.github`
- Description: `Organization profile and shared community health files`
- Public; Add README = On; .gitignore = None; license = по решению владельца.

В репозитории создать файл `profile/README.md` через Add file → Create new file. Пример:

```markdown
# Enterprise Data Platform

Независимый инженерный проект по созданию референсной архитектуры корпоративной платформы данных.

## Направления

- Lakehouse и открытые форматы данных
- Batch- и streaming-пайплайны
- Kubernetes, GitOps и автоматизация инфраструктуры
- Data governance, безопасность и качество данных
- Observability и эксплуатационная надёжность

## Репозитории

- [Website](https://github.com/enterprise-data-platform-ru/enterprise-data-platform-ru.github.io) — сайт проекта.

## Статус

Проект находится на стадии разработки. Публикуемые архитектуры и прототипы не являются заявлением о готовом сертифицированном продукте.

Сайт: https://enterprisedataplatform.ru
```

Ссылки на будущие репозитории добавлять после создания. На странице организации закрепить основные публичные репозитории (Customize pins / Edit pinned repositories).

По мере развития добавить в корень `.github` файлы `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `PULL_REQUEST_TEMPLATE.md`, каталог `ISSUE_TEMPLATE/`. Для SECURITY.md указать реально работающий приватный канал связи или Private vulnerability reporting, если включён; не просить публиковать секреты в Issues. Это общие community health файлы; индивидуальный репозиторий может их переопределять. Переиспользуемые workflows создавать позже и явно подключать из каждого репозитория через `uses:`; сам `.github` не запускает их автоматически в других репозиториях.

## 5. Настройка сайта в GitHub Pages

Открыть Settings → Pages в репозитории `enterprise-data-platform-ru.github.io`. Build and deployment → Source → **GitHub Actions**.

Использовать существующий `.github/workflows/ci.yml`, описанный в README. Не создавать дублирующий `deploy.yml`, если `ci.yml` уже публикует сайт.

Проверить, что workflow:

- выполняется на PR (тесты и сборка без публикации) и push в `main`;
- использует Node.js 22+ и `npm ci`;
- выполняет `npm test` и `npm run build`;
- загружает `out/` через `actions/upload-pages-artifact`;
- публикует через `actions/deploy-pages` только после успешной сборки в `main`;
- deploy job имеет `pages: write`, `id-token: write`; для checkout достаточно `contents: read`;
- использует environment `github-pages` и по возможности ограничение деплоя веткой `main`;
- не запускает недоверенный код из PR с секретами и привилегированным токеном (`pull_request_target` не нужен для обычной сборки).

В Next.js должен быть статический экспорт `output: 'export'`. Для основного сайта организации и собственного корневого домена `basePath` должен быть пустым; проверить существующую логику `next.config.*` и `src/lib/paths.mjs` (не подставлять имя репозитория автоматически, если оно оканчивается на `.github.io`). Проверить пути к `_next/static`, изображениям и favicon. Для `next/image` при необходимости использовать `images.unoptimized: true`.

Вкладка Actions → существующий workflow → Run workflow, если настроен `workflow_dispatch`; иначе следующий push в `main`. После успешного deploy проверить https://enterprise-data-platform-ru.github.io/ до переключения DNS. Если домен уже подключён, этот URL может перенаправлять на него.

## 6. Собственный домен и DNS

**Важное изменение:** прежние инструкции могли указывать `letenkov.github.io`. Новый владелец Pages — организация, поэтому CNAME должен указывать на `enterprise-data-platform-ru.github.io`, а не на персональный аккаунт. Проверить и обновить `DEPLOYMENT.md`, `GITHUB-PAGES.md`, README и настройки CI. При переносе уже действующего домена сначала спланировать переключение и удалить старую привязку Pages, избегая оставленных DNS-записей.

1. В Organization → Settings → Pages → Add a domain добавить `enterprisedataplatform.ru`.
2. GitHub покажет имя TXT-записи и уникальный token. Внести их у DNS-провайдера без изменений. Ожидаемый шаблон имени: `_github-pages-challenge-enterprise-data-platform-ru.enterprisedataplatform.ru`. Если провайдер автоматически добавляет домен, использовать только относительную часть. Не выдумывать значение TXT. Нажать Verify и оставить TXT после верификации.
3. В Settings → Pages репозитория сайта → Custom domain ввести `enterprisedataplatform.ru`, Save.
4. Настроить DNS-записи:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | enterprise-data-platform-ru.github.io. |

TTL: 300–3600 секунд (если доступно). Удалить только конфликтующие старые A/AAAA/CNAME записи веб-сайта после проверки; не трогать MX, SPF, DKIM, DMARC и другие записи почты. Не создавать wildcard `*` на GitHub Pages. Если используется прокси DNS-провайдера, для первичной диагностики оставить DNS-only.

```bash
dig +short A enterprisedataplatform.ru
dig +short CNAME www.enterprisedataplatform.ru
dig +short TXT _github-pages-challenge-enterprise-data-platform-ru.enterprisedataplatform.ru
```

5. Дождаться подтверждения DNS и выпуска сертификата в Pages; включить Enforce HTTPS. Срок зависит от DNS и GitHub. Для Actions custom domain задаётся в настройках Pages; один лишь файл CNAME в репозитории не подключает домен.

```bash
curl -IL https://enterprisedataplatform.ru/
curl -IL https://www.enterprisedataplatform.ru/
```

Проверить сайт в браузере. Pages использовать для некоммерческой демонстрации и документации; для коммерческого веб-сервиса, электронной торговли или SaaS подобрать другое размещение согласно правилам GitHub Pages.

## 7. Настройки репозиториев

После первого успешного CI в Settings → General:

| Параметр | Рекомендация |
|---|---|
| Default branch | main |
| Issues | On |
| Discussions | Off до появления сообщества |
| Wiki | Off; документация хранится в Git |
| Allow squash merging | On |
| Allow merge commits | Off (если выбран squash workflow) |
| Allow rebase merging | Off (по желанию) |
| Automatically delete head branches | On |

В About на главной странице сайта: Website = https://enterprisedataplatform.ru; Topics = `nextjs`, `github-pages`, `data-platform`, `lakehouse`, `reference-architecture`.

### Защита main

Settings → Rules → Rulesets → New branch ruleset. Name: `protect-main`. Target: default branch или `main`. Enforcement: Active после успешного первого CI.

- Restrict deletions / Block force pushes.
- Require a pull request before merging.
- Required approvals: 0, пока работаешь один; при появлении второго инженера — 1.
- Require status checks to pass: выбрать реально появившиеся имена проверок PR из существующего workflow. Не требовать deploy job, который выполняется только на main.
- Не требовать CODEOWNERS review, если нет независимого доступного reviewer.
- Не добавлять постоянный bypass без необходимости; задокументировать аварийный процесс.

На GitHub Free rulesets доступны для public, для private требуется подходящий платный тариф. Не делать private-репозиторий публичным ради rulesets. Организационные rulesets — при соответствующем платном плане.

В Security включить доступные бесплатные функции: Dependabot alerts, security updates, secret scanning / push protection для публичных репозиториев, если доступны. Для приватных проверить тариф и стоимость. Для сторонних Actions желательно фиксировать проверенные полные commit SHA и обновлять их контролируемо.

## 8. Что будет в технических репозиториях

`architecture`:

```text
README.md
docs/architecture/
docs/adr/
diagrams/
```

`platform` — начать с модульной референсной реализации, не с разработки собственных аналогов Kafka и Trino:

```text
README.md
QWEN.md
docs/
components/
  ingestion/
  processing/
  serving/
  governance/
  observability/
deploy/
examples/
tests/
```

`infrastructure` после отделения:

```text
README.md
terraform/modules/
terraform/environments/
ansible/
gitops/
clusters/
docs/runbooks/
```

Первый сквозной MVP: синтетический источник → Kafka → обработка → S3 / Iceberg → Trino → проверка качества и базовая observability. Конкретный набор и версии выбрать и документировать в ADR. Не переносить конфиденциальный код, данные и документы бывших работодателей.

## 9. Процесс разработки с Qwen Code

Использовать один организационный GitHub Project для backlog (`Enterprise Data Platform`), связывать задачи с Issues репозиториев. Колонки: Backlog, Ready, In progress, Review, Done. Не дублировать backlog полностью в ROADMAP.md: roadmap хранит направления и крупные этапы, Issues — конкретные задачи.

```bash
git switch main
git pull --ff-only
git switch -c docs/update-organization-guide
# выполнить небольшую задачу в Qwen Code
npm test
npm run build
git diff
git add README.md docs/GITHUB-ORGANIZATION.md
git commit -m "docs: add organization setup guide"
git push -u origin HEAD
gh pr create --base main --title 'docs: update organization guide' --body 'Document repository structure and setup.'
```

После проверки CI — squash merge через интерфейс GitHub, затем обновить локальную main. Qwen Code получает один Issue, список разрешённых файлов, критерии приёмки и команды проверки. Не выдавать агенту токены администратора организации; не разрешать самостоятельный push в main, изменение DNS, секретов или настроек доступа.

## 10. Чек-лист

- [ ] Настроен профиль организации, доступ и 2FA.
- [ ] Создан пустой публичный `enterprise-data-platform-ru.github.io`.
- [ ] Проверены исходники, история и отсутствие секретов.
- [ ] Локальные тесты и build успешно пройдены.
- [ ] Исходники отправлены в `main`.
- [ ] Pages Source = GitHub Actions, существующий CI успешно публикует `out/`.
- [ ] Проверен корневой Pages URL и корректный basePath.
- [ ] Домен верифицирован организацией.
- [ ] DNS настроен на GitHub Pages, HTTPS включён, сайт доступен.
- [ ] Создан `.github/profile/README.md` и оформлен профиль.
- [ ] Настроена защита main и обязательные проверки CI.
- [ ] Обновлены README, DEPLOYMENT.md и GITHUB-PAGES.md с новым owner.
- [ ] Создан backlog следующего этапа, без пустых репозиториев.

## 11. Официальные источники

- [GitHub Pages: создание сайта](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Источник публикации](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Настройка домена](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Верификация домена](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Ограничения Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Профиль организации](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile)
- [Настройки организации](https://docs.github.com/en/organizations/managing-organization-settings)
- [Actions permissions](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization)
- [Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub CLI: repo create](https://cli.github.com/manual/gh_repo_create)

Проверено по документации GitHub; фактические настройки новой организации и содержимое локального workflow не проверены. Перед выполнением сверить существующие файлы и доступность настроек на текущем тарифе.
