import React from 'react';
import Header from '../../../components/Header.jsx';
import Footer from '../../../components/Footer.jsx';

export const metadata = {
  title: 'PoC — MDX — Enterprise Data Platform',
  alternates: { canonical: '/docs/poc/' },
};

export default function DocsPocLayout({children}) {
  return (
    <>
      <Header activeSection="/docs/" />
      <main id="main" className="docs-page">
        {children}
      </main>
      <Footer />
    </>
  );
}
