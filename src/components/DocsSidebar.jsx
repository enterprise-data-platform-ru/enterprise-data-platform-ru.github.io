import React from 'react';
import {getSidebarNav} from '../content/docs/navigation.mjs';
import {linkHref} from '../lib/paths.mjs';

// B05 documentation sidebar.
// Builds a grouped tree of published sections/articles from the B03 registry.
// Planned/draft topics are excluded, so they have no active links. The current
// article is marked with `aria-current="page"` and a non-color glyph marker, and
// its section group is opened. Native <details>/<summary> keep the groups
// keyboard-accessible and collapsible on narrow screens.
export default function DocsSidebar({currentSlug = ''}) {
  const groups = getSidebarNav(currentSlug);
  return (
    <aside className="docs-sidebar">
      <nav aria-label="Разделы документации">
        <p className="docs-nav-title mono">РАЗДЕЛЫ</p>
        <ul className="docs-nav-list">
          {groups.map((g) => (
            <li key={g.section} className="docs-nav-group">
              <details open={g.open}>
                <summary className="docs-nav-summary">{g.section}</summary>
                <ul className="docs-nav-items">
                  {g.items.map((i) => (
                    <li
                      key={i.slug}
                      className={i.active ? 'docs-nav-item is-active' : 'docs-nav-item'}
                    >
                      <a
                        href={linkHref(i.href)}
                        aria-current={i.active ? 'page' : undefined}
                      >
                        {i.active && (
                          <span className="docs-nav-marker" aria-hidden="true">●</span>
                        )}
                        {i.title}
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
