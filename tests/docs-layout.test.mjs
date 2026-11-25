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
