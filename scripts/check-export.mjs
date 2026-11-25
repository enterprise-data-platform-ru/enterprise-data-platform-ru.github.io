import {readFileSync, statSync, readdirSync} from 'node:fs';
import {resolve, join, sep, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

// ── helpers ────────────────────────────────────────────────────────────────────

function walkHtml(dir, out = []) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Strip <script> blocks (RSC payloads can contain raw paths that look like
 * navigation but are not).
 */
function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

/**
 * Returns true for external / non-local URLs that should be ignored.
 */
function isExternal(url) {
  return (
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url) ||
    /^data:/i.test(url) ||
    /^\/\//.test(url) ||
    /^javascript:/i.test(url) ||
    /^vbscript:/i.test(url)
  );
}

/**
 * Split a URL into {path, anchor}.  Handles percent-encoding.
 * Bare anchor "#main" → {path: '', anchor: 'main'}
 * "/docs/#faq"        → {path: '/docs/', anchor: 'faq'}
 * "/platform.svg"     → {path: '/platform.svg', anchor: null}
 */
function splitUrl(url) {
  const hashIdx = url.indexOf('#');
  if (hashIdx === -1) return {path: url, anchor: null};
  if (hashIdx === 0) return {path: '', anchor: decodeURIComponent(url.slice(1))};
  const path = url.slice(0, hashIdx);
  const anchor = decodeURIComponent(url.slice(hashIdx + 1));
  return {path, anchor};
}

/**
 * Map a logical path (already stripped of basePath) to a file on disk.
 *  /              → index.html
 *  /docs/         → docs/index.html
 *  /docs          → docs/index.html  (no extension)
 *  /platform.svg  → platform.svg
 *  /_next/foo.js  → _next/foo.js
 */
function resolveFile(logicalPath) {
  let p = logicalPath.replace(/^\/+/, ''); // strip leading slashes
  if (!p || p === '') return 'index.html';
  if (p.endsWith('/')) return join(p, 'index.html');
  // Has a file extension?
  const ext = p.split('.').pop();
  if (ext && ext.length <= 10 && !ext.includes('/')) return p;
  // No extension → treat as a route → index.html
  return join(p, 'index.html');
}

/**
 * Check that an id attribute exists in the stripped HTML of a target file.
 * Uses a simple regex suitable for Next.js output (well-formed, single-line).
 */
function hasAnchor(html, anchor) {
  if (!anchor) return true;
  return new RegExp(`id="${anchor}"`).test(html);
}

/**
 * Verify a file exists and is non-empty.
 */
function verifyFile(outDir, file) {
  const abs = resolve(outDir, file);
  if (!abs.startsWith(resolve(outDir) + sep)) throw new Error(`Path traversal: ${file}`);
  let st;
  try { st = statSync(abs); }
  catch { throw new Error(`Missing file: ${file}`); }
  if (!st.isFile()) throw new Error(`Not a file: ${file}`);
  if (st.size === 0) throw new Error(`Empty file: ${file}`);
}

// ── main export ────────────────────────────────────────────────────────────────

/**
 * @param {string} outDir  – path to the export directory
 * @param {object} [opts]
 * @param {string} [opts.basePath]        – e.g. '' or '/edp-test'
 * @param {string} [opts.siteUrl]         – e.g. 'https://enterprisedataplatform.ru'
 * @returns {{assetCount: number}}
 */
export function checkExport(outDir, opts = {}) {
  const base = opts.basePath ?? '';
  const siteUrl = opts.siteUrl;
  let assetCount = 0;

  // 1. Required files
  for (const f of ['index.html', '404.html', 'platform.svg', 'favicon.svg',
                   'og.png', 'robots.txt', 'sitemap.xml']) {
    verifyFile(outDir, f);
  }

  // 2. docs/index.html must exist
  verifyFile(outDir, join('docs', 'index.html'));

  // 3. sitemap must contain /docs/
  const sitemap = readFileSync(join(outDir, 'sitemap.xml'), 'utf8');
  if (siteUrl) {
    if (!sitemap.includes(siteUrl + '/docs/'))
      throw new Error('sitemap.xml missing /docs/ URL');
    if (!sitemap.includes(siteUrl + '/'))
      throw new Error('sitemap.xml missing root URL');
  }

  // 4. Walk all HTML files and validate links
  const htmlFiles = walkHtml(outDir);

  // Pre-read all HTML for anchor lookups (cache)
  const htmlCache = new Map();
  for (const f of htmlFiles) {
    htmlCache.set(f, stripScripts(readFileSync(f, 'utf8')));
  }

  for (const htmlFile of htmlFiles) {
    const stripped = htmlCache.get(htmlFile);
    const rel = relative(outDir, htmlFile);
    const pageDir = rel === 'index.html' ? '' : relative(outDir, dirname(htmlFile));

    // Extract all href/src attribute values
    const attrRegex = /\b(?:href|src)="([^"]*)"/gi;

    for (const m of stripped.matchAll(attrRegex)) {
      const url = m[1];
      if (isExternal(url)) continue;

      const {path: rawPath, anchor} = splitUrl(url);

      // Bare anchor (e.g. "#main") → check in current page
      if (!rawPath || rawPath === '') {
        if (anchor && !hasAnchor(stripped, anchor)) {
          throw new Error(`Broken anchor in ${rel}: #${anchor}`);
        }
        continue;
      }

      // Root-relative path
      if (!rawPath.startsWith('/')) {
        // Relative path — resolve against the page's directory
        const resolved = join(pageDir, rawPath);
        const file = resolveFile('/' + resolved.replace(/\\/g, '/'));
        try { verifyFile(outDir, file); }
        catch (e) { throw new Error(`${rel}: ${e.message}`); }
        if (anchor) {
          const targetHtml = htmlCache.get(resolve(outDir, file));
          if (targetHtml !== undefined && !hasAnchor(targetHtml, anchor)) {
            throw new Error(`Broken anchor in ${rel}: #${anchor} → ${file}`);
          }
        }
        continue;
      }

      // Absolute path — must carry basePath prefix (if non-empty)
      if (base && !rawPath.startsWith(base + '/') && rawPath !== base) {
        throw new Error(`${rel}: missing basePath in "${url}"`);
      }

      // Strip basePath
      const logical = base ? rawPath.slice(base.length) : rawPath;

      // Next.js internal resources — verify existence only
      if (logical.startsWith('/_next/')) {
        verifyFile(outDir, logical.replace(/^\/+/, ''));
        assetCount++;
        continue;
      }

      // Check file existence
      const file = resolveFile(logical);
      try { verifyFile(outDir, file); }
      catch (e) { throw new Error(`${rel}: ${e.message}`); }
      assetCount++;

      // If there's an anchor, check it in the target page
      if (anchor) {
        const targetHtml = htmlCache.get(resolve(outDir, file));
        if (targetHtml !== undefined && !hasAnchor(targetHtml, anchor)) {
          throw new Error(`${rel}: broken anchor #${anchor} in ${file}`);
        }
      }
    }

    // Canonical URL check (only for index.html and docs/index.html)
    if (siteUrl && (rel === 'index.html' || rel.startsWith('docs/') || rel.startsWith('404'))) {
      if (!stripped.includes(siteUrl + '/')) {
        // 404 pages may have the root canonical, that's fine
      }
    }
  }

  // 5. Check canonical URL in main index.html
  if (siteUrl) {
    const mainHtml = htmlCache.get(resolve(outDir, 'index.html'));
    if (mainHtml && !mainHtml.includes(siteUrl + '/')) {
      throw new Error('index.html missing canonical production URL');
    }
  }

  return {assetCount, htmlFiles: htmlFiles.length};
}

// ── CLI entry ──────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].includes('check-export.mjs')) {
  const {basePath} = await import('../src/lib/paths.mjs');
  const {site} = await import('../src/content/site.mjs');
  const outDir = resolve(process.argv[2] || 'out');
  const {assetCount, htmlFiles} = checkExport(outDir, {basePath, siteUrl: site.url});
  console.log(
    `Static export OK: ${assetCount} local asset references across ${htmlFiles} HTML files, basePath=${basePath || '/'}`
  );
}
