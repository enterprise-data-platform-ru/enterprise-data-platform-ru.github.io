import React from 'react';
import DocsSidebar from '../../../components/DocsSidebar.jsx';

export default function DocsOverviewLayout({children}) {
  return (
    <div className="docs-shell">
      <DocsSidebar currentSlug="overview" />

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
