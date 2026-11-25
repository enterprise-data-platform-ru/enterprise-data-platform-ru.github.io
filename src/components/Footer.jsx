import React from 'react';
import {site} from '../content/site.mjs';
import {linkHref} from '../lib/paths.mjs';
import {Logo} from './Icon.jsx';

export default function Footer(){
  return <footer className="footer">
    <div className="container">
      <div className="footer-main">
        <div>
          <Logo/>
          <p>Референсная архитектура корпоративной платформы данных.</p>
        </div>
        <nav aria-label="Навигация в подвале">
          {site.nav.map(([l, h]) => <a key={h} href={linkHref(h)}>{l}</a>)}
          <a href={linkHref('#faq')}>FAQ</a>
        </nav>
        <div className="footer-domain mono">ENTERPRISEDATAPLATFORM.RU<br/><span>REFERENCE PROJECT / v0.1</span></div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Enterprise Data Platform</span>
        <span>Независимый архитектурный проект. Названия технологий принадлежат их правообладателям.</span>
      </div>
    </div>
  </footer>;
}
