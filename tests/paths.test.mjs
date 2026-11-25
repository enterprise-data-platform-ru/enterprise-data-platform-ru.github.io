import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {normalizeBasePath, linkHref} from '../src/lib/paths.mjs';

test('custom domain uses root paths', () => {
  for (const value of ['', '/', '  ']) assert.equal(normalizeBasePath(value), '');
});
test('project Pages path is normalized', () => {
  assert.equal(normalizeBasePath('/enterprise-data-platform/'), '/enterprise-data-platform');
});
test('reject invalid prefixes', () => {
  for (const value of ['relative', '//host', '/a/../b', '/a?x=1', 'https://example.com']) assert.throws(() => normalizeBasePath(value));
});
test('linkHref adapts anchors and paths to basePath', () => {
  assert.equal(linkHref('#platform', ''), '/#platform');
  assert.equal(linkHref('#platform', '/edp'), '/edp/#platform');
  assert.equal(linkHref('/', ''), '/');
  assert.equal(linkHref('/', '/edp'), '/edp/');
  assert.equal(linkHref('/docs/', ''), '/docs/');
  assert.equal(linkHref('/docs/', '/edp'), '/edp/docs/');
});
test('linkHref avoids double prefix on already-prefixed paths', () => {
  assert.equal(linkHref('/edp/docs/', '/edp'), '/edp/docs/');
  assert.equal(linkHref('/edp', '/edp'), '/edp');
});
test('linkHref passes external links and rejects unsafe schemes', () => {
  assert.equal(linkHref('https://example.com', '/edp'), 'https://example.com');
  assert.equal(linkHref('http://example.com', ''), 'http://example.com');
  assert.equal(linkHref('mailto:a@example.com', '/edp'), 'mailto:a@example.com');
  assert.equal(linkHref('tel:+70000000000', ''), 'tel:+70000000000');
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil.example', 'relative/path', '', '  ']) {
    assert.throws(() => linkHref(bad, '/edp'));
  }
});
test('build config and asset paths agree for both hosting modes', () => {
  for (const prefix of ['', '/enterprise-data-platform']) {
    const script = `import config from './next.config.mjs'; import {assetPath} from './src/lib/paths.mjs'; console.log(JSON.stringify([config.basePath,config.output,assetPath('/platform.svg')]));`;
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', script], {encoding:'utf8',env:{...process.env,NEXT_PUBLIC_BASE_PATH:prefix}});
    assert.deepEqual(JSON.parse(result), [prefix,'export',`${prefix}/platform.svg`]);
  }
});
