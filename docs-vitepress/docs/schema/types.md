# types.json

结果类型定义配置文件，定义人格类型的名称、描述、特质、优势劣势等。

## 文件位置

```
suites/{suite-id}/types.json
```

## 完整示例

```json
{
  "meta": {
    "version": "1.0.0",
    "lastUpdated": "2026-04-24T00:00:00Z"
  },
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向-内向", "en": "Extraversion-Introversion" },
      "left": {
        "letter": "E",
        "name": { "zh": "外向", "en": "Extraversion" },
        "description": { "zh": "从外部世界获得能量", "en": "Get energy from outside world" }
      },
      "right": {
        "letter": "I",
        "name": { "zh": "内向", "en": "Introversion" },
        "description": { "zh": "从内部世界获得能量", "en": "Get energy from inner world" }
      }
    }
  ],
  "types": [
    {
      "id": "E",
      "name": { "zh": "外向型", "en": "Extravert" },
      "subtitle": {
        "zh": "充满能量的社交达人",
        "en": "Energetic social butterfly"
      },
      "description": {
        "zh": "你是一个外向的人，喜欢从外部世界获得能量，享受社交互动和对外活动。",
        "en": "You are an extravert who gains energy from the external world and enjoys social interactions."
      },
      "icon": "sparkles",
      "color": "#6366f1",
      "traits": [
        {
          "id": "sociable",
          "name": { "zh": "善于社交", "en": "Sociable" },
          "icon": "users",
          "level": 90,
          "description": {
            "zh": "喜欢与人交流，容易建立联系",
            "en": "Enjoys communicating and easily builds connections"
          }
        }
      ],
      "strengths": [
        { "zh": "善于社交", "en": "Good at socializing" },
        { "zh": "充满活力", "en": "Full of energy" },
        { "zh": "易于激励他人", "en": "Good at motivating others" }
      ],
      "weaknesses": [
        { "zh": "有时过于冲动", "en": "Sometimes too impulsive" },
        { "zh": "可能忽视细节", "en": "May overlook details" }
      ],
      "compatibleTypes": ["I"],
      "incompatibleTypes": [],
      "careers": [
        { "zh": "市场营销", "en": "Marketing" },
        { "zh": "销售", "en": "Sales" },
        { "zh": "公共关系", "en": "Public Relations" }
      ],
      "relationships": {
        "zh": "外向型的人在人际关系中通常更加主动和开放",
        "en": "Extraverts tend to be more proactive and open in relationships"
      },
      "workStyle": {
        "zh": "喜欢团队合作，在开放的环境中工作更有创造力",
        "en": "Prefers teamwork and is more creative in open environments"
      },
      "communicationStyle": {
        "zh": "直接、开放、喜欢面对面交流",
        "en": "Direct, open, and prefers face-to-face communication"
      },
      "famousPeople": ["马云", "奥普拉·温弗瑞"],
      "quotes": [
        { "text": "生活就像骑自行车，必须保持平衡才能前进。", "author": "阿尔伯特·爱因斯坦" }
      ]
    }
  ]
}
```

## 字段说明

### meta

元信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 版本号，格式：`x.y.z` |
| `lastUpdated` | string (date-time) | 最后更新时间 |

### dimensions

维度详情定义（可选），用于补充 manifest 中的维度信息。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 维度 ID，格式：`^[A-Z]{2}$` |
| `name` | LocalizedString | 否 | 维度名称 |
| `left` | object | 是 | 左侧端点（第一个字母） |
| `left.letter` | string | 是 | 字母，格式：`^[A-Z]$` |
| `left.name` | LocalizedString | 是 | 名称 |
| `left.description` | LocalizedString | 否 | 描述 |
| `right` | object | 是 | 右侧端点（第二个字母） |
| `right.letter` | string | 是 | 字母，格式：`^[A-Z]$` |
| `right.name` | LocalizedString | 是 | 名称 |
| `right.description` | LocalizedString | 否 | 描述 |

### types

人格类型列表。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 类型代码，格式：`^[A-Z]{2,6}$`（如 `INTJ`、`EN`） |
| `name` | LocalizedString | 是 | 类型名称 |
| `subtitle` | LocalizedString | 否 | 类型副标题/描述语 |
| `description` | LocalizedString | 否 | 详细描述 |
| `icon` | string | 否 | 图标名称（lucide-react 图标名） |
| `color` | string | 否 | 类型主题色（用于结果图），格式：`^#[0-9A-Fa-f]{6}$` |
| `traits` | Trait[] | 否 | 特质列表 |
| `strengths` | LocalizedString[] | 否 | 优势列表 |
| `weaknesses` | LocalizedString[] | 否 | 劣势列表 |
| `compatibleTypes` | string[] | 否 | 兼容类型列表 |
| `incompatibleTypes` | string[] | 否 | 不兼容类型列表 |
| `careers` | LocalizedString[] | 否 | 适合职业 |
| `relationships` | LocalizedString | 否 | 人际关系描述 |
| `workStyle` | LocalizedString | 否 | 工作风格描述 |
| `communicationStyle` | LocalizedString | 否 | 沟通风格描述 |
| `famousPeople` | string[] | 否 | 名人/榜样 |
| `quotes` | Quote[] | 否 | 名言 |

### traits

特质列表。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 特质 ID，格式：`^[a-z0-9-]+$` |
| `name` | LocalizedString | 是 | 特质名称 |
| `icon` | string | 否 | 特质图标 |
| `level` | integer | 是 | 特质强度（1-100） |
| `description` | LocalizedString | 否 | 特质描述 |

### quotes

名言列表。

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | string | 名言内容 |
| `author` | string | 作者 |

## 验证规则

- `types` 数组至少包含一个类型
- `types[].id` 格式：`^[A-Z]{2,6}$`（如 `INTJ`、`EN`）
- `types[].traits[].level` 范围：1-100
- `types[].strengths` 最少 1 个，最多 10 个
- `types[].weaknesses` 最少 1 个，最多 10 个
- `types[].careers` 最多 10 个
- `types[].famousPeople` 最多 10 个

## 图标参考

`icon` 字段使用 lucide-react 图标名称，常见图标：

- 通用：`sparkles`、`star`、`heart`、`users`、`user`
- 性格：`brain`、`target`、`compass`、`lightbulb`
- 职业：`briefcase`、`palette`、`code`、`pencil`
- 社交：`message-circle`、`phone`、`mail`

## 下一步

- 查看 [manifest.json](./manifest)
- 查看 [questions.json](./questions)
- 查看 [完整 Schema](/schemas/types.schema.json)
