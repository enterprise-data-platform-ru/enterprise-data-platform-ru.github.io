import {createElement} from 'react';

// Keep the native table and isolate horizontal scrolling in a focusable wrapper.
// The wrapper is styled only inside the EDP documentation article.
function DocsTable(props) {
  return createElement(
    'div',
    {className: 'docs-table-scroll', tabIndex: 0, role: 'region', 'aria-label': 'Таблица с горизонтальной прокруткой'},
    createElement('table', props),
  );
}

const components = {table: DocsTable};

export function useMDXComponents() {
  return components;
}
