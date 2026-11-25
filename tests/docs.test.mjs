import {test} from 'node:test';
import assert from 'node:assert/strict';
import {linkHref} from '../src/lib/paths.mjs';
import sitemap from '../src/app/sitemap.js';

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
