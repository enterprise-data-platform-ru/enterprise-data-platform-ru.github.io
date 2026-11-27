import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('src/app/docs/page.jsx');
const root = read('src/app/docs/layout.jsx');
const overview = read('src/app/docs/overview/layout.jsx');
const layout = read('src/components/DocsLayout.jsx');
const css = read('src/app/docs/docs.css');
const toc = read('src/components/DocsToc.jsx');
const articleNav = read('src/components/DocsArticleNav.jsx');
const fixDemo = read('src/app/docs/style-preview/fix-06-r1-1/page.mdx');
const sitemap = read('src/app/sitemap.js');

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

// FIX-06: sticky sidebar and TOC
test('docs CSS makes sidebar and TOC sticky on desktop', () => {
  assert.ok(/\.docs-sidebar\s*\{[^}]*position:\s*sticky/s.test(css),
    '.docs-sidebar must be position: sticky');
  assert.ok(/\.docs-toc\s*\{[^}]*position:\s*sticky/s.test(css),
    '.docs-toc must be position: sticky');
  assert.ok(/\.docs-sidebar\s*\{[^}]*max-height:/s.test(css),
    '.docs-sidebar must have max-height for independent scrolling');
  assert.ok(/\.docs-toc\s*\{[^}]*max-height:/s.test(css),
    '.docs-toc must have max-height for independent scrolling');
});

test('docs CSS resets sidebar and TOC to static on mobile (≤899px)', () => {
  // The 899px block must reset both panels to position: static.
  assert.ok(/@media\s*\(max-width:\s*899px\)\s*\{[\s\S]*position:\s*static/g.test(css),
    'mobile breakpoint must reset to position: static');
});

test('docs CSS has keyboard focus styles for sidebar and TOC', () => {
  assert.ok(/\.docs-sidebar\s+a:focus-visible/.test(css),
    'sidebar links must have :focus-visible style');
  assert.ok(/\.docs-toc\s+a:focus-visible/.test(css),
    'TOC links must have :focus-visible style');
});

// FIX-06: ScrollSpy in DocsToc
test('DocsToc uses the shared ScrollSpy and accessible active state', () => {
  assert.match(toc, /findActiveHeading/);
  assert.match(toc, /requestAnimationFrame/);
  assert.match(toc, /aria-current/);
  assert.doesNotMatch(toc, /is-active/);
});

test('DocsArticleNav uses docPath for prev/next hrefs', () => {
  assert.ok(/docPath\(prev\.slug\)/.test(articleNav),
    'prev link must use docPath(prev.slug)');
  assert.ok(/docPath\(next\.slug\)/.test(articleNav),
    'next link must use docPath(next.slug)');
  assert.doesNotMatch(articleNav, /prev\.href/, 'must not use prev.href (undefined)');
  assert.doesNotMatch(articleNav, /next\.href/, 'must not use next.href (undefined)');
});

test('docs CSS scroll-margin-top accounts for sticky header', () => {
  assert.ok(/scroll-margin-top:\s*calc\(var\(--docs-header-height/.test(css),
    'scroll-margin-top must use --docs-header-height to offset sticky header');
});

test('docs CSS styles the current TOC link', () => {
  assert.match(css, /\.docs-toc-list a\[aria-current="location"\]/);
});

// FIX-06-R1.1: sticky sidebar refinement

test('FIX-06-R1.1 demo page declares noindex and stays out of the catalog/sitemap', () => {
  assert.match(fixDemo, /export\s+const\s+metadata\s*=/,
    'demo page must export metadata');
  assert.match(fixDemo, /robots\s*:\s*\{\s*index:\s*false\s*,\s*follow:\s*false\s*\}/,
    'demo page must declare robots noindex');
  assert.doesNotMatch(sitemap, /style-preview/,
    'style-preview must not be listed in the sitemap');
});

test('FIX-06-R1.1 sidebar targets are 36px on desktop and 44px on coarse pointers', () => {
  assert.ok(/\.docs-nav-item\s+a\s*\{[^}]*min-height:\s*36px/s.test(css),
    'sidebar links must be at least 36px tall on non-touch');
  assert.ok(/@media\s*\(pointer:\s*coarse\)\s*\{[\s\S]*min-height:\s*44px/s.test(css),
    'coarse pointers must bump touch targets to 44px');
});

test('FIX-06-R1.1 group heading is compact and keyboard-focusable', () => {
  assert.ok(/\.docs-nav-summary\s*\{[^}]*font-size:\s*11px/s.test(css),
    '.docs-nav-summary must be compact (11px)');
  assert.ok(/\.docs-nav-summary\s*\{[^}]*line-height:\s*16px/s.test(css),
    '.docs-nav-summary must use 16px line-height');
  assert.ok(/\.docs-nav-summary\s*\{[^}]*font-weight:\s*600/s.test(css),
    '.docs-nav-summary must be 600 weight');
  assert.ok(/\.docs-nav-summary\s*\{[^}]*text-transform:\s*uppercase/s.test(css),
    '.docs-nav-summary must be uppercase');
  assert.ok(/\.docs-sidebar summary:focus-visible/.test(css),
    'group summary must have a :focus-visible style');
});

test('FIX-06-R1.1 sidebar background and border fill the full panel height', () => {
  assert.ok(/\.docs-sidebar\s*\{[^}]*background:\s*var\(--docs-sidebar-bg\)/s.test(css),
    '.docs-sidebar must paint a full-height background');
  assert.ok(/\.docs-sidebar\s*\{[^}]*border-right:\s*1px solid var\(--line\)/s.test(css),
    '.docs-sidebar must paint a full-height right border');
});

test('mobile sidebar has bounded independent scrolling', () => {
  assert.match(css, /\.docs-mobile-nav \.docs-sidebar\s*\{[^}]*position:\s*static/s);
  assert.match(css, /\.docs-mobile-nav \.docs-sidebar\s*\{[^}]*max-height:\s*65dvh/s);
  assert.match(css, /\.docs-mobile-nav \.docs-sidebar\s*\{[^}]*overflow-y:\s*auto/s);
});

test('responsive navigation reuses sidebar and a single TOC', () => {
  const mobile = read('src/components/DocsMobileNav.jsx');
  assert.match(layout, /<DocsMobileNav currentSlug=/);
  assert.match(mobile, /<details className="docs-mobile-nav">/);
  assert.match(mobile, /<DocsSidebar currentSlug=/);
  assert.equal((layout.match(/<DocsToc\b/g) || []).length, 1);
  assert.match(css, /\.docs-sidebar-desktop\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(max-width:\s*1199px\)/);
  assert.match(css, /\.docs-toc-list a\s*\{[^}]*min-height:\s*44px/s);
  assert.doesNotMatch(sitemap, /style-preview/);
});
