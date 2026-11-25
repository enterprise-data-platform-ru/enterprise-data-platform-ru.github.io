import React from 'react';
import {getArticleNav} from '../content/docs/navigation.mjs';
import {linkHref} from '../lib/paths.mjs';

export default function DocsBreadcrumb({currentSlug = ''}) {
  const {current} = getArticleNav(currentSlug);
  return (
    <nav className="docs-breadcrumb" aria-label="Хлебные крошки">
      <a href={linkHref('/')}>Главная</a>
      <span aria-hidden="true">/</span>
      {current ? (
        <>
          <a href={linkHref('/docs/')}>Документация</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{current.title}</span>
        </>
      ) : (
        <span aria-current="page">Документация</span>
      )}
    </nav>
  );
}
