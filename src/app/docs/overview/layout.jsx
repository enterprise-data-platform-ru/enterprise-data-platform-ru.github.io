import React from 'react';
import DocsBreadcrumb from '../../../components/DocsBreadcrumb.jsx';
import DocsArticleNav from '../../../components/DocsArticleNav.jsx';

// FIX-03: дублирующаяся обёртка (docs-shell + DocsSidebar + DocsToc)
// удалена — единую сетку предоставляет DocsLayout из src/app/docs/layout.jsx.
// Здесь остаются только специфичные для статьи элементы:
//   - metadata (Next.js segment metadata, FIX-01)
//   - DocsBreadcrumb (хлебные крошки)
//   - DocsArticleNav (перелистывание prev/next)
export const metadata = {
  title: 'Обзор платформы — Корпоративная платформа данных',
  description:
    'Назначение, границы и ключевые решения корпоративной платформы данных. Краткое описание архитектуры и технологического стека.',
  canonical: 'https://enterprisedataplatform.ru/docs/overview/',
};

export default function DocsOverviewLayout({children}) {
  return (
    <>
      <DocsBreadcrumb currentSlug="overview" />
      {children}
      <DocsArticleNav currentSlug="overview" />
    </>
  );
}
