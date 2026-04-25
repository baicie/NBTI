# 项目结构

## 整体目录

```
nbti/
├── apps/
│   └── web/                          # Next.js Web 应用
│       ├── app/                       # Next.js App Router 页面
│       ├── components/                # React 组件
│       ├── configs/
│       │   └── suites/                # 套餐配置目录
│       │       ├── index.json         # 套餐索引
│       │       ├── mbti/              # MBTI 套餐
│       │       ├── disc/              # DISC 套餐
│       │       └── pr01/             # 自定义套餐
│       ├── lib/                       # 工具函数
│       └── providers/                 # React Context
│
├── packages/
│   ├── core/                          # 核心包
│   │   └── src/
│   │       ├── schemas/               # JSON Schema 定义
│   │       │   ├── manifest.schema.json
│   │       │   ├── questions.schema.json
│   │       │   ├── types.schema.json
│   │       │   ├── templates.schema.json
│   │       │   └── themes.schema.json
│   │       └── ...
│   │
│   ├── shared/                        # 共享工具包
│   └── test-data/                     # 测试数据包
│
├── scripts/                           # 构建脚本
├── docs/                              # Markdown 文档（旧）
├── docs-vitepress/                    # VitePress 文档（新）
│   ├── index.md
│   ├── guide/                         # 指南文档
│   ├── schema/                        # Schema 参考
│   ├── suites/                        # 套餐文档
│   ├── public/
│   │   └── schemas/                  # 公开的 Schema 文件（AI 可直接访问）
│   └── .vitepress/
│       └── config.ts
│
└── package.json                       # 根 package.json（pnpm workspace 配置）
```

## 套餐配置目录结构

每个套餐目录下包含以下文件：

```
suites/{suite-id}/
├── manifest.json      # 【必填】套餐元信息
├── questions.json     # 【必填】题目数据
├── types.json         # 【必填】结果类型定义
├── themes.json        # 【可选】主题配置
├── templates.json     # 【可选】分享图模板
└── i18n/             # 【可选】多语言翻译
    ├── zh.json        # 简体中文
    ├── en.json        # 英文
    └── ja.json        # 日语（示例）
```

## 配置文件说明

| 文件             | 必填 | 说明                       |
| ---------------- | ---- | -------------------------- |
| `manifest.json`  | 是   | 套餐元信息、版本、计分规则 |
| `questions.json` | 是   | 题目、选项、权重、维度定义 |
| `types.json`     | 是   | 人格类型、特质、描述       |
| `themes.json`    | 否   | 颜色、字体、圆角等样式     |
| `templates.json` | 否   | 结果分享图模板             |
| `i18n/*.json`    | 否   | 多语言翻译文件             |

## Schema 文件位置

有两处 Schema 文件：

1. **`packages/core/src/schemas/`** — 源代码中的权威定义
2. **`docs-vitepress/public/schemas/`** — 公开给 AI 的可访问端点

```bash
# packages/core/src/schemas/（源代码）
packages/core/src/schemas/manifest.schema.json

# docs-vitepress/public/schemas/（可访问）
docs-vitepress/public/schemas/manifest.schema.json
# 访问方式：https://nbti.app/schemas/manifest.schema.json
```
