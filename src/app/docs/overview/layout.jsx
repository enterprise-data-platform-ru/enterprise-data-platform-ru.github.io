import React from 'react';
import DocsLayout from '../../../components/DocsLayout.jsx';

export const metadata = {
  title: 'Обзор платформы — Enterprise Data Platform',
  description: 'Назначение, границы и ключевые решения корпоративной платформы данных Enterprise Data Platform.',
  alternates: {
    canonical: 'https://enterprisedataplatform.ru/docs/overview/',
  },
};

export default function DocsOverviewLayout({children}) {
  return (
    <DocsLayout variant="article" currentSlug="overview">
      {children}
    </DocsLayout>
  );
}
