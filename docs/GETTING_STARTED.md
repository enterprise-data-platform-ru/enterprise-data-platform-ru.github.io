# Enterprise Data Platform — начало работы с проектом

Инструкция по подготовке локального окружения на macOS, запуску проекта в Visual Studio Code, сборке Next.js и подготовке к публикации на GitHub Pages.

## 1. Требования

- macOS;
- Visual Studio Code;
- Git;
- Node.js и npm (версия Node.js должна соответствовать требованиям `package.json`, `.nvmrc` или версии, используемой в GitHub Actions);
- Homebrew — при необходимости установки инструментов;
- Qwen Code — опционально, для работы над проектом с локальной LLM.

Проверить установленные инструменты:

```bash
node --version
npm --version
git --version
brew --version
```

Если Node.js отсутствует, установите совместимую с проектом версию. Например, при отсутствии специальных требований можно использовать актуальную LTS-версию через Homebrew или менеджер версий Node.js. Не устанавливайте Next.js глобально.

## 2. Подготовка рабочей директории

Для разработки рекомендуется хранить проекты в `~/Projects`, а не в `~/Downloads`, `~/Documents` или `~/Desktop`: macOS применяет к последним дополнительные ограничения доступа приложений.

```bash
mkdir -p ~/Projects
```

Если проект уже распакован в Downloads, переместите его из обычного Terminal.app с разрешённым доступом к Downloads:

```bash
mv ~/Downloads/enterprise-data-platform ~/Projects/
cd ~/Projects/enterprise-data-platform
```

Перед перемещением убедитесь, что целевая директория проекта ещё не существует. Если проект уже находится в нужном месте, перемещать его повторно не нужно.

Если решено работать непосредственно в Downloads:

```bash
cd ~/Downloads/enterprise-data-platform
```

Открыть проект в VS Code:

```bash
code .
```

Если команда `code` не найдена, в VS Code откройте Command Palette (`Cmd + Shift + P`) и выполните `Shell Command: Install 'code' command in PATH`. Либо откройте папку через File → Open Folder.

## 3. Устранение проблемы доступа macOS в терминале VS Code

### Симптомы

При работе во встроенном терминале VS Code могут возникать ошибки:

```text
ls: .: Operation not permitted
```

```text
Error: The current working directory must be readable to letenkov to run brew.
```

В данном проекте проблема наблюдалась в каталоге `/Users/letenkov/Downloads/enterprise-data-platform`. Причиной были ограничения доступа macOS (TCC — Transparency, Consent and Control) для VS Code.

### Проверенное решение

Следующая команда помогла восстановить доступ:

1. Полностью закройте Visual Studio Code (`Cmd + Q`).
2. Откройте обычный macOS Terminal.app.
3. Сбросьте разрешение VS Code на доступ к Downloads:

   ```bash
   tccutil reset SystemPolicyDownloadsFolder com.microsoft.VSCode
   ```

4. Запустите VS Code снова и откройте проект.
5. Если macOS запросит доступ к Downloads, разрешите его. При необходимости проверьте System Settings → Privacy & Security → Files and Folders → Visual Studio Code → Downloads Folder.
6. Во встроенном терминале проверьте:

   ```bash
   pwd
   ls -al
   brew --version
   ```

Команда `tccutil reset` не выдаёт разрешение сама по себе: она сбрасывает сохранённое решение для конкретного приложения и категории доступа. Она не требует `sudo`, не меняет UNIX-права и не отключает защиту macOS.

### Если проблема сохраняется

Сравните результаты в Terminal.app и VS Code:

```bash
whoami
id
echo "$HOME"
pwd
ls -ldeO@ "$HOME/Downloads"
ls -ldeO@ .
ls -al
```

- Если обычный терминал читает каталог, а VS Code — нет, проверьте TCC и перезапустите VS Code.
- Если оба терминала не могут прочитать каталог, проверьте владельца, UNIX-права и ACL, а также разрешения каждого приложения.
- Не используйте `chmod -R 777`, рекурсивный `chown` или отключение SIP для устранения этой ошибки.
- Альтернативное решение — перенести проект в `~/Projects`.

## 4. Установка зависимостей

Убедитесь, что вы находитесь в корне проекта:

```bash
pwd
ls -al
cat package.json
```

Если присутствует `package-lock.json`, установите зависимости воспроизводимым способом:

```bash
npm ci
```

Если lock-файла нет:

```bash
npm install
```

Сохраните созданный `package-lock.json` в Git. Не удаляйте его без необходимости.

### Ошибка `next: command not found`

```text
> enterprise-data-platform@0.2.0 build
> next build

sh: next: command not found
```

Обычно это означает, что локальные зависимости не установлены или установлены не полностью. Выполните `npm ci` (при наличии корректного lock-файла) или `npm install`, затем:

```bash
npm ls next --depth=0
npm run build
```

Если ошибка сохраняется, проверьте, что `next` указан в `dependencies` или `devDependencies` файла `package.json`, что установка завершилась успешно и что зависимости разработки не были исключены. Не устанавливайте Next.js глобально и не обновляйте версии зависимостей вслепую.

## 5. Локальная разработка

```bash
npm run dev
```

Откройте http://localhost:3000 (либо адрес, напечатанный сервером).

Для остановки сервера нажмите `Ctrl + C`.

Посмотреть доступные команды проекта:

```bash
npm run
```

Если в `package.json` предусмотрены команды `lint`, `test` или `typecheck`, запускайте их перед фиксацией изменений.

## 6. Production-сборка и GitHub Pages

```bash
npm run build
```

Для статического экспорта Next.js в GitHub Pages существующая конфигурация `next.config.*` должна содержать соответствующие параметры (пример для ESM):

```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

Не заменяйте весь конфигурационный файл этим примером: сохраните остальные настройки проекта. При пользовательском домене `enterprisedataplatform.ru`, опубликованном в корне сайта, обычно не нужен `basePath` с именем репозитория.

После успешного статического экспорта проверьте артефакт:

```bash
test -f out/index.html && echo 'Static export OK'
ls -al out/
```

При наличии Python 3 статическую сборку можно проверить локально:

```bash
python3 -m http.server 8080 --directory out
```

Откройте http://localhost:8080. Проверьте навигацию, изображения, стили и обновление страниц. Остановите сервер через `Ctrl + C`.

GitHub Pages не предоставляет сервер исполнения Next.js: серверные API, SSR и другие функции, требующие Node.js на сервере, нельзя использовать в таком развёртывании без отдельного backend.

Для публикации через GitHub Actions:

- В настройках репозитория Settings → Pages установите Source: GitHub Actions.
- Проверьте существующий workflow в `.github/workflows/`: он должен устанавливать зависимости, выполнять `npm run build`, загружать `out/` как Pages-артефакт и развёртывать его.
- Настройте пользовательский домен `enterprisedataplatform.ru` в Settings → Pages и соответствующие DNS-записи. После подтверждения домена включите Enforce HTTPS, когда настройка станет доступна.
- Проверьте, что опубликован именно `out/`, а не исходный код или `.next/`.

## 7. Работа с Git и Qwen Code

Перед началом изменений:

```bash
git status
git remote -v
```

Если проект получен из ZIP и ещё не является Git-репозиторием, предпочтительно клонировать существующий репозиторий, если он уже создан, или отдельно инициализировать новый через `git init`. Не перезаписывайте существующую историю.

Для отдельной задачи в существующем репозитории:

```bash
git switch -c feature/landing-improvements
```

При работе с Qwen Code запускайте агент из корня проекта (если CLI установлен):

```bash
qwen
```

Рекомендуемый порядок работы с локальной моделью:

- Передавайте одну небольшую задачу за раз, с конкретными критериями готовности.
- Укажите, какие файлы относятся к задаче; избегайте чтения всего репозитория без необходимости.
- Не включайте в контекст `node_modules/`, `.next/`, `out/` и большие сгенерированные файлы.
- Используйте `QWEN.md` для постоянных инструкций проекта, если ваша версия Qwen Code поддерживает этот файл.
- Не передавайте агенту секреты и не разрешайте менять системные права доступа для обхода ошибок.
- После каждого изменения проверяйте `git diff` и выполняйте сборку.

Перед коммитом:

```bash
git status --short
git diff
npm run build
```

Не добавляйте в Git `node_modules/`, `.next/`, `out/` (если публикация выполняется через Pages workflow), локальные секреты и `.env`-файлы с чувствительными данными. Проверьте `.gitignore`.

## 8. Краткий ежедневный сценарий

Первый запуск после получения проекта (при наличии lock-файла):

```bash
cd ~/Projects/enterprise-data-platform
npm ci
npm run dev
```

Последующие запуски:

```bash
cd ~/Projects/enterprise-data-platform
npm run dev
```

После обновления зависимостей из Git повторно выполните `npm ci`.

Перед публикацией:

```bash
npm run build
git status --short
git diff
```

При повторном отказе доступа к Downloads из VS Code используйте проверенную команду из обычного Terminal.app, предварительно закрыв VS Code:

```bash
tccutil reset SystemPolicyDownloadsFolder com.microsoft.VSCode
```
