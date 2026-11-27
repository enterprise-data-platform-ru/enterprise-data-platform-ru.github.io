# FIX-06 — Sticky Sidebar, TOC и навигация документации

## 1. Контекст

Проект: Enterprise Data Platform.

Базовый коммит:

46c9a44 — style(docs): align typography and MDX content styles

FIX-04 и FIX-05 реализованы. Автоматические проверки FIX-05-R5: 71/71 PASS.

Не повторять реализацию предыдущих FIX.

Визуальная приёмка предыдущих исправлений может оставаться отложенной до FIX-09.

## 2. Подготовка

Прочитай AGENTS.md.

Выполни:

```bash
git status --short
git log -5 --oneline
rg -n 'FIX-05-R5|FIX-06' docs/IMPLEMENTATION-STATE.md
```

Прочитай только соответствующие записи журнала.

Если существует docs/archive/documentation-fixes/IMPLEMENTATION-FIX-PLAN.md, прочитай только раздел FIX-06.

Если файл отсутствует, используй данный промпт как самостоятельное задание.

Не загружай весь репозиторий в контекст.

## 3. Цель

Реализовать:

- Sticky Sidebar.
- Sticky TOC.
- Независимую прокрутку боковых панелей.
- ScrollSpy для автоматического выделения текущего раздела.
- Корректные переходы по якорям.
- Корректную навигацию между опубликованными статьями.
- Сохранение существующего дизайна FIX-04 и FIX-05.

## 4. Область изменений

Разрешено изменять:

```text
src/app/docs/docs.css
src/components/DocsToc.jsx
src/components/DocsArticleNav.jsx
src/components/DocsSidebar.jsx
tests/docs.test.mjs
tests/docs-layout.test.mjs
docs/IMPLEMENTATION-STATE.md
```

При необходимости разрешено создать отдельный небольшой модуль чистых функций для ScrollSpy в src/lib/ и соответствующие unit-тесты.

Только читать:

```text
src/components/DocsLayout.jsx
src/components/DocsBreadcrumb.jsx
src/components/Header.jsx
src/app/globals.css
src/content/docs/navigation.mjs
src/lib/heading-slug.mjs
src/lib/paths.mjs
src/app/docs/style-preview/page.mdx
```

Не изменять DocsLayout без отдельного согласования.

## 5. Этап FIX-06.1 — Sticky Sidebar

Файл: src/app/docs/docs.css.

Текущая Sidebar использует align-self: stretch и не закреплена при прокрутке.

Обнови существующее правило .docs-sidebar.

Целевые свойства:

```css
.docs-sidebar {
  position: sticky;
  top: var(--docs-header-height);
  align-self: start;
  min-width: 0;

  max-height: calc(
    100dvh - var(--docs-header-height)
  );

  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;

  padding: 24px 16px;
  background: var(--docs-sidebar-bg);
  border-right: 1px solid var(--line);
}
```

Сохрани существующие свойства оформления, если они необходимы.

Требования:

- Desktop: Sidebar 256px.
- Tablet: Sidebar 224px.
- Header Desktop: 77px.
- Header Mobile: 66px.
- Sidebar закреплена под глобальным Header.
- Длинное меню прокручивается внутри Sidebar.
- Footer не перекрывается.
- При прокрутке основной статьи Sidebar остаётся видимой.

Проверь, что родительские контейнеры не блокируют position: sticky через overflow или ограничение высоты.

Учитывай возможное исчезновение сплошного фона левой колонки при замене align-self: stretch на start. Сохрани визуальную целостность каркаса без изменения DocsLayout и без создания второго скроллируемого контейнера.

На ширине до 899px:

```css
@media (max-width: 899px) {
  .docs-sidebar {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}
```

Мобильный Drawer реализуется позже в FIX-07.

Не скрывать мобильную Sidebar.

После завершения этапа проверить diff и перейти к FIX-06.2.

## 6. Этап FIX-06.2 — Sticky TOC

Обнови существующий .docs-toc:

```css
.docs-toc {
  position: sticky;

  top: calc(
    var(--docs-header-height) + 24px
  );

  align-self: start;
  min-width: 0;

  max-height: calc(
    100dvh -
    var(--docs-header-height) -
    48px
  );

  overflow-y: auto;
  overscroll-behavior-y: contain;
  scrollbar-width: thin;

  padding: 0 20px 24px;
  margin-top: 32px;
  border-left: 1px solid var(--line);
}
```

Сохранить:

- Ширину TOC 224px.
- Отображение только при viewport от 1200px.
- Существующее оформление вложенных H3.
- Отсутствие TOC на /docs/.

Основная статья должна прокручиваться вместе со страницей.

Не использовать position: fixed.

Не устанавливать height: 100vh для основного layout.

Не изменять grid-template-columns.

## 7. Этап FIX-06.3 — ScrollSpy

Файл: src/components/DocsToc.jsx.

Компонент уже является Client Component.

Существующая реализация:

- Сканирует H2 и H3.
- Формирует оглавление.
- Сохраняет явные идентификаторы.
- Генерирует уникальные якоря.
- Поддерживает кириллицу.

Сохранить существующий механизм buildToc(), slugifyHeading() и uniqueHeadingId().

Добавить состояние:

```jsx
const [activeId, setActiveId] = useState('');
```

Добавить отдельный useEffect для отслеживания текущего раздела.

Требования к алгоритму:

1. Получить элементы заголовков по идентификаторам items.
2. Для вложенного a[id] использовать родительский H2/H3 при определении позиции.
3. Получать фактическую высоту .site-header.
4. Использовать getBoundingClientRect() для определения текущего заголовка.
5. Выбирать последний заголовок, верхняя граница которого прошла линию активации.
6. Линия активации: фактическая высота Header плюс согласованный небольшой отступ с учётом существующего scroll-padding.
7. Обрабатывать scroll через requestAnimationFrame.
8. Использовать passive: true для scroll listener.
9. Пересчитывать активный раздел при resize и hashchange.
10. При необходимости учитывать изменение высоты контента после загрузки изображений.
11. Корректно обрабатывать начало и конец длинной статьи.
12. Удалять обработчики и отменять requestAnimationFrame при размонтировании.

Не добавлять сторонние библиотеки.

Не обновлять URL при обычной прокрутке.

Не вызывать setActiveId без необходимости.

При отсутствии заголовков не отображать список TOC.

### Активная ссылка

Изменить существующий рендеринг:

```jsx
<a
  href={`#${it.id}`}
  aria-current={
    activeId === it.id
      ? 'location'
      : undefined
  }
>
  {it.text}
</a>
```

Одновременно активна не более чем одна ссылка TOC.

Оформление:

```css
.docs-toc-item a {
  display: block;
  padding: 6px 8px;
  border-left: 2px solid transparent;
  border-radius: 3px;
  color: var(--docs-muted);
  overflow-wrap: anywhere;
}

.docs-toc-item a:hover {
  color: var(--docs-primary);
  background: #f0f3ef;
}

.docs-toc-item a[aria-current="location"] {
  color: var(--docs-primary);
  background: var(--docs-active);
  border-left-color: var(--docs-primary);
  font-weight: 600;
}
```

Сохрани существующие размеры 13px/20px и вложенность H3.

Изменяй текущие CSS-правила вместо добавления дублирующихся селекторов.

Не использовать !important.

## 8. Этап FIX-06.4 — Якоря

Сохранить существующие опубликованные идентификаторы:

```text
/docs/overview/#naznachenie
/docs/overview/#granitsy
```

Проверить:

- Переход по ссылке TOC.
- Прямую загрузку URL с якорем.
- Повторяющиеся заголовки.
- Кириллицу.
- Явный id заголовка.
- Вложенный a[id].
- Отсутствие дублирующихся идентификаторов.
- Переходы браузера назад и вперёд.

Для локальных якорей не использовать linkHref().

Глобальный html уже содержит:

```css
scroll-padding-top: 90px;
```

В docs.css предусмотрен дополнительный scroll-margin-top: 12px.

Не добавлять повторную компенсацию полной высоты Header.

Проверить, что ScrollSpy корректно определяет активный заголовок после якорного перехода с учётом этих отступов.

Сохранить существующий механизм генерации идентификаторов, кроме минимальных исправлений подтверждённых коллизий.

Не включать H1, H4, H5 и H6 в TOC.

## 9. Этап FIX-06.5 — Навигация между статьями

Файл: src/components/DocsArticleNav.jsx.

Обнаружен дефект:

```jsx
href={linkHref(prev.href)}
href={linkHref(next.href)}
```

getArticleNav() возвращает записи docsNav без свойства href.

Исправить импорт:

```jsx
import {
  getArticleNav,
  docPath,
} from '../content/docs/navigation.mjs';
```

Исправить ссылки:

```jsx
href={linkHref(docPath(prev.slug))}
```

```jsx
href={linkHref(docPath(next.slug))}
```

Требования:

- Только опубликованные статьи.
- Корректный basePath.
- При отсутствии предыдущей и следующей статьи навигация не отображается.
- При наличии одного соседа нет неработающих ссылок.
- Переходы сохраняют существующий дизайн.

Не изменять реестр документации.

Добавить регрессионный тест, который проверяет навигацию при наличии более одной опубликованной статьи.

Для проверки использовать тестовые данные без добавления фиктивных опубликованных статей в production-реестр.

## 10. Этап FIX-06.6 — Sidebar и Breadcrumb

Проверить существующий DocsSidebar.

Сохранить:

- getSidebarNav().
- aria-current="page".
- Раскрытие активной группы.
- Нативные details и summary.
- Отсутствие ссылок на draft/planned.
- Навигацию с клавиатуры.
- Перенос длинных названий.

DocsBreadcrumb оставить без изменений, если дефекты не обнаружены.

Breadcrumbs и H1 должны сохранять общую левую границу каталога и статьи, реализованную в FIX-05-R3.

## 11. Использование тестовой страницы

Для проверки длинной статьи использовать существующий маршрут:

```text
/docs/style-preview/
```

Страница содержит:

- Длинную статью.
- Большое количество H2/H3.
- Повторяющиеся заголовки.
- Явные якоря.
- Таблицы.
- Код.
- Callout.
- Изображения.

Проверить Sticky Sidebar, Sticky TOC и ScrollSpy на этой странице.

Не сокращать тестовый контент.

Не изменять исправленные таблицы и Callout.

Учесть, что тестовая страница не является опубликованной статьёй реестра.

Не добавлять её в Sidebar и sitemap.

Не считать noindex защитой от публикации.

Для локальной визуальной проверки сохранить временный маршрут до подтверждения владельцем.

Перед следующим публичным релизом сохранить эталонный MDX вне src/app и исключить временный маршрут из production-экспорта. Не удалять пользовательские файлы без согласования.

## 12. Автоматические тесты

Добавить или обновить тесты:

- Sticky Sidebar CSS contract.
- Sticky TOC CSS contract.
- Правильные responsive breakpoints.
- Активный пункт TOC через aria-current="location".
- Выбор активного заголовка в начале, середине и конце статьи.
- Обработка отсутствующих заголовков.
- Стабильность якорей.
- Уникальность якорей.
- Корректность кириллических идентификаторов.
- Отсутствие TOC на index.
- Корректность предыдущей и следующей статьи.
- Переходы с basePath.

По возможности тестировать чистую логику ScrollSpy независимо от DOM.

Не подменять проверку поведения браузера поиском CSS-строк.

Сохранить все 71 существующий тест.

Не ослаблять существующие проверки ради успешного результата.

## 13. Сборка

Не запускать dev-сервер и production build одновременно в одном каталоге сборки.

Выполнить последовательно:

```bash
npm test
```

```bash
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export
```

```bash
NEXT_PUBLIC_BASE_PATH=/edp-test npm run build
NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export
```

Восстановить production-экспорт:

```bash
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export
```

Финальные проверки:

```bash
git diff --check
git diff --stat
git status --short
```

Проверять фактические коды возврата.

При ошибке остановиться и устранить причину в рамках FIX-06.

Не считать временный экспорт со style-preview готовым production-артефактом для публикации.

## 14. Визуальная приёмка

Проверить страницы:

- /docs/
- /docs/overview/
- /docs/style-preview/

Разрешения:

- 1920 × 1080.
- 1440 × 900.
- 1280 × 800.
- 1200 × 800.
- 1199 × 800.
- 1024 × 768.
- 900 × 800.
- 899 × 800.
- 768 × 1024.
- 390 × 844.
- 360 × 800.

На длинной статье проверить:

- Sidebar закреплена под Header.
- TOC закреплено.
- Активный пункт меняется при прокрутке вниз и вверх.
- Последний раздел корректно активируется.
- Якоря не перекрываются Header.
- Длинные панели прокручиваются независимо.
- Footer не перекрывается.
- Нет горизонтального переполнения страницы.
- Таблицы и код сохраняют внутреннюю прокрутку.
- Нет ошибок React hydration.
- Нет ошибок JavaScript в консоли.

Если браузер недоступен, записать:

VISUAL_VALIDATION: NOT_RUN

Не объявлять визуальную проверку успешной без фактического выполнения.

## 15. Ограничения

- Контекст локальной модели: 32768 токенов.
- Выполнять этапы FIX-06.1–FIX-06.6 последовательно.
- Читать только необходимые файлы.
- Не выводить большие файлы и полные build-логи в контекст.
- Не переписывать весь docs.css.
- Не изменять типографику FIX-05.
- Не изменять каталог FIX-04.
- Не изменять mdx-components.js.
- Не изменять next.config.mjs.
- Не изменять globals.css.
- Не изменять Header и Footer.
- Не изменять архитектуру DocsLayout.
- Не устанавливать зависимости.
- Не добавлять Drawer.
- Не реализовывать FIX-07.
- Не выполнять git commit и git push.

Если контекст приближается к лимиту, записать завершённый подэтап и следующие действия в IMPLEMENTATION-STATE.md, затем остановиться.

## 16. Definition of Done

- Sticky Sidebar работает на desktop/tablet.
- Sticky TOC работает на desktop.
- ScrollSpy выделяет текущий раздел.
- Стабильные идентификаторы сохранены.
- Переходы по якорям работают.
- Навигация между статьями исправлена.
- Breadcrumbs сохранены.
- Мобильная Sidebar остаётся доступной.
- Дизайн FIX-04 и FIX-05 сохранён.
- Все существующие и новые тесты проходят.
- Обе конфигурации basePath проходят сборку.
- Production-экспорт восстановлен локально.
- IMPLEMENTATION-STATE.md обновлён.

## 17. Отчёт

Предоставить краткий отчёт:

- Какие файлы изменены.
- Какие подэтапы завершены.
- Какие дефекты исправлены.
- Количество пройденных тестов.
- Результаты build и check:export.
- Статус визуальной проверки.
- Оставшиеся замечания.

После завершения остановиться.

## 18. Commit message

feat(docs): add sticky sidebar and scroll-aware table of contents
