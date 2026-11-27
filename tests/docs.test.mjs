import {test} from 'node:test';
import {existsSync, readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {linkHref} from '../src/lib/paths.mjs';
import sitemap from '../src/app/sitemap.js';
import {docsNav, getPublishedDocs, getSectionStatus, getGettingStarted, docPath, getSidebarNav, getArticleNav, validateDocsRegistry} from '../src/content/docs/navigation.mjs';
import {slugifyHeading, uniqueHeadingId} from '../src/lib/heading-slug.mjs';
import {docs} from '../src/content/site.mjs';

// A04 docs SEO/accessibility contract: the breadcrumb home link and the contact
// reference must resolve through the A01 helper for both hosting modes, and the
// sitemap must publish the docs route on the production domain (no test path).
test('docs breadcrumb home link resolves through linkHref in both basePath modes', () => {
  assert.equal(linkHref('/', ''), '/');
  assert.equal(linkHref('/', '/edp'), '/edp/');
});

test('docs contact reference targets the home contact block, not a form', () => {
  assert.equal(linkHref('#contact', ''), '/#contact');
  assert.equal(linkHref('#contact', '/edp'), '/edp/#contact');
});

test('sitemap includes the root and the docs route on the production domain', () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.includes('https://enterprisedataplatform.ru/'));
  assert.ok(urls.includes('https://enterprisedataplatform.ru/docs/'));
  for (const u of urls) {
    assert.ok(!u.includes('/edp-test'), 'sitemap must not reference a test path');
  }
});

// B03 documentation route registry contracts.

test('docs registry has no duplicate slugs', () => {
  const slugs = docsNav.map((d) => d.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs must be unique');
});

test('published docs resolve to a route and exclude drafts/plans', () => {
  const published = getPublishedDocs();
  assert.ok(published.length >= 1, 'at least one published doc expected');
  // Every published entry must expose a real route and a published status.
  for (const d of published) {
    assert.equal(d.status, 'published');
    assert.equal(docPath(d.slug), `/docs/${d.slug}/`);
  }
  // A real article "Обзор платформы" must be published with a route.
  const overview = published.find((d) => d.slug === 'overview');
  assert.ok(overview, 'overview article must be published');
  assert.equal(docPath('overview'), '/docs/overview/');
});

test('drafts and plans are not published and have no public route', () => {
  const statuses = new Set(getPublishedDocs().map((d) => d.status));
  assert.ok(!statuses.has('draft') && !statuses.has('planned'));
  // A known planned/draft slug must not appear among published routes.
  const planned = docsNav.find((d) => d.status === 'planned' || d.status === 'draft');
  if (planned) {
    assert.ok(!getPublishedDocs().some((d) => d.slug === planned.slug));
  }
});

test('sitemap publishes only published docs (no test path, includes overview)', () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.includes('https://enterprisedataplatform.ru/docs/overview/'));
  for (const u of urls) {
    assert.ok(!u.includes('/edp-test'), 'sitemap must not reference a test path');
  }
});

// B05 documentation sidebar contract.

test('sidebar groups published docs by section and excludes drafts/plans', () => {
  const groups = getSidebarNav();
  const slugs = groups.flatMap((g) => g.items.map((i) => i.slug));
  // Draft/planned topics must not produce active links.
  assert.ok(!slugs.includes('architecture'), 'planned topic must not appear');
  assert.ok(!slugs.includes('components'), 'draft topic must not appear');
  assert.ok(slugs.includes('overview'), 'published article must appear');
  // Every item exposes a real route and is inactive without a current slug.
  for (const g of groups) {
    assert.equal(g.open, false, 'no group is open without a current slug');
    for (const i of g.items) {
      assert.equal(i.href, `/docs/${i.slug}/`);
      assert.equal(i.active, false);
    }
  }
});

test('sidebar marks the current article and opens its group', () => {
  const groups = getSidebarNav('overview');
  const group = groups.find((g) => g.items.some((i) => i.slug === 'overview'));
  assert.ok(group, 'group containing the current article must exist');
  assert.equal(group.open, true, 'current group must be open');
  const item = group.items.find((i) => i.slug === 'overview');
  assert.equal(item.active, true);
  assert.equal(item.href, '/docs/overview/');
});

test('sidebar sections stay ordered by the registry order', () => {
  const groups = getSidebarNav('overview');
  const order = getPublishedDocs().map((d) => d.section);
  // Sections are emitted in first-appearance order (already sorted by order).
  assert.deepEqual(groups.map((g) => g.section), order);
});

// B06 breadcrumbs, article pager, and table-of-contents contracts.

test('breadcrumb home and docs links resolve through linkHref in both basePath modes', () => {
  // The breadcrumb crumb to /docs/ must resolve like the home crumb.
  assert.equal(linkHref('/docs/', ''), '/docs/');
  assert.equal(linkHref('/docs/', '/edp'), '/edp/docs/');
});

test('article pager uses only published docs (no planned/draft transitions)', () => {
  const publishedSlugs = new Set(getPublishedDocs().map((d) => d.slug));
  // The single published article has no neighbors yet: both sides are null, so
  // the pager renders nothing rather than pointing at a planned/draft route.
  const nav = getArticleNav('overview');
  assert.ok(nav.current, 'current article must resolve');
  assert.equal(nav.current.slug, 'overview');
  assert.equal(nav.prev, null);
  assert.equal(nav.next, null);

  // For every known slug the neighbors must always be published entries
  // (or null) — never a planned/draft topic.
  for (const d of docsNav) {
    const {prev, next} = getArticleNav(d.slug);
    for (const neighbor of [prev, next]) {
      if (neighbor) {
        assert.ok(publishedSlugs.has(neighbor.slug), `neighbor must be published: ${neighbor.slug}`);
      }
    }
  }
});

test('article pager excludes planned and draft slugs even as neighbors', () => {
  const nav = getArticleNav('overview');
  const neighborSlugs = [nav.prev, nav.next].filter(Boolean).map((n) => n.slug);
  assert.ok(!neighborSlugs.includes('architecture'), 'planned topic must not be a neighbor');
  assert.ok(!neighborSlugs.includes('components'), 'draft topic must not be a neighbor');
});

test('heading slug is Cyrillic-safe, deterministic and deduplicated', () => {
  assert.equal(slugifyHeading('Назначение'), 'назначение');
  assert.equal(slugifyHeading('Границы ответственности и модули'), 'границы-ответственности-и-модули');
  // Punctuation is stripped and repeated spaces collapse to a single hyphen.
  assert.equal(slugifyHeading('Код,  и  стиль?'), 'код-и-стиль');
  // Deterministic: same text yields the same slug (stable anchor across renders).
  assert.equal(slugifyHeading('Код,  и  стиль?'), slugifyHeading('Код, и стиль?'));

  // uniqueHeadingId assigns a suffix to collisions but keeps the first base.
  const used = new Set();
  assert.equal(uniqueHeadingId('код', used), 'код');
  assert.equal(uniqueHeadingId('код', used), 'код-1');
  assert.equal(uniqueHeadingId('код', used), 'код-2');
});

// B07 documentation landing as a navigation hub: catalog cards are linkable only
// when their section is published; future sections are marked without a route;
// and the "Начать работу" entry resolves to a real published article.
test('catalog cards are wired to the docs registry via slug', () => {
  // Every catalog card must declare a slug so the landing can resolve status.
  for (const card of docs) {
    assert.ok(typeof card.slug === 'string' && card.slug.length > 0, `${card.code} has a slug`);
  }
});

test('getSectionStatus: published section reports published, others are future', () => {
  assert.equal(getSectionStatus('overview'), 'published');
  // planned, draft and not-yet-registered sections are all "future" (no route).
  assert.ok(getSectionStatus('architecture') !== 'published');
  assert.ok(getSectionStatus('components') !== 'published');
  // Slugs absent from the registry fall back to the future status.
  assert.equal(getSectionStatus('security'), 'planned');
  assert.equal(getSectionStatus('operations'), 'planned');
  assert.equal(getSectionStatus(''), 'planned');
});

test('catalog cards only link when published; future cards have no route', () => {
  // A published catalog card resolves to a real route through docPath + linkHref.
  const publishedCards = docs.filter((c) => getSectionStatus(c.slug) === 'published');
  for (const card of publishedCards) {
    const href = linkHref(docPath(card.slug), '/docs-base');
    assert.ok(href.startsWith('/docs-base/docs/'), `published card ${card.slug} resolves under basePath`);
    assert.equal(href, `/docs-base/docs/${card.slug}/`, `published card ${card.slug} resolves to its article`);
  }
  // Future cards must not produce a link. We assert the contract directly:
  // any non-published card would throw if routed, proving no dead link exists.
  const futureCards = docs.filter((c) => getSectionStatus(c.slug) !== 'published');
  for (const card of futureCards) {
    assert.ok(!docsNav.some((d) => d.slug === card.slug && d.status === 'published'),
      `future card ${card.slug} has no published route`);
  }
});

test('getSectionStatus published cards always have a registry entry', () => {
  // Invariant: a card reported published must exist in the registry so docPath works.
  for (const card of docs) {
    if (getSectionStatus(card.slug) === 'published') {
      assert.ok(docsNav.some((d) => d.slug === card.slug), `${card.slug} is in the registry`);
    }
  }
});

test('getGettingStarted resolves to a real published article', () => {
  const start = getGettingStarted();
  assert.ok(start, 'a getting-started entry exists when published docs exist');
  const href = linkHref(docPath(start.slug), '/docs-base');
  assert.ok(href.startsWith('/docs-base/docs/'), 'getting-started links under basePath');
  assert.equal(getSectionStatus(start.slug), 'published');
});

// FIX-01 documentation article metadata: YAML frontmatter in a .mdx file is not
// parsed by the build pipeline (no gray-matter / frontmatter mode), so it
// rendered as visible text in the article body. Metadata moved to the segment
// layout's standard Next.js `export const metadata`, and the body keeps a single
// H1 so the page has exactly one top-level heading.
const overviewMdx = readFileSync(new URL('../src/app/docs/overview/page.mdx', import.meta.url), 'utf8');
const overviewLayout = readFileSync(new URL('../src/app/docs/overview/layout.jsx', import.meta.url), 'utf8');

test('overview article has no leading YAML frontmatter block', () => {
  // A leading "---" block would be rendered as visible content (no frontmatter parser).
  assert.equal(
    overviewMdx.trimStart().startsWith('---'),
    false,
    'overview .mdx must not start with a YAML frontmatter block',
  );
});

test('overview article does not leak service metadata into visible content', () => {
  assert.ok(!/^\s*title\s*:/.test(overviewMdx), 'no title: line in visible article content');
  assert.ok(!/^\s*description\s*:/.test(overviewMdx), 'no description: line in visible article content');
});

test('overview layout exposes Next.js metadata (title, description, canonical)', () => {
  assert.match(overviewLayout, /export\s+const\s+metadata\b/);
  assert.match(overviewLayout, /title\s*:\s*'Обзор платформы/);
  assert.match(overviewLayout, /description\s*:/);
  assert.match(overviewLayout, /canonical\s*:\s*'https:\/\/?enterprisedataplatform\.ru\/docs\/overview\/?'?/);
});

test('overview article body renders exactly one H1', () => {
  let inFence = false;
  let h1 = 0;
  for (const line of overviewMdx.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^#(\s|$)/.test(line)) h1 += 1;
  }
  assert.equal(h1, 1, 'overview article must contain exactly one H1 heading');
});

// FIX-04 compact catalog contract: the index page renders a compact
// navigational catalog with a getting-started card, section cards with
// status badges, and an optional "other materials" list.
const docsPageSrc = readFileSync(new URL('../src/app/docs/page.jsx', import.meta.url), 'utf8');
const docsCssSrc = readFileSync(new URL('../src/app/docs/docs.css', import.meta.url), 'utf8');

test('docs index renders compact catalog structure (no hero)', () => {
  // Must NOT contain a marketing hero section.
  assert.ok(!/className="docs-hero"/.test(docsPageSrc),
    'index must not contain docs-hero class');
  // Must contain a getting-started card.
  assert.ok(/className="docs-start-card"/.test(docsPageSrc),
    'index must contain docs-start-card');
  // Must contain section cards grid.
  assert.ok(/className="docs-cards"/.test(docsPageSrc),
    'index must contain docs-cards grid');
  // Must contain status labels for planned/draft sections.
  assert.ok(/Скоро/.test(docsPageSrc),
    'index must show "Скоро" status label for planned sections');
});

test('docs index uses getGettingStarted and getSectionStatus helpers', () => {
  assert.ok(/getGettingStarted/.test(docsPageSrc),
    'index must call getGettingStarted');
  assert.ok(/getSectionStatus/.test(docsPageSrc),
    'index must call getSectionStatus');
});

test('docs CSS contains catalog card styles', () => {
  assert.ok(/\.docs-start-card\b/.test(docsCssSrc),
    'CSS must define .docs-start-card');
  assert.ok(/\.docs-cards\b/.test(docsCssSrc),
    'CSS must define .docs-cards');
  assert.ok(/\.docs-card-status\b/.test(docsCssSrc),
    'CSS must define .docs-card-status');
  assert.ok(/\.docs-card--published\b/.test(docsCssSrc),
    'CSS must define .docs-card--published');
  assert.ok(/\.docs-topics\b/.test(docsCssSrc),
    'CSS must define .docs-topics');
  assert.ok(/\.docs-topic\b/.test(docsCssSrc),
    'CSS must define .docs-topic');
});

test('docs index deduplicates getting-started from other materials', () => {
  const published = getPublishedDocs();
  const start = getGettingStarted();
  const catalogSlugs = new Set(
    docs
      .filter((card) => getSectionStatus(card.slug) === 'published')
      .map((card) => card.slug),
  );
  const otherMaterials = published.filter(
    (entry) =>
      entry.slug !== start?.slug &&
      !catalogSlugs.has(entry.slug),
  );
  // No duplicate: the getting-started slug must not appear in otherMaterials.
  if (start) {
    assert.ok(
      !otherMaterials.some((e) => e.slug === start.slug),
      'getting-started slug must not appear in otherMaterials',
    );
  }
  // Catalog-published slugs must not appear in otherMaterials.
  for (const slug of catalogSlugs) {
    assert.ok(
      !otherMaterials.some((e) => e.slug === slug),
      `catalog slug ${slug} must not appear in otherMaterials`,
    );
  }
});

test('docs index shows correct status labels for section cards', () => {
  const labelMap = {
    published: 'Доступно',
    draft: 'В разработке',
    planned: 'Скоро',
  };
  for (const card of docs) {
    const status = getSectionStatus(card.slug);
    const expectedLabel = labelMap[status] || status;
    // The page source must reference this label text.
    assert.ok(
      docsPageSrc.includes(expectedLabel),
      `status label "${expectedLabel}" must appear in docs page source for section ${card.slug}`,
    );
  }
});

test('docs index has a single H1 and no marketing sections', () => {
  assert.ok((docsPageSrc.match(/<h1/g) || []).length === 1,
    'docs index must have exactly one H1');
  assert.ok(!/className="docs-hero"/.test(docsPageSrc),
    'docs index must not have marketing hero');
  assert.ok(!/className="docs-start"/.test(docsPageSrc),
    'docs index must not have old docs-start section');
  assert.ok(!/className="docs-start-empty"/.test(docsPageSrc),
    'docs index must not have old docs-start-empty section');
});

// FIX-05 MDX article style contract: CSS is scoped to #docs-content, MDX
// components provide accessible table and callout wrappers, and the style
// uses design tokens without leaking into global selectors.
const mdxComponentsSrc = readFileSync(new URL('../mdx-components.js', import.meta.url), 'utf8');

test('docs CSS scopes MDX article typography to #docs-content', () => {
  // H1 through H4 must be scoped under #docs-content, not global.
  assert.ok(/#docs-content\s+h1\b/.test(docsCssSrc),
    'CSS must scope h1 to #docs-content');
  assert.ok(/#docs-content\s+h2\b/.test(docsCssSrc),
    'CSS must scope h2 to #docs-content');
  assert.ok(/#docs-content\s+h3\b/.test(docsCssSrc),
    'CSS must scope h3 to #docs-content');
  assert.ok(/#docs-content\s+h4\b/.test(docsCssSrc),
    'CSS must scope h4 to #docs-content');
  // Paragraph, lists, and links must be scoped under #docs-content.
  assert.ok(/#docs-content\s+p\b/.test(docsCssSrc),
    'CSS must scope p to #docs-content');
  assert.ok(/#docs-content\s+ul\b/.test(docsCssSrc),
    'CSS must scope ul to #docs-content');
  assert.ok(/#docs-content\s+ol\b/.test(docsCssSrc),
    'CSS must scope ol to #docs-content');
  assert.ok(/#docs-content\s+a\b/.test(docsCssSrc),
    'CSS must scope a to #docs-content');
  // Blockquote, code, and table must be scoped under #docs-content.
  assert.ok(/#docs-content\s+blockquote\b/.test(docsCssSrc),
    'CSS must scope blockquote to #docs-content');
  assert.ok(/#docs-content\s+pre\b/.test(docsCssSrc),
    'CSS must scope pre to #docs-content');
  assert.ok(/#docs-content\s+table\b/.test(docsCssSrc),
    'CSS must scope table to #docs-content');
  // Images and figures must be scoped under #docs-content.
  assert.ok(/#docs-content.*img/.test(docsCssSrc),
    'CSS must scope img to #docs-content');
  assert.ok(/#docs-content\s+figure\b/.test(docsCssSrc),
    'CSS must scope figure to #docs-content');
  // Callout variants must be defined.
  assert.ok(/\.docs-callout\b/.test(docsCssSrc),
    'CSS must define .docs-callout');
  assert.ok(/\.docs-callout--warning\b/.test(docsCssSrc),
    'CSS must define .docs-callout--warning');
  assert.ok(/\.docs-callout--danger\b/.test(docsCssSrc),
    'CSS must define .docs-callout--danger');
  assert.ok(/\.docs-callout--tip\b/.test(docsCssSrc),
    'CSS must define .docs-callout--tip');
});

test('docs CSS does not leak MDX styles into global selectors', () => {
  // No bare h1/h2/h3/h4/p/table/pre/code selectors outside #docs-content scope.
  // Allow: .docs-hero h1 (legacy), .docs-card h3 (catalog), .docs-toc h2 (TOC).
  const lines = docsCssSrc.split('\n');
  let inScope = false;
  for (const line of lines) {
    const trimmed = line.trim();
    // Track when we enter a #docs-content or .docs-article block.
    if (/^\s*#docs-content\s/.test(trimmed) || /^\.docs-article\s/.test(trimmed)) {
      inScope = true;
    }
    // Detect bare global selectors that are not inside a scoped context.
    if (/^\s*h[1-4]\s*[,{]/.test(trimmed) && !inScope) {
      assert.fail(`Bare global heading selector found: ${trimmed}`);
    }
    if (/^\s*p\s*[,{]/.test(trimmed) && !inScope) {
      assert.fail(`Bare global paragraph selector found: ${trimmed}`);
    }
    if (/^\s+table\s*[,{]/.test(trimmed) && !inScope) {
      assert.fail(`Bare global table selector found: ${trimmed}`);
    }
    // Reset scope at closing brace of a rule.
    if (/^\s*\}/.test(trimmed)) {
      inScope = false;
    }
  }
});

test('mdx-components exports DocsTable with ARIA region wrapper', () => {
  assert.ok(/DocsTable/.test(mdxComponentsSrc),
    'mdx-components must define DocsTable');
  assert.ok(/docs-table-scroll/.test(mdxComponentsSrc),
    'DocsTable must render .docs-table-scroll wrapper');
  assert.ok(/role\s*[:=]\s*['"]region['"]/.test(mdxComponentsSrc),
    'DocsTable must set role="region"');
  assert.ok(/aria-label/.test(mdxComponentsSrc),
    'DocsTable must set aria-label');
});

test('mdx-components recursively cleans table structure whitespace', () => {
  assert.ok(/function\s+cleanTableChildren\s*\(/.test(mdxComponentsSrc),
    'must define cleanTableChildren');
  assert.ok(/function\s+rebuildTableElement\s*\(/.test(mdxComponentsSrc),
    'must define rebuildTableElement for recursive cleanup');
  assert.ok(/TABLE_STRUCTURE_TAGS/.test(mdxComponentsSrc),
    'must enumerate structural table tags to clean recursively');
  assert.ok(/trim\(\)\s*!==\s*['"]['"]/.test(mdxComponentsSrc),
    'must remove only whitespace-only string children');
  const componentsMap = mdxComponentsSrc.slice(mdxComponentsSrc.indexOf('const components'));
  // Cleaning happens at the table level, so structural tags are not registered separately.
  assert.ok(!/\bthead\s*:/.test(componentsMap), 'must not register thead separately');
  assert.ok(!/\btbody\s*:/.test(componentsMap), 'must not register tbody separately');
  assert.ok(!/\btr\s*:/.test(componentsMap), 'must not register tr separately');
  // Cell content must be preserved: th/td are not overridden.
  assert.ok(!/\bth\s*:/.test(componentsMap), 'must not override th (preserve cell content)');
  assert.ok(!/\btd\s*:/.test(componentsMap), 'must not override td (preserve cell content)');
});

test('DocsTable removes whitespace on every table level and keeps cell content', async () => {
  const react = await import('react');
  const {useMDXComponents} = await import('../mdx-components.js');
  const tableComponent = useMDXComponents().table;
  const ce = (type, props, ...kids) => react.createElement(type, props, ...kids);
  // Realistic GFM tree: whitespace "\n" between structural elements at every level.
  const td = (v) => ce('td', null, v);
  const tr = ce('tr', null, '\n  ', td(['\n', 'A', '\n']), '\n  ', td(['\n', 'B', '\n']), '\n');
  const tbody = ce('tbody', null, tr, '\n');
  const thead = ce('thead', null, '\n', ce('tr', null, ce('th', null, 'H')));
  const wrapper = tableComponent({children: [thead, '\n', tbody, '\n']});

  const STRUCT = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'caption', 'colgroup', 'col']);
  const table = wrapper.props.children;
  let whitespaceCount = 0;
  const walk = (children) => {
    for (const child of react.Children.toArray(children)) {
      if (!child || !child.type || !STRUCT.has(child.type)) {
        continue;
      }
      // No whitespace text node may sit directly under a structural element.
      for (const direct of react.Children.toArray(child.props.children)) {
        if (typeof direct === 'string' && direct.trim() === '') {
          whitespaceCount += 1;
        }
      }
      walk(child.props.children);
    }
  };
  walk(table.props.children);
  assert.equal(whitespaceCount, 0,
    'no whitespace text nodes may remain under structural table elements');

  // Cell content must be preserved inside <td>.
  const tbodyEl = table.props.children.find((c) => c && c.type === 'tbody');
  const trEl = tbodyEl.props.children.find((c) => c && c.type === 'tr');
  const tdEl = trEl.props.children.find((c) => c && c.type === 'td');
  const cellText = react.Children.toArray(tdEl.props.children).map(String).join('');
  assert.ok(cellText.includes('A'), 'cell content must be preserved');
});

test('mdx-components exports DocsCallout (callout) component', () => {
  assert.ok(/DocsCallout/.test(mdxComponentsSrc),
    'mdx-components must define DocsCallout');
  assert.ok(/docs-callout/.test(mdxComponentsSrc),
    'DocsCallout must render .docs-callout class');
  assert.ok(/docs-callout--/.test(mdxComponentsSrc),
    'DocsCallout must render variant modifier class');
  assert.ok(/calloutTitles/.test(mdxComponentsSrc),
    'DocsCallout must map default titles by type');
  assert.ok(/type/.test(mdxComponentsSrc),
    'DocsCallout must support type prop');
});

test('docs CSS uses design tokens for article typography', () => {
  // Core tokens must appear in the MDX article style block.
  assert.ok(/var\(--ink\)/.test(docsCssSrc),
    'CSS must use --ink token');
  assert.ok(/var\(--muted\)/.test(docsCssSrc),
    'CSS must use --muted token');
  assert.ok(/var\(--green\)/.test(docsCssSrc),
    'CSS must use --green token');
  assert.ok(/var\(--line\)/.test(docsCssSrc),
    'CSS must use --line token');
  assert.ok(/var\(--white\)/.test(docsCssSrc),
    'CSS must use --white token');
  assert.ok(/var\(--mono\)/.test(docsCssSrc),
    'CSS must use --mono token');
});

test('docs CSS defines table scroll wrapper and zebra striping', () => {
  assert.ok(/\.docs-table-scroll\b/.test(docsCssSrc),
    'CSS must define .docs-table-scroll');
  assert.ok(/overflow-x\s*:\s*auto/.test(docsCssSrc),
    'table wrapper must enable horizontal scrolling');
  assert.ok(/tbody\s+tr:nth-child\(even\)/.test(docsCssSrc),
    'CSS must define zebra striping for table rows');
});

test('docs CSS defines code block and inline code styles', () => {
  assert.ok(/#docs-content\s+pre\b/.test(docsCssSrc),
    'CSS must style pre in #docs-content');
  // Inline code uses a compound selector (not bare #docs-content code).
  assert.ok(/#docs-content\s+pre code/.test(docsCssSrc),
    'CSS must style pre code in #docs-content');
  assert.ok(/#docs-content\s+:not\(pre\)\s*>\s*code/.test(docsCssSrc),
    'CSS must style inline code in #docs-content');
  // Pre should have a dark background (code block).
  assert.ok(/background\s*:\s*#/.test(docsCssSrc),
    'code block must have a background color');
});

test('docs CSS defines callout/note styles with variants', () => {
  assert.ok(/\.docs-callout\b/.test(docsCssSrc),
    'CSS must define .docs-callout');
  assert.ok(/\.docs-callout--warning\b/.test(docsCssSrc),
    'CSS must define .docs-callout--warning');
  assert.ok(/\.docs-callout--danger\b/.test(docsCssSrc),
    'CSS must define .docs-callout--danger');
  assert.ok(/\.docs-callout--tip\b/.test(docsCssSrc),
    'CSS must define .docs-callout--tip');
  assert.ok(/\.docs-callout-title\b/.test(docsCssSrc),
    'CSS must define .docs-callout-title');
});


test('catalog and registry are consistent and published sources exist', () => {
  assert.doesNotThrow(() => validateDocsRegistry(docsNav, docs));
  for (const entry of getPublishedDocs()) assert.ok(existsSync(entry.source), entry.source);
  assert.equal(getSidebarNav('overview')[0].section, 'Начало работы');
});

test('registry validation rejects inconsistent entries and cards', () => {
  assert.throws(() => validateDocsRegistry([...docsNav, docsNav[0]], docs));
  assert.throws(() => validateDocsRegistry([{...docsNav[0], status: 'unknown'}]));
  assert.throws(() => validateDocsRegistry([{...docsNav[0], source: 'missing.mdx'}]));
  assert.throws(() => validateDocsRegistry([{...docsNav[1], source: 'hidden.mdx'}]));
  assert.throws(() => validateDocsRegistry(docsNav, [{slug: 'missing'}]));
  assert.throws(() => validateDocsRegistry(docsNav, [docs[0], docs[0]]));
  assert.throws(() => validateDocsRegistry([{...docsNav[0], slug: '../invalid'}]));
});
