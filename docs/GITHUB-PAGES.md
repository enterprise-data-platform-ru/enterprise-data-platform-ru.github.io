# Публикация на GitHub Pages

Целевой адрес: https://enterprisedataplatform.ru. Исходники Next.js собираются в `out/`; GitHub Actions публикует только этот каталог. Docker, VPS, Nginx и персональный токен для деплоя не нужны.

## 1. Репозиторий и первый запуск

Создайте пустой репозиторий `enterprise-data-platform` (public, если используется GitHub Free). Из распакованного каталога, подставив свой GitHub login:

```bash
npm install
npm test
npm run build
npm run check:export
git init -b main
git add .
git commit -m 'Initial Enterprise Data Platform website'
git remote add origin https://github.com/USERNAME/enterprise-data-platform.git
git push -u origin main
```

Зафиксируйте `package-lock.json` в Git. Если npm недоступен локально, CI сможет выполнить первоначальный `npm install`, но для воспроизводимости затем потребуется сохранить lockfile. Если репозиторий уже существует, используйте его рабочую копию и перенесите изменения без повторной инициализации или force push.

В репозитории: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Не выбирайте Jekyll, `Deploy from a branch` или отдельную ветку gh-pages. Затем **Actions → Build and deploy GitHub Pages → Run workflow → main**. Первый push до включения Pages может завершиться ошибкой; ручной повтор после настройки исправит это.

По умолчанию project site доступен на `https://USERNAME.github.io/enterprise-data-platform/` (если на пользовательском сайте уже есть custom domain, адрес может отличаться). Workflow автоматически передаёт `base_path` из `configure-pages` в Next.js. Pull request запускает тесты и сборку, но не публикует сайт. Только main запускает деплой. Авторизация — встроенным GITHUB_TOKEN с `pages: write` и `id-token: write` в deploy job. При необходимости разрешите main в environment `github-pages`.

## 2. Привязка домена

1. В настройках личного аккаунта или организации GitHub: **Settings → Pages → Add a domain**. Подтвердите владение `enterprisedataplatform.ru` через выданную GitHub TXT-запись; сохраните эту запись после подтверждения.
2. В настройках репозитория **Settings → Pages → Custom domain** укажите `enterprisedataplatform.ru` (без https и пути) и сохраните.
3. У DNS-провайдера измените конфликтующие A/AAAA/ALIAS/ANAME для корневого домена и CNAME/A/AAAA для www, если они указывают на другой веб-хостинг. Не удаляйте MX, TXT для почты или другие несвязанные записи. Не используйте wildcard `*`.

| Host | Type | Value |
|---|---|---|
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |
| www | CNAME | USERNAME.github.io. |

Замените USERNAME на реального владельца репозитория (логин или организацию). Не добавляйте имя репозитория к CNAME. TTL можно оставить по умолчанию, например 3600. IPv6 опционально: четыре AAAA `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` вместе с A. При использовании Cloudflare начните с режима DNS only.

```bash
dig +short A enterprisedataplatform.ru
dig +short AAAA enterprisedataplatform.ru
dig +short CNAME www.enterprisedataplatform.ru
```

4. Дождитесь успешной DNS-проверки в Pages и выпуска сертификата, включите **Enforce HTTPS**. При смене домена обязательно повторно запустите workflow на main: новый `base_path` будет пустым, а ресурсы станут доступны в корне домена. `public/CNAME` не требуется: при публикации через Actions GitHub игнорирует этот файл; домен хранится в Settings.
5. Проверьте сайт, переходы и ресурсы:

```bash
curl -IL https://enterprisedataplatform.ru/
curl -I https://enterprisedataplatform.ru/platform.svg
curl -I https://enterprisedataplatform.ru/robots.txt
curl -I https://enterprisedataplatform.ru/sitemap.xml
curl -IL https://www.enterprisedataplatform.ru/
```

Проверьте в DevTools Network, что JS/CSS из `/_next/` загружаются без 404. Если в ссылках остался `/enterprise-data-platform/`, повторите деплой после сохранения custom domain. Не публикуйте исходники вместо `out/`.

## 3. Разработка, CI/CD и откат

```bash
npm ci                # после создания lockfile
npm run dev
npm test
npm run build
npm run check:export
npm run preview
```

Для проверки временного project URL:

```bash
export NEXT_PUBLIC_BASE_PATH=/enterprise-data-platform
npm run build
npm run check:export
npm run preview        # http://localhost:3000/enterprise-data-platform/
# после остановки preview
unset NEXT_PUBLIC_BASE_PATH
```

Переменная фиксируется на этапе сборки; при изменении нужен новый build. Для production-доменаnpm install она пустая. Канонический URL, OG и sitemap сохраняют целевой домен; временный URL нужен для проверки, а не как второе SEO-зеркало.

После изменений: `git add . && git commit -m 'Update website' && git push`. GitHub автоматически пересоберёт и опубликует. Для отката используйте `git revert <commit>` и push в main, не переписывая историю.

## 4. Ограничения хостинга

GitHub Pages обслуживает статику. Нельзя добавлять SSR, API routes, server actions, серверные сессии или обработчики форм внутрь проекта. Для обратной связи используйте подтверждённый email или отдельный backend. Не помещайте токены, закрытые данные или конфиденциальные материалы в репозиторий или `NEXT_PUBLIC_*`. Для полноценного SaaS/интернет-магазина/коммерческих транзакций выберите другой хостинг: учитывайте ограничения использования GitHub Pages.

## Ссылки

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
