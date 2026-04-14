/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@nbti/core', '@nbti/shared'],
}

export default nextConfig
