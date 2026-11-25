import {test} from 'node:test';
import assert from 'node:assert/strict';
import {linkHref} from '../src/lib/paths.mjs';
import sitemap from '../src/app/sitemap.js';
import {docsNav, getPublishedDocs, docPath} from '../src/content/docs/navigation.mjs';

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
