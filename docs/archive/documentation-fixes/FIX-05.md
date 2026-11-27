# FIX-05 — Типографика и оформление MDX-документов

## 1. Подготовка

Прочитай:

- AGENTS.md.
- Последние 60 строк docs/IMPLEMENTATION-STATE.md.
- Раздел FIX-05 из docs/archive/documentation-fixes/IMPLEMENTATION-FIX-PLAN.md.

Если файл плана отсутствует, используй данный промпт как самостоятельное техническое задание.

Проверь выполнение FIX-04 и наличие стилей из комплекта edp-docs-style-v2.

Если требуемые стили уже реализованы, не переписывай их. Выполни аудит и исправь только выявленные отклонения.

## 2. Цель

Создать единый стиль технических документов Enterprise Data Platform.

Все существующие и будущие MDX-статьи должны автоматически получать согласованное оформление без необходимости добавлять индивидуальные CSS-правила в каждый документ.

Устранить наследование маркетинговой типографики главной страницы.

## 3. Файлы

Читать:

- src/app/docs/docs.css
- src/app/docs/overview/page.mdx
- src/components/DocsLayout.jsx
- src/app/globals.css — только дизайн-токены и глобальная типографика.
- mdx-components.js
- tests/docs.test.mjs

Изменять:

- src/app/docs/docs.css
- mdx-components.js
- tests/docs.test.mjs
- docs/IMPLEMENTATION-STATE.md

Не изменять содержимое опубликованных статей.

## 4. Область применения стилей

Все правила типографики ограничить контейнером:

```css
#docs-content
```

Этот контейнер уже создаётся компонентом DocsLayout:

```jsx
<article id="docs-content">
  {children}
</article>
```

Не изменять глобальные селекторы h1, h2, h3, p, table, pre и code.

Стили не должны влиять на каталог документации, Sidebar, TOC, Header, Footer и главную страницу сайта.

## 5. Дизайн-система

Использовать существующую палитру:

| Элемент | Цвет |
|---|---|
| Заголовки | #12232B |
| Основной текст | #334640 |
| Вторичный текст | #52656C |
| Ссылки | #24594A |
| Фон статьи | #FFFFFF |
| Границы | #DCE4DF |
| Фон встроенного кода | #EDF1EB |
| Фон блоков кода | #101C24 |
| Текст блоков кода | #E2E8F0 |
| Фон примечаний | #EDF4E9 |
| Фирменный акцент | #B7F46A |

Переиспользовать существующие переменные var(--ink), var(--muted), var(--green), var(--line), var(--white), var(--mono), var(--dark).

Не добавлять новые глобальные переменные.

## 6. Основная типографика

Проверить существующие правила и привести их к следующей спецификации:

```css
#docs-content {
  min-width: 0;
  max-width: 100%;
  color: #334640;
  font-size: 16px;
  line-height: 1.75;
  overflow-wrap: break-word;
}

#docs-content h1,
#docs-content h2,
#docs-content h3,
#docs-content h4 {
  color: var(--ink);
  letter-spacing: -.02em;
  overflow-wrap: anywhere;
}

#docs-content h1 {
  margin: 0 0 16px;
  font-size: 36px;
  line-height: 44px;
  font-weight: 650;
}

#docs-content h2 {
  margin: 40px 0 16px;
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
}

#docs-content h3 {
  margin: 28px 0 12px;
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
}

#docs-content h4 {
  margin: 24px 0 12px;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
}

#docs-content p {
  margin: 0 0 16px;
  color: #334640;
  font-size: 16px;
  line-height: 28px;
}

#docs-content > h1 + p {
  color: var(--muted);
}

#docs-content strong {
  color: var(--ink);
  font-weight: 600;
}

#docs-content a {
  color: var(--green);
  text-decoration: underline;
  text-underline-offset: 3px;
}

#docs-content a:hover {
  color: #194638;
}

#docs-content hr {
  margin: 32px 0;
  border: 0;
  border-top: 1px solid var(--line);
}
```

Не добавлять дублирующиеся определения.

Максимальную ширину статьи 820px сохранить в существующем DocsLayout.

## 7. Списки

```css
#docs-content ul,
#docs-content ol {
  margin: 16px 0 24px;
  padding-left: 24px;
}

#docs-content ul {
  list-style-type: disc;
}

#docs-content ol {
  list-style-type: decimal;
}

#docs-content li {
  margin: 6px 0;
  padding-left: 2px;
  line-height: 28px;
}

#docs-content li::marker {
  color: var(--green);
}

#docs-content li > p {
  margin: 0 0 8px;
}

#docs-content li > ul,
#docs-content li > ol {
  margin: 8px 0;
}
```

Проверить вложенные списки и длинные строки.

## 8. Встроенный код

```css
#docs-content :not(pre) > code {
  padding: 2px 5px;
  border-radius: 4px;
  background: #edf1eb;
  color: var(--green);
  font-family: var(--mono);
  font-size: .875em;
  overflow-wrap: anywhere;
}
```

Встроенный код должен визуально отличаться от основного текста, но не нарушать межстрочный интервал.

## 9. Блоки кода

```css
#docs-content pre {
  max-width: 100%;
  min-width: 0;
  margin: 24px 0;
  padding: 20px;

  overflow-x: auto;

  border-radius: 8px;
  background: var(--dark);
  color: #e2e8f0;

  font-family: var(--mono);
  font-size: 14px;
  line-height: 22px;

  tab-size: 2;
}

#docs-content pre code {
  display: block;
  padding: 0;

  background: transparent;
  color: inherit;

  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  white-space: pre;
  overflow-wrap: normal;
  word-break: normal;
}
```

Длинные строки прокручиваются внутри блока.

Не добавлять неработающую кнопку копирования.

Не устанавливать библиотеки подсветки синтаксиса в рамках этой задачи.

## 10. Таблицы

Таблицы должны иметь отдельную область горизонтальной прокрутки.

Проверить mdx-components.js.

Если компонент-обёртка уже реализован, сохранить его. Если отсутствует — добавить.

Пример:

```jsx
function DocsTable(props) {
  return (
    <div
      className="docs-table-wrapper"
      role="region"
      aria-label="Таблица документации"
      tabIndex={0}
    >
      <table {...props} />
    </div>
  );
}
```

Подключить DocsTable через существующий объект MDX components, сохранив остальные компоненты.

Стили:

```css
#docs-content .docs-table-wrapper {
  width: 100%;
  max-width: 100%;

  margin: 24px 0;
  overflow-x: auto;

  border: 1px solid var(--line);
  border-radius: 6px;
}

#docs-content table {
  width: 100%;
  border-collapse: collapse;

  font-size: 14px;
  line-height: 22px;
}

#docs-content th,
#docs-content td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

#docs-content th {
  background: #f0f3ef;
  color: var(--ink);
  font-weight: 600;
}

#docs-content tbody tr:nth-child(even) {
  background: #fafbf9;
}

#docs-content tbody tr:last-child td {
  border-bottom: 0;
}
```

Сохранить семантические элементы table, thead, tbody, tr, th и td.

Не применять display:block непосредственно к table.

Проверить, поддерживает ли текущий MDX pipeline Markdown-таблицы. Если GFM не подключён, не устанавливать зависимости самостоятельно. Проверить оформление на HTML/JSX-таблице и зафиксировать ограничение.

## 11. Цитаты и примечания

Обычный Markdown blockquote:

```css
#docs-content blockquote {
  margin: 24px 0;
  padding: 16px 20px;

  border-left: 3px solid var(--green);
  border-radius: 0 6px 6px 0;

  background: #edf4e9;
  color: #334640;
}

#docs-content blockquote > :last-child {
  margin-bottom: 0;
}
```

Поддержать четыре типа технических примечаний:

| Тип | Акцент | Фон |
|---|---|---|
| note | #24594A | #EDF4E9 |
| warning | #996000 | #FFF7E6 |
| danger | #B42318 | #FDECEC |
| tip | #245A8D | #EAF2FA |

Если DocsCallout уже присутствует в mdx-components.js, сохранить его и проверить корректность.

В противном случае добавить небольшой серверный компонент DocsCallout с параметрами type, title и children.

Пример использования:

```mdx
<DocsCallout
  type="warning"
  title="Внимание"
>
  Перед обновлением необходимо создать резервную копию.
</DocsCallout>
```

Не использовать цвет как единственный способ обозначения типа примечания.

Не добавлять внешние UI-библиотеки.

## 12. Изображения и диаграммы

```css
#docs-content img,
#docs-content svg {
  max-width: 100%;
  height: auto;
}

#docs-content figure {
  max-width: 100%;
  margin: 24px 0;
}

#docs-content figcaption {
  margin-top: 8px;

  font-size: 13px;
  line-height: 20px;
  color: var(--muted);
}
```

Изображения и диаграммы не должны выходить за пределы центральной колонки.

Не изменять глобальный компонент Logo.

## 13. Раскрывающиеся блоки

```css
#docs-content details {
  margin: 24px 0;
  padding: 16px 20px;

  border: 1px solid var(--line);
  border-radius: 6px;
}

#docs-content summary {
  color: var(--ink);
  font-weight: 600;
  cursor: pointer;
}

#docs-content details[open] > summary {
  margin-bottom: 16px;
}
```

Использовать нативные details и summary без дополнительного JavaScript.

## 14. Адаптивность

```css
@media (max-width: 899px) {
  #docs-content h1 {
    font-size: 30px;
    line-height: 38px;
  }

  #docs-content h2 {
    font-size: 24px;
    line-height: 32px;
  }
}

@media (max-width: 639px) {
  #docs-content h1 {
    font-size: 28px;
    line-height: 36px;
  }

  #docs-content h2 {
    font-size: 23px;
    line-height: 30px;
  }

  #docs-content pre {
    padding: 16px;
    font-size: 13px;
  }

  #docs-content th,
  #docs-content td {
    padding: 10px 12px;
  }
}
```

Не уменьшать основной текст ниже 16px.

Не использовать overflow-x:hidden для сокрытия переполнения страницы.

Горизонтальная прокрутка допускается только внутри таблиц и блоков кода.

## 15. Сохранение существующих якорей

Сохранить опубликованные URL:

- /docs/overview/#naznachenie
- /docs/overview/#granitsy

Не изменять генерацию идентификаторов заголовков.

Сохранить текущую компенсацию sticky Header при переходе по якорям.

Не реализовывать динамическое выделение TOC — это задача FIX-06.

## 16. Тестовый документ

Использовать MDX-STYLE-EXAMPLE.mdx из комплекта edp-docs-style-v2, если он доступен.

Проверить следующие элементы:

- H1–H4.
- Абзацы.
- Ссылки.
- Жирный и курсивный текст.
- Маркированные и нумерованные списки.
- Вложенные списки.
- Inline code.
- Bash, YAML и JSON code blocks.
- Таблицы.
- Цитаты.
- Все типы DocsCallout.
- Изображения и диаграммы.
- Раскрывающиеся блоки.
- Длинные строки.

Не публиковать тестовый документ и не добавлять его в sitemap или реестр документации.

Временный маршрут, если он создан для локальной проверки, удалить перед финальной сборкой.

## 17. Регрессионные проверки

Проверить и при необходимости дополнить существующие тесты:

- MDX-компоненты корректно экспортируются.
- Существующие компоненты не потеряны.
- CSS-правила ограничены контейнером статьи.
- CSS-переменные определены.
- Метаданные статьи сохранены.
- Опубликованные якоря сохранены.
- В статье один H1.
- YAML frontmatter не отображается.

Не удалять существующие тесты ради успешного результата.

## 18. Проверка сборки

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
```

Проверить exit code каждой команды.

Production-экспорт должен быть восстановлен.

Проверить страницы:

- /
- /docs/
- /docs/overview/

## 19. Визуальная приёмка

Проверить статью при разрешениях:

- 1920 × 1080.
- 1440 × 900.
- 1280 × 800.
- 1024 × 768.
- 768 × 1024.
- 390 × 844.
- 360 × 800.

Убедиться, что типографика статьи отличается от маркетинговых секций главной страницы и соответствует заданным размерам.

Проверить отсутствие горизонтального переполнения страницы.

При отсутствии браузера указать:

VISUAL_VALIDATION: NOT_RUN

Не подменять визуальную проверку успешной сборкой.

## 20. Ограничения

- Контекст модели: 32768 токенов.
- Не читать весь репозиторий.
- Не переписывать уже корректные стили.
- Не изменять globals.css.
- Не изменять DocsLayout.
- Не изменять Sidebar и TOC.
- Не изменять каталог FIX-04.
- Не изменять опубликованный MDX-контент.
- Не устанавливать зависимости.
- Не изменять URL.
- Не выполнять FIX-06.
- Не выполнять git commit и git push.

При приближении к лимиту контекста сохранить промежуточное состояние и остановиться.

## 21. Definition of Done

- Единая типографика всех MDX-документов.
- Согласованная цветовая палитра.
- Оформление списков, кода, таблиц и примечаний.
- Корректное отображение изображений.
- Адаптивные размеры заголовков.
- Отсутствие глобальных CSS-регрессий.
- Сохранение каталога FIX-04.
- Сохранение SEO и опубликованных якорей.
- Успешные тесты и статический экспорт.
- Обновление IMPLEMENTATION-STATE.md.

Если все требования уже выполнены установленным комплектом edp-docs-style-v2, зафиксировать результаты проверки без повторного изменения исходников.

Предоставить краткий отчёт и остановиться.

## 22. Commit message

style(docs): standardize technical documentation typography
