import React from 'react';
import './docs.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import DocsLayout from '../../components/DocsLayout.jsx';

// FIX-03: root layout документации. Все страницы /docs/ проходят через
// DocsLayout (единая 3-колоночная сетка). Каталог (/docs/) не задаёт
// currentSlug, поэтому в боковой навигации ни один пункт не подсвечен.
export default function DocsRootLayout({children}) {
  return (
    <>
      <a className="skip-link" href="#main">К содержимому</a>
      <Header activeSection="/docs/" />
      <DocsLayout currentSlug="">
        {children}
      </DocsLayout>
      <Footer />
    </>
  );
}
