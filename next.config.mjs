import {basePath} from './src/lib/paths.mjs';
import withMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: {unoptimized: true},
  poweredByHeader: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: {
      mdxType: 'gfm',
    },
  },
};
export default withMDX()(config);
