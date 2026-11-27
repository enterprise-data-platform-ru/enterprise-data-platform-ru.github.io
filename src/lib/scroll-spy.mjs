export function createScrollSpy(scope, items, {onChange, rootMargin = '-80px 0px -60% 0px', threshold = [0, 1]} = {}) {
  if (!items.length) return () => {};

  const scrollRoot = document.scrollingElement || document.documentElement;
  let destroyed = false;
  let rafId = 0;

  function scheduleUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      update();
    });
  }

  function update() {
    if (destroyed) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: use getBoundingClientRect on scroll
      const scrollTop = window.scrollY || scrollRoot.scrollTop;
      const entries = collectHeadingEntries(items, scrollTop);
      const active = findActiveHeading(entries, scrollTop, 80);
      onChange?.(active || items[0]?.id || '');
      return;
    }

    // Find visible headings that have passed the scroll offset
    const visiblePassed = [];
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const id = item.id;
      const isIntersecting = intersected.has(id);
      const rect = el.getBoundingClientRect();
      if (isIntersecting && rect.top <= 80) {
        visiblePassed.push(item);
      }
    }

    if (visiblePassed.length > 0) {
      // Rule 1: first visible heading from the top is active
      onChange?.(visiblePassed[0]?.id || '');
      return;
    }

    const scrollY = window.scrollY || 0;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const atBottom = scrollY + winHeight >= docHeight - 10;

    if (atBottom) {
      // Rule 2: last heading is active when at bottom
      onChange?.(items[items.length - 1]?.id || '');
      return;
    }

    // Rule 3: last passed heading before scroll offset is active
    const entries = collectHeadingEntries(items, scrollY);
    const active = findActiveHeading(entries, scrollY, 80);
    onChange?.(active || items[0]?.id || '');
  }

  const intersected = new Set();

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          intersected.add(id);
        } else {
          intersected.delete(id);
        }
      }
      scheduleUpdate();
    },
    {rootMargin, threshold}
  ) : null;

  for (const item of items) {
    const el = document.getElementById(item.id);
    if (el && observer) observer.observe(el);
  }

  // Always listen to scroll and resize with rAF throttling
  window.addEventListener('scroll', scheduleUpdate, {passive: true});
  window.addEventListener('resize', scheduleUpdate);
  scheduleUpdate();

  return function destroy() {
    destroyed = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (observer) {
      observer.disconnect();
    }
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', scheduleUpdate);
  };
}

export function findActiveHeading(headings, scrollTop, threshold = 80) {
  if (!headings || headings.length === 0) return null;
  let active = null;
  for (const h of headings) {
    if (h.top <= scrollTop + threshold) {
      active = h.id;
    } else {
      break;
    }
  }
  return active || headings[0].id;
}

export function collectHeadingEntries(els, scrollY = 0) {
  return els
    .filter(el => el && el.id)
    .map(el => ({id: el.id, top: el.getBoundingClientRect().top + scrollY}));
}
