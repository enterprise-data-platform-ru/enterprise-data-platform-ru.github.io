import React from 'react';
import {getArticleNav, docPath} from '../content/docs/navigation.mjs';
import {linkHref} from '../lib/paths.mjs';

// B06: переходы «предыдущая / следующая» между опубликованными статьями.
// Соседи берутся из getArticleNav, который рассматривает только опубликованные
// записи — переход не может вести на плановый раздел или черновик. Если соседей
// нет (например, опубликована одна статья), пажер ничего не рендерит.
export default function DocsArticleNav({currentSlug = ''}) {
  const {prev, next} = getArticleNav(currentSlug);
  if (!prev && !next) return null;

  return (
    <nav className="docs-article-nav" aria-label="Навигация по статьям">
      {prev ? (
        <a className="docs-article-prev" href={linkHref(docPath(prev.slug))}>
          <span className="mono docs-article-dir">← Предыдущая</span>
          <span className="docs-article-title">{prev.title}</span>
        </a>
      ) : <span className="docs-article-prev is-empty" aria-hidden="true" />}

      {next ? (
        <a className="docs-article-next" href={linkHref(docPath(next.slug))}>
          <span className="mono docs-article-dir">Следующая →</span>
          <span className="docs-article-title">{next.title}</span>
        </a>
      ) : <span className="docs-article-next is-empty" aria-hidden="true" />}
    </nav>
  );
}
