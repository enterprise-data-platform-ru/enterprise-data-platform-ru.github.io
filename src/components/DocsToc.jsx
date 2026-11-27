'use client';

import React, {useEffect, useRef, useState} from 'react';
import {slugifyHeading, uniqueHeadingId} from '../lib/heading-slug.mjs';
import {findActiveHeading} from '../lib/scroll-spy.mjs';

export default function DocsToc({scopeId = 'docs-content'}) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (!items.length) return;
    const media = window.matchMedia('(min-width: 1200px)');
    const sync = () => { detailsRef.current.open = media.matches; };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [items.length]);

  useEffect(() => {
    const root = document.getElementById(scopeId);
    if (!root) return;
    const headings = buildToc(root);
    setItems(headings.map(({element, ...item}) => item));
    if (!headings.length) return;

    let frame = 0;
    let locked = false;
    let releaseTimer;
    const select = id => setActiveId(current => current === id ? current : id);
    const update = () => {
      frame = 0;
      if (locked) return;
      const scrollRoot = document.scrollingElement || document.documentElement;
      const scrollTop = window.scrollY;
      const header = document.querySelector('.site-header');
      const threshold = (header?.getBoundingClientRect().height || 0) + 24;
      const entries = headings.map(({id, element}) => ({id, top: element.getBoundingClientRect().top + scrollTop}));
      select(findActiveHeading(entries, scrollTop, threshold, {
        scrollHeight: scrollRoot.scrollHeight,
        clientHeight: scrollRoot.clientHeight,
      }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const release = () => { locked = false; clearTimeout(releaseTimer); };
    const activateHash = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { id = ''; }
      if (headings.some(heading => heading.id === id)) {
        locked = true;
        select(id);
        clearTimeout(releaseTimer);
        releaseTimer = setTimeout(release, 600);
      } else {
        release();
        schedule();
      }
    };
    const onClick = event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      if (!headings.some(heading => heading.id === id)) return;
      locked = true;
      select(id);
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(release, 600);
    };
    const toc = document.querySelector('.docs-toc');
    toc?.addEventListener('click', onClick);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', activateHash);
    window.addEventListener('wheel', release, {passive: true});
    window.addEventListener('touchstart', release, {passive: true});
    window.addEventListener('keydown', release);
    activateHash();
    return () => {
      toc?.removeEventListener('click', onClick);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', activateHash);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
      cancelAnimationFrame(frame);
      clearTimeout(releaseTimer);
    };
  }, [scopeId]);

  if (!items.length) return null;
  return (
    <div className="docs-toc-inner">
      <details ref={detailsRef} className="docs-toc-collapsible" open>
        <summary>На этой странице</summary>
        <nav aria-label="Содержание страницы">
          <ul className="docs-toc-list" data-active-heading={activeId || undefined}>
            {items.map(item => (
              <li key={item.id} className={`docs-toc-item${item.level === 3 ? ' is-sub' : ''}`} data-heading-level={item.level}>
                <a href={`#${item.id}`} aria-current={item.id === activeId ? 'location' : undefined}>{item.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </div>
  );
}

function buildToc(root) {
  const used = new Set();
  return Array.from(root.querySelectorAll('h2, h3')).flatMap(element => {
    const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return [];
    const holder = element.id ? element : element.querySelector('a[id]');
    const id = uniqueHeadingId(holder?.id || slugifyHeading(text), used);
    (holder || element).id = id;
    return [{id, text, level: Number(element.tagName[1]), element}];
  });
}
