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
