import React from 'react';
import DocsSidebar from '../../../components/DocsSidebar.jsx';
import DocsBreadcrumb from '../../../components/DocsBreadcrumb.jsx';
import DocsArticleNav from '../../../components/DocsArticleNav.jsx';
import DocsToc from '../../../components/DocsToc.jsx';

// FIX-01: метаданные статьи вынесены в штатный механизм Next.js. YAML
// frontmatter в .mdx не обрабатывается сборкой (нет gray-matter), поэтому в
// frontmatter метаданные рендерятся как видимый текст.
export const metadata = {
  title: 'Обзор платформы — Enterprise Data Platform',
  description:
    'Назначение, границы и ключевые решения корпоративной платформы данных Enterprise Data Platform.',
  alternates: {
    canonical: 'https://enterprisedataplatform.ru/docs/overview/',
  },
};

// Б06: шаблон статьи документации — боковая навигация (B05), хлебные крошки и
// переходы «предыдущая/следующая» (B06), а также оглавление, собранное из
// заголовков h2/h3 этой статьи (а не вручную прописанный список).
export default function DocsOverviewLayout({children}) {
  return (
    <div className="docs-shell">
      <DocsSidebar currentSlug="overview" />

      <main id="main" className="docs-article">
        <DocsBreadcrumb currentSlug="overview" />
        {children}
        <DocsArticleNav currentSlug="overview" />
      </main>

      <aside className="docs-toc" aria-label="Оглавление">
        <h2>На этой странице</h2>
        <DocsToc scopeId="main" />
      </aside>
    </div>
  );
}
