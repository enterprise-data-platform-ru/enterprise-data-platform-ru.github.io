import React from 'react';
import './docs.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

export default function DocsRootLayout({children}) {
  return (
    <>
      <a className="skip-link" href="#main">К содержимому</a>
      <Header activeSection="/docs/" />
      {children}
      <Footer />
    </>
  );
}
