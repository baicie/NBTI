/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nbti/core', '@nbti/shared'],
  experimental: {
    turbo: {
      rules: {},
    },
  },
};

export default nextConfig;
