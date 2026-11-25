import React from 'react';
import {getArticleNav} from '../content/docs/navigation.mjs';
import {linkHref} from '../lib/paths.mjs';

// B06: хлебные крошки статьи. Каждая крошка ведёт на реальную страницу через
// linkHref: Главная (/) и Раздел документации (/docs/). Текущая статья —
// aria-current и на себя не ссылается. Плановых/черновых маршрутов здесь нет.
export default function DocsBreadcrumb({currentSlug = ''}) {
  const {current} = getArticleNav(currentSlug);
  const title = current ? current.title : 'Документация';
  return (
    <nav className="docs-breadcrumb" aria-label="Хлебные крошки">
      <a href={linkHref('/')}>Главная</a>
      <span aria-hidden="true">/</span>
      <a href={linkHref('/docs/')}>Документация</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
