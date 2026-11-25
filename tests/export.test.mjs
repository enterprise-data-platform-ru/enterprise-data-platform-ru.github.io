import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {checkExport} from '../scripts/check-export.mjs';

// ── helpers ────────────────────────────────────────────────────────────────────

function makeDir() {
  return mkdtempSync(join(tmpdir(), 'export-test-'));
}

function write(dir, rel, content = 'ok') {
  const full = join(dir, rel);
  mkdirSync(join(full, '..'), {recursive: true});
  writeFileSync(full, content);
}

/**
 * Build a minimal valid export fixture.
 * @param {object} [opts]
 * @param {string} [opts.basePath]        – '' or '/edp'
 * @param {string} [opts.siteUrl]
 * @returns {string} dir path
 */
function validFixture(opts = {}) {
  const dir = makeDir();
  const bp = opts.basePath ?? '';
  const site = opts.siteUrl ?? 'https://example.com';
  const p = (s) => `${bp}${s}`; // helper for prefixed paths

  // index.html with internal links
  const indexHtml = [
    `<a href="${p('/')}" id="nav">Home</a>`,
    `<a href="${p('/#platform')}">Platform</a>`,
    `<a href="${p('/docs/')}">Docs</a>`,
    `<img src="${p('/platform.svg')}" alt="logo">`,
    `<a href="${p('/favicon.svg')}">Fav</a>`,
    `<a href="https://external.com/">Ext</a>`,
    `<a href="mailto:a@b.c">Mail</a>`,
    `<a href="#main">Anchor</a>`,
    `<link rel="canonical" href="${site}/">`,
    `<section id="platform">Platform</section>`,
    `<section id="contact">Contact</section>`,
    `<main id="main">Content</main>`,
  ].join('');

  // docs/index.html
  const docsHtml = [
    `<a href="${p('/')}" id="nav">Home</a>`,
    `<a href="${p('/#contact')}">Contact</a>`,
    `<link rel="canonical" href="${site}/docs/">`,
    `<main id="main">Docs</main>`,
  ].join('');

  // 404.html
  const notFound = `<a href="${p('/')}">Home</a><link rel="canonical" href="${site}/">`;

  write(dir, 'index.html', indexHtml);
  write(dir, 'docs/index.html', docsHtml);
  write(dir, '404.html', notFound);
  write(dir, 'platform.svg', '<svg></svg>');
  write(dir, 'favicon.svg', '<svg></svg>');
  write(dir, 'og.png', 'png');
  write(dir, 'robots.txt', 'User-agent: *');
  write(dir, 'sitemap.xml',
    `<?xml version="1.0"?><urlset><url><loc>${site}/</loc></url>` +
    `<url><loc>${site}/docs/</loc></url></urlset>`
  );

  return dir;
}

// ── tests ──────────────────────────────────────────────────────────────────────

test('valid export with root basePath passes', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  assert.doesNotThrow(() => {
    const r = checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
    assert.ok(r.assetCount > 0, 'should count assets');
    assert.ok(r.htmlFiles >= 3, 'should find at least 3 HTML files');
  });
  rmSync(dir, {recursive: true, force: true});
});

test('valid export with nested basePath passes', () => {
  const dir = validFixture({basePath: '/edp', siteUrl: 'https://example.com'});
  assert.doesNotThrow(() => {
    const r = checkExport(dir, {basePath: '/edp', siteUrl: 'https://example.com'});
    assert.ok(r.assetCount > 0);
  });
  rmSync(dir, {recursive: true, force: true});
});

test('broken internal link to missing page causes failure', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  // Add a broken link to docs/index.html (no cross-page anchor refs in fixture)
  const docsHtml = readFileSync(join(dir, 'docs', 'index.html'), 'utf8');
  write(dir, 'docs/index.html',
    docsHtml + '<a href="/missing-page/">Broken</a>'
  );
  assert.throws(() => {
    checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
  }, /Missing file/);
  rmSync(dir, {recursive: true, force: true});
});

test('broken anchor to missing id causes failure', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  // Add a link with an anchor that doesn't exist
  write(dir, 'index.html',
    `<a href="/#nonexistent-anchor">Broken</a><link rel="canonical" href="https://example.com/">` +
    `<main id="main">x</main>`
  );
  assert.throws(() => {
    checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
  }, /broken anchor/);
  rmSync(dir, {recursive: true, force: true});
});

test('missing required file causes failure', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  rmSync(join(dir, 'platform.svg'));
  assert.throws(() => {
    checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
  }, /Missing file: platform\.svg/);
  rmSync(dir, {recursive: true, force: true});
});

test('missing docs/index.html causes failure', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  rmSync(join(dir, 'docs', 'index.html'));
  assert.throws(() => {
    checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
  }, /Missing file/);
  rmSync(dir, {recursive: true, force: true});
});

test('sitemap missing /docs/ URL causes failure', () => {
  const dir = validFixture({basePath: '', siteUrl: 'https://example.com'});
  write(dir, 'sitemap.xml',
    '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url></urlset>'
  );
  assert.throws(() => {
    checkExport(dir, {basePath: '', siteUrl: 'https://example.com'});
  }, /sitemap\.xml missing \/docs\//);
  rmSync(dir, {recursive: true, force: true});
});

test('missing basePath on link with nested basePath causes failure', () => {
  const dir = validFixture({basePath: '/edp', siteUrl: 'https://example.com'});
  // Add a link without the /edp prefix to docs/index.html
  const docsHtml = readFileSync(join(dir, 'docs', 'index.html'), 'utf8');
  write(dir, 'docs/index.html',
    docsHtml + '<a href="/platform.svg">NoPrefix</a>'
  );
  assert.throws(() => {
    checkExport(dir, {basePath: '/edp', siteUrl: 'https://example.com'});
  }, /missing basePath/);
  rmSync(dir, {recursive: true, force: true});
});
