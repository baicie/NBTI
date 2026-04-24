/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@nbti/core', '@nbti/shared'],

  // 确保 standalone 输出时打包所有套件 JSON 配置文件
  outputFileTracingIncludes: {
    '/_next/static/chunks/**/*': [
      '../configs/suites/**/*.json',
    ],
  },
}

export default nextConfig
