import {Children, createElement} from 'react';

// GFM compilation can place whitespace-only text nodes inside structural table
// elements (<table>, <thead>, <tbody>, <tfoot>, <tr>, <caption>). React forbids
// such nodes as children of these HTML elements and reports a hydration error.
// These nodes are generated at MDX compile time, nested inside the already-built
// element tree, so per-level component overrides are not enough: mdxRs does not
// route nested <tbody>/<tr> through them. Instead we rebuild the table subtree at
// the <table> level, stripping whitespace-only strings on every structural level.
// Non-structural elements (<th>/<td> and their cell content) are left untouched.
const TABLE_STRUCTURE_TAGS = new Set([
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'caption',
  'colgroup',
  'col',
]);

function isStructuralElement(element) {
  return (
    element != null
    && typeof element === 'object'
    && typeof element.type === 'string'
    && TABLE_STRUCTURE_TAGS.has(element.type)
  );
}

// Recursively clean children: drop whitespace-only strings, and rebuild every
// structural descendant element so its own children are cleaned too. Cell content
// inside <th>/<td> (meaningful strings) is preserved.
function cleanTableChildren(children) {
  const result = [];

  Children.forEach(children, (child) => {
    if (child === null || child === undefined || child === false || child === true) {
      return;
    }

    if (typeof child === 'string') {
      if (child.trim() !== '') {
        result.push(child);
      }
      return;
    }

    if (typeof child === 'number') {
      result.push(child);
      return;
    }

    if (isStructuralElement(child)) {
      result.push(rebuildTableElement(child));
      return;
    }

    result.push(child);
  });

  return result;
}

function rebuildTableElement(element) {
  const props = {...element.props};
  props.children = cleanTableChildren(element.props.children);

  return createElement(element.type, {...props, key: element.key});
}

// Keep the native table and isolate horizontal scrolling in a focusable wrapper.
// The wrapper is styled only inside the EDP documentation article.
function DocsTable({children, ...rest}) {
  return createElement(
    'div',
    {
      className: 'docs-table-scroll',
      tabIndex: 0,
      role: 'region',
      'aria-label': 'Таблица документации',
    },
    createElement('table', {...rest, children: cleanTableChildren(children)}),
  );
}

const calloutTitles = {
  note: 'Примечание',
  warning: 'Внимание',
  danger: 'Опасность',
  tip: 'Рекомендация',
};

function DocsCallout({
  type = 'note',
  title,
  children,
}) {
  const variant = Object.hasOwn(
    calloutTitles,
    type,
  ) ? type : 'note';

  const className = variant === 'note'
    ? 'docs-callout'
    : `docs-callout docs-callout--${variant}`;

  return createElement(
    'aside',
    {className},
    createElement(
      'p',
      {className: 'docs-callout-title'},
      title ?? calloutTitles[variant],
    ),
    children,
  );
}

const components = {
  table: DocsTable,
  DocsCallout,
};

export function useMDXComponents() {
  return components;
}
