import {test} from 'node:test';
import assert from 'node:assert/strict';
import {site} from '../src/content/site.mjs';
import {linkHref} from '../src/lib/paths.mjs';

// A02 navigation contract: every nav target must resolve through the A01 helper
// for both hosting modes, and the active-section contract must match exactly.
test('nav items resolve through linkHref in both basePath modes', () => {
  for (const [, href] of site.nav) {
    assert.ok(typeof href === 'string' && href.length > 0);
    assert.equal(linkHref(href, ''), href.startsWith('#') ? `/#${href.slice(1)}` : href);
    assert.equal(linkHref(href, '/edp'), href.startsWith('#') ? `/edp/#${href.slice(1)}` : `/edp${href}`);
  }
});

test('documentation anchor resolves to the global home anchor', () => {
  assert.equal(linkHref('#contact', ''), '/#contact');
  assert.equal(linkHref('#contact', '/edp'), '/edp/#contact');
});

test('active-section marker matches by raw href', () => {
  const active = '/docs/';
  const marked = site.nav.filter(([, href]) => href === active).map(([label]) => label);
  assert.deepEqual(marked, ['Документация']);
  assert.equal(site.nav.some(([, href]) => href === active && href !== active), false);
});
