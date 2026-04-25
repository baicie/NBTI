# JSON Schema 参考

## 概述

NBTI 使用 JSON Schema 定义所有配置文件的结构。本节提供每个 Schema 的详细参考。

## Schema 索引

| Schema                        | 文件                    | 用途       | 必填字段                  |
| ----------------------------- | ----------------------- | ---------- | ------------------------- |
| [manifest.json](./manifest)   | `manifest.schema.json`  | 套餐元信息 | id, name, version, config |
| [questions.json](./questions) | `questions.schema.json` | 题目数据   | meta, questions           |
| [types.json](./types)         | `types.schema.json`     | 结果类型   | types                     |
| [templates.json](./templates) | `templates.schema.json` | 分享图模板 | templates                 |
| [themes.json](./themes)       | `themes.schema.json`    | 主题样式   | themes                    |
| i18n                          | `i18n.schema.json`      | 国际化     | 无（自由结构）            |

## AI 快速接入

AI 助手可以通过以下方式快速了解所有 Schema：

```bash
# 获取所有 Schema 的索引（推荐第一步）
GET /schemas/index.json

# 获取完整 Schema 文件
GET /schemas/manifest.schema.json
GET /schemas/questions.schema.json
GET /schemas/types.schema.json
GET /schemas/themes.schema.json
GET /schemas/templates.schema.json
```

## 公共定义

### LocalizedString

所有 Schema 中用于多语言文本的公共定义。

```json
{
  "zh": "简体中文",
  "en": "English",
  "ja": "日本語"
}
```

### 颜色格式

所有颜色字段使用 6 位或 8 位十六进制格式：

```json
"#6366f1"
"#6366f1ff"
```

### URI 格式

所有 URL 字段使用 URI 格式：

```json
"https://example.com/image.png"
"/images/thumbnail.png"
```

## 必填字段速查

### manifest.json

| 字段               | 类型            | 说明                                  |
| ------------------ | --------------- | ------------------------------------- |
| `id`               | string          | 套餐唯一标识符，格式：`^[a-z0-9-]+$`  |
| `name`             | LocalizedString | 套餐显示名称                          |
| `version`          | string          | 语义化版本号，格式：`^\d+\.\d+\.\d+$` |
| `config`           | object          | 配置文件路径映射                      |
| `config.questions` | string          | 题库文件路径                          |
| `config.types`     | string          | 结果类型文件路径                      |

### questions.json

| 字段                            | 类型            | 说明                             |
| ------------------------------- | --------------- | -------------------------------- |
| `meta`                          | object          | 题库元信息                       |
| `meta.totalQuestions`           | integer         | 题目总数                         |
| `questions`                     | array           | 题目列表                         |
| `questions[].id`                | string          | 题目 ID，格式：`^q\d{3,}$`       |
| `questions[].dimension`         | string          | 维度 ID                          |
| `questions[].content`           | LocalizedString | 题目内容                         |
| `questions[].options`           | array           | 选项列表                         |
| `questions[].options[].id`      | string          | 选项 ID，格式：`^opt_[a-z0-9]+$` |
| `questions[].options[].content` | LocalizedString | 选项内容                         |
| `questions[].options[].weight`  | object          | 权重，键为大写字母               |

### types.json

| 字段                 | 类型            | 说明                           |
| -------------------- | --------------- | ------------------------------ |
| `types`              | array           | 人格类型列表                   |
| `types[].id`         | string          | 类型代码，格式：`^[A-Z]{2,6}$` |
| `types[].name`       | LocalizedString | 类型名称                       |
| `types[].color`      | string          | 主题色                         |
| `types[].strengths`  | array           | 优势列表                       |
| `types[].weaknesses` | array           | 劣势列表                       |

### themes.json

| 字段                            | 类型            | 说明     |
| ------------------------------- | --------------- | -------- |
| `themes`                        | object          | 主题字典 |
| `themes.{id}.name`              | LocalizedString | 主题名称 |
| `themes.{id}.colors`            | object          | 颜色配置 |
| `themes.{id}.colors.primary`    | string          | 主色     |
| `themes.{id}.colors.background` | string          | 背景色   |
| `themes.{id}.colors.foreground` | string          | 前景色   |

### templates.json

| 字段                     | 类型            | 说明     |
| ------------------------ | --------------- | -------- |
| `templates`              | array           | 模板列表 |
| `templates[].id`         | string          | 模板 ID  |
| `templates[].name`       | LocalizedString | 模板名称 |
| `templates[].dimensions` | object          | 尺寸配置 |
| `templates[].elements`   | array           | 元素列表 |

## 下一步

- [manifest.json 详细参考](./manifest)
- [questions.json 详细参考](./questions)
- [types.json 详细参考](./types)
- [themes.json 详细参考](./themes)
- [templates.json 详细参考](./templates)
