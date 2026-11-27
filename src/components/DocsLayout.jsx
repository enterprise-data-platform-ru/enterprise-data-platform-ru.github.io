import React from 'react';
import DocsSidebar from './DocsSidebar.jsx';
import DocsMobileNav from './DocsMobileNav.jsx';
import DocsBreadcrumb from './DocsBreadcrumb.jsx';
import DocsArticleNav from './DocsArticleNav.jsx';
import DocsToc from './DocsToc.jsx';

export default function DocsLayout({children, currentSlug = '', variant = 'article'}) {
  const isIndex = variant === 'index';
  return (
    <div className={`docs-shell docs-shell--${isIndex ? 'index' : 'article'}`}>
      <div className="docs-sidebar-desktop"><DocsSidebar currentSlug={currentSlug} /></div>
      <DocsMobileNav currentSlug={currentSlug} />
      <main id="main" className="docs-main">
        {isIndex ? (
          <div className="docs-catalog">
            <DocsBreadcrumb />
            {children}
          </div>
        ) : (
          <div className="docs-article">
            <DocsBreadcrumb currentSlug={currentSlug} />
            <article id="docs-content">{children}</article>
            <DocsArticleNav currentSlug={currentSlug} />
          </div>
        )}
        {!isIndex && (
          <aside className="docs-toc" aria-label="Оглавление">
            <DocsToc scopeId="docs-content" />
          </aside>
        )}
      </main>
    </div>
  );
}
