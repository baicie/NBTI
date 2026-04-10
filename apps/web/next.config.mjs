/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@nbti/core', '@nbti/shared'],

  // 路由重定向配置
  async redirects() {
    return [
      // 旧测试路径重定向到新的套件路径
      {
        source: '/test',
        destination: '/mbti',
        permanent: false,
      },
      // 旧结果路径重定向到新的套件结果路径
      {
        source: '/result',
        destination: '/mbti/result',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
