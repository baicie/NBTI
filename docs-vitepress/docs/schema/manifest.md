# manifest.json

套餐元信息配置文件，定义套餐的基本信息、版本、配置文件路径和计分规则。

## 文件位置

```
suites/{suite-id}/manifest.json
```

## 完整示例

```json
{
  "id": "mbti",
  "name": { "zh": "MBTI 性格测试", "en": "MBTI Personality Test" },
  "version": "1.0.0",
  "description": {
    "zh": "国际通用的性格评估工具，帮助你了解自己的性格特点",
    "en": "A comprehensive personality assessment tool"
  },
  "author": "NBTI Team",
  "thumbnail": "/thumbnails/mbti.png",
  "tags": ["personality", "mbti", "career"],
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
    "dimensions": ["EI", "NS", "TF", "JP"],
    "calculateMethod": "difference",
    "normalizeOutput": true
  }
}
```

## 字段说明

### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 套餐唯一标识符，只能包含小写字母、数字和连字符 |
| `name` | LocalizedString | 是 | 套餐显示名称 |
| `version` | string | 是 | 语义化版本号，格式：`x.y.z` |
| `description` | LocalizedString | 否 | 套餐详细描述 |
| `author` | string | 否 | 作者名称 |
| `thumbnail` | string (uri) | 否 | 封面图片 URL |
| `tags` | string[] | 否 | 标签列表，用于分类和搜索 |

### config

配置文件路径映射，所有路径相对于套餐目录。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `questions` | string | 是 | - | 题库文件路径 |
| `types` | string | 是 | - | 结果类型文件路径 |
| `themes` | string | 否 | `themes.json` | 主题配置文件路径 |
| `templates` | string | 否 | `templates.json` | 分享图模板路径 |
| `i18n` | string | 否 | - | 国际化文件夹路径 |

### settings

测试行为设置。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `allowBack` | boolean | `true` | 是否允许返回上一题 |
| `showTimer` | boolean | `false` | 是否显示计时器 |
| `shuffleQuestions` | boolean | `false` | 是否随机打乱题目顺序 |
| `shuffleOptions` | boolean | `false` | 是否随机打乱选项顺序 |
| `requiredAnswer` | boolean | `true` | 是否必须回答才能继续 |
| `maxDuration` | integer \| null | `null` | 最大测试时长（秒），`null` 表示不限时 |

### scoring

计分配置。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 计分类型：`dimension`、`percentage`、`weighted-sum` |
| `dimensions` | string[] | 是 | 维度列表，每项为两个大写字母（如 `EI`、`NS`） |
| `calculateMethod` | string | 否 | 计算方法：`difference`、`ratio`、`absolute` |
| `normalizeOutput` | boolean | 否 | 是否归一化输出到 0-100 |

### scoring.type 计分类型

| 值 | 说明 | 示例 |
|------|------|------|
| `dimension` | 维度差值法，将结果计算为维度两端的差值，最常用 | MBTI |
| `percentage` | 百分比法，计算每个维度的百分比 | DISC |
| `weighted-sum` | 加权求和法，直接对所有得分求和 | 大五人格 |

### scoring.calculateMethod 计算方法

| 值 | 说明 | 示例 |
|------|------|------|
| `difference` | 差值法，取两个端点的差值 | `EI = E - I` |
| `ratio` | 比值法，计算比例 | `EI = E / (E + I) * 100` |
| `absolute` | 绝对值法，取较大端的值 | `EI = max(E, I)` |

## LocalizedString 定义

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "localizedString": {
      "type": "object",
      "description": "本地化字符串，支持多语言",
      "additionalProperties": {
        "type": "string",
        "minLength": 1
      },
      "examples": [
        { "zh": "性格测试", "en": "Personality Test" }
      ]
    }
  }
}
```

## 验证规则

- `id` 格式：`^[a-z0-9-]+$`（只能包含小写字母、数字和连字符）
- `version` 格式：`^\d+\.\d+\.\d+$`（语义化版本号）
- `scoring.dimensions` 中每个元素格式：`^[A-Z]{2}$`（两个大写字母）
- `config.questions` 和 `config.types` 是必填的

## 下一步

- 查看 [questions.json](./questions)
- 查看 [types.json](./types)
- 查看 [完整 Schema](/schemas/manifest.schema.json)
