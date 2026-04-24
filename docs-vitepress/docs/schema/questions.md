# questions.json

题库数据配置文件，包含题目内容、选项、权重和维度定义。

## 文件位置

```
suites/{suite-id}/questions.json
```

## 完整示例

```json
{
  "meta": {
    "totalQuestions": 4,
    "timeEstimate": 180,
    "tags": ["personality", "introvert-extrovert"],
    "description": {
      "zh": "简单的外向-内向测试",
      "en": "Simple introversion-extraversion test"
    }
  },
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向-内向", "en": "Extraversion-Introversion" },
      "description": {
        "zh": "精力来源和注意力指向",
        "en": "Energy source and focus of attention"
      },
      "leftLabel": { "zh": "外向", "en": "Extravert" },
      "rightLabel": { "zh": "内向", "en": "Introvert" }
    }
  ],
  "categories": [
    {
      "id": "social",
      "name": { "zh": "社交场景", "en": "Social Scenarios" },
      "description": { "zh": "关于社交行为的题目", "en": "Questions about social behavior" },
      "questionIds": ["q001", "q002"]
    }
  ],
  "questions": [
    {
      "id": "q001",
      "dimension": "EI",
      "category": "social",
      "content": {
        "zh": "在社交聚会中，你通常会：",
        "en": "At a social gathering, you tend to:"
      },
      "image": null,
      "isReverse": false,
      "required": true,
      "options": [
        {
          "id": "opt_a",
          "content": {
            "zh": "主动和很多人交流",
            "en": "Initiate conversations with many people"
          },
          "image": null,
          "weight": { "E": 3, "I": 0 },
          "tooltip": {
            "zh": "选择此项表示你倾向于外向",
            "en": "Choosing this indicates extraversion"
          }
        },
        {
          "id": "opt_b",
          "content": {
            "zh": "和几个熟悉的人聊天",
            "en": "Chat with a few familiar people"
          },
          "weight": { "E": 1, "I": 1 }
        },
        {
          "id": "opt_c",
          "content": {
            "zh": "独自找个安静的角落",
            "en": "Find a quiet corner alone"
          },
          "weight": { "E": 0, "I": 3 }
        }
      ]
    }
  ]
}
```

## 字段说明

### meta

题库元信息。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `totalQuestions` | integer | 是 | 题目总数，范围 1-500 |
| `timeEstimate` | integer | 否 | 预估完成时间（秒） |
| `tags` | string[] | 否 | 题库标签 |
| `description` | LocalizedString | 否 | 题库描述 |

### dimensions

维度定义列表，定义测评的核心测量维度。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 维度 ID，格式：`^[A-Z]{2}$` |
| `name` | LocalizedString | 是 | 维度名称 |
| `description` | LocalizedString | 否 | 维度描述 |
| `leftLabel` | LocalizedString | 否 | 左侧标签（第一个字母的含义） |
| `rightLabel` | LocalizedString | 否 | 右侧标签（第二个字母的含义） |

### categories

题目分类（可选），用于对题目进行分组。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 分类 ID，格式：`^[a-z0-9-]+$` |
| `name` | LocalizedString | 是 | 分类名称 |
| `description` | LocalizedString | 否 | 分类描述 |
| `questionIds` | string[] | 否 | 该分类下的题目 ID 列表 |

### questions

题目列表，核心内容。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 题目唯一标识符，格式：`^q\d{3,}$` |
| `dimension` | string | 是 | 所属维度 ID，必须在 dimensions 中定义 |
| `category` | string | 否 | 题目分类 ID |
| `content` | LocalizedString | 是 | 题目内容 |
| `image` | string \| null | 否 | 题目配图 URL |
| `isReverse` | boolean | 否 | 是否反向计分，默认 `false` |
| `required` | boolean | 否 | 是否必答题，默认 `true` |
| `options` | Option[] | 是 | 选项列表 |

### options

选项列表。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 选项唯一标识符，格式：`^opt_[a-z0-9]+$` |
| `content` | LocalizedString | 是 | 选项内容 |
| `image` | string \| null | 否 | 选项配图 URL |
| `weight` | object | 是 | 权重，键为维度字母（如 `E`、`I`），值为 0-10 |
| `tooltip` | LocalizedString | 否 | 选项悬停提示 |

### weight 权重

权重表示用户选择该选项后对各维度的贡献分数。

```json
// 示例：外向-内向维度
{ "E": 3, "I": 0 }  // 选择此选项得 3 分 E，0 分 I
{ "E": 1, "I": 1 }  // 选择此选项得 1 分 E，1 分 I
{ "E": 0, "I": 3 }  // 选择此选项得 0 分 E，3 分 I
```

### isReverse 反向计分

当题目设置 `isReverse: true` 时，权重会反转计算：

```json
// 原权重：{ "E": 3, "I": 0 }
// 反转后：{ "E": 0, "I": 3 }
```

## 验证规则

- `meta.totalQuestions` 范围：1-500
- `questions[].id` 格式：`^q\d{3,}$`（如 `q001`、`q002`）
- `questions[].dimension` 必须在 `dimensions[].id` 中存在
- `options[].id` 格式：`^opt_[a-z0-9]+$`（如 `opt_a`、`opt_option1`）
- `options[].weight` 键必须是大写字母，值范围 0-10
- `options` 最少 2 个，最多 6 个

## 下一步

- 查看 [manifest.json](./manifest)
- 查看 [types.json](./types)
- 查看 [完整 Schema](/schemas/questions.schema.json)
