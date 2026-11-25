import {readFileSync, statSync} from 'node:fs';
import {resolve, sep} from 'node:path';
import {basePath} from '../src/lib/paths.mjs';
import {site} from '../src/content/site.mjs';

const root = resolve(process.argv[2] || 'out');
const rawHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
// Remove <script> content to avoid matching serialized RSC data with raw paths
const html = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
function verify(file) {
  const absolute = resolve(root, file);
  if (!absolute.startsWith(root + sep) || !statSync(absolute).isFile()) throw new Error(`Missing file: ${file}`);
  if (statSync(absolute).size === 0) throw new Error(`Empty file: ${file}`);
}
for (const file of ['index.html', '404.html', 'platform.svg', 'favicon.svg', 'og.png', 'robots.txt', 'sitemap.xml']) verify(file);
if (!html.includes(`src="${basePath}/platform.svg"`)) throw new Error('Incorrect hero image path');
if (!html.includes(`href="${basePath}/favicon.svg"`)) throw new Error('Incorrect favicon path');
let count = 0;
for (const match of html.matchAll(/\b(?:src|href)="(\/(?!\/)[^"?#]+)(?:[?#][^"]*)?"/g)) {
  const path = match[1];
  if (!path.startsWith(`${basePath}/`)) throw new Error(`Missing basePath: ${path}`);
  const file = decodeURIComponent(path.slice(basePath.length + 1));
  if (file.startsWith('_next/') || /\.[a-zA-Z0-9]+$/.test(file)) { verify(file); count++; }
}
if (!html.includes(`${site.url}/`)) throw new Error('Expected production canonical URL');
if (!readFileSync(resolve(root, 'sitemap.xml'), 'utf8').includes(`${site.url}/`)) throw new Error('Invalid sitemap domain');
console.log(`Static export OK: ${count} local asset references, basePath=${basePath || '/'}`);
