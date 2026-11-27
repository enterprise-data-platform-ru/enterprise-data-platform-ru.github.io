# Enterprise Data Platform — план исправлений документации для Pi Coding Agent

**Репозиторий:** `enterprise-data-platform-ru/enterprise-data-platform-ru.github.io`<br>
**Домен:** https://enterprisedataplatform.ru<br>
**Целевая среда:** Next.js App Router, MDX, статический экспорт, GitHub Pages.<br>
**Исполнитель:** Pi Coding Agent с локальной моделью Qwen.<br>
**Базовое состояние:** аудит ветки `main` от 25 ноября 2026 года; перед началом сверить с текущей веткой.<br>
**Связанные документы:** [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md), [IMPLEMENTATION-STATE.md](../../IMPLEMENTATION-STATE.md), [IMPLEMENTATION-FIX-PROMPT.md](IMPLEMENTATION-FIX-PROMPT.md).

## 1. Цель и исходное состояние

Цель — единый инженерный портал документации в фирменном стиле EDP. Не второй маркетинговый лендинг. Сохранить Next.js App Router, MDX, статический экспорт и существующие URL, тексты и функциональность. Не менять главную страницу сайта.

Исходная точка по последней проверке main: FIX-01 и FIX-02 реализованы; B08 прошёл автоматические проверки по журналу, но ручная браузерная приёмка не выполнена. `docs.css` существует и подключён из `src/app/docs/layout.jsx`; CSS документации удалён из `globals.css`; синтаксис pager исправлен. `page.jsx` и `overview/layout.jsx` всё ещё используют разные структуры. В реестре одна опубликованная статья `overview`, `architecture` — planned, `components` — draft; `security` и `operations` отсутствуют. Четыре тематические карточки сейчас не являются ссылками. По журналу 50/50 тестов и 6 HTML-страниц; эти результаты не являются новым независимым запуском.

| FIX | Назначение | Стартовое состояние |
|---|---|---|
| FIX-01 | MDX и SEO | IMPLEMENTED, визуальная приёмка NOT_RUN |
| FIX-02 | Вынос CSS и синтаксис | IMPLEMENTED, визуальная приёмка NOT_RUN |
| FIX-03 | Единый layout | READY |
| FIX-04 | Компактный каталог | PENDING |
| FIX-05 | Типографика MDX | PENDING |
| FIX-06 | Sidebar и TOC | PENDING |
| FIX-07 | Мобильная адаптация | PENDING |
| FIX-08 | Реестр и целостность данных | PENDING |
| FIX-09 | Регрессия и приёмка | PENDING |

Таблица фиксирует baseline, не является живым журналом. Актуальный статус — последние записи `docs/IMPLEMENTATION-STATE.md` и код. Если репозиторий уже изменился, проверить факты, не повторять реализованную работу. Не перезаписывать исходный `IMPLEMENTATION-PLAN.md`. До окончания FIX-09 не добавлять статьи этапа C или поиск этапа D. B08 не переписывать задним числом; после FIX-09 повторно подтвердить контрольную точку.

## 2. Ограничения локальной модели и рабочий протокол

- Одна сессия = один явно указанный FIX. Не выполнять последующие задачи, даже если они простые. Не переходить автоматически.
- Прочитать `AGENTS.md`, последние записи `docs/IMPLEMENTATION-STATE.md`, раздел 2 и нужный подраздел текущего плана. Уточнить реальное состояние через `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, `rg` и выборочные диапазоны строк. Не читать весь репозиторий, lock-файл, `.next`, `out`, `node_modules` целиком.
- Контекст 32 768 токенов, максимальный ответ 4096 токенов (сверить текущую конфигурацию): ориентир по суммарному контексту до генерации 20–24 тыс. токенов, по исходникам 8–12 тыс. токенов, по одному выводу 150–250 строк. При 70–75% окна завершить на безопасной границе; оставить запас на изменение, тесты и отчёт. При приближении к пределу сохранить состояние и завершить сессию. Вывод команд ограничивать релевантными строками; не загружать HTML/CSS бандлы целиком.
- Разрешённые файлы указаны в каждом FIX. Если нужен другой файл, сначала обосновать необходимость и остановиться, если изменение выходит за рамки задачи. Не отменять чужие изменения, не использовать `git reset --hard`, не коммитить и не отправлять `git push` без явного разрешения.
- Не добавлять зависимости, UI frameworks, внешние шрифты, API routes, SSR/ISR, middleware, runtime server. Не менять глобальные CSS-токены, Header/Footer, контент лендинга, маршруты, workflow публикации без отдельного задания. Не создавать фиктивные ссылки, статьи, поиск, версии или кнопки.
- Ссылки на страницы — `linkHref()` и `docPath()`; ссылки на якоря внутри текущей статьи — `#id` (не `linkHref('#id')`, поскольку тот ведёт на главную). Сохранить `trailingSlash`, `basePath`, canonical и sitemap. Header/Footer/skip-link должны быть в единственном экземпляре.
- CSS оформлять читаемо: одна декларация на строку, завершающие `;`, без `!important`, inline-стилей, декоративных анимаций, градиентов и теней. Использовать префикс `.docs-`; учитывать каскад глобальных `section`, `h1/h2/h3`, `p`, `a`, `.container`. Удалять конфликтующие правила вместо бесконечных переопределений.
- Не объявлять PASS без выполненной проверки. DOM/сборка не доказывают визуальное соответствие. При отсутствии браузера использовать `VISUAL_VALIDATION: NOT_RUN`. Скриншоты без просмотра — `CAPTURED_NOT_REVIEWED`. Функциональные браузерные проверки отмечать отдельно от визуальных.
- При ошибке не продолжать следующий FIX. Исправить в пределах текущего scope либо указать BLOCKED и конкретную причину.

### 2.1. Обязательные проверки после изменения кода

Запускать из корня репозитория, последовательно, останавливаясь на ошибках:

```sh
npm test
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export
NEXT_PUBLIC_BASE_PATH=/edp-test npm run build
NEXT_PUBLIC_BASE_PATH=/edp-test npm run check:export
NEXT_PUBLIC_BASE_PATH='' npm run build
NEXT_PUBLIC_BASE_PATH='' npm run check:export
git diff --check
git status --short
```

Последние build/check восстанавливают production-экспорт. Если проверка failed, явно указать команду, код возврата, диагностический вывод и состояние `out/`. Не подменять выполнение тестов чтением прежнего отчёта. Для FIX без изменений достаточно проверки соответствующих исходников, если прежние тесты не выдаются за текущие.

### 2.2. Запись результата

Добавить краткую запись в конец `docs/IMPLEMENTATION-STATE.md` (не менять предыдущие записи и не вставлять полный текст плана). Указывать base commit SHA до изменения, ветку, статус, изменённые файлы, результаты обеих сборок и тестов, визуальную/браузерную проверку, блокеры и следующий FIX. Не писать, что git-операции сделаны, если их не было.

Журнал уже содержит подробную историю: читать последние записи через `tail -n 40` и искать нужный FIX через `rg -n`, не загружать его целиком. Отдельный файл состояния не создавать.

Статусы: `READY`, `IN_PROGRESS`, `IMPLEMENTED`, `BLOCKED`, `ACCEPTED` (после явной приёмки владельцем). Для каждой проверки: `PASS`, `FAIL`, `NOT_RUN`, `N/A`; для скриншотов допустим `CAPTURED_NOT_REVIEWED`.

## 3. Целевая дизайн-спецификация

### 3.1. Композиция

На всех docs-страницах сохранить фактические глобальные Header и Footer сайта, логотип, навигацию и шрифт. Не рисовать новую шапку. Исходный CSS/журнал предполагает sticky Header около 76 px; проверить `Header.jsx` и `globals.css` (и computed height при наличии браузера). 76 px — начальное значение, не безусловная константа. При отличиях синхронизировать локальный offset с фактической высотой на каждом breakpoint.

Desktop ≥1200 px:

```text
┌────────────────── существующий Header ─────────────────────────┐
│ Sidebar 256px │ Main: minmax(0,1fr)         │ TOC 224px         │
│ Документация  │ Breadcrumbs                 │ На этой странице │
│ Главная       │ H1                         │ H2                │
│ Обзор         │ MDX, ширина ≤820px          │   H3              │
│               │ Previous/Next (если есть)  │                   │
└────────────────── существующий Footer ─────────────────────────┘
```

На `/docs/` две колонки: тот же Sidebar и основной каталог, без TOC и пустой третьей колонки. Sidebar и TOC должны оставаться в пределах shell при прокрутке, не перекрывая Header/Footer. Высота shell не меньше высоты окна минус Header. Прокручивается документ, а не центральная колонка. Панели при необходимости имеют собственный вертикальный скролл.

| Viewport | Sidebar | TOC статьи | Main padding | Каталог |
|---|---|---|---|---|
| ≥1200px | 256px, sticky | 224px, sticky | 32px 40px 64px | 2 колонки |
| 900–1199px | 224px, sticky | в потоке, раскрывающийся | 32px 28px 48px | 2 колонки |
| 640–899px | Drawer/раскрываемая навигация | в потоке | 24px 20px 48px | 2 колонки |
| ≤639px | Drawer/раскрываемая навигация | в потоке | 24px 16px 48px | 1 колонка |

Layout max-width 1600px; статья max-width 820px, каталог max-width 1100px, оба центрируются внутри main. Никакого горизонтального скролла всей страницы. На 1440px shell 1440px; колонки 256/960/224px, main после padding 880px, текст ограничен 820px. На 1024px — 224/800px, TOC внутри main. На 390px ширина main 390px, доступная ширина текста 358px.

### 3.2. Цвета и размеры

Локальные CSS-переменные на `.docs-shell` (только для docs), не менять `:root` сайта. Если существующие фирменные токены имеют те же значения, разрешено переиспользовать через `var()`.

```css
.docs-shell {
  --docs-bg: #f7f9f6;
  --docs-surface: #ffffff;
  --docs-sidebar-bg: #f0f3ef;
  --docs-border: #dce4df;
  --docs-heading: #172b32;
  --docs-text: #334640;
  --docs-muted: #60716b;
  --docs-primary: #24594a;
  --docs-primary-hover: #194638;
  --docs-active-bg: #dcebd7;
  --docs-note-bg: #edf4e9;
  --docs-code-bg: #101c24;
  --docs-code-text: #e2e8f0;
  --docs-header-height: 76px;
  --docs-sidebar-width: 256px;
  --docs-toc-width: 224px;
  --docs-content-width: 820px;
  --docs-layout-width: 1600px;
  --docs-radius: 8px;
  color: var(--docs-text);
  background: var(--docs-surface);
}
.docs-shell *, .docs-shell *::before, .docs-shell *::after {
  box-sizing: border-box;
}
```

Header сохраняет существующий цвет; ориентир тёмный #101C24, акцент #B7F46A только на тёмном фоне. Ссылки светлой области — #24594A. Радиусы 4/6/8px, границы 1px, без теней. Отступы кратны 4px. Focus outline 2px #24594A, offset 3px. Контраст обычного текста ≥4.5:1, крупного ≥3:1; проверять реальные пары цветов.

| Элемент | Размер / line-height | Вес |
|---|---|---|
| H1 | 36/44px; <900px 30/38; ≤639px 28/36 | 650 |
| H2 | 28/36px; <900px 24/32; ≤639px 23/30 | 600 |
| H3 | 22/30px | 600 |
| H4 | 18/26px | 600 |
| Body | 16/28px | 400 |
| Breadcrumb | 13/20px | 400 |
| Sidebar link | 14/20px | 400; active 600 |
| Sidebar group / TOC title | 11/16px | 600 |
| TOC link | 13/20px | 400; active 600 |
| Card title | 18/26px | 600 |
| Card description | 14/22px | 400 |
| Code | 14/22px; ≤639px 13/22 | 400 |
| Table | 14/22px | 400 |

Сохранить существующий font-family. Не подключать новые шрифты. Monospace — существующая `--mono` либо системный fallback.

### 3.3. Реальная структура страниц

Каталог в текущей версии содержит ровно одну опубликованную вводную статью «Обзор платформы» и четыре существующие тематические карточки. Не рисовать несуществующие «Быстрый старт», поисковую строку или переходы к плановым материалам. Пример композиции:

```text
Главная / Документация                  ← breadcrumb
Документация платформы                  ← H1
Материалы по архитектуре, компонентам, безопасности и эксплуатации EDP.

┌ Начало работы ─────────────────────────────────────────────┐
│ Обзор платформы                                     →     │
│ Назначение, границы и ключевые решения.                     │
└────────────────────────────────────────────────────────────┘
Разделы документации                    ← H2
┌ A Архитектура      Скоро ┐  ┌ B Компоненты   В разработке ┐
│ описание и темы          │  │ описание и темы          │
└──────────────────────────┘  └──────────────────────────┘
┌ C Безопасность     Скоро ┐  ┌ D Эксплуатация     Скоро ┐
│ описание и темы          │  │ описание и темы          │
└──────────────────────────┘  └──────────────────────────┘
Короткая заметка о статусе документации и контактная ссылка.
```

Sidebar на обеих страницах: «Документация» (заголовок), «Главная» (реальная ссылка), группа «Начало работы» с «Обзор платформы» (реальная ссылка). Использовать существующий реестр и его группы, не вводить новые названия групп жёстко в JSX; название «Начало работы» — целевой пользовательский ярлык для группы `Обзор` (согласовать в FIX-08). Будущие разделы достаточно показывать в каталоге, не дублировать их в Sidebar. При добавлении статей sidebar формируется автоматически из published.

Статья: Breadcrumb → H1 из MDX → вступление → мобильный TOC (при необходимости) → H2/H3 и текст → pager, только при наличии реального соседа. Desktop TOC справа. Никакого второго H1. Не переписывать текст overview. Сохранить якоря `#naznachenie`, `#granitsy`.

---

## 4. Этап FIX — исправление интерфейса документации

### FIX-01 — MDX и SEO (уже реализован)

**Зависимости:** B03–B07.<br>
**Цель:** метаданные не видны в тексте статьи; уникальные title, description, canonical. Не повторять при наличии исправления.

**Читать/изменять:** `src/app/docs/overview/page.mdx`, `src/app/docs/overview/layout.jsx`, `mdx-components.js` (только при необходимости), `tests/docs.test.mjs`, журнал.

Ожидаемый контракт: `export const metadata` в server layout/page; в MDX нет YAML frontmatter; H1 ровно один; canonical `https://enterprisedataplatform.ru/docs/overview/`; префикс тестового хостинга не попадает в canonical/sitemap. Проверить исходники и тесты. При регрессии исправить в указанных файлах, затем выполнить проверки §2.1.

**Приёмка:** уникальные SEO-метаданные; нет видимого frontmatter; ровно один H1; оба basePath сохраняют production canonical.

**Коммит:** `fix(docs): correct MDX rendering and article metadata`.

### FIX-02 — Изоляция CSS (уже реализован)

**Зависимости:** FIX-01.<br>
**Цель:** все docs-стили в `src/app/docs/docs.css`; импорт из `src/app/docs/layout.jsx`; ни одного оставшегося docs-селектора в `globals.css`. Проверить, что pager имеет корректный синтаксис:

```css
.docs-article-prev, .docs-article-next {
  border-radius: var(--radius);
  color: var(--green);
  text-decoration: none;
  font-size: 14px;
}
```

Это фрагмент проверки, не полная замена существующих правил.

**Читать/изменять:** `src/app/docs/docs.css`, `src/app/globals.css`, `src/app/docs/layout.jsx`, `docs/IMPLEMENTATION-STATE.md`. Не переносить базовые site-токены и не менять дизайн. При отсутствии регрессии не делать повторный рефакторинг.

**Приёмка:** CSS подключён, дубли и синтаксическая ошибка отсутствуют; обе сборки и проверка экспорта проходят.
**Коммит:** `refactor(docs): isolate documentation styles and fix CSS syntax`.

### FIX-03 — Общий layout

**Зависимости:** FIX-01/02 реализованы.<br>
**Цель:** общий серверный компонент, две колонки каталога, три колонки статьи, единый Sidebar.

**Читать/изменять:** `src/components/DocsLayout.jsx` (новый), `src/components/DocsSidebar.jsx`, `src/app/docs/layout.jsx`, `src/app/docs/page.jsx`, `src/app/docs/overview/layout.jsx`, `src/app/docs/docs.css`, `tests/docs.test.mjs`, журнал.

1. Оставить Header/Footer/skip-link и импорт CSS в `src/app/docs/layout.jsx`. Создать общий `DocsLayout` в components. Использовать существующие компоненты, не дублировать их. Каталог и overview должны использовать один шаблон. Metadata сохранить в текущих серверных файлах.
2. В каталоге удалить вложенные `main` и `.container`, оставить существующий контент и секции до FIX-04. В overview перенести общий shell в `DocsLayout`; `DocsArticleNav` и `DocsBreadcrumb` не дублировать. TOC сканирует только MDX article (id `docs-article-content`), а не весь main, чтобы не захватывать служебные заголовки. Существующий `DocsToc` принимает `scopeId`.
3. Добавить «Главная» в `DocsSidebar` с `linkHref('/docs/')`, активная только при `currentSlug === ''`. Для каталога раскрыть группу с единственной опубликованной статьёй; допустимо сделать это на уровне Sidebar без изменения реестра. Сохранить aria-current и реальный порядок published.
4. Ввести токены §3.2, заменить конфликтующие grid/media-правила. На этом этапе sidebar на мобильном должен оставаться видимым в потоке; мобильный Drawer появится в FIX-07. TOC не скрывать без замены: до FIX-07 на узком экране допустимо оставить его в потоке после статьи.

Пример структуры компонента (адаптировать импорты, не добавлять второй H1):

```jsx
import DocsSidebar from './DocsSidebar.jsx';
import DocsBreadcrumb from './DocsBreadcrumb.jsx';
import DocsArticleNav from './DocsArticleNav.jsx';
import DocsToc from './DocsToc.jsx';

export default function DocsLayout({ children, currentSlug = '', variant = 'article' }) {
  const isArticle = variant === 'article';
  return (
    <div className={`docs-shell docs-shell--${variant}`}>
      <DocsSidebar currentSlug={currentSlug} />
      <main id="main" className="docs-main">
        {isArticle ? (
          <div className="docs-article-frame">
            <DocsBreadcrumb currentSlug={currentSlug} />
            <article id="docs-article-content" className="docs-article">
              {children}
            </article>
            <DocsArticleNav currentSlug={currentSlug} />
          </div>
        ) : <div className="docs-page">{children}</div>}
      </main>
      {isArticle && (
        <aside className="docs-toc" aria-label="Оглавление">
          <h2>На этой странице</h2>
          <DocsToc scopeId="docs-article-content" />
        </aside>
      )}
    </div>
  );
}
```

Grid CSS (добавить токены §3.2; удалить старые breakpoints 820/1100 для shell):

```css
.docs-shell {
  display: grid;
  grid-template-columns: var(--docs-sidebar-width) minmax(0, 1fr) var(--docs-toc-width);
  max-width: var(--docs-layout-width);
  min-height: calc(100dvh - var(--docs-header-height));
  margin-inline: auto;
  align-items: start;
}
.docs-shell--index {
  grid-template-columns: var(--docs-sidebar-width) minmax(0, 1fr);
  background: var(--docs-bg);
}
.docs-main { min-width: 0; padding: 32px 40px 64px; }
.docs-article-frame { width: 100%; max-width: var(--docs-content-width); margin-inline: auto; min-width: 0; }
.docs-article { width: 100%; min-width: 0; padding: 0; overflow-wrap: break-word; }
.docs-page { max-width: 1100px; margin-inline: auto; }
.docs-toc { display: block; min-width: 0; }
@media (max-width: 1199px) {
  .docs-shell { --docs-sidebar-width: 224px; grid-template-columns: var(--docs-sidebar-width) minmax(0, 1fr); }
  .docs-main { padding: 32px 28px 48px; }
  .docs-toc { grid-column: 2; }
}
@media (max-width: 899px) {
  .docs-shell, .docs-shell--index { grid-template-columns: minmax(0, 1fr); }
  .docs-main { padding: 24px 20px 48px; }
  .docs-toc { grid-column: 1; }
}
@media (max-width: 639px) {
  .docs-main { padding-inline: 16px; }
}
```

**Приёмка:** один `main#main`, H1, Header/Footer на каждой странице; каталог без TOC; обе страницы используют общий Sidebar, правильный active route; mobile sidebar доступен; metadata и якоря сохранены. Обе сборки §2.1. Добавить регрессионные тесты структуры, не хрупкие проверки форматирования исходника.

**Коммит:** `refactor(docs): introduce shared documentation layout`.

### FIX-04 — Компактный каталог

**Зависимости:** FIX-03.<br>
**Читать/изменять:** `src/app/docs/page.jsx`, `src/app/docs/docs.css`, `tests/docs.test.mjs`, журнал. Допускается новый `DocsCategoryCard.jsx`, если это реально сокращает дублирование.

1. Убрать маркетинговый Hero, uppercase eyebrow `DOCS / REFERENCE MATERIAL`, `01 / GETTING STARTED`, полноширинные полосы, секционные padding 80/40/48/32/64px. Оставить breadcrumb, H1 «Документация платформы», описание, карточку начала работы, H2 «Разделы документации», четыре реальные тематические карточки, краткую заметку о статусе.
2. `getGettingStarted()` — единственный источник ссылки на вводную статью; зелёная карточка целиком является ссылкой. Не повторять `overview` в отдельном списке. Если позже опубликованы другие статьи, которые не представлены карточками, выводить только их в компактном списке «Другие материалы»; не терять реальные ссылки и не дублировать ссылки без необходимости.
3. Использовать `docs` из `site.mjs` и `getSectionStatus` до FIX-08. Сохранить названия, описания, темы и порядок карточек. Published — `<a>`, draft/planned — `<article>` без `href`, tabindex, hover как у ссылки. Статус «В разработке» для draft, «Скоро» для planned. Статус не должен переносить заголовок за пределы карточки. Не добавлять поиск, если он не работает.
4. Обнулить глобальные section padding внутри `.docs-page`; отказаться от `.container` и лишних фоновых полос. Контактную ссылку сохранить через `linkHref('#contact')`.

```css
.docs-page > section { padding: 0; margin: 0; background: transparent; border: 0; }
.docs-page .docs-breadcrumb { margin: 0 0 24px; }
.docs-index-title { margin: 0 0 12px; font-size: 36px; line-height: 44px; font-weight: 650; color: var(--docs-heading); }
.docs-index-description { max-width: 680px; margin: 0 0 24px; font-size: 16px; line-height: 26px; color: var(--docs-muted); }
.docs-start-card { display: block; padding: 20px 24px; margin: 0 0 32px; border: 1px solid #bfd1ba; border-radius: 8px; background: var(--docs-note-bg); color: var(--docs-heading); text-decoration: none; }
.docs-start-card:hover { border-color: var(--docs-primary); background: var(--docs-active-bg); }
.docs-start-label { margin: 0 0 8px; font-size: 11px; line-height: 16px; font-weight: 600; text-transform: uppercase; color: var(--docs-primary); }
.docs-start-card h2 { margin: 0 0 8px; font-size: 22px; line-height: 30px; font-weight: 600; }
.docs-start-card p { margin: 0; font-size: 14px; line-height: 22px; color: var(--docs-text); }
.docs-catalog-title { margin: 0 0 16px; font-size: 24px; line-height: 32px; font-weight: 600; color: var(--docs-heading); }
.docs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.docs-card { display: flex; flex-direction: column; gap: 12px; min-width: 0; min-height: 184px; padding: 24px; border: 1px solid var(--docs-border); border-radius: 8px; background: var(--docs-surface); color: var(--docs-text); overflow-wrap: anywhere; }
.docs-card-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin: 0; }
.docs-card h2, .docs-card h3 { margin: 0; font-size: 18px; line-height: 26px; font-weight: 600; color: var(--docs-heading); }
.docs-card p { margin: 0; font-size: 14px; line-height: 22px; color: var(--docs-muted); }
.docs-code { font-size: 11px; color: var(--docs-muted); }
.docs-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
.docs-topic { padding: 3px 8px; font-size: 11px; line-height: 16px; border: 1px solid var(--docs-border); border-radius: 4px; color: var(--docs-muted); }
.docs-soon { margin-left: auto; padding: 3px 8px; font-size: 11px; line-height: 16px; border: 1px solid var(--docs-border); border-radius: 4px; color: var(--docs-muted); background: var(--docs-bg); }
.docs-card-link { text-decoration: none; }
.docs-card-link:hover { border-color: var(--docs-primary); background: #fafcf9; box-shadow: none; }
.docs-card-cta { margin-top: auto; font-size: 13px; color: var(--docs-primary); font-weight: 600; }
.docs-page .docs-note { margin-top: 24px; font-size: 13px; line-height: 20px; color: var(--docs-muted); }
@media (max-width: 899px) { .docs-index-title { font-size: 30px; line-height: 38px; } }
@media (max-width: 639px) {
  .docs-index-title { font-size: 28px; line-height: 36px; }
  .docs-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .docs-card, .docs-start-card { padding: 20px; }
}
```

Классы должны реально присутствовать в JSX; не оставлять неиспользуемые старые правила. Если H2 «Разделы документации» — карточки использовать H3. Карточку overview оформить H2 или семантически корректным заголовком без пропуска уровня. Не устанавливать фиксированную высоту, только min-height.

**Приёмка:** компактный каталог с рабочей ссылкой overview, четыре реальные карточки, никаких dead links и дублирующегося обзора; 2/1 колонки; тексты не обрезаны; тесты §2.1.
**Коммит:** `refactor(docs): redesign documentation index as a compact hub`.

### FIX-05 — Типографика MDX

**Зависимости:** FIX-04.<br>
**Читать/изменять:** `src/app/docs/docs.css`, `mdx-components.js`, при необходимости небольшие компоненты `src/components/DocsCodeBlock.jsx`, `DocsCallout.jsx`, `tests/docs.test.mjs`, журнал. `overview/page.mdx` менять только для эквивалентной разметки существующих якорей, не переписывать содержание. Сначала проверить конфигурацию MDX, не добавлять пакеты.

Основная задача — переопределить маркетинговые стили в пределах `.docs-article`, не затронуть Sidebar, Header, Footer и каталог. Применить следующий CSS, объединить существующие дубли:

```css
.docs-article { font-size: 16px; line-height: 28px; color: var(--docs-text); font-weight: 400; overflow-wrap: break-word; }
.docs-article h1, .docs-article h2, .docs-article h3, .docs-article h4 { color: var(--docs-heading); letter-spacing: -0.02em; scroll-margin-top: calc(var(--docs-header-height) + 24px); }
.docs-article h1 { font-size: 36px; line-height: 44px; font-weight: 650; margin: 0 0 16px; }
.docs-article h2 { font-size: 28px; line-height: 36px; font-weight: 600; margin: 40px 0 16px; }
.docs-article h3 { font-size: 22px; line-height: 30px; font-weight: 600; margin: 28px 0 12px; }
.docs-article h4 { font-size: 18px; line-height: 26px; font-weight: 600; margin: 24px 0 12px; }
.docs-article p { margin: 0 0 16px; font-size: 16px; line-height: 28px; }
.docs-article ul, .docs-article ol { padding-inline-start: 24px; margin: 16px 0 24px; }
.docs-article ul { list-style: disc; }
.docs-article ol { list-style: decimal; }
.docs-article li { margin-bottom: 6px; }
.docs-article li::marker { color: var(--docs-primary); }
.docs-article li > p { margin-bottom: 8px; }
.docs-article a[href] { color: var(--docs-primary); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
.docs-article a[href]:hover { color: var(--docs-primary-hover); }
.docs-article hr { border: 0; border-top: 1px solid var(--docs-border); margin: 32px 0; }
.docs-article img, .docs-article svg { max-width: 100%; height: auto; }
.docs-article blockquote { margin: 24px 0; padding: 16px 20px; border-left: 3px solid var(--docs-primary); border-radius: 0 6px 6px 0; background: var(--docs-note-bg); }
.docs-article blockquote > :last-child { margin-bottom: 0; }
.docs-article pre { max-width: 100%; overflow-x: auto; margin: 24px 0; padding: 20px; background: var(--docs-code-bg); color: var(--docs-code-text); border-radius: 8px; font: 14px/22px var(--mono, monospace); tab-size: 2; white-space: pre; overflow-wrap: normal; }
.docs-article :not(pre) > code { padding: 2px 5px; border-radius: 4px; background: #edf1eb; color: var(--docs-primary); font: 0.875em/1.5 var(--mono, monospace); overflow-wrap: anywhere; }
.docs-article pre code { padding: 0; font: inherit; color: inherit; background: transparent; white-space: pre; overflow-wrap: normal; }
.docs-table-wrapper { width: 100%; max-width: 100%; overflow-x: auto; margin: 24px 0; border: 1px solid var(--docs-border); border-radius: 6px; }
.docs-article table { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 22px; }
.docs-article th { font-weight: 600; text-align: left; background: var(--docs-sidebar-bg); }
.docs-article th, .docs-article td { padding: 12px 16px; vertical-align: top; border-bottom: 1px solid var(--docs-border); }
.docs-article tbody tr:nth-child(even) { background: #fafbf9; }
.docs-article tbody tr:last-child td { border-bottom: 0; }
.docs-callout { margin: 24px 0; padding: 16px 20px; border-left: 4px solid var(--callout-color, #24594a); background: var(--callout-bg, #edf4e9); border-radius: 0 6px 6px 0; }
.docs-callout--warning { --callout-color: #996000; --callout-bg: #fff7e6; }
.docs-callout--danger { --callout-color: #b42318; --callout-bg: #fdecec; }
.docs-callout--tip { --callout-color: #245a8d; --callout-bg: #eaf2fa; }
.docs-callout-title { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--callout-color, #24594a); }
.docs-callout > :last-child { margin-bottom: 0; }
@media (max-width: 899px) {
  .docs-article h1 { font-size: 30px; line-height: 38px; }
  .docs-article h2 { font-size: 24px; line-height: 32px; }
}
@media (max-width: 639px) {
  .docs-article h1 { font-size: 28px; line-height: 36px; }
  .docs-article h2 { font-size: 23px; line-height: 30px; }
  .docs-article pre { padding: 16px; font-size: 13px; }
}
```

MDX table mapping, если поддерживается текущим компилятором (объединить с существующими mappings, сохранить переданные `components`):

```jsx
const Table = (props) => (
  <div className="docs-table-wrapper" role="region" aria-label="Таблица" tabIndex={0}>
    <table {...props} />
  </div>
);
// В существующем useMDXComponents добавить table: Table.
```

Проверить поддержку GFM pipe tables: не считать её включённой автоматически. Если текущий MDX не поддерживает Markdown-таблицы, проверить нативную JSX-таблицу/обёртку; GFM оформить отдельным блокером, не устанавливать plugin самостоятельно. Блок кода допускает компактный заголовок языка и кнопку «Копировать» только при рабочем Clipboard API с обработкой отказа; если реализуется, использовать небольшой client component, aria-live для результата, без внешних библиотек. Не рисовать неработающую кнопку. Callout — серверная обёртка с allowlist note/warning/danger/tip, видимым текстовым заголовком, без фиктивных сообщений.

Для проверок длинных строк, таблиц, списков и callout использовать временный локальный fixture/тест, не публиковать демонстрационную страницу; удалить временные файлы до итоговой сборки. Проверить прежние якоря, в том числе прямые fragment URL.

**Приёмка:** размеры/отступы §3, ширина ≤820px; длинные строки кода/таблицы скроллятся внутри; списки с маркерами; цитаты читаемы; H1 один; нет изменений лендинга; проверки §2.1.
**Коммит:** `style(docs): implement scoped MDX typography and content styles`.

### FIX-06 — Sidebar, breadcrumbs, TOC и pager

**Зависимости:** FIX-05.<br>
**Читать/изменять:** `src/components/DocsSidebar.jsx`, `DocsToc.jsx`, `DocsBreadcrumb.jsx`, `DocsArticleNav.jsx`, `DocsLayout.jsx`, `src/lib/heading-slug.mjs` (если требуется), `src/app/docs/docs.css`, `tests/docs.test.mjs`, журнал.

1. Сохранить группировку published, native details/summary, `aria-current=page`. Активная строка — фон #DCEBD7, зелёная вертикальная полоса 3px, вес 600. Не дублировать цветной маркер `●`, если сохранены полоса, вес и aria-current. Группа активной статьи открыта; на каталоге вводная группа раскрыта. Sidebar фон #F0F3EF, padding 24px 16px. Ссылка ≥36px высотой, на сенсорных устройствах ≥44px. Группы — 11px uppercase, вложенность 16px.
2. Sidebar и правый TOC sticky на desktop; до FIX-07 узкие экраны показывают панели в потоке. Если высота Header изменяется, синхронизировать offset с фактическим CSS, не менять Header. Проверить ancestors на overflow, нарушающий sticky.
3. TOC строится из H2/H3 только в `#docs-article-content`. Сохранить существующий `buildToc`, кириллицу и старые якоря. Идентификаторы должны присутствовать в экспортированном HTML для прямых fragment URL, если текущий MDX pipeline позволяет. Для уже опубликованной статьи обязательно сохранить существующие якоря; для будущих статей документировать явные стабильные id в MDX, если автоматическая генерация возможна только после hydration. Не переименовывать существующие уникальные id. При обнаружении дублей фиксировать проблему контента и тестировать алгоритм; не оставлять дубли.
4. Добавить scrollspy на `IntersectionObserver` или обработчик scroll с throttling/requestAnimationFrame: активен последний заголовок, верх которого прошёл offset Header + 24px; если таких нет — первый. Обработать достижение низа, resize, переход по hash, очистку подписок. Только один `aria-current="location"` в каждом видимом TOC; активный элемент — вес 600 и полоса. Не переписывать hash при обычном скролле. Не применять автопрокрутку с анимацией принудительно. Сохранить нативное поведение ссылок.
5. Breadcrumbs — 13px, wrap; Pager — только реальные published-соседи, без пустых ссылок, с правильным выравниванием. Текущая одна статья — pager отсутствует.

```css
.docs-sidebar {
  position: sticky;
  top: var(--docs-header-height);
  height: calc(100dvh - var(--docs-header-height));
  min-width: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px 16px;
  background: var(--docs-sidebar-bg);
  border: 0;
  border-right: 1px solid var(--docs-border);
}
.docs-nav-title { margin: 0 0 12px; padding-inline: 12px; font-size: 11px; line-height: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--docs-muted); }
.docs-nav-list, .docs-nav-items { list-style: none; margin: 0; padding: 0; }
.docs-nav-group { margin: 16px 0 0; }
.docs-nav-summary { min-height: 36px; padding: 8px 12px; font-size: 11px; line-height: 20px; font-weight: 600; text-transform: uppercase; color: var(--docs-muted); cursor: pointer; }
.docs-nav-list li, .docs-nav-item { margin: 0; }
.docs-nav-list a { position: relative; display: flex; align-items: center; min-height: 36px; gap: 8px; padding: 8px 12px; border-radius: 4px; font-size: 14px; line-height: 20px; color: var(--docs-text); text-decoration: none; overflow-wrap: anywhere; }
.docs-nav-items a { padding-inline-start: 28px; }
.docs-nav-list a:hover { background: #e6ede2; color: var(--docs-primary); text-decoration: none; }
.docs-nav-list a[aria-current="page"] { background: var(--docs-active-bg); color: var(--docs-primary); font-weight: 600; }
.docs-nav-list a[aria-current="page"]::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; border-radius: 3px; background: var(--docs-primary); }
.docs-toc { position: sticky; top: calc(var(--docs-header-height) + 24px); max-height: calc(100dvh - var(--docs-header-height) - 48px); overflow-y: auto; padding: 0 20px 24px; margin-top: 32px; border-left: 1px solid var(--docs-border); }
.docs-toc h2 { margin: 0 0 16px; font-size: 11px; line-height: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--docs-muted); }
.docs-toc ul { margin: 0; padding: 0; list-style: none; }
.docs-toc li { margin: 0; }
.docs-toc a { display: block; padding: 6px 8px; border-left: 3px solid transparent; font-size: 13px; line-height: 20px; color: var(--docs-muted); text-decoration: none; overflow-wrap: anywhere; }
.docs-toc a:hover, .docs-toc a[aria-current="location"] { color: var(--docs-primary); }
.docs-toc a[aria-current="location"] { border-left-color: var(--docs-primary); font-weight: 600; }
.docs-toc-item.is-sub { padding-inline-start: 12px; }
.docs-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 13px; line-height: 20px; color: var(--docs-muted); }
.docs-breadcrumb a { color: var(--docs-primary); text-decoration: none; }
.docs-breadcrumb a:hover { text-decoration: underline; }
.docs-article-nav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 48px; padding: 24px 0 0; border-top: 1px solid var(--docs-border); }
.docs-article-prev, .docs-article-next { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 16px; border: 1px solid var(--docs-border); border-radius: 8px; color: var(--docs-primary); text-decoration: none; font-size: 14px; }
.docs-article-next { grid-column: 2; text-align: right; }
.docs-article-prev:hover, .docs-article-next:hover { border-color: var(--docs-primary); background: var(--docs-bg); }
.docs-article-dir { font-size: 12px; color: var(--docs-muted); }
.docs-article-title { font-weight: 600; }
@media (max-width: 1199px) {
  .docs-toc { position: static; max-height: none; margin: 0; padding: 16px 28px; border-left: 0; }
}
@media (max-width: 899px) {
  .docs-sidebar { position: static; height: auto; overflow: visible; border-right: 0; border-bottom: 1px solid var(--docs-border); }
}
@media (max-width: 639px) {
  .docs-article-nav { grid-template-columns: minmax(0, 1fr); }
  .docs-article-next { grid-column: auto; }
}
.docs-shell :focus-visible { outline: 2px solid var(--docs-primary); outline-offset: 3px; }
```

**Приёмка:** единый Sidebar; правильный active link; корректные переходы и старые hash; TOC только H2/H3, корректная вложенность и scrollspy; sticky не перекрывает Header/Footer; отсутствующие соседи не рендерятся. Тесты helper-функций и §2.1. Browser scrollspy не считать PASS без фактического запуска.
**Коммит:** `style(docs): improve sidebar and article navigation`.

### FIX-07 — Мобильная адаптация

**Зависимости:** FIX-06.<br>
**Читать/изменять:** `src/components/DocsLayout.jsx`, `DocsSidebar.jsx`, `DocsToc.jsx`, новый `DocsMobileNav.jsx` (при необходимости), `src/app/docs/docs.css`, `tests/docs.test.mjs`, журнал.

1. При ширине <900px убрать постоянную левую колонку. Над main, сразу под глобальным Header, разместить панель «Документация» с реальной кнопкой раскрытия навигации, высота ≥48px, padding 8px 16px, фон #F0F3EF, нижняя граница 1px. Предпочтителен простой disclosure в потоке (нативные details/summary или button с `aria-expanded` + `aria-controls`); он не требует модального focus trap и остаётся доступным без JS при native details. Если выбран Drawer, использовать доступный dialog: закрытие Escape, initial focus, возврат фокуса, блокировка фоновых взаимодействий и скролла. Не имитировать modal обычным div. На desktop сохраняется обычная навигация. В каждом viewport только одна видимая и фокусируемая копия Sidebar, без дублирующихся DOM id.
2. При ширине <1200px TOC расположить внутри main до первого H2, предпочтительно после H1/вступления; допускается сразу после breadcrumb перед статьёй, если это не требует изменения MDX-контента. Native details/summary «На этой странице», высота summary ≥44px, border 1px, radius 6px, фон #F7F9F6. Не рисовать пустой TOC, если заголовков нет. Desktop TOC скрыть через CSS `display:none` на мобильном; мобильный скрыть на desktop. Если два экземпляра DocsToc используют общий список, не допускать гонки генерации id: сбор заголовков и присвоение id идемпотентны, либо выполняются один раз общим контроллером. Не нарушать прямые якоря и SSR hydration.
3. Применить breakpoints и отступы из §3.1. Проверить 360, 390, 640, 768, 899, 900, 1024, 1199, 1200, 1280, 1440, 1920px. Границы не должны перекрываться. Вложенные grid-элементы имеют `min-width:0`. На странице нет горизонтальной прокрутки; `overflow-x:hidden` на body не является исправлением.
4. Сохранить клавиатурную навигацию, видимый focus, reduced motion, сенсорные target ≥44px для мобильных кнопок. При якорных переходах учитывать высоту действительно sticky-элементов. При наличии JS-состояния меню закрывается при выборе ссылки; обычный переход по anchor/page допустим. Не добавлять отдельный mobile Header.

Пример disclosure (вынести общий список ссылок, чтобы не дублировать данные):

```jsx
<details className="docs-mobile-nav">
  <summary>Документация</summary>
  <div className="docs-mobile-nav-content">
    <DocsSidebar currentSlug={currentSlug} />
  </div>
</details>
```

Desktop Sidebar в этом случае обернуть в `.docs-sidebar-desktop`; убедиться, что `aside`/`nav` не получают одинаковый id, а скрытые копии недоступны Tab. Не вкладывать `<details>` в `<summary>`. Переиспользовать один компонент, а не отдельный hardcoded список.

```css
.docs-mobile-nav, .docs-toc-mobile { display: none; }
.docs-sidebar-desktop { min-width: 0; position: sticky; top: var(--docs-header-height); }
.docs-sidebar-desktop > .docs-sidebar { position: static; }
@media (max-width: 1199px) {
  .docs-toc { display: none; }
  .docs-toc-mobile { display: block; margin: 0 0 24px; padding: 0 14px; border: 1px solid var(--docs-border); border-radius: 6px; background: var(--docs-bg); }
  .docs-toc-mobile summary { min-height: 44px; padding: 12px 0; font-size: 14px; line-height: 20px; font-weight: 600; color: var(--docs-heading); cursor: pointer; }
  .docs-toc-mobile .docs-toc-list { padding: 0 0 12px; list-style: none; }
  .docs-toc-mobile .docs-toc-list a { display: block; padding: 10px 8px; color: var(--docs-primary); font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
}
@media (max-width: 899px) {
  .docs-sidebar-desktop { display: none; }
  .docs-mobile-nav { display: block; grid-column: 1; background: var(--docs-sidebar-bg); border-bottom: 1px solid var(--docs-border); }
  .docs-mobile-nav > summary { min-height: 48px; padding: 14px 16px; font-size: 14px; line-height: 20px; font-weight: 600; color: var(--docs-primary); cursor: pointer; }
  .docs-mobile-nav .docs-sidebar { position: static; height: auto; max-height: 65dvh; overflow-y: auto; border: 0; }
  .docs-mobile-nav .docs-nav-list a, .docs-mobile-nav .docs-nav-summary { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .docs-shell *, .docs-shell *::before, .docs-shell *::after { transition: none; animation: none; scroll-behavior: auto; }
}
```

Если используется другое решение disclosure, оно должно соответствовать указанным размерам и функциональным требованиям. Объединить правила `.docs-toc` и `.docs-sidebar` с FIX-06; не оставлять конфликтующих declarations. Для mobile TOC применить те же правила active state, что и для desktop.

**Приёмка:** навигация и TOC доступны на 360/390/768/1024px, обе панели desktop на ≥1200px, корректные Tab/Enter/Space (Escape для modal), отсутствие переполнения, один H1/main, без dead links; §2.1.
**Коммит:** `feat(docs): add responsive documentation navigation`.

### FIX-08 — Реестр и целостность данных

**Зависимости:** FIX-07.<br>
**Читать/изменять:** `src/content/docs/navigation.mjs`, `src/content/site.mjs` (только docs-данные при необходимости), `src/app/docs/page.jsx`, `src/components/DocsSidebar.jsx`, `src/app/sitemap.js` (только при обнаруженной необходимости), `tests/docs.test.mjs`, журнал.

Цель — исключить тихое расхождение каталога, реестра, маршрутов и sitemap, не менять фактический контент лендинга. Не превращать категорию и статью в один и тот же объект без необходимости.

- Добавить явные записи planned для отсутствующих `security`, `operations` с уникальными slug/order и правильными заголовками; `architecture` planned, `components` draft сохранить. Не создавать маршруты для них. `overview` published и source сохранить.
- Согласовать название группы `Обзор` → «Начало работы» в одном источнике (если это поле используется в других местах, проверить ссылки/тесты). Не менять slug и URL.
- Сохранить `docs` из `site.mjs` как метаданные карточек, если они нужны другим потребителям. Статус публикации принадлежит реестру; в каталоге не хранить второй независимый статус. Для текущей модели каждый card.slug должен иметь явную запись. Альтернатива для будущих многостатейных разделов — отдельный реестр categories с явными categoryId у статей; не реализовывать эту архитектуру без необходимости в текущем FIX.
- Добавить проверку неизвестных/дублирующихся slug карточек, валидности статусов, обязательных title/section/order, соответствия published source существующему маршруту, уникальности маршрутов, запрета source/public links для непубликуемых материалов в текущей модели. Не использовать fs/runtime на клиенте; проверку существования файлов выполнять в тесте Node или при сборке.
- `getSectionStatus` не должен тихо скрывать отсутствие ожидаемой записи: каталог валидируется явно. Если существующие тесты требуют fallback planned для произвольного slug, сохранить API, но проверять все реальные карточки через отдельную валидацию. Не ухудшать безопасность `docPath`/`linkHref`.
- Sidebar, pager, sitemap — только published. Каталог: planned «Скоро», draft «В разработке», published реальная ссылка. Все текущие статьи доступны через каталог/Sidebar без нерабочих маршрутов. Не дублировать обзор и не вводить поиск.

**Приёмка:** тест на отсутствие записи карточки; тест на дубли slug/невалидный статус; тест на published source/маршрут; draft/planned отсутствуют в sitemap и в ссылках Sidebar/pager; оба basePath; §2.1.
**Коммит:** `refactor(docs): align documentation registry and catalog`.

### FIX-09 — Финальная регрессия и приёмка

**Зависимости:** FIX-03–08 реализованы, FIX-01/02 не регрессировали.<br>
**Читать/изменять:** `tests/docs.test.mjs`, существующие test/check scripts при необходимости, `docs/IMPLEMENTATION-STATE.md`, новый `docs/IMPLEMENTATION-FIX-VALIDATION.md` (отчёт). Не менять дизайн в этой задаче; при дефекте открыть корректирующий FIX с узким scope и остановиться. Не добавлять зависимости без согласования.

1. Выполнить §2.1 и проверить весь экспорт. Сохранить доказательства (число тестов, HTML, ссылки, canonical, sitemap, результаты root/prefix, git diff). Не требовать неизменности числа тестов/asset refs; оно может увеличиваться.
2. Проверить обе страницы: прямой URL, refresh, якоря, переход назад, active nav, единственный Header/Footer/main/H1, метаданные, ссылки, отсутствие PoC, отсутствие dead links и утечки `/edp-test` в production canonical/sitemap. Сопоставить `globals.css` и главную страницу с исходным baseline, проверить отсутствие регрессий CSS/JS.
3. Если доступен установленный браузер/Playwright, запустить локальный preview существующим скриптом. Не устанавливать browser packages без согласования. Снимать `/docs/`, `/docs/overview/` и `/` при 360×800, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080. Хранить скриншоты локально (например, вне репозитория или в игнорируемой папке), не коммитить PNG без указания владельца. Проверить оба режима basePath хотя бы функционально на desktop/mobile. При отсутствии браузера записать NOT_RUN; если модель не видит скриншоты — CAPTURED_NOT_REVIEWED, передать пути владельцу.
4. При наличии browser automation измерить DOM и computed styles. Допуск ±1 CSS px для округлений. Проверять при 100% zoom:

```js
// Выполнять в контексте страницы после загрузки/гидратации.
const main = document.querySelector('main#main');
const article = document.querySelector('.docs-article');
const sidebar = document.querySelector('.docs-sidebar-desktop .docs-sidebar') ||
  document.querySelector('.docs-sidebar');
const h1 = main?.querySelector('h1');
const rect = (el) => el?.getBoundingClientRect();
console.log({
  viewport: innerWidth,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  mainCount: document.querySelectorAll('main#main').length,
  h1Count: document.querySelectorAll('h1').length,
  mainWidth: rect(main)?.width,
  articleWidth: rect(article)?.width,
  sidebarWidth: rect(sidebar)?.width,
  h1Size: h1 && getComputedStyle(h1).fontSize,
  h1LineHeight: h1 && getComputedStyle(h1).lineHeight,
});
```

Дополнительно проверить grid columns, доступность видимых панелей, высоту Header и sticky offset, отсутствие перекрытия Footer, локальный overflow длинного кода/таблиц (fixture без публикации), отсутствие ошибок console/hydration, Tab/Shift+Tab/Enter/Space/Escape (где применимо), focus visible, mobile disclosure, scrollspy и навигацию с кириллицей.

#### Итоговый чек-лист владельца

- [ ] `/` сохранила прежний дизайн и функциональность.
- [ ] Каталог и статья визуально являются единым порталом.
- [ ] Sidebar 256/224px, TOC 224px; нет пустой колонки у каталога.
- [ ] Статья ≤820px, типографика/цвета/отступы соответствуют §3.
- [ ] Каталог компактный, 2/1 колонки, без лишних marketing-секций и дублирования overview.
- [ ] Все видимые ссылки и элементы управления функциональны.
- [ ] MDX frontmatter отсутствует, H1 один, списки/код/цитаты/таблицы читаемы.
- [ ] Sticky панели корректно работают и не перекрывают Header/Footer.
- [ ] Мобильная навигация и TOC работают; нет общего горизонтального скролла.
- [ ] Прямые якоря и активное оглавление работают.
- [ ] SEO, basePath, static export, sitemap и registry проверены.
- [ ] Реальные скриншоты просмотрены на всех контрольных разрешениях.
- [ ] ADR принят владельцем; приёмка B08 повторно подтверждена.

Автоматические проверки PASS при отсутствии визуальной проверки не равны полной приёмке. В этом случае статус FIX-09 `IMPLEMENTED` с открытой ручной приёмкой, не `ACCEPTED`. Вернуться к этапам C/D только после явной приёмки владельцем.

**Приёмка:** выполнены проверки и чек-лист выше; без ручной приёмки статус только IMPLEMENTED.
**Коммит:** `test(docs): validate documentation redesign and static export`.

---

## 5. Формат итогового отчёта одной сессии

```text
TASK: FIX-XX
BASE_SHA:
BRANCH:
STATUS: IMPLEMENTED / BLOCKED / ACCEPTED
CHANGED_FILES:
CHECKS:
  npm test:
  root build/check:
  prefix build/check:
  production export restored:
  git diff --check:
BROWSER_FUNCTIONAL_VALIDATION: PASS / FAIL / NOT_RUN / N/A
VISUAL_VALIDATION: PASS / FAIL / NOT_RUN / CAPTURED_NOT_REVIEWED / N/A
SCREENSHOTS:
KNOWN_ISSUES:
NEXT_TASK:
COMMIT_MESSAGE:
```

Статус ACCEPTED не присваивается агентом без явного подтверждения владельца.

## 6. Запуск следующей задачи

Использовать [универсальный промпт](IMPLEMENTATION-FIX-PROMPT.md). Текущая отправная точка — FIX-03, если актуальная ветка и журнал не содержат более поздней реализации. Владелец выбирает один ID, проверяет diff и самостоятельно создаёт коммит. После FIX-09 и ручной приёмки вернуться к этапу C основного плана. Если scope включает только чтение и нет изменений, отметить это и не создавать пустой коммит.
