# FIX-04 — Компактный каталог документации

## 1. Подготовка

Прочитай:

- AGENTS.md.
- Последние 60 строк docs/IMPLEMENTATION-STATE.md.
- Только раздел FIX-04 из docs/archive/documentation-fixes/IMPLEMENTATION-FIX-PLAN.md.

Если файл плана отсутствует, используй данный промпт как самостоятельное задание.

Убедись, что FIX-03-R1 реализован и новые стили документации установлены.

## 2. Цель

Превратить страницу /docs/ в компактный навигационный каталог технической документации, сохранив существующий фирменный стиль сайта.

Не изменять архитектуру DocsLayout и оформление MDX-статей.

## 3. Файлы

Читать:

- src/app/docs/page.jsx
- src/app/docs/docs.css
- src/content/docs/navigation.mjs
- соответствующий массив docs в src/content/site.mjs
- tests/docs.test.mjs

Изменять только:

- src/app/docs/page.jsx
- src/app/docs/docs.css
- tests/docs.test.mjs
- docs/IMPLEMENTATION-STATE.md

## 4. Целевая структура страницы

```text
Global Header
┌──────────────────┬──────────────────────────────────┐
│ ДОКУМЕНТАЦИЯ     │ Главная / Документация           │
│                  │                                  │
│ Главная          │ Документация платформы           │
│                  │ Краткое описание                 │
│ Обзор            │                                  │
│ Обзор платформы  │ ┌──────────────────────────────┐ │
│                  │ │ НАЧАЛО РАБОТЫ                │ │
│                  │ │ Обзор платформы            → │ │
│                  │ │ Краткое описание             │ │
│                  │ └──────────────────────────────┘ │
│                  │                                  │
│                  │ Разделы документации             │
│                  │ ┌──────────────┐ ┌─────────────┐ │
│                  │ │ Архитектура  │ │ Компоненты  │ │
│                  │ │ Скоро        │ │ В разработке│ │
│                  │ └──────────────┘ └─────────────┘ │
│                  │ ┌──────────────┐ ┌─────────────┐ │
│                  │ │ Безопасность │ │ Эксплуатация│ │
│                  │ │ Скоро        │ │ Скоро       │ │
│                  │ └──────────────┘ └─────────────┘ │
│                  │                                  │
│                  │ Примечание о статусе документации│
└──────────────────┴──────────────────────────────────┘
Global Footer
```

Не добавлять правую колонку TOC.

## 5. Изменения page.jsx

Сохранить существующие импорты, metadata и компонент:

```jsx
<DocsLayout variant="index" currentSlug="">
```

Установить заголовок H1:

```jsx
<h1>Документация платформы</h1>
```

Под заголовком оставить существующее краткое описание документации.

Убрать маркетинговый Hero, лишние секционные разделители и большие вертикальные отступы.

### Карточка начала работы

Использовать getGettingStarted().

Пример реализации:

```jsx
{start && (
  <a
    className="docs-start-card"
    href={linkHref(docPath(start.slug))}
  >
    <span className="docs-start-label">
      Начало работы
    </span>

    <h2>
      {start.title}
      <span aria-hidden="true"> →</span>
    </h2>

    <p>
      Назначение, границы и ключевые
      решения платформы.
    </p>
  </a>
)}
```

Вся карточка должна быть кликабельной.

### Устранение дублирования

Не выводить статью overview повторно в разделе «Опубликованные материалы».

Перед return сформировать список дополнительных опубликованных материалов:

```jsx
const published = getPublishedDocs();
const start = getGettingStarted();

const catalogSlugs = new Set(
  docs
    .filter(
      card =>
        getSectionStatus(card.slug) === 'published'
    )
    .map(card => card.slug)
);

const otherMaterials = published.filter(
  entry =>
    entry.slug !== start?.slug &&
    !catalogSlugs.has(entry.slug)
);
```

Блок «Другие материалы» отображать только при наличии записей в otherMaterials.

Использовать обычный компактный список ссылок вместо дополнительных больших карточек.

### Каталог разделов

Заголовок:

```jsx
<h2>Разделы документации</h2>
```

Сохранить четыре существующие категории из site.mjs:

- Архитектура.
- Компоненты.
- Безопасность.
- Эксплуатация.

Сохранить их описания, порядок и технологические темы.

Статусы определять через существующий реестр:

```jsx
const status = getSectionStatus(card.slug);

const statusLabel = {
  published: 'Доступно',
  draft: 'В разработке',
  planned: 'Скоро',
}[status];
```

Опубликованную карточку рендерить как ссылку.

Черновики и запланированные разделы рендерить как article без href, tabindex и имитации кликабельности.

Технологические темы выводить из существующего card.topics, не дублируя данные вручную.

Не создавать ссылки на несуществующие страницы.

Не добавлять неработающий поиск.

### Примечание

Внизу оставить короткое примечание о развитии документации и ссылку на контактный блок через linkHref('#contact').

## 6. Изменения docs.css

Использовать существующие design tokens из установленного комплекта стилей.

Не изменять правила #docs-content, MDX, Sidebar, TOC и Grid layout.

Заменять старые правила каталога, а не добавлять конфликтующие определения.

Целевые CSS-правила:

```css
.docs-start-card {
  display: block;
  margin: 24px 0 32px;
  padding: 20px 24px;

  border: 1px solid #bfd1ba;
  border-radius: 8px;

  background: #edf4e9;
  color: var(--ink);
  text-decoration: none;
}

.docs-start-card:hover {
  border-color: var(--green);
  background: #dcebd7;
}

.docs-start-label {
  display: block;
  margin-bottom: 8px;

  font-family: var(--mono);
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;

  color: var(--green);
}

.docs-catalog .docs-start-card h2 {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
}

.docs-start-card p {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--muted);
}

.docs-cards {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.docs-card {
  display: flex;
  flex-direction: column;
  gap: 12px;

  min-width: 0;
  min-height: 184px;
  padding: 24px;

  border: 1px solid var(--line);
  border-radius: 8px;

  background: var(--white);
  overflow-wrap: anywhere;
}

.docs-card h3 {
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
  color: var(--ink);
}

.docs-card p {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--muted);
}

.docs-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.docs-topic {
  padding: 3px 8px;

  border: 1px solid var(--line);
  border-radius: 4px;

  font-family: var(--mono);
  font-size: 11px;
  line-height: 16px;
  color: var(--muted);
}

.docs-card-status {
  align-self: flex-start;
  padding: 3px 8px;

  border: 1px solid var(--line);
  border-radius: 4px;

  font-size: 11px;
  line-height: 16px;

  background: var(--paper);
  color: var(--muted);
}

.docs-card--published:hover {
  border-color: var(--green);
  background: #fafcf9;
}

.docs-note {
  margin-top: 24px;
  font-size: 13px;
  line-height: 20px;
  color: var(--muted);
}

@media (max-width: 639px) {
  .docs-cards {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .docs-card,
  .docs-start-card {
    padding: 20px;
  }
}
```

Сохранить существующие правила доступности и адаптивности.

Учитывать специфичность существующих селекторов. Не использовать !important для устранения конфликтов.

Удалить неиспользуемые правила старого каталога.

## 7. Размеры

- Максимальная ширина каталога: 1100px.
- Sidebar: 256px.
- H1: 36/44px.
- H2: 28/36px.
- Заголовок карточки: 18/26px.
- Основной текст: 16/28px.
- Описание карточки: 14/22px.
- Отступ между карточками: 20px.
- Радиус карточек: 8px.
- Минимальная высота карточки: 184px.
- Mobile: одна колонка при ширине менее 640px.

Не устанавливать фиксированную высоту карточек.

## 8. Проверки

Добавить регрессионные тесты:

- Вводная статья не дублируется в дополнительных материалах.
- Опубликованные категории имеют корректные ссылки.
- Draft и planned категории не имеют ссылок.
- Дополнительные опубликованные статьи не теряются.
- Существующие metadata сохранены.

Выполнить:

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

Проверить фактический exit code каждой команды.

Проверить HTML каталога и статьи после сборки.

Если браузер доступен, проверить разрешения 1440, 1024, 768, 390 и 360px.

Если браузер недоступен, указать:

VISUAL_VALIDATION: NOT_RUN

## 9. Ограничения

- Контекст модели: 32768 токенов.
- Не читать весь репозиторий и весь план.
- Не изменять globals.css.
- Не изменять DocsLayout.
- Не изменять Sidebar и TOC.
- Не изменять mdx-components.js.
- Не изменять стили MDX-статей.
- Не изменять реестр документации.
- Не устанавливать зависимости.
- Не изменять главную страницу сайта.
- Не выполнять FIX-06 или FIX-07.
- Не выполнять git commit и git push.

При приближении к лимиту контекста сохранить промежуточное состояние и остановиться.

## 10. Приёмка

- Компактный каталог без маркетингового Hero.
- Единая карточка начала работы.
- Отсутствие дублирующегося обзора.
- Четыре существующие тематические карточки.
- Корректные статусы разделов.
- Две колонки на desktop, одна на mobile.
- Отсутствие горизонтального переполнения.
- Сохранение SEO.
- Сохранение оформления MDX-статей.
- Успешное выполнение тестов и статического экспорта.

Обновить docs/IMPLEMENTATION-STATE.md фактическими результатами.

Предоставить краткий отчёт и остановиться.

Commit message:

refactor(docs): redesign documentation index as a compact hub