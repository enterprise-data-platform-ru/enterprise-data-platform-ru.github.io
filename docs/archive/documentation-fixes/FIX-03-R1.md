# FIX-03-R1 — Устранение регрессий общего layout документации

**Репозиторий:** `enterprise-data-platform-ru/enterprise-data-platform-ru.github.io`<br>
**Домен:** https://enterprisedataplatform.ru<br>
**Исполнитель:** Pi Coding Agent.<br>
**Зависимости:** FIX-01, FIX-02, FIX-03.<br>
**Приоритет:** обязательное исправление перед FIX-04.

## 1. Цель

Исправить ошибки, допущенные при реализации FIX-03.

Восстановить SEO-метаданные, корректную навигацию, единую структуру документации и соответствие ранее определённым размерам layout.

Не выполнять полный редизайн каталога или типографики статей. Эти изменения предусмотрены последующими задачами.

Приведённые ниже фрагменты кода являются целевой реализацией. Перед изменением каждого файла сверить его фактическое содержимое. Если исправление уже присутствует, проверить его вместо повторного внесения изменений.

## 2. Подготовка

Выполни:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Прочитай:

- `AGENTS.md`;
- последние 60 строк `docs/IMPLEMENTATION-STATE.md`;
- раздел FIX-03 из `docs/archive/documentation-fixes/IMPLEMENTATION-FIX-PLAN.md`, если файл существует.

Если план отсутствует, используй данный промпт как самостоятельное техническое задание.

Не загружай весь репозиторий в контекст.

## 3. Разрешённые файлы

```text
src/app/docs/layout.jsx
src/app/docs/page.jsx
src/app/docs/docs.css
src/app/docs/overview/layout.jsx
src/components/DocsLayout.jsx
src/components/DocsSidebar.jsx
tests/docs.test.mjs
docs/IMPLEMENTATION-STATE.md
```

Другие файлы изменять запрещено без отдельного согласования.

## 4. ERR-01 — Восстановление SEO каталога

**Файл:** `src/app/docs/page.jsx`

### Проблема

В результате FIX-03 удалён экспорт `metadata`. Каталог наследует метаданные главной страницы.

### Исправление

После импортов и перед объявлением `DocsIndexPage` добавить:

```jsx
export const metadata = {
  title: 'Документация — Enterprise Data Platform',
  description:
    'Архитектура, компоненты, безопасность и эксплуатация корпоративной платформы данных.',
  alternates: {
    canonical:
      'https://enterprisedataplatform.ru/docs/',
  },
};
```

### Приёмка

В сгенерированном `out/docs/index.html` должны присутствовать:

```html
<title>Документация — Enterprise Data Platform</title>

<link
  rel="canonical"
  href="https://enterprisedataplatform.ru/docs/"
/>
```

Также должен присутствовать уникальный meta description.

Порядок HTML-атрибутов не имеет значения.

## 5. ERR-02 — Исправление метаданных статьи

**Файл:** `src/app/docs/overview/layout.jsx`

### Ошибочный код

```jsx
export const metadata = {
  title: 'Обзор платформы — Корпоративная платформа данных',
  description:
    'Назначение, границы и ключевые решения корпоративной платформы данных. Краткое описание архитектуры и технологического стека.',
  canonical:
    'https://enterprisedataplatform.ru/docs/overview/',
};
```

### Правильный код

```jsx
export const metadata = {
  title: 'Обзор платформы — Enterprise Data Platform',
  description:
    'Назначение, границы и ключевые решения корпоративной платформы данных Enterprise Data Platform.',
  alternates: {
    canonical:
      'https://enterprisedataplatform.ru/docs/overview/',
  },
};
```

Поле `canonical` должно находиться внутри `alternates`.

Запрещается размещать `canonical` непосредственно в корне объекта `metadata`.

При сборке с `/edp-test` canonical должен сохранять production URL.

## 6. ERR-03 — Исправление родительского layout

**Файл:** `src/app/docs/layout.jsx`

### Ошибочный код

```jsx
<DocsLayout currentSlug="">
  {children}
</DocsLayout>
```

Пустой `currentSlug` передаётся всем страницам документации. Sidebar не может определить активную статью.

### Заменить файл следующим кодом

```jsx
import React from 'react';
import './docs.css';

import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

export default function DocsRootLayout({children}) {
  return (
    <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>

      <Header activeSection="/docs/" />

      {children}

      <Footer />
    </>
  );
}
```

### Ответственность компонента

Родительский layout отвечает только за:

- подключение CSS документации;
- глобальный Header;
- глобальный Footer;
- skip-link;
- рендеринг дочернего маршрута.

Он не должен самостоятельно определять текущую статью или вариант Grid layout.

Не добавлять `usePathname` и не превращать родительский layout в Client Component.

## 7. ERR-04 — Исправление общего DocsLayout

**Файл:** `src/components/DocsLayout.jsx`

### Проблема

Текущий компонент всегда создаёт три колонки и TOC, включая главную страницу документации.

### Заменить файл следующим кодом

```jsx
import React from 'react';

import DocsSidebar from './DocsSidebar.jsx';
import DocsBreadcrumb from './DocsBreadcrumb.jsx';
import DocsArticleNav from './DocsArticleNav.jsx';
import DocsToc from './DocsToc.jsx';

export default function DocsLayout({
  children,
  currentSlug = '',
  variant = 'article',
}) {
  const isIndex = variant === 'index';

  return (
    <div
      className={
        isIndex
          ? 'docs-shell docs-shell--index'
          : 'docs-shell docs-shell--article'
      }
    >
      <DocsSidebar currentSlug={currentSlug} />

      <main id="main" className="docs-main">
        {isIndex ? (
          <div className="docs-catalog">
            <DocsBreadcrumb />
            {children}
          </div>
        ) : (
          <div className="docs-article">
            <DocsBreadcrumb
              currentSlug={currentSlug}
            />

            <article id="docs-content">
              {children}
            </article>

            <DocsArticleNav
              currentSlug={currentSlug}
            />
          </div>
        )}
      </main>

      {!isIndex && (
        <aside
          className="docs-toc"
          aria-label="Оглавление"
        >
          <h2>На этой странице</h2>

          <DocsToc
            scopeId="docs-content"
          />
        </aside>
      )}
    </div>
  );
}
```

### Контракт компонента

| Параметр | Значение |
|---|---|
| `variant="index"` | Каталог без TOC |
| `variant="article"` | Статья с TOC |
| `currentSlug=""` | Главная документации |
| `currentSlug="overview"` | Статья обзора |

Оглавление строится только по заголовкам внутри `article#docs-content`.

Компоненты Header и Footer здесь не создавать.

## 8. Подключение layout к статье

**Файл:** `src/app/docs/overview/layout.jsx`

Заменить содержимое файла:

```jsx
import React from 'react';

import DocsLayout from
  '../../../components/DocsLayout.jsx';

export const metadata = {
  title: 'Обзор платформы — Enterprise Data Platform',
  description:
    'Назначение, границы и ключевые решения корпоративной платформы данных Enterprise Data Platform.',
  alternates: {
    canonical:
      'https://enterprisedataplatform.ru/docs/overview/',
  },
};

export default function DocsOverviewLayout({
  children,
}) {
  return (
    <DocsLayout
      currentSlug="overview"
      variant="article"
    >
      {children}
    </DocsLayout>
  );
}
```

Удалить прежние импорты:

```jsx
import DocsBreadcrumb from
  '../../../components/DocsBreadcrumb.jsx';

import DocsArticleNav from
  '../../../components/DocsArticleNav.jsx';
```

Теперь эти компоненты предоставляет общий `DocsLayout`.

Файл `page.mdx` не изменять.

## 9. Подключение layout к каталогу

**Файл:** `src/app/docs/page.jsx`

Добавить импорт:

```jsx
import DocsLayout from
  '../../components/DocsLayout.jsx';
```

Восстановить `metadata` согласно разделу 4.

Найти:

```jsx
return (
  <div className="docs-catalog">
```

Заменить:

```jsx
return (
  <DocsLayout
    currentSlug=""
    variant="index"
  >
```

В конце компонента заменить соответствующий закрывающий `</div>` на:

```jsx
  </DocsLayout>
);
```

Имеющиеся секции каталога сохранить:

```jsx
<DocsLayout
  currentSlug=""
  variant="index"
>
  <section className="docs-hero">
    {/* Существующее содержимое */}
  </section>

  <section className="docs-start">
    {/* Существующее содержимое */}
  </section>

  <section className="docs-list">
    {/* Существующее содержимое */}
  </section>

  <section className="docs-published">
    {/* Существующее содержимое */}
  </section>

  <aside className="docs-note">
    {/* Существующее содержимое */}
  </aside>
</DocsLayout>
```

Этот пример описывает структуру. Не заменять фактическое содержимое комментариями.

### Удаление вложенных контейнеров

Во всех перечисленных секциях удалить обёртки:

```jsx
<div className="container">
  ...
</div>
```

Например, вместо:

```jsx
<section className="docs-hero">
  <div className="container">
    <h1>Корпоративная платформа данных</h1>
    <p className="lead">
      Описание документации
    </p>
  </div>
</section>
```

должно быть:

```jsx
<section className="docs-hero">
  <h1>Документация</h1>

  <p className="lead">
    Материалы по архитектуре, компонентам,
    безопасности и эксплуатации
    Enterprise Data Platform.
  </p>
</section>
```

Сохранить существующие `id` и `aria-labelledby`, если они используются.

Шириной и горизонтальными отступами теперь управляет `.docs-main`.

Не добавлять внутренний `<main>`.

Не дублировать `DocsBreadcrumb`: он уже присутствует в общем layout.

## 10. ERR-05 — Исправление Sidebar

**Файл:** `src/components/DocsSidebar.jsx`

### Заменить компонент следующим кодом

```jsx
import React from 'react';

import {getSidebarNav} from
  '../content/docs/navigation.mjs';

import {linkHref} from
  '../lib/paths.mjs';

export default function DocsSidebar({
  currentSlug = '',
}) {
  const groups = getSidebarNav(currentSlug);
  const isIndex = currentSlug === '';

  return (
    <aside className="docs-sidebar">
      <nav aria-label="Разделы документации">
        <p className="docs-nav-title mono">
          ДОКУМЕНТАЦИЯ
        </p>

        <ul className="docs-nav-list">
          <li
            className={
              isIndex
                ? 'docs-nav-item is-active'
                : 'docs-nav-item'
            }
          >
            <a
              href={linkHref('/docs/')}
              aria-current={
                isIndex ? 'page' : undefined
              }
            >
              Главная
            </a>
          </li>

          {groups.map((group) => (
            <li
              key={group.section}
              className="docs-nav-group"
            >
              <details
                open={isIndex || group.open}
              >
                <summary
                  className="docs-nav-summary"
                >
                  {group.section}
                </summary>

                <ul className="docs-nav-items">
                  {group.items.map((item) => (
                    <li
                      key={item.slug}
                      className={
                        item.active
                          ? 'docs-nav-item is-active'
                          : 'docs-nav-item'
                      }
                    >
                      <a
                        href={linkHref(item.href)}
                        aria-current={
                          item.active
                            ? 'page'
                            : undefined
                        }
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
```

### Требования

На странице `/docs/` активна ссылка «Главная».

На странице `/docs/overview/` активна ссылка «Обзор платформы».

Внутри Sidebar должна присутствовать ровно одна ссылка с `aria-current="page"`.

Не создавать ссылки на `draft` и `planned` материалы.

Сохранить совместимость с `linkHref()` и обоими режимами `basePath`.

## 11. ERR-06 — Исправление размеров Grid layout

**Файл:** `src/app/docs/docs.css`

### Удалить устаревшие правила

Найти и удалить либо заменить существующие блоки:

```css
.docs-shell
.docs-article
.docs-toc
```

Включая их определения внутри старых media queries:

```css
@media (min-width: 820px)
@media (min-width: 1100px)
```

Удалять только конфликтующие правила перечисленных компонентов. Не удалять media query целиком, если внутри остались другие необходимые селекторы.

### Добавить целевой layout

```css
.docs-shell {
  --docs-header-height: 76px;
  --docs-sidebar-width: 256px;
  --docs-toc-width: 224px;
  --docs-content-width: 820px;
  --docs-layout-width: 1600px;

  display: grid;

  grid-template-columns:
    var(--docs-sidebar-width)
    minmax(0, 1fr)
    var(--docs-toc-width);

  max-width: var(--docs-layout-width);
  min-height: calc(
    100dvh - var(--docs-header-height)
  );

  margin-inline: auto;
  align-items: start;
}

.docs-shell--index {
  grid-template-columns:
    var(--docs-sidebar-width)
    minmax(0, 1fr);
}

.docs-main {
  min-width: 0;
  padding: 32px 40px 64px;
}

.docs-article {
  width: 100%;
  max-width: var(--docs-content-width);
  min-width: 0;

  margin-inline: auto;
  padding: 0;

  overflow-wrap: break-word;
}

.docs-catalog {
  width: 100%;
  min-width: 0;
  max-width: 1100px;
  margin-inline: auto;
}

.docs-toc {
  display: block;
  min-width: 0;

  padding: 24px 20px;
  border-left: 1px solid var(--line);
}

.docs-article pre {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 1199px) {
  .docs-shell {
    --docs-sidebar-width: 224px;

    grid-template-columns:
      var(--docs-sidebar-width)
      minmax(0, 1fr);
  }

  .docs-toc {
    display: none;
  }

  .docs-main {
    padding-inline: 28px;
  }
}

@media (max-width: 899px) {
  .docs-shell,
  .docs-shell--index,
  .docs-shell--article {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .docs-main {
    padding: 24px 20px 48px;
  }

  .docs-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
}

@media (max-width: 639px) {
  .docs-main {
    padding-inline: 16px;
  }
}
```

Проверить фактическую высоту глобального Header, включая мобильные media queries. При необходимости скорректировать `--docs-header-height`.

### Обязательные размеры

| Параметр | Значение |
|---|---:|
| Максимальная ширина layout | 1600 px |
| Sidebar desktop | 256 px |
| Sidebar tablet | 224 px |
| TOC | 224 px |
| Ширина статьи | максимум 820 px |
| Ширина каталога | максимум 1100 px |
| Отступ desktop | 40 px |
| Отступ tablet | 28 px |
| Отступ mobile | 16–20 px |

До реализации FIX-07 Sidebar на мобильном устройстве должен оставаться видимым над содержимым.

Мобильное оглавление будет реализовано отдельной задачей FIX-07.

## 12. Минимальное оформление Sidebar

**Файл:** `src/app/docs/docs.css`

Заменить существующие правила соответствующих селекторов:

```css
.docs-sidebar {
  min-width: 0;
  align-self: start;
  padding: 24px 16px;

  background: #f0f3ef;
  border-right: 1px solid #dce4df;
}

.docs-nav-title {
  margin: 0 0 16px;
  padding-inline: 12px;

  color: var(--muted);
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;

  letter-spacing: 0.06em;
}

.docs-nav-list,
.docs-nav-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.docs-nav-group {
  margin-top: 16px;
}

.docs-nav-summary {
  padding: 8px 12px;

  color: var(--muted);
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;

  cursor: pointer;
}

.docs-nav-items {
  padding-left: 8px;
}

.docs-nav-item {
  margin: 2px 0;
}

.docs-nav-item a {
  position: relative;
  display: flex;
  align-items: center;

  min-height: 36px;
  padding: 8px 12px;

  border-radius: 4px;

  color: var(--ink);
  font-size: 14px;
  line-height: 20px;
  text-decoration: none;
}

.docs-nav-item a:hover {
  background: #e6ede2;
  color: var(--green);
}

.docs-nav-item a[aria-current="page"] {
  background: #dcebd7;
  color: var(--green);
  font-weight: 600;
}

.docs-nav-item a[aria-current="page"]::before {
  content: "";
  position: absolute;

  top: 0;
  bottom: 0;
  left: 0;

  width: 3px;
  border-radius: 3px;

  background: var(--green);
}

.docs-nav-item a:focus-visible,
.docs-nav-summary:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
```

Удалить неиспользуемое правило `.docs-nav-marker`, поскольку текстовый маркер заменён вертикальной полосой и выделением активной ссылки.

Полноценное закрепление Sidebar и TOC будет выполнено в FIX-06.

## 13. ERR-07 — Неопределённые CSS-переменные

**Файл:** `src/app/docs/docs.css`

Найти все использования следующих переменных:

```css
var(--font-mono)
var(--ink-mute)
var(--ink-soft)
var(--surface)
```

Эти переменные отсутствуют в текущей дизайн-системе.

Заменить:

```text
--font-mono → --mono
--ink-mute  → --muted
--ink-soft  → --muted
--surface   → --white
```

В результате соответствующие правила должны выглядеть так:

```css
.docs-card-tag {
  display: inline-block;

  font-family: var(--mono);
  font-size: 11px;

  letter-spacing: 0.08em;
  text-transform: uppercase;

  color: var(--muted);
  margin-bottom: 8px;
}

.docs-card-status {
  display: inline-block;

  font-family: var(--mono);
  font-size: 11px;

  letter-spacing: 0.08em;
  text-transform: uppercase;

  margin-top: 8px;
  color: var(--muted);
}

.docs-list-intro {
  color: var(--muted);
  font-size: 16px;
  line-height: 26px;
}

.docs-start-empty {
  color: var(--muted);
  font-style: italic;
}
```

Не добавлять новые глобальные CSS-переменные в `globals.css`.

## 14. ERR-08 — Дублирующиеся CSS-правила

**Файл:** `src/app/docs/docs.css`

В текущем файле дважды определены:

```css
.docs-start-link
.docs-start-link:hover
```

Удалить дублирующиеся базовые определения и оставить один согласованный набор:

```css
.docs-start-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  gap: 12px;
  margin-top: 16px;
  padding: 16px 20px;

  border: 1px solid var(--line);
  border-radius: 8px;

  background: var(--white);
  color: var(--green);

  font-size: 14px;
  line-height: 22px;
  font-weight: 600;

  text-decoration: none;

  transition:
    border-color 150ms ease,
    background-color 150ms ease;
}

.docs-start-link:hover {
  border-color: var(--green);
  background: #edf4e9;
}

.docs-start-link:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 3px;
}

.docs-start-link small {
  color: var(--muted);
  font-size: 12px;
  font-weight: 400;
}

.docs-shell .arrow {
  color: var(--green);
  font-size: 18px;
}

@media (max-width: 639px) {
  .docs-start-link {
    align-items: flex-start;
  }
}
```

Удалить глобальный селектор:

```css
.arrow {
  color: var(--ink-mute);
  font-size: 1.1rem;
}
```

Также удалить устаревшее правило:

```css
.docs-article > .docs-catalog {
  display: contents;
}
```

После исправления каталог и статья являются разными вариантами layout.

Повторное объявление одного селектора внутри media query допускается, если оно необходимо для адаптивности. Дублирующиеся базовые правила без необходимости запрещены.

## 15. ERR-09 — Переполнение сетки карточек

**Файл:** `src/app/docs/docs.css`

### Ошибочный код

```css
.docs-cards {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
```

Минимальная ширина 280 px может превышать доступную ширину контента.

### Заменить

```css
.docs-cards {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 20px;
  margin-top: 20px;
}

.docs-card {
  min-width: 0;
  overflow-wrap: anywhere;

  border: 1px solid var(--line);
  border-radius: 8px;

  padding: 24px;
  background: var(--white);
}

.docs-card h3 {
  color: var(--ink);

  font-size: 18px;
  line-height: 26px;
  font-weight: 600;

  margin: 0 0 12px;
}

.docs-card p {
  color: var(--muted);

  font-size: 14px;
  line-height: 22px;

  margin: 0 0 12px;
}

@media (max-width: 639px) {
  .docs-cards {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .docs-card {
    padding: 20px;
  }
}
```

Заменять существующие правила, а не добавлять конфликтующие определения в конец файла.

Не использовать `overflow-x: hidden` для маскировки ошибок layout.

## 16. ERR-10 — Несуществующее поле summary

**Файл:** `src/app/docs/page.jsx`

Найти:

```jsx
<p>{d.summary}</p>
```

В текущем `navigation.mjs` поле `summary` отсутствует.

Заменить:

```jsx
{d.summary && (
  <p>{d.summary}</p>
)}
```

Не добавлять вымышленные описания статей.

Не изменять структуру реестра документации в рамках этой задачи. Реестр будет согласован в FIX-08.

## 17. Целевая структура интерфейса

### Каталог `/docs/`

```text
+----------------------------------------------------+
|                    Global Header                   |
+--------------+-------------------------------------+
|              | Breadcrumbs                         |
| Sidebar      |                                     |
|              | Документация                        |
| Главная [*]  | Описание                            |
|              |                                     |
| Обзор        | Начать работу                       |
|              |                                     |
|              | +---------------+ +---------------+ |
|              | | Архитектура   | | Компоненты    | |
|              | +---------------+ +---------------+ |
|              | +---------------+ +---------------+ |
|              | | Безопасность  | | Эксплуатация  | |
|              | +---------------+ +---------------+ |
+--------------+-------------------------------------+
|                    Global Footer                   |
+----------------------------------------------------+
```

Правая колонка отсутствует.

### Статья `/docs/overview/`

```text
+----------------------------------------------------+
|                    Global Header                   |
+-------------+-------------------------+------------+
| Sidebar     | Breadcrumbs             | TOC        |
|             |                         |            |
| Главная     | Обзор платформы         | Назначение |
|             |                         | Границы    |
| Обзор [*]   | Содержимое статьи       |            |
|             |                         |            |
|             | Назначение              |            |
|             |                         |            |
|             | Границы                 |            |
|             |                         |            |
+-------------+-------------------------+------------+
|                    Global Footer                   |
+----------------------------------------------------+
```

Desktop: Sidebar 256 px, TOC 224 px, центральная колонка гибкой ширины.

Tablet: Sidebar и основной контент.

Mobile: Sidebar над основным контентом до реализации Drawer.

## 18. Регрессионные тесты

**Файл:** `tests/docs.test.mjs`

Не ограничиваться проверкой наличия слова `canonical` в исходном коде.

Усилить существующий тест FIX-01: проверять, что `canonical` расположен внутри `alternates`.

Пример:

```javascript
test('overview canonical is inside alternates', () => {
  assert.match(
    overviewLayout,
    /alternates\s*:\s*\{[^}]*canonical\s*:/
  );
});
```

Добавить проверку metadata каталога:

```javascript
const docsIndex = readFileSync(
  new URL(
    '../src/app/docs/page.jsx',
    import.meta.url
  ),
  'utf8'
);

test('docs index has metadata', () => {
  assert.match(
    docsIndex,
    /export\s+const\s+metadata/
  );

  assert.match(
    docsIndex,
    /alternates\s*:\s*\{[^}]*canonical\s*:/
  );
});
```

Переиспользовать существующие импорты `test`, `assert` и `readFileSync`.

Не дублировать объявления переменных, если они уже существуют.

Важное замечание: существующий тест опубликованных карточек содержит проверку:

```javascript
href.endsWith('/docs/')
```

Для маршрута статьи этот инвариант неправильный.

Исправить на:

```javascript
assert.equal(
  href,
  `/docs-base/docs/${card.slug}/`
);
```

Проверка должна работать и после появления новых опубликованных разделов.

Не удалять существующие тесты ради получения успешного результата.

## 19. Проверка статического HTML

После каждой сборки необходимо проверить реальные HTML-файлы:

```text
out/docs/index.html
out/docs/overview/index.html
```

Проверка только исходных JSX-файлов недостаточна.

Для каждой страницы подтвердить:

- ровно один `main#main`;
- ровно один H1;
- один глобальный Header;
- один глобальный Footer;
- уникальный title;
- уникальный description;
- правильный canonical;
- отсутствие служебного MDX frontmatter;
- ровно одну активную ссылку внутри Sidebar.

Дополнительно для каталога:

- класс `docs-shell--index`;
- отсутствие `aside.docs-toc`;
- отсутствие вложенных `.container` внутри каталога;
- активная ссылка «Главная»;
- наличие ссылки на `/docs/overview/`.

Дополнительно для статьи:

- класс `docs-shell--article`;
- наличие `article#docs-content`;
- наличие `aside.docs-toc`;
- активная ссылка «Обзор платформы»;
- сохранение якорей `naznachenie` и `granitsy`.

Учесть, что DocsToc является Client Component. Наличие контейнера в статическом HTML не доказывает работоспособность динамического оглавления.

## 20. Команды проверки

Проверить изменения:

```bash
git diff --check
git diff --stat
```

Проверить тесты:

```bash
npm test
```

Production export:

```bash
NEXT_PUBLIC_BASE_PATH='' npm run build

NEXT_PUBLIC_BASE_PATH='' npm run check:export
```

Проверить сгенерированный HTML.

Project site export:

```bash
NEXT_PUBLIC_BASE_PATH=/edp-test npm run build

NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export
```

Повторно проверить сгенерированный HTML.

Восстановить production export:

```bash
NEXT_PUBLIC_BASE_PATH='' npm run build

NEXT_PUBLIC_BASE_PATH='' npm run check:export
```

Проверить отсутствие ошибочных CSS-переменных:

```bash
rg -n -- \
  'var\(--(font-mono|ink-mute|ink-soft|surface)\b' \
  src/app/docs/docs.css
```

Команда не должна находить совпадений.

Проверить отсутствие глобального селектора `.arrow`:

```bash
rg -n '^\.arrow\s*\{' \
  src/app/docs/docs.css
```

Команда не должна находить совпадений.

Для каждой команды проверить фактический exit code.

## 21. Визуальная проверка

Минимальные разрешения:

| Viewport | Ожидаемая структура статьи |
|---|---|
| 1920 × 1080 | Три колонки |
| 1440 × 900 | Три колонки |
| 1280 × 800 | Три колонки |
| 1024 × 768 | Две колонки |
| 768 × 1024 | Одна колонка |
| 390 × 844 | Одна колонка |
| 360 × 800 | Одна колонка |

На странице каталога правая панель должна отсутствовать при любом разрешении.

Проверить отсутствие горизонтальной прокрутки.

Если доступны браузерные инструменты, проверить:

```javascript
document.documentElement.scrollWidth <=
  document.documentElement.clientWidth
```

Если браузер недоступен:

```text
VISUAL_VALIDATION: NOT_RUN
```

Не утверждать, что визуальная приёмка пройдена, на основании успешной сборки.

## 22. Управление контекстом

Размер контекста модели — 32 768 токенов.

Работать последовательно:

1. Метаданные.
2. Общий layout.
3. Sidebar.
4. CSS.
5. Регрессионные тесты.
6. Проверка экспорта.

Не читать одновременно все файлы проекта.

Использовать:

```bash
rg -n 'docs-shell|docs-main|docs-article' \
  src/app/docs/docs.css

rg -n 'docs-start-link|docs-card|arrow' \
  src/app/docs/docs.css

git diff -- src/app/docs/
```

Не выводить большие файлы и полные логи сборки в контекст.

При достижении 70–75% окна контекста записать промежуточное состояние в `IMPLEMENTATION-STATE.md` и остановиться. Продолжить тот же FIX в новой сессии.

## 23. Ограничения

- Не изменять `globals.css`.
- Не изменять глобальный Header и Footer.
- Не изменять главную страницу сайта.
- Не изменять содержимое MDX-статьи.
- Не изменять существующие URL.
- Не устанавливать дополнительные зависимости.
- Не создавать новые UI-библиотеки.
- Не добавлять внешние шрифты.
- Не переводить серверные компоненты в клиентские без необходимости.
- Не выполнять FIX-04.
- Не выполнять git commit.
- Не выполнять git push.
- Не перезаписывать пользовательские изменения.
- Не считать отсутствующую браузерную проверку успешной.

## 24. Обновление состояния реализации

**Файл:** `docs/IMPLEMENTATION-STATE.md`

Добавить короткую запись:

```markdown
### FIX-03-R1 — Устранение регрессий layout

- Base commit:
- Branch:
- Status:
- Changed files:
- Metadata:
- Shared layout:
- Sidebar:
- CSS variables:
- CSS duplicates:
- npm test:
- Production export:
- Project site export:
- HTML validation:
- Visual validation:
- Known issues:
- Next task:
- Commit: pending
```

Заполнить поля фактическими результатами.

Если обязательные автоматические проверки не прошли, указать `BLOCKED` или `IN_PROGRESS`.

Если автоматические проверки пройдены, но визуальная приёмка недоступна, явно указать, что ожидается проверка владельцем.

Следующую задачу FIX-04 разрешено считать готовой к запуску только после устранения регрессий и принятия результата владельцем.

## 25. Definition of Done

Задача считается технически реализованной, если:

- восстановлены метаданные каталога и статьи;
- canonical корректен в обоих режимах basePath;
- каталог использует две колонки на desktop;
- статья использует три колонки на desktop;
- Sidebar одинаковый на всех страницах;
- активный маршрут определяется корректно;
- TOC отсутствует в каталоге;
- восстановлены breadcrumbs;
- устранены неопределённые CSS-переменные;
- устранены конфликтующие CSS-правила;
- соблюдены размеры layout;
- регрессионные тесты проходят;
- оба статических экспорта проходят;
- состояние реализации обновлено.

Окончательная визуальная приёмка выполняется отдельно.

## 26. Commit message

```text
fix(docs): resolve shared layout and metadata regressions
```

После завершения предоставить краткий отчёт и остановиться. Не переходить к следующей задаче автоматически.
