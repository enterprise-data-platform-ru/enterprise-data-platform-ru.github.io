# FIX-05-R1 — Исправление рендеринга таблиц и Callout-блоков

## Цель

Устранить ошибки, обнаруженные при визуальной проверке FIX-05:

- Markdown-таблицы отображаются как обычный текст.
- Callout-блоки отображаются как обычные абзацы.
- Отсутствуют цветные фоны, боковые границы и заголовки примечаний.

Не перерабатывать типографику и дизайн документации.

## Подготовка

Прочитай AGENTS.md и последние 40 строк docs/IMPLEMENTATION-STATE.md.

Проверь текущие незакоммиченные изменения:

```bash
git status --short
git diff --stat
git diff -- next.config.mjs mdx-components.js
```

Не удаляй и не перезаписывай существующие пользовательские изменения.

## 1. Включение GFM

Файл: next.config.mjs.

Найди:

```javascript
experimental: {
  mdxRs: true,
},
```

Замени на:

```javascript
experimental: {
  mdxRs: {
    mdxType: 'gfm',
  },
},
```

Сохрани остальные параметры конфигурации Next.js.

Не устанавливай remark-gfm.

Не отключай mdxRs.

Не изменяй зависимости проекта.

После изменения конфигурации необходим перезапуск dev-сервера.

Если установленная версия компилятора не поддерживает этот параметр или таблицы по-прежнему не компилируются, остановись и зафиксируй блокер.

## 2. Исправление MDX-компонентов

Файл: mdx-components.js.

Проверь существующие компоненты и соответствие их CSS-классов.

Для таблиц и Callout используй следующую реализацию:

```javascript
import {createElement} from 'react';

function DocsTable(props) {
  return createElement(
    'div',
    {
      className: 'docs-table-scroll',
      tabIndex: 0,
      role: 'region',
      'aria-label': 'Таблица документации',
    },
    createElement('table', props),
  );
}

const calloutTitles = {
  note: 'Примечание',
  warning: 'Внимание',
  danger: 'Опасность',
  tip: 'Рекомендация',
};

function DocsCallout({
  type = 'note',
  title,
  children,
}) {
  const variant = Object.hasOwn(
    calloutTitles,
    type,
  ) ? type : 'note';

  const className = variant === 'note'
    ? 'docs-callout'
    : `docs-callout docs-callout--${variant}`;

  return createElement(
    'aside',
    {className},
    createElement(
      'p',
      {className: 'docs-callout-title'},
      title ?? calloutTitles[variant],
    ),
    children,
  );
}

const components = {
  table: DocsTable,
  DocsCallout,
};

export function useMDXComponents() {
  return components;
}
```

Если в текущей локальной версии уже присутствуют дополнительные MDX-компоненты, обязательно сохрани их.

Не создавай дублирующиеся компоненты.

Не добавляй директиву 'use client'.

Используй createElement, поскольку файл имеет расширение .js.

## 3. Проверка CSS

Файл: src/app/docs/docs.css.

Проверь наличие правил:

```css
.docs-shell #docs-content .docs-table-scroll
.docs-shell #docs-content .docs-callout
.docs-shell #docs-content .docs-callout-title
.docs-shell #docs-content .docs-callout--warning
.docs-shell #docs-content .docs-callout--danger
.docs-shell #docs-content .docs-callout--tip
```

Имена классов в MDX-компонентах должны точно совпадать с именами в CSS.

Если правила Callout отсутствуют, восстанови следующий блок:

```css
.docs-shell #docs-content .docs-callout {
  --callout-color: #24594a;
  --callout-bg: #edf4e9;

  margin: 24px 0;
  padding: 16px 20px;

  border-left: 4px solid var(--callout-color);
  border-radius: 0 6px 6px 0;

  background: var(--callout-bg);
}

.docs-shell #docs-content .docs-callout--warning {
  --callout-color: #996000;
  --callout-bg: #fff7e6;
}

.docs-shell #docs-content .docs-callout--danger {
  --callout-color: #b42318;
  --callout-bg: #fdecec;
}

.docs-shell #docs-content .docs-callout--tip {
  --callout-color: #245a8d;
  --callout-bg: #eaf2fa;
}

.docs-shell #docs-content .docs-callout-title {
  color: var(--callout-color);
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  margin: 0 0 8px;
}

.docs-shell #docs-content .docs-callout > :last-child {
  margin-bottom: 0;
}
```

Если эти правила уже существуют, не добавляй их повторно.

Проверь, что тестовая статья находится внутри article#docs-content и .docs-shell.

## 4. Исправление тестового MDX-документа

Найди тестовую страницу, созданную для FIX-05.

Тест Markdown-таблицы должен использовать обычный GFM-синтаксис:

```mdx
## Таблицы

| Технология | Категория | Назначение |
| --- | --- | --- |
| Apache Iceberg | Хранилище | Open table format |
| Apache Spark | Обработка | Batch / Streaming |
| Trino | Аналитика | Interactive SQL |
```

Не заменяй эту таблицу ручной HTML-разметкой, поскольку необходимо проверить именно поддержку GFM.

Тест Callout:

```mdx
## Callout-блоки

<DocsCallout type="note">
  Это информационное примечание.
</DocsCallout>

<DocsCallout type="warning" title="Внимание">
  Перед обновлением создайте резервную копию.
</DocsCallout>

<DocsCallout type="danger" title="Опасность">
  Операция может привести к потере данных.
</DocsCallout>

<DocsCallout type="tip" title="Рекомендация">
  Используйте GitOps.
</DocsCallout>
```

Если тестовая страница импортирует собственный DocsCallout, проверь, не перекрывает ли этот импорт глобальный MDX-компонент.

## 5. Проверка фактического HTML

После сборки временной тестовой страницы убедись, что внутри article#docs-content присутствуют реальные элементы:

- table;
- thead;
- tbody;
- tr;
- th;
- td;
- .docs-table-scroll;
- .docs-callout;
- .docs-callout--warning;
- .docs-callout--danger;
- .docs-callout--tip;
- .docs-callout-title.

Недостаточно проверить наличие этих строк внутри JavaScript-бандлов или сериализованных React-данных.

Не считать успешную сборку доказательством корректного рендеринга.

## 6. Проверки

Выполни npm test.

Проверь временную тестовую страницу в браузере, если он доступен.

После проверки не включай временную тестовую страницу в production-экспорт.

Выполни:

```bash
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export

NEXT_PUBLIC_BASE_PATH=/edp-test npm run build
NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export

NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export

git diff --check
git diff --stat
```

Не запускай production build одновременно с dev-сервером, если они используют один каталог сборки. Согласуй остановку dev-сервера с владельцем.

## 7. Приёмка

- Markdown-таблица преобразуется в семантическую HTML-таблицу.
- Таблица имеет оформленные заголовки, строки и границы.
- Таблица прокручивается внутри собственного контейнера.
- Все четыре типа Callout имеют разные фоны и акценты.
- Callout без title получает заголовок по умолчанию.
- Inline code и остальная типографика не сломаны.
- Главная страница сайта не изменена.
- SEO и basePath сохранены.
- Дополнительные зависимости не установлены.

Обнови docs/IMPLEMENTATION-STATE.md.

Не отмечай визуальную проверку как PASS, пока результат не подтверждён в браузере.

Не выполняй git commit и git push.
Не переходи к FIX-06.

Commit message:

fix(docs): enable GFM tables and render MDX callouts
