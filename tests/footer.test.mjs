import {test} from 'node:test';
import assert from 'node:assert/strict';
import {site} from '../src/content/site.mjs';
import {linkHref} from '../src/lib/paths.mjs';

// A03 brand/footer contract: every shared navigation target and the FAQ anchor
// must resolve through the A01 helper for both hosting modes, and the brand
// (logo) must target the home page rather than a local anchor.
test('footer nav items resolve through linkHref in both basePath modes', () => {
  for (const [, href] of site.nav) {
    assert.equal(linkHref(href, ''), href.startsWith('#') ? `/#${href.slice(1)}` : href);
    assert.equal(linkHref(href, '/edp'), href.startsWith('#') ? `/edp/#${href.slice(1)}` : `/edp${href}`);
  }
});

test('footer FAQ anchor resolves to the global home anchor', () => {
  assert.equal(linkHref('#faq', ''), '/#faq');
  assert.equal(linkHref('#faq', '/edp'), '/edp/#faq');
});

test('brand (logo) targets the home page, not a local anchor', () => {
  assert.equal(linkHref('/', ''), '/');
  assert.equal(linkHref('/', '/edp'), '/edp/');
});
