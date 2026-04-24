---
layout: home

hero:
  name: "NBTI 框架"
  text: "测评平台开发文档"
  tagline: "配置驱动的多试题套件平台，让 AI 也能轻松读懂你的试题配置"
  image:
    src: /logo.svg
    alt: NBTI
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 Schema
      link: /schema/
    - theme: alt
      text: AI 接入指南
      link: /guide/ai-integration

features:
  - icon: 🧩
    title: 配置即代码
    details: 通过 JSON 文件定义试题、题型、主题，无需编写代码即可创建完整测评。

  - icon: 🤖
    title: AI 友好
    details: 所有配置都有 JSON Schema 定义，AI 助手可以直接读取 Schema 进行校验和生成配置。

  - icon: 🎨
    title: 多主题支持
    details: 每个套件独立主题配置，支持颜色、字体、圆角、阴影等完整视觉定制。

  - icon: 🌐
    title: 多语言支持
    details: 内置国际化方案，通过 localizedString 对象轻松实现中英日等多语言切换。

  - icon: 📊
    title: 多种计分方式
    details: 支持维度差值法、百分比法、加权求和法等多种计分算法。

  - icon: 📱
    title: 响应式设计
    details: 适配移动端、平板和桌面端，提供一致的优秀体验。
---

<div style="text-align:center;padding:2rem 0 1rem;">
  <h3 style="font-size:1.1rem;color:var(--vp-c-text-2);margin-bottom:0.5rem;">AI 快速接入</h3>
  <p style="font-size:0.9rem;color:var(--vp-c-text-3);font-family:ui-monospace,monospace;background:var(--vp-c-bg-soft);padding:0.75rem 1rem;border-radius:8px;display:inline-block;">
    <strong style="color:var(--vp-c-brand-1);">GET</strong> /schemas/index.json
  </p>
  <p style="font-size:0.85rem;color:var(--vp-c-text-3);margin-top:0.5rem;">
    读取此端点，AI 即可了解所有 Schema 结构和关联关系
  </p>
</div>
