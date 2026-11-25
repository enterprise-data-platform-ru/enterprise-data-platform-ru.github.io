// Next.js basePath is fixed at build time. A custom apex domain uses ''.
export function normalizeBasePath(value = '') {
  const path = value.trim().replace(/\/+$/, '');
  if (!path) return '';
  if (!/^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(path) || path.split('/').some(s => s === '.' || s === '..')) {
    throw new Error(`Invalid NEXT_PUBLIC_BASE_PATH: ${value}`);
  }
  return path;
}

export const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '');

export function assetPath(path) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Expected a root-relative local path');
  return `${basePath}${path}`;
}

// Schemes that are safe to pass through untouched. Anything else is rejected.
const SAFE_LINK_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

// Builds an <a href> for an ordinary link on the static export. `prefix` is
// accepted for testing and defaults to the build-time `basePath`.
// - absolute path (/docs/) -> /docs/ or /edp/docs/
// - bare anchor (#platform) -> /#platform or /edp/#platform
// - external/protocol (https:, mailto:, tel:) -> returned unchanged
// - unsafe scheme (javascript:, data:, vbscript:, protocol-relative //host) -> throws
// - already-prefixed absolute path -> returned unchanged (no double prefix)
export function linkHref(href, prefix = basePath) {
  const base = normalizeBasePath(prefix);
  if (typeof href !== 'string' || !href.trim()) {
    throw new Error('Expected a non-empty href string');
  }
  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(href);
  if (scheme) {
    if (!SAFE_LINK_SCHEMES.has(scheme[1].toLowerCase())) {
      throw new Error(`Disallowed URL scheme: ${scheme[1]}`);
    }
    return href;
  }
  if (href.startsWith('//')) throw new Error('Protocol-relative URLs are not allowed');
  if (href.startsWith('#')) return `${base}/#${href.slice(1)}`;
  if (href.startsWith('/')) {
    if (base && (href === base || href.startsWith(`${base}/`))) return href;
    return `${base}${href}`;
  }
  throw new Error('Expected an absolute path, anchor, or protocol URL');
}
