import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('src/app/docs/page.jsx');
const root = read('src/app/docs/layout.jsx');
const overview = read('src/app/docs/overview/layout.jsx');
const layout = read('src/components/DocsLayout.jsx');
const css = read('src/app/docs/docs.css');

// Source contracts complement, but do not replace, exported HTML checks.
test('documentation routes declare canonical metadata inside alternates', () => {
  for (const [source, path] of [[index, '/docs/'], [overview, '/docs/overview/']]) {
    assert.match(source, /export\s+const\s+metadata\s*=/);
    assert.match(source, /title\s*:/);
    assert.match(source, /description\s*:/);
    const alternates = source.match(/alternates\s*:\s*\{([^}]*)\}/);
    assert.ok(alternates, `${path}: missing alternates`);
    assert.ok(alternates[1].includes(`canonical: 'https://enterprisedataplatform.ru${path}'`));
  }
});

test('each route explicitly selects the shared layout variant', () => {
  assert.match(index, /<DocsLayout\s+variant="index"\s+currentSlug=""/);
  assert.match(overview, /<DocsLayout\s+variant="article"\s+currentSlug="overview"/);
  assert.doesNotMatch(root, /<DocsLayout\b/);
  assert.match(layout, /!isIndex\s*&&\s*\(/);
  assert.match(layout, /<DocsToc\s+scopeId="docs-content"/);
  assert.doesNotMatch(index, /className="container"/);
});

test('docs stylesheet uses declared custom properties and no unscoped arrow rule', () => {
  const withoutComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
  const docs = withoutComments(css);
  const globals = withoutComments(read('src/app/globals.css'));
  const defined = new Set([...`${globals}\n${docs}`.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  for (const match of docs.matchAll(/var\(\s*(--[\w-]+)\s*(?=\)|,)/g)) {
    assert.ok(defined.has(match[1]), `undefined custom property: ${match[1]}`);
  }
  assert.doesNotMatch(docs, /^\s*\.arrow\s*\{/m);
  assert.doesNotMatch(docs, /minmax\(280px,/);
});

test('docs CSS scopes task-list and inline content elements to #docs-content', () => {
  const withoutComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
  const docs = withoutComments(css);
  // Inline content elements are styled inside the article body, not globally.
  for (const tag of ['mark', 'abbr', 'sub', 'sup']) {
    assert.ok(
      new RegExp(`#docs-content\\s+${tag}\\b`).test(docs),
      `${tag} must be scoped to #docs-content`,
    );
  }
  assert.ok(new RegExp(`#docs-content\\s+\\.task-list-item\\b`).test(docs),
    'CSS must style .task-list-item inside #docs-content');
  // Checkboxes adopt the brand accent.
  assert.ok(/input\[type="checkbox"\][\s\S]{0,200}accent-color:\s*var\(--docs-primary\)/.test(docs),
    'checkbox must use accent-color: var(--docs-primary)');
  // Mark uses a light surface from the existing brand palette.
  assert.ok(/#docs-content\s+mark\b[\s\S]{0,120}background:\s*var\(--docs-note\)/.test(docs),
    'mark must use a light brand background (--docs-note)');
});

test('docs CSS keeps a six-level heading scale and the catalog h1 selector', () => {
  const withoutComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
  const docs = withoutComments(css);
  assert.doesNotMatch(docs, /\.docs-hero\b/, 'legacy .docs-hero selector must be removed');
  assert.ok(/\.docs-catalog\s*>\s*h1\b/.test(docs),
    'catalog H1 must use .docs-catalog > h1');
  // H5 and H6 must have distinct sizes.
  assert.ok(/#docs-content\s+h5\s*\{\s*font-size:\s*16px\s*;\s*line-height:\s*24px/.test(docs),
    'H5 must be 16/24px');
  assert.ok(/#docs-content\s+h6\s*\{\s*font-size:\s*14px\s*;\s*line-height:\s*22px/.test(docs),
    'H6 must be 14/22px');
  assert.match(css, /--docs-h1-size:\s*36px/);
  assert.match(css, /--docs-h2-size:\s*28px/);
});
