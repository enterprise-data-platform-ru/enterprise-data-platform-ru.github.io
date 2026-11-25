import React from 'react';
import {getPublishedDocs, docPath} from '../../../content/docs/navigation.mjs';
import {linkHref} from '../../../lib/paths.mjs';

export default function DocsOverviewLayout({children}) {
  const published = getPublishedDocs();
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <nav aria-label="Разделы документации">
          <p className="docs-nav-title mono">РАЗДЕЛЫ</p>
          <ul className="docs-nav-list">
            {published.map(d => (
              <li key={d.slug}>
                <a href={linkHref(docPath(d.slug))}>{d.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main id="main" className="docs-article">{children}</main>

      <aside className="docs-toc" aria-label="Оглавление">
        <h2>На этой странице</h2>
        <ul>
          <li><a href="#naznachenie">Назначение</a></li>
          <li><a href="#granitsy">Границы</a></li>
        </ul>
      </aside>
    </div>
  );
}
