import React from 'react';
import {getSidebarNav} from '../content/docs/navigation.mjs';
import {linkHref} from '../lib/paths.mjs';

export default function DocsSidebar({currentSlug = ''}) {
  const groups = getSidebarNav(currentSlug);
  const isIndex = currentSlug === '';
  return (
    <aside className="docs-sidebar">
      <nav aria-label="Разделы документации">
        <p className="docs-nav-title mono">ДОКУМЕНТАЦИЯ</p>
        <ul className="docs-nav-list">
          <li className={isIndex ? 'docs-nav-item is-active' : 'docs-nav-item'}>
            <a href={linkHref('/docs/')} aria-current={isIndex ? 'page' : undefined}>Главная</a>
          </li>
          {groups.map((group) => (
            <li key={group.section} className="docs-nav-group">
              <details open={isIndex || group.open}>
                <summary className="docs-nav-summary">{group.section}</summary>
                <ul className="docs-nav-items">
                  {group.items.map((item) => (
                    <li key={item.slug} className={item.active ? 'docs-nav-item is-active' : 'docs-nav-item'}>
                      <a href={linkHref(item.href)} aria-current={item.active ? 'page' : undefined}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
