import React from 'react';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

export const metadata = {
  title: 'Обзор платформы — Enterprise Data Platform',
  alternates: { canonical: '/docs/overview/' },
};

export default function DocsOverviewLayout({children}) {
  return (
    <>
      <Header activeSection="/docs/" />
      <main id="main" className="docs-page docs-article">
        {children}
      </main>
      <Footer />
    </>
  );
}
