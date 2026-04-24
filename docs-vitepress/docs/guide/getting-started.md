# 快速开始

## 环境要求

- **Node.js**: >= 18.12.0
- **pnpm**: >= 10.19.0（项目使用 pnpm workspace 管理）

## 安装

```bash
# 克隆项目
git clone https://github.com/your-org/nbti.git
cd nbti

# 安装依赖
pnpm install

# 安装 VitePress 文档依赖
cd docs-vitepress && pnpm install && cd ..
```

## 开发命令

```bash
# 启动 Web 应用
pnpm dev

# 启动文档网站
cd docs-vitepress && pnpm docs:dev

# 构建 Web 应用
pnpm build

# 运行测试
pnpm test

# 类型检查
pnpm check

# 代码检查
pnpm lint
```

## 创建第一个测试套餐

### 1. 创建套餐目录

在 `apps/web/configs/suites/` 下创建新目录：

```
apps/web/configs/suites/my-test/
├── manifest.json      # 必填：套餐元信息
├── questions.json     # 必填：题目数据
├── types.json         # 必填：结果类型
├── themes.json        # 可选：主题配置
├── templates.json     # 可选：分享图模板
└── i18n/             # 可选：多语言
    ├── zh.json
    └── en.json
```

### 2. 编写 manifest.json

```json
{
  "id": "my-test",
  "name": { "zh": "我的测试", "en": "My Test" },
  "version": "1.0.0",
  "config": {
    "questions": "questions.json",
    "types": "types.json",
    "themes": "themes.json"
  },
  "settings": {
    "allowBack": true,
    "showTimer": false,
    "shuffleQuestions": false,
    "shuffleOptions": false
  },
  "scoring": {
    "type": "dimension",
    "dimensions": ["EI", "NS", "TF", "JP"],
    "calculateMethod": "difference",
    "normalizeOutput": true
  }
}
```

### 3. 编写 questions.json

```json
{
  "meta": {
    "totalQuestions": 4,
    "timeEstimate": 180,
    "tags": ["personality"],
    "description": { "zh": "简单的性格测试", "en": "A simple personality test" }
  },
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向-内向", "en": "Extraversion-Introversion" },
      "leftLabel": { "zh": "外向", "en": "Extraversion" },
      "rightLabel": { "zh": "内向", "en": "Introversion" }
    }
  ],
  "questions": [
    {
      "id": "q001",
      "dimension": "EI",
      "content": { "zh": "在社交聚会中，你通常会？", "en": "At a party, you usually?" },
      "options": [
        {
          "id": "opt_a",
          "content": { "zh": "主动和很多人交流", "en": "Talk to many people" },
          "weight": { "E": 3, "I": 0 }
        },
        {
          "id": "opt_b",
          "content": { "zh": "和几个熟悉的人聊天", "en": "Chat with a few familiar people" },
          "weight": { "E": 1, "I": 1 }
        },
        {
          "id": "opt_c",
          "content": { "zh": "独自找个安静的角落", "en": "Find a quiet corner alone" },
          "weight": { "E": 0, "I": 3 }
        }
      ]
    }
  ]
}
```

### 4. 编写 types.json

```json
{
  "types": [
    {
      "id": "E",
      "name": { "zh": "外向型", "en": "Extravert" },
      "description": { "zh": "你是一个外向的人", "en": "You are an extravert" },
      "color": "#6366f1",
      "strengths": [{ "zh": "善于社交", "en": "Good at socializing" }],
      "weaknesses": [{ "zh": "有时过于冲动", "en": "Sometimes too impulsive" }]
    },
    {
      "id": "I",
      "name": { "zh": "内向型", "en": "Introvert" },
      "description": { "zh": "你是一个内向的人", "en": "You are an introvert" },
      "color": "#8b5cf6",
      "strengths": [{ "zh": "善于思考", "en": "Good at thinking" }],
      "weaknesses": [{ "zh": "有时过于沉默", "en": "Sometimes too quiet" }]
    }
  ]
}
```

### 5. 注册套餐

在 `apps/web/configs/suites/index.json` 中添加：

```json
{
  "suites": [
    {
      "id": "my-test",
      "name": { "zh": "我的测试", "en": "My Test" },
      "description": { "zh": "一个简单的测试", "en": "A simple test" },
      "enabled": true,
      "order": 10
    }
  ]
}
```

### 6. 访问测试

启动开发服务器后访问：`http://localhost:3000/my-test`

## 下一步

- 了解 [核心概念](./core-concepts)
- 查看 [完整 Schema 参考](../schema/)
- 学习 [如何配置主题](../schema/themes)
