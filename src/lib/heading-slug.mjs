// B06: чистые помощники для оглавления. Их можно тестировать в Node, а клиентский
// DocsToc импортирует их, чтобы не дублировать логику. Якоря из заголовков
// статьи должны быть уникальными и реальными (когда у заголовка нет id,
// назначается стабильный слог; при повторах добавляется суффикс).

// Слог из текста заголовка: нижний регистр, кириллица сохраняется, пробелы ->
// дефис, всё остальное (пунктуация и т.п.) удаляется, повторяющиеся дефисы
// схлопываются. Детерминированно: одинаковый текст даёт одинаковый слог.
export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Уникальный id: если base уже занят в used, добавляет -1, -2, …
export function uniqueHeadingId(base, used) {
  const root = base || 'section';
  let candidate = root;
  let n = 1;
  while (used.has(candidate)) {
    candidate = `${root}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}
