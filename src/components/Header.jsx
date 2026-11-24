import React from 'react';
import {site} from '../content/site.mjs';
import {Logo,Icon} from './Icon.jsx';
export default function Header(){return <header className="site-header" id="top"><div className="container header-inner"><Logo/><nav className="desktop-nav" aria-label="Основная навигация">{site.nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}</nav><a className="button button-small header-cta" href="#contact">Обсудить проект <Icon name="diagonal" size={16}/></a><details className="mobile-nav"><summary aria-label="Меню"><Icon name="menu"/></summary><nav aria-label="Мобильная навигация">{site.nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}<a href="#contact">Обсудить проект</a></nav></details></div></header>}
