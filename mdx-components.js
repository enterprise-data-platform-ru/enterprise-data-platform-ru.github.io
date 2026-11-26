import {createElement} from 'react';

// Keep the native table and isolate horizontal scrolling in a focusable wrapper.
// The wrapper is styled only inside the EDP documentation article.
function DocsTable(props) {
  return createElement(
    'div',
    {
      className: 'docs-table-scroll',
      tabIndex: 0,
      role: 'region',
      'aria-label': 'Таблица документации',
    },
    createElement('table', props),
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
