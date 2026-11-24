import {basePath} from './src/lib/paths.mjs';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {unoptimized: true},
  poweredByHeader: false,
};
export default config;
