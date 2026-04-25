# 创建新套餐

## 前置条件

在开始之前，建议先阅读：

- [快速开始](./getting-started)
- [核心概念](./core-concepts)
- [Schema 参考](../schema/)

## 完整流程

### Step 1: 创建套餐目录

在 `apps/web/configs/suites/` 下创建新目录，目录名即为套餐 ID：

```bash
mkdir -p apps/web/configs/suites/my-suite
```

### Step 2: 编写 manifest.json

```json
{
  "id": "my-suite",
  "name": { "zh": "我的套餐", "en": "My Suite" },
  "version": "1.0.0",
  "description": {
    "zh": "这是一个自定义测试套餐",
    "en": "This is a custom test suite"
  },
  "config": {
    "questions": "questions.json",
    "types": "types.json",
    "themes": "themes.json",
    "templates": "templates.json",
    "i18n": "i18n"
  },
  "settings": {
    "allowBack": true,
    "showTimer": false,
    "shuffleQuestions": false,
    "shuffleOptions": false,
    "requiredAnswer": true,
    "maxDuration": null
  },
  "scoring": {
    "type": "dimension",
    "dimensions": ["EI", "NS"],
    "calculateMethod": "difference",
    "normalizeOutput": true
  }
}
```

### Step 3: 编写 questions.json

```json
{
  "meta": {
    "totalQuestions": 4,
    "timeEstimate": 120,
    "tags": ["test", "demo"],
    "description": {
      "zh": "这是一个演示用的测试题库",
      "en": "This is a demo question bank"
    }
  },
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向-内向", "en": "Extraversion-Introversion" },
      "leftLabel": { "zh": "外向", "en": "Extravert" },
      "rightLabel": { "zh": "内向", "en": "Introvert" }
    },
    {
      "id": "NS",
      "name": { "zh": "直觉-实感", "en": "Intuition-Sensing" },
      "leftLabel": { "zh": "直觉", "en": "Intuition" },
      "rightLabel": { "zh": "实感", "en": "Sensing" }
    }
  ],
  "questions": [
    {
      "id": "q001",
      "dimension": "EI",
      "content": {
        "zh": "周末你更喜欢：",
        "en": "On weekends, you prefer:"
      },
      "options": [
        {
          "id": "opt_1a",
          "content": { "zh": "和朋友出去浪", "en": "Hang out with friends" },
          "weight": { "E": 3, "I": 0 }
        },
        {
          "id": "opt_1b",
          "content": { "zh": "一个人待着", "en": "Stay alone" },
          "weight": { "E": 0, "I": 3 }
        }
      ]
    }
  ]
}
```

### Step 4: 编写 types.json

```json
{
  "meta": {
    "version": "1.0.0",
    "lastUpdated": "2026-04-24"
  },
  "dimensions": [
    {
      "id": "EI",
      "left": { "letter": "E", "name": { "zh": "外向", "en": "Extravert" } },
      "right": { "letter": "I", "name": { "zh": "内向", "en": "Introvert" } }
    }
  ],
  "types": [
    {
      "id": "EN",
      "name": { "zh": "外向直觉型", "en": "Extraverted Intuitive" },
      "subtitle": { "zh": "充满能量的梦想家", "en": "Energetic dreamer" },
      "description": {
        "zh": "你是一个充满活力和创意的人...",
        "en": "You are a vibrant and creative person..."
      },
      "icon": "sparkles",
      "color": "#6366f1",
      "traits": [
        {
          "id": "energetic",
          "name": { "zh": "充满活力", "en": "Energetic" },
          "icon": "zap",
          "level": 85
        }
      ],
      "strengths": [
        { "zh": "富有想象力", "en": "Imaginative" },
        { "zh": "善于社交", "en": "Good at socializing" }
      ],
      "weaknesses": [
        { "zh": "有时过于理想化", "en": "Sometimes too idealistic" }
      ],
      "compatibleTypes": ["IN", "ES"],
      "careers": [
        { "zh": "市场营销", "en": "Marketing" },
        { "zh": "创意设计", "en": "Creative Design" }
      ]
    }
  ]
}
```

### Step 5: 注册套餐

在 `apps/web/configs/suites/index.json` 中添加：

```json
{
  "suites": [
    // ... 现有套餐
    {
      "id": "my-suite",
      "name": { "zh": "我的套餐", "en": "My Suite" },
      "description": {
        "zh": "这是一个自定义测试套餐",
        "en": "This is a custom test suite"
      },
      "enabled": true,
      "order": 100
    }
  ]
}
```

### Step 6: 验证

访问 `http://localhost:3000/my-suite` 查看效果。

## 使用 AI 辅助创建

你可以让 AI 助手根据 Schema 自动生成配置。提供以下端点给 AI：

```
/schemas/index.json      →  了解整体结构
/schemas/manifest.schema.json
/schemas/questions.schema.json
/schemas/types.schema.json
```

### 示例 Prompt

> 请根据 questions.schema.json 为我创建一个关于"职场性格"的测试，包含 10 道题目，涵盖沟通风格、工作偏好、团队协作三个维度。

## 常见问题

### Q: 可以使用中文还是英文？

A: 配置文件中建议使用 `LocalizedString` 格式，同时提供中英文。但如果只做中文版本，可以只写 `zh` 键。

### Q: 题目 ID 有什么要求？

A: 题目 ID 格式为 `q` 开头后跟数字，如 `q001`、`q002`，长度至少 4 个字符。

### Q: 选项权重如何设置？

A: 权重范围 0-10，值越大表示越倾向该选项。每个选项的权重之和不一定为固定值。

### Q: 如何让 AI 校验我的配置？

A: 提供对应的 Schema 文件给 AI，AI 可以根据 Schema 校验 JSON 配置的正确性。
