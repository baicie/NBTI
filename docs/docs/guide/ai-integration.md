# AI 接入指南

## 概述

NBTI 提供了一套完整的 JSON Schema，让 AI 助手能够理解、生成和校验测评配置文件。通过本指南，AI 可以：

1. 了解 NBTI 框架的数据结构
2. 根据 Schema 生成有效的配置文件
3. 校验现有配置的正确性
4. 辅助创建和管理测试套餐

## AI 快速接入

### Step 1: 获取 Schema 索引

AI 助手可以通过以下方式获取所有 Schema 的概览：

```
GET /schemas/index.json
```

这将返回包含以下内容的索引文件：

- 所有 Schema 文件的路径和 URL
- 每个 Schema 的必填字段
- 快速开始指引
- 核心概念解释

### Step 2: 获取具体 Schema

根据需要获取对应的 Schema 文件：

```
GET /schemas/manifest.schema.json   →  套餐元信息 Schema
GET /schemas/questions.schema.json   →  题目数据 Schema
GET /schemas/types.schema.json       →  结果类型 Schema
GET /schemas/themes.schema.json      →  主题配置 Schema
GET /schemas/templates.schema.json   →  分享图模板 Schema
```

### Step 3: 读取示例文件

参考现有的配置文件了解实际格式：

- `apps/web/configs/suites/pr01/manifest.json`
- `apps/web/configs/suites/pr01/questions.json`
- `apps/web/configs/suites/pr01/types.json`

---

## AI 推荐 Prompts

以下是 AI 助手可以完成的任务示例：

### 创建套餐

> 请根据 manifest.schema.json 和 questions.schema.json 为我创建一个"职场沟通风格"测试，包含 8 道题目，涵盖表达方式、倾听习惯、冲突处理三个维度。

### 添加题目

> 请根据 questions.schema.json 为我的 MBTI 测试添加 5 道关于"思考方式"的新题目，每道题 3 个选项。

### 定义类型

> 请根据 types.schema.json 定义一个新的 9 型人格类型（enneagram），包含类型名称、核心欲望、核心恐惧、成长/退化方向。

### 创建主题

> 请根据 themes.schema.json 创建一套"森林自然"主题，使用绿色系配色。

### 校验配置

> 请根据 questions.schema.json 校验以下 questions.json 的结构是否正确，并指出任何不符合 Schema 的地方。

### 翻译配置

> 请将以下配置文件中的中文翻译为英文，保持 LocalizedString 格式。

---

## AI 友好的 Schema 设计

### 索引文件设计

`/schemas/index.json` 专门为 AI 设计，包含：

```json
{
  "schemas": {
    "manifest": {
      "requiredFields": ["id", "name", "version", "config"],
      "notes": "config.questions 和 config.types 是必填的"
    }
  },
  "quickStart": {
    "minimumFiles": [...],
    "typicalWorkflow": [...]
  },
  "coreConcepts": {
    "dimension": { "examples": [...] },
    "weight": { "examples": [...] }
  },
  "aiFriendly": {
    "readableForAI": true,
    "recommendedPrompts": [...]
  }
}
```

### 为什么这样设计？

1. **减少 token 消耗**：AI 不需要读取完整的 JSON Schema 文件，只读索引文件即可了解结构
2. **提供上下文**：包含实际示例和业务解释
3. **推荐任务**：列出 AI 常用的操作类型
4. **交叉引用**：统一使用 `LocalizedString` 等公共定义

---

## Schema 文件映射

| Schema 文件           | AI 端点                          | 用途            |
| --------------------- | -------------------------------- | --------------- |
| index.json            | `/schemas/index.json`            | AI 快速了解框架 |
| manifest.schema.json  | `/schemas/manifest.schema.json`  | 套餐元信息      |
| questions.schema.json | `/schemas/questions.schema.json` | 题目和选项      |
| types.schema.json     | `/schemas/types.schema.json`     | 人格类型定义    |
| themes.schema.json    | `/schemas/themes.schema.json`    | 视觉样式        |
| templates.schema.json | `/schemas/templates.schema.json` | 分享图模板      |

---

## 实现示例

### 示例 1: AI 创建新套餐

```bash
# AI 首先读取索引
curl /schemas/index.json

# 然后根据需要读取具体 Schema
curl /schemas/questions.schema.json

# 参考现有配置
cat apps/web/configs/suites/pr01/questions.json
```

### 示例 2: 验证 AI 生成的配置

AI 可以根据 Schema 快速检查配置：

```json
// questions.json 的关键校验点：
{
  "meta": {
    /* 必填 */
  },
  "questions": [
    {
      "id": "q001", // 必须以 q 开头
      "dimension": "EI", // 必须在 dimensions 中定义
      "content": { "zh": "..." }, // 必须是 LocalizedString
      "options": [
        {
          "id": "opt_xxx", // 必须以 opt_ 开头
          "weight": { "E": 3, "I": 0 } // 键必须是大写字母
        }
      ]
    }
  ]
}
```

---

## 最佳实践

### 给 AI 的指令

1. **明确需求**：说明测评的主题、目标人群、题目数量
2. **指定维度**：列出需要测量的维度
3. **提供示例**：如果有参考配置文件，给 AI 参考
4. **明确语言**：说明需要的语言（中文/英文/双语）

### 校验 AI 输出

1. **Schema 校验**：使用 Ajv 等工具进行自动化校验
2. **逻辑校验**：检查题目和类型的对应关系
3. **内容校验**：人工审核题目的表述和类型的描述

### 迭代优化

1. AI 生成初稿
2. 人工审核和调整
3. 在测试环境验证
4. 根据反馈优化提示词

---

## 更多信息

- 查看 [完整 Schema 参考](../schema/)
- 查看 [创建新套餐](./create-suite)
- 查看 [核心概念](./core-concepts)
