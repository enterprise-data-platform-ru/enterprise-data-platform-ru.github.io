/**
 * scroll-spy.mjs — pure logic for determining which heading is active
 * based on scroll position. No DOM access; fully testable in Node.
 */

/**
 * Given a list of heading entries (each { id, top }) and the current
 * viewport top offset, return the id of the heading that should be active.
 *
 * @param {Array<{id: string, top: number}>} headings — heading entries
 *   sorted by document order; `top` is the pixel offset from the document
 *   top of each heading (as returned by getBoundingClientRect().top + scrollY).
 * @param {number} scrollTop — current window scroll position (in pixels).
 * @param {number} [threshold=100] — the offset from the top of the viewport
 *   below which a heading is considered "in view". Default 100px accounts
 *   for the sticky header.
 * @returns {string|null} the id of the active heading, or null if none
 *   qualifies.
 */
export function findActiveHeading(headings, scrollTop, threshold = 100) {
  if (!headings || headings.length === 0) return null;

  let activeId = null;

  for (const h of headings) {
    // A heading is "active" when its top edge is within `threshold` pixels
    // of the viewport top (i.e. the user has scrolled past it, or it's
    // currently near the top of the viewport).
    if (h.top <= scrollTop + threshold) {
      activeId = h.id;
    } else {
      break;
    }
  }

  // If the user is at the very top and no heading qualifies, default to the
  // first heading.
  if (activeId === null && scrollTop <= threshold) {
    activeId = headings[0].id;
  }

  return activeId;
}

/**
 * Given a list of heading elements (with DOM `getBoundingClientRect` and
 * `id` properties) and the current window scroll position, build the
 * entries array for `findActiveHeading`.
 *
 * @param {Array<{id: string, getBoundingClientRect: () => {top: number}}>} elements
 * @param {number} scrollY — window.scrollY or equivalent
 * @returns {Array<{id: string, top: number}>}
 */
export function collectHeadingEntries(elements, scrollY) {
  return elements
    .filter((el) => el && el.id)
    .map((el) => ({
      id: el.id,
      top: el.getBoundingClientRect().top + scrollY,
    }));
}
