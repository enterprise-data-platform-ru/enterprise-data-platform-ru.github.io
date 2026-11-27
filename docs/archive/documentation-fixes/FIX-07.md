# FIX-07 — Responsive Documentation Navigation

## 1. Контекст

Проект: Enterprise Data Platform.

Стек: Next.js App Router, React, MDX, JavaScript ESM, CSS, GitHub Pages.

Источники требований:

- AGENTS.md.
- docs/archive/documentation-fixes/IMPLEMENTATION-FIX-PLAN.md.
- docs/IMPLEMENTATION-STATE.md.

Прочитай только раздел 2, раздел 3.1 и подраздел FIX-07 оригинального плана.

Зависимость: FIX-06 должен быть реализован.

Одна сессия — только FIX-07.

## 2. Предварительная проверка

Выполни:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -5 --oneline

rg -n 'FIX-06|FIX-07' docs/IMPLEMENTATION-STATE.md
```

Проверь наличие:

- Sticky Sidebar.
- Sticky TOC.
- ScrollSpy.
- aria-current="location".
- Исправленных переходов между статьями.
- Успешных автоматических проверок FIX-06.

Если FIX-06 не реализован, остановись со статусом BLOCKED.

Не повторяй работу FIX-06 внутри FIX-07.

Не отменяй существующие пользовательские изменения.

## 3. Цель

Создать полноценную адаптивную навигацию документации:

- Раскрываемая мобильная Sidebar.
- Раскрываемый TOC внутри основного контента.
- Сохранение desktop Sidebar и TOC.
- Сохранение ScrollSpy.
- Корректное поведение на мобильных устройствах и планшетах.
- Отсутствие горизонтального переполнения.

Предпочтительная реализация — native details/summary.

Не использовать модальный Drawer без необходимости.

## 4. Разрешённые файлы

```text
src/components/DocsLayout.jsx
src/components/DocsSidebar.jsx
src/components/DocsToc.jsx
src/components/DocsMobileNav.jsx
src/app/docs/docs.css
tests/docs.test.mjs
tests/docs-layout.test.mjs
docs/IMPLEMENTATION-STATE.md
```

DocsMobileNav.jsx создавать только при необходимости.

Допускается небольшой общий компонент или hook для переиспользования состояния TOC, если это необходимо для предотвращения дублирования логики.

Остальные файлы только читать.

## 5. Сохранение существующего дизайна

Сохранить:

- article#docs-content.
- Общий DocsLayout.
- Layout max-width: 1600px.
- Article max-width: 820px.
- Catalog max-width: 1100px.
- margin-inline: 0 auto.
- Header desktop: 77px.
- Header mobile: 66px.
- Sidebar desktop: 256px.
- Sidebar tablet: 224px.
- TOC desktop: 224px.
- Существующие CSS-токены.
- Типографику FIX-05.
- Оформление таблиц, кода и Callout.

Не возвращать центрирование контента.

Не изменять глобальный Header.

## 6. FIX-07.1 — Responsive Sidebar

При viewport от 900px сохранить desktop Sidebar.

При viewport менее 900px:

1. Скрыть desktop Sidebar через CSS.
2. Разместить раскрываемую панель «Документация» над main, сразу после глобального Header.
3. Использовать существующий DocsSidebar внутри мобильной панели.
4. Не дублировать данные реестра.
5. Не создавать отдельные hardcoded ссылки.

Предпочтительная структура:

```jsx
<details className="docs-mobile-nav">
  <summary>Документация</summary>
  <div className="docs-mobile-nav-content">
    <DocsSidebar currentSlug={currentSlug} />
  </div>
</details>
```

Панель по умолчанию закрыта.

Требования:

- Summary min-height: 48px.
- Padding: 14px 16px.
- Font-size: 14px.
- Font-weight: 600.
- Background: var(--docs-sidebar-bg).
- Border-bottom: 1px.
- Видимый индикатор раскрытия.
- Максимальная высота раскрытого меню: 65dvh.
- Внутренний вертикальный скролл при необходимости.
- Сенсорные области ссылок и summary не менее 44px.

Не добавлять sticky для мобильной панели, если это создаёт дополнительное перекрытие Header или якорей.

Использовать native details/summary без дополнительного JavaScript, если этого достаточно.

Если требуется закрытие панели при выборе ссылки, реализовать минимальную доступную логику.

Сохранить текущую статью через aria-current="page".

## 7. FIX-07.2 — Мобильный TOC

При viewport от 1200px сохранить правый sticky TOC.

При viewport менее 1200px:

- Скрыть правый TOC.
- Разместить раскрываемое оглавление внутри main.
- Предпочтительное положение — после H1 и вступления, перед первым H2.
- Допустимое положение — после Breadcrumbs, перед article#docs-content, если это позволяет сохранить MDX без изменений.

Использовать заголовок «На этой странице».

Требования:

- Native details/summary.
- По умолчанию закрыто.
- Summary min-height: 44px.
- Border: 1px solid var(--docs-border).
- Border-radius: 6px.
- Светлый фон из существующей палитры.
- Нижний отступ: 24px.
- Ссылки 13/20px.
- Вложенность H3: 12px.
- Сенсорная область ссылок не менее 44px.
- Активный пункт сохраняет оформление FIX-06.

Не отображать пустое оглавление.

Не отображать TOC на странице каталога /docs/.

## 8. FIX-07.3 — Общая логика TOC

Не создавать два независимых механизма генерации идентификаторов и ScrollSpy.

Desktop и mobile TOC должны использовать одинаковые:

- Список заголовков.
- Идентификаторы.
- Порядок элементов.
- Active state.
- Алгоритм ScrollSpy.

Предпочтительно использовать общий контроллер или одну переиспользуемую реализацию.

Если рендерятся два экземпляра DocsToc:

- Генерация идентификаторов должна быть идемпотентной.
- Не допускать гонки между useEffect.
- Не изменять уже корректно назначенные id.
- Не создавать дублирующиеся DOM id.
- Не создавать конфликтующие обработчики прокрутки.
- Скрытые элементы не должны быть доступны через Tab.

В каждом viewport одновременно видим только один TOC.

Сохранить:

- H2/H3.
- Кириллические якоря.
- Явные идентификаторы.
- Уникальные автоматически назначенные идентификаторы.
- aria-current="location".
- Переходы назад и вперёд.

Не менять URL при обычной прокрутке.

## 9. FIX-07.4 — CSS и breakpoints

Обнови существующие правила в docs.css.

Не добавляй параллельные конфликтующие media queries.

Desktop:

```css
.docs-mobile-nav,
.docs-toc-mobile {
  display: none;
}

.docs-sidebar-desktop {
  min-width: 0;
  position: sticky;
  top: var(--docs-header-height);
}

.docs-sidebar-desktop > .docs-sidebar {
  position: static;
}
```

Если текущая реализация FIX-06 позволяет сохранить один sticky-контейнер без дополнительной обёртки, не усложняй DOM.

Tablet:

```css
@media (max-width: 1199px) {
  .docs-toc {
    display: none;
  }

  .docs-toc-mobile {
    display: block;
    margin: 0 0 24px;
    padding: 0 14px;
    border: 1px solid var(--docs-border);
    border-radius: 6px;
    background: var(--paper);
  }

  .docs-toc-mobile summary {
    min-height: 44px;
    padding: 12px 0;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
    cursor: pointer;
  }
}
```

Mobile:

```css
@media (max-width: 899px) {
  .docs-sidebar-desktop {
    display: none;
  }

  .docs-mobile-nav {
    display: block;
    grid-column: 1;
    background: var(--docs-sidebar-bg);
    border-bottom: 1px solid var(--docs-border);
  }

  .docs-mobile-nav > summary {
    min-height: 48px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 20px;
    font-weight: 600;
    color: var(--docs-primary);
    cursor: pointer;
  }

  .docs-mobile-nav .docs-sidebar {
    position: static;
    height: auto;
    max-height: 65dvh;
    overflow-y: auto;
    border: 0;
  }

  .docs-mobile-nav .docs-nav-item a,
  .docs-mobile-nav .docs-nav-summary {
    min-height: 44px;
  }
}
```

Приведённые CSS-фрагменты являются ориентирами.

Адаптировать их к фактической структуре FIX-06.

Main padding:

- Desktop: 32px 40px 64px.
- Tablet: 32px 28px 48px.
- Mobile: 24px 20px 48px.
- Small mobile: 24px 16px 48px.

Сохранить две колонки карточек при ширине от 640px.

При ширине до 639px — одна колонка.

Не применять overflow-x: hidden к body или html для маскировки переполнения.

## 10. FIX-07.5 — Accessibility

Проверить:

- Tab и Shift+Tab.
- Enter и Space для details/summary.
- Видимый focus-visible.
- Минимальные сенсорные области 44px.
- Отсутствие фокуса у скрытых элементов.
- Корректные aria-current.
- Отсутствие дублирующихся id.
- Нативное раскрытие и закрытие панелей.
- prefers-reduced-motion.

Не добавлять принудительные анимации.

Не создавать модальное окно через обычный div.

Если применяется настоящий modal Drawer вместо disclosure, необходимы корректная семантика dialog, Escape, управление фокусом и блокировка фоновых взаимодействий. Такой вариант требует дополнительного обоснования.

## 11. FIX-07.6 — Якоря и ScrollSpy

Проверить переходы:

```text
/docs/overview/#naznachenie
/docs/overview/#granitsy
```

Сохранить существующие отступы якорных переходов.

Не дублировать компенсацию высоты Header.

Проверить изменение viewport:

- Desktop → tablet.
- Tablet → mobile.
- Mobile → desktop.

При изменении размеров окна не должны возникать:

- Повторная генерация id.
- Потеря активного пункта.
- Дублирование TOC.
- Перекрытие заголовков.
- Горизонтальное переполнение.

## 12. Регрессионные тесты

Добавить тесты для:

- Наличия мобильной навигации.
- Native details/summary.
- Правильных CSS breakpoints.
- Скрытия desktop/sidebar mobile.
- Наличия мобильного TOC только в статье.
- Единого источника данных Sidebar.
- Сохранения ScrollSpy.
- Уникальности идентификаторов.
- Отсутствия TOC в каталоге.
- Сенсорных областей.
- Сохранения basePath.

Сохранить все существующие тесты FIX-01–FIX-06.

Не ослаблять тесты ради PASS.

## 13. Функциональная и визуальная проверка

Страницы:

```text
/docs/
/docs/overview/
/docs/style-preview/
```

Последнюю использовать при наличии временного тестового маршрута.

Контрольные ширины viewport:

360, 390, 640, 768, 899, 900, 1024, 1199, 1200, 1280, 1440, 1920px.

Проверить:

- Sidebar раскрывается и закрывается.
- Мобильное оглавление раскрывается и закрывается.
- Скрытые панели не фокусируются.
- Сохраняется desktop sticky.
- Сохраняется ScrollSpy.
- Работают прямые якоря.
- Нет горизонтальной прокрутки страницы.
- Широкие таблицы прокручиваются внутри обёртки.
- Длинные строки кода прокручиваются внутри pre.
- Изображения и SVG адаптивны.
- Header и Footer не перекрываются.
- Нет React hydration errors.
- Нет JavaScript errors.

Не устанавливать Playwright или другие браузерные зависимости без разрешения.

Если браузер недоступен, записать:

BROWSER_FUNCTIONAL_VALIDATION: NOT_RUN

VISUAL_VALIDATION: NOT_RUN

## 14. Обязательные автоматические проверки

Выполнить последовательно:

```bash
npm test

NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export

NEXT_PUBLIC_BASE_PATH=/edp-test npm run build
NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export

NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export

git diff --check
git diff --stat
git status --short
```

При ошибке остановиться и устранить причину в пределах FIX-07.

Не запускать dev-сервер и production build одновременно.

Не считать экспорт с временным style-preview готовым к публичному релизу. Исключение тестового маршрута выполнить перед публикацией с сохранением эталонного MDX вне src/app.

## 15. Ограничения контекста

Контекст локальной модели: 32768 токенов.

Максимальный ответ: 4096 токенов.

- Читать только необходимые файлы.
- Выполнять FIX-07.1–FIX-07.6 последовательно.
- Ограничивать вывод команд 150–250 строками.
- Не читать весь IMPLEMENTATION-STATE.md.
- Не загружать node_modules, .next и out.
- При достижении 70–75% контекста сохранить промежуточное состояние и остановиться на безопасной границе.

## 16. Запрещено

- Изменять дизайн главной страницы сайта.
- Изменять Header/Footer.
- Изменять globals.css.
- Изменять next.config.mjs.
- Изменять mdx-components.js.
- Перерабатывать типографику FIX-05.
- Переписывать ScrollSpy без необходимости.
- Изменять реестр документации.
- Добавлять статьи.
- Добавлять поиск.
- Устанавливать зависимости.
- Выполнять FIX-08.
- Выполнять git commit.
- Выполнять git push.

## 17. Definition of Done

- Мобильная Sidebar доступна.
- Мобильный TOC доступен.
- Desktop Sidebar и TOC сохранены.
- ScrollSpy работает.
- Все breakpoints согласованы.
- Якоря сохранены.
- Нет горизонтального переполнения.
- Все существующие и новые тесты проходят.
- Обе конфигурации basePath проходят сборку.
- Восстановлен локальный production-экспорт.
- IMPLEMENTATION-STATE.md обновлён.

Если визуальные или браузерные проверки не выполнены, явно указать это в отчёте.

## 18. Формат отчёта

Добавить запись в конец docs/IMPLEMENTATION-STATE.md.

TASK: FIX-07
BASE_SHA:
BRANCH:
STATUS:
CHANGED_FILES:
CHECKS:
  npm test:
  root build/check:
  prefix build/check:
  production export restored:
  git diff --check:
BROWSER_FUNCTIONAL_VALIDATION:
VISUAL_VALIDATION:
SCREENSHOTS:
KNOWN_ISSUES:
NEXT_TASK: FIX-08
COMMIT_MESSAGE:

Статус ACCEPTED присваивается только владельцем.

После завершения FIX-07 остановиться.

## Commit message

feat(docs): add responsive documentation navigation
