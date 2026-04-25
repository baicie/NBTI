# 核心概念

## Dimension（维度）

维度是测评的核心测量维度，通常用两个大写字母表示。在 MBTI 中有四个维度：

| 维度 | 名称      | 左端      | 右端      |
| ---- | --------- | --------- | --------- |
| `EI` | 外向-内向 | E（外向） | I（内向） |
| `NS` | 直觉-实感 | N（直觉） | S（实感） |
| `TF` | 思考-情感 | T（思考） | F（情感） |
| `JP` | 判断-知觉 | J（判断） | P（知觉） |

### 定义维度

在 `questions.json` 的 `dimensions` 数组中定义：

```json
{
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向-内向", "en": "Extraversion-Introversion" },
      "description": { "zh": "精力来源", "en": "Energy source" },
      "leftLabel": { "zh": "外向", "en": "Extraversion" },
      "rightLabel": { "zh": "内向", "en": "Introversion" }
    }
  ]
}
```

---

## Weight（权重）

权重表示每个选项对各维度的贡献分数，范围为 0-10。

### 计分规则

- 每个选项的 `weight` 对象键为大写字母（对应维度端点）
- 值越大表示越倾向该端点
- `isReverse: true` 时，权重会反转计算

### 示例

```json
{
  "options": [
    {
      "id": "opt_1a",
      "content": { "zh": "喜欢和人聊天", "en": "Like chatting with people" },
      "weight": { "E": 3, "I": 0 }
    },
    {
      "id": "opt_1b",
      "content": { "zh": "享受独处时光", "en": "Enjoy alone time" },
      "weight": { "E": 0, "I": 3 }
    },
    {
      "id": "opt_1c",
      "content": { "zh": "都可以", "en": "Either is fine" },
      "weight": { "E": 1, "I": 1 }
    }
  ]
}
```

---

## LocalizedString（本地化字符串）

本地化字符串是一个以语言代码为键、多语言文本为值的对象。

### 格式

```json
{
  "zh": "简体中文文本",
  "en": "English text",
  "ja": "日本語テキスト"
}
```

### 使用场景

- 题目内容、选项文本
- 类型名称、描述
- 标签、按钮文案
- 任何需要多语言的文本

### 语言代码规范

| 代码    | 语言             |
| ------- | ---------------- |
| `zh`    | 简体中文         |
| `zh-TW` | 繁体中文（台湾） |
| `zh-HK` | 繁体中文（香港） |
| `en`    | 英语             |
| `ja`    | 日语             |
| `ko`    | 韩语             |
| `es`    | 西班牙语         |
| `fr`    | 法语             |

---

## Scoring Type（计分类型）

### dimension（维度差值法）

最常用，将所有维度计算为两个端点的差值。

```
EI = E得分 - I得分  →  结果取差值较大的那个字母
```

### percentage（百分比法）

计算每个维度的百分比：

```
EI = E得分 / (E得分 + I得分) × 100%
```

### weighted-sum（加权求和法）

直接对所有维度得分求和：

```
总分 = E×权重E + I×权重I + ...
```

---

## Scoring Method（计算方法）

| 方法         | 说明                     | 示例                      |
| ------------ | ------------------------ | ------------------------- |
| `difference` | 差值法，取差值较大的字母 | EI = E - I，结果为 E 或 I |
| `ratio`      | 比值法，计算比例         | EI = E / (E + I)          |
| `absolute`   | 绝对值法，取较大值       | EI = max(E, I)            |

---

## 概念关系图

```
manifest.json
├── id, name, version
├── config          →  指向其他配置文件
├── scoring         →  计分类型 + 维度列表
└── settings        →  行为设置

questions.json
├── meta            →  题库元信息
├── dimensions      →  维度定义（和 manifest.scoring.dimensions 对应）
├── categories      →  题目分类（可选）
└── questions[]
    ├── id
    ├── dimension   →  关联到某个维度 ID
    ├── content     →  LocalizedString
    └── options[]
        ├── id
        ├── content →  LocalizedString
        └── weight  →  { "E": 3, "I": 0 }

types.json
├── meta
├── dimensions      →  维度详情（可选，补充 manifest 信息）
└── types[]
    ├── id          →  如 "INTJ", "ENFP"
    ├── name        →  LocalizedString
    ├── color
    ├── traits
    ├── strengths
    └── weaknesses
```
