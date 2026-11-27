export function findActiveHeading(headings, scrollTop, threshold = 80, {scrollHeight = 0, clientHeight = 0} = {}) {
  if (!headings?.length) return null;
  if (scrollHeight > clientHeight && scrollTop + clientHeight >= scrollHeight - 1) {
    return headings[headings.length - 1].id;
  }
  let active = headings[0].id;
  for (const heading of headings) {
    if (heading.top <= scrollTop + threshold) active = heading.id;
    else break;
  }
  return active;
}

export function collectHeadingEntries(elements, scrollY = 0) {
  return elements
    .filter(element => element && element.id)
    .map(element => ({id: element.id, top: element.getBoundingClientRect().top + scrollY}));
}
