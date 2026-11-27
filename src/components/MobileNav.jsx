'use client';

export default function MobileNav({children}) {
  function handleClick(event) {
    const link = event.target.closest('nav a');
    if (link && event.currentTarget.contains(link)) {
      event.currentTarget.open = false;
    }
  }

  return <details className="mobile-nav" onClick={handleClick}>{children}</details>;
}
