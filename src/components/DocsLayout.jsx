import React from 'react';
import DocsSidebar from './DocsSidebar.jsx';
import DocsToc from './DocsToc.jsx';

// FIX-03: единый layout-обёртка для всех страниц документации.
// Рендерит 3-колоночную сетку docs-shell: боковая навигация (B05),
// основной контент и оглавление (B06). Используется всеми сегментами
// /docs/, чтобы структура JSX была идентична.
export default function DocsLayout({children, currentSlug = '', mainClass = 'docs-article'}) {
  return (
    <div className="docs-shell">
      <DocsSidebar currentSlug={currentSlug} />
      <main id="main" className={mainClass}>
        {children}
      </main>
      <aside className="docs-toc" aria-label="Оглавление">
        <h2>На этой странице</h2>
        <DocsToc scopeId="main" />
      </aside>
    </div>
  );
}
