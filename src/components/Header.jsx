import React from 'react';
import {site} from '../content/site.mjs';
import {linkHref} from '../lib/paths.mjs';
import {Logo,Icon} from './Icon.jsx';
import MobileNav from './MobileNav.jsx';

function NavItems({activeSection}){
  return site.nav.map(([label,href])=>(
    <a key={href} href={linkHref(href)} aria-current={href === activeSection ? 'page' : undefined}>{label}</a>
  ));
}

export default function Header({activeSection=''}){
  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Logo/>
        <nav className="desktop-nav" aria-label="Основная навигация"><NavItems activeSection={activeSection}/></nav>
        <a className="button button-small header-cta" href={linkHref('#contact')}>Обсудить проект <Icon name="diagonal" size={16}/></a>
        <MobileNav>
          <summary aria-label="Меню"><Icon name="menu"/></summary>
          <nav aria-label="Мобильная навигация">
            <NavItems activeSection={activeSection}/>
            <a href={linkHref('#contact')}>Обсудить проект</a>
          </nav>
        </MobileNav>
      </div>
    </header>
  );
}
