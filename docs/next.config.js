/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    domains: [],
  },
  // Ensure static generation works
  experimental: {
    // Enable static page generation
  },
}

module.exports = nextConfig

