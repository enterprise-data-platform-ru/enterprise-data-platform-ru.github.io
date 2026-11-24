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
