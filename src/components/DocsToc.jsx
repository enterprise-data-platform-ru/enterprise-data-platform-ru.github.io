'use client';

import {useEffect, useRef, useState} from 'react';
import {slugifyHeading, uniqueHeadingId} from '../lib/heading-slug.mjs';
import {findActiveHeading, collectHeadingEntries} from '../lib/scroll-spy.mjs';

// B06: оглавление строится из реальных заголовков h2/h3 в теле статьи, поэтому
// оно не может «отстать» от контента (нет отдельного списка вручную).
// При монтировании читаются заголовки внутри scopeId, для каждого выводятся
// стабильный уникальный id (кириллица сохраняется), при отсутствии id он
// назначается на месте, и рендерятся ссылки на эти якоря.
// FIX-06: добавлен ScrollSpy через IntersectionObserver — активная ссылка
// подсвечивается при прокрутке.
export default function DocsToc({scopeId = 'main'}) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const root = document.getElementById(scopeId);
    if (!root) return;

    const toc = buildToc(root);
    setItems(toc);

    // FIX-06: ScrollSpy — observe heading elements and highlight active TOC link.
    // Headings live in #docs-content (sibling of <nav>), so resolve via document.
    const headingEls = toc.map((it) => document.getElementById(it.id)).filter(Boolean);

    // Prefer IntersectionObserver; fall back to scroll listener.
    if (typeof IntersectionObserver !== 'undefined' && headingEls.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          // Collect currently visible headings with their bounding rect tops.
          const visible = entries
            .filter((e) => e.isIntersecting)
            .map((e) => ({id: e.target.id, top: e.boundingClientRect.top}));
          // Sort by top position (closest to viewport top wins).
          visible.sort((a, b) => a.top - b.top);
          setActiveId(visible.length > 0 ? visible[0].id : null);
        },
        {
          rootMargin: '-80px 0px -60% 0px',
          threshold: [0, 1],
        }
      );

      headingEls.forEach((el) => observer.observe(el));
      observerRef.current = observer;

      return () => {
        observer.disconnect();
        observerRef.current = null;
      };
    }

    // Fallback: scroll listener with getBoundingClientRect.
    const handleScroll = () => {
      if (headingEls.length === 0) return;
      const entries = collectHeadingEntries(headingEls, window.scrollY);
      const active = findActiveHeading(entries, window.scrollY, 100);
      setActiveId(active);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, {passive: true});

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scopeId]);

  if (!items.length) return null;

  return (
    <ul className="docs-toc-list" aria-label="Оглавление на этой странице">
      {items.map((it) => {
        const isActive = it.id === activeId;
        return (
          <li
            key={it.id}
            className={
              (it.level === 3 ? 'docs-toc-item is-sub' : 'docs-toc-item') +
              (isActive ? ' is-active' : '')
            }
          >
            <a
              href={`#${it.id}`}
              aria-current={isActive ? 'location' : undefined}
            >
              {it.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Читает заголовки h2/h3 в пределах корня, назначает/возвращает их id и
// возвращает плоский список {id, text, level} в порядке документа.
function buildToc(root) {
  const headings = Array.from(root.querySelectorAll('h2, h3'));
  const used = new Set();
  const items = [];
  for (const h of headings) {
    const text = (h.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const level = Number(h.tagName[1]);

    // Приоритет: id самого заголовка -> id внутреннего <a id> (как в MDX) ->
    // вычисленный слог. Итоговый id всегда уникален в пределах страницы.
    const holder = h.id ? h : h.querySelector(':scope > a[id]');
    const base = holder && holder.id ? holder.id : slugifyHeading(text);
    const id = uniqueHeadingId(base, used);
    (holder ? holder : h).id = id;

    items.push({id, text, level});
  }
  return items;
}
