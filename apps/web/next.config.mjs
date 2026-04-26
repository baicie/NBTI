/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@nbti/core', '@nbti/shared'],

  // 确保 standalone 输出时打包所有套件 JSON 配置文件
  outputFileTracingIncludes: {
    '/_next/static/chunks/**/*': ['../configs/suites/**/*.json'],
    '/types/**/*': ['./public/types/**/*'],
    '/favicon.ico': ['./public/favicon.ico'],
  },

  // 优化重库的 tree-shaking，减少编译时的解析开销
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'recharts',
      'lucide-react',
      '@radix-ui/react-icons',
      'clsx',
      'tailwind-merge',
    ],
  },
}

export default nextConfig
