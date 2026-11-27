import DocsSidebar from './DocsSidebar.jsx';

// FIX-07: the mobile navigation is a native <details> so it collapses by
// default and costs no client-side state. It is hidden on desktop (>=900px)
// where the sticky sidebar is shown instead.
export default function DocsMobileNav({currentSlug = ''}) {
  return (
    <details className="docs-mobile-nav">
      <summary className="docs-mobile-nav-summary">Документация</summary>
      <div className="docs-mobile-nav-content">
        <DocsSidebar currentSlug={currentSlug} />
      </div>
    </details>
  );
}
