import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {normalizeBasePath} from '../src/lib/paths.mjs';

test('custom domain uses root paths', () => {
  for (const value of ['', '/', '  ']) assert.equal(normalizeBasePath(value), '');
});
test('project Pages path is normalized', () => {
  assert.equal(normalizeBasePath('/enterprise-data-platform/'), '/enterprise-data-platform');
});
test('reject invalid prefixes', () => {
  for (const value of ['relative', '//host', '/a/../b', '/a?x=1', 'https://example.com']) assert.throws(() => normalizeBasePath(value));
});
test('build config and asset paths agree for both hosting modes', () => {
  for (const prefix of ['', '/enterprise-data-platform']) {
    const script = `import config from './next.config.mjs'; import {assetPath} from './src/lib/paths.mjs'; console.log(JSON.stringify([config.basePath,config.output,assetPath('/platform.svg')]));`;
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', script], {encoding:'utf8',env:{...process.env,NEXT_PUBLIC_BASE_PATH:prefix}});
    assert.deepEqual(JSON.parse(result), [prefix,'export',`${prefix}/platform.svg`]);
  }
});
