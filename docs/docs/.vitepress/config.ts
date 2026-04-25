import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NBTI',
  description: 'NBTI 测评平台开发文档 — 让 AI 也能读懂你的试题配置',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'NBTI Docs' }],
    ['meta', { property: 'og:description', content: 'NBTI 测评平台开发文档' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'NBTI Docs',

    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'Schema 参考', link: '/schema/' },
      { text: '套餐列表', link: '/suites/' },
      {
        text: '更多',
        items: [
          { text: 'CLI 工具', link: '/cli/' },
          { text: 'API 参考', link: '/api/' },
          { text: '变更日志', link: '/changelog' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '核心概念', link: '/guide/core-concepts' },
            { text: '配置套餐', link: '/guide/create-suite' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],

      '/schema/': [
        {
          text: 'JSON Schema 参考',
          items: [
            { text: '概述', link: '/schema/' },
            { text: 'manifest.json', link: '/schema/manifest' },
            { text: 'questions.json', link: '/schema/questions' },
            { text: 'types.json', link: '/schema/types' },
            { text: 'templates.json', link: '/schema/templates' },
            { text: 'themes.json', link: '/schema/themes' },
          ],
        },
      ],

      '/suites/': [
        {
          text: '套餐列表',
          items: [
            { text: '概述', link: '/suites/' },
            { text: 'MBTI', link: '/suites/mbti' },
            { text: 'DISC', link: '/suites/disc' },
            { text: 'pr01', link: '/suites/pr01' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-repo' }],

    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '基于 NBTI 框架构建',
      copyright: `Copyright © ${new Date().getFullYear()} NBTI Team`,
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
      level: [2, 3],
    },
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '警告',
      infoLabel: '信息',
      detailsLabel: '详情',
    },
  },

  sitemap: {
    hostname: 'https://nbti.app',
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
  },
})
