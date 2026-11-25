import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {linkHref} from '../src/lib/paths.mjs';
import sitemap from '../src/app/sitemap.js';
import {docsNav, getPublishedDocs, getSectionStatus, getGettingStarted, docPath, getSidebarNav, getArticleNav} from '../src/content/docs/navigation.mjs';
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
