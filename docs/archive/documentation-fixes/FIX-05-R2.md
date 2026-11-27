# FIX-05-R2 — Устранение hydration error при рендеринге MDX-таблиц

На тестовой странице /docs/style-preview/ обнаружена ошибка React:

In HTML, whitespace text nodes cannot be a child of thead.

Причина: Rust MDX Compiler при генерации GFM-таблиц может создавать лишние пробельные текстовые узлы внутри структурных элементов таблицы.

## Задача

Изменить mdx-components.js.

1. Импортировать Children из react.
2. Создать функцию normalizeTableChildren(children), использующую Children.toArray и удаляющую только строки, состоящие из пробельных символов.
3. Применить нормализацию children в DocsTable.
4. Создать серверные компоненты DocsTableHead, DocsTableBody, DocsTableFoot и DocsTableRow.
5. Зарегистрировать их как thead, tbody, tfoot и tr в useMDXComponents().
6. Сохранить DocsCallout и остальные существующие компоненты.
7. Не удалять пробелы внутри td и th.
8. Проверить отдельно Markdown-таблицы и нативные JSX-таблицы.

## Ограничения

- Сохранить experimental.mdxRs.mdxType = 'gfm'.
- Не устанавливать зависимости.
- Не изменять docs.css.
- Не заменять Markdown-таблицы на HTML ради прохождения теста.
- Не использовать suppressHydrationWarning.
- Не отключать серверный рендеринг.
- Не добавлять use client.
- Не удалять тестовую страницу.
- Не выполнять git commit и git push.

## Проверка

- Открыть /docs/style-preview/.
- Проверить отсутствие hydration errors в консоли.
- Проверить обычные и широкие таблицы.
- Проверить сохранение содержимого ячеек.
- Проверить горизонтальную прокрутку.
- Добавить регрессионный тест нормализации дочерних элементов.
- Выполнить npm test.
- Выполнить git diff --check.

При недоступности браузера не объявлять проблему устранённой окончательно.

Обновить docs/IMPLEMENTATION-STATE.md.

Commit message:

fix(docs): normalize MDX table children to prevent hydration errors
