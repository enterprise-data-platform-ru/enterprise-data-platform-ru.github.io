// Единый источник истины для маршрутов документации.
// Публичные ссылки (индекс /docs/) и sitemap строятся только из записей
// со статусом 'published'. Черновики и планы не получают публичных ссылок.
//
// Маршруты задаются файловой маршрутизацией Next.js (page.mdx), поэтому
// динамический сегмент и generateStaticParams не нужны; поле `source`
// хранит путь к исходнику в информационных целях.

export const DOC_STATUSES = ['published', 'draft', 'planned'];

// published — опубликована, маршрут существует, ссылка публикуется;
// draft     — в работе, маршрут не создаётся, ссылка не публикуется;
// planned   — запланирована, маршрут не создаётся, ссылка не публикуется.
export const docsNav = [
  {
    slug: 'overview',
    title: 'Обзор платформы',
    section: 'Обзор',
    order: 1,
    status: 'published',
    source: 'src/app/docs/overview/page.mdx',
  },
  {
    slug: 'architecture',
    title: 'Архитектура',
    section: 'Архитектура',
    order: 2,
    status: 'planned',
  },
  {
    slug: 'components',
    title: 'Компоненты',
    section: 'Компоненты',
    order: 3,
    status: 'draft',
  },
];

// Контроль на дубли: при сборке/тестах бросает исключение, если slug повторяется.
const seen = new Set();
for (const d of docsNav) {
  if (seen.has(d.slug)) {
    throw new Error(`Дублирующийся slug документации: ${d.slug}`);
  }
  seen.add(d.slug);
}

// Реестр отсортирован по полю order (публичные ссылки идут в этом порядке).
export function getDocsNav() {
  return [...docsNav].sort((a, b) => a.order - b.order);
}

// Только опубликованные записи — источник для публичных ссылок и sitemap.
export function getPublishedDocs() {
  return getDocsNav().filter((d) => d.status === 'published');
}

// Root-relative путь к статье (basePath добавляет linkHref / префикс CI).
export function docPath(slug) {
  const entry = docsNav.find((d) => d.slug === slug);
  if (!entry) {
    throw new Error(`Неизвестный slug документации: ${slug}`);
  }
  return `/docs/${slug}/`;
}

// B05: дерево боковой навигации из опубликованных разделов/статей.
// Черновики и планы исключены (активных ссылок на них нет). Текущая статья
// (currentSlug) помечается как active, а её группа открывается (open).
// Порядок разделов и статей — по полю order; порядок не зависит от currentSlug.
export function getSidebarNav(currentSlug = '') {
  const published = getPublishedDocs();
  const groups = new Map();
  for (const d of published) {
    if (!groups.has(d.section)) {
      groups.set(d.section, {section: d.section, items: []});
    }
    groups.get(d.section).items.push(d);
  }
  return [...groups.values()].map((g) => ({
    section: g.section,
    open: g.items.some((i) => i.slug === currentSlug),
    items: g.items.map((i) => ({
      slug: i.slug,
      title: i.title,
      active: i.slug === currentSlug,
      href: docPath(i.slug),
    })),
  }));
}

// B06: переходы «предыдущая / следующая» берутся из порядка опубликованных
// статей, поэтому переход не может вести на плановый раздел или черновик.
// Возвращаются текущая запись и ближайшие соседи; отсутствующий сосед — null,
// тогда пажер эту сторону не рисует (нет нерабочих кнопок).
export function getArticleNav(currentSlug = '') {
  const published = getPublishedDocs();
  const index = published.findIndex((d) => d.slug === currentSlug);
  const current = index >= 0 ? published[index] : null;
  const prev = index > 0 ? published[index - 1] : null;
  const next = index >= 0 && index < published.length - 1 ? published[index + 1] : null;
  return {current, prev, next};
}

// B07: статус каталожной карточки раздела. Карточка ссылается на реальный
// маршрут только если раздел уже опубликован (есть запись реестра со
// статусом published). Плановый раздел или ещё не созданный раздел
// (отсутствует в реестре) возвращают 'planned' — для них ссылка не строится,
// чтобы каталог не содержал мёртвых ссылок.
export function getSectionStatus(slug = '') {
  const match = docsNav.find((d) => d.slug === slug);
  if (!match) return 'planned';
  return match.status;
}

// B07: точка входа «Начать работу» — опубликованная статья-обзор.
// Ищем по слагу overview; если обзор недоступен, берём первую опубликованную
// статью по порядку. Если опубликованных нет — null, блок не рисуется.
export function getGettingStarted() {
  const published = getPublishedDocs();
  if (published.length === 0) return null;
  return published.find((d) => d.slug === 'overview') ?? published[0];
}
