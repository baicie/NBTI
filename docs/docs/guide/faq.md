# 常见问题

## 一般问题

### NBTI 是什么？

NBTI 是一个配置驱动的多试题套件测评平台，支持通过 JSON 配置文件定义测评内容、主题和分享模板，无需编写代码即可创建完整的在线测评。

### 如何创建新的测试套餐？

在 `apps/web/configs/suites/` 下创建新目录，然后按照以下顺序创建配置文件：

1. `manifest.json` — 套餐元信息（必填）
2. `questions.json` — 题目数据（必填）
3. `types.json` — 结果类型（必填）
4. `themes.json` — 主题样式（可选）
5. `templates.json` — 分享图模板（可选）
6. `i18n/*.json` — 多语言翻译（可选）

详细步骤请参考 [创建新套餐](./create-suite)。

### 支持哪些计分方式？

支持三种计分方式：

- **dimension（维度差值法）**：最常用，如 MBTI，将维度计算为两个端点的差值
- **percentage（百分比法）**：计算每个维度的百分比
- **weighted-sum（加权求和法）**：直接对所有维度得分求和

---

## Schema 相关

### 什么是 JSON Schema？

JSON Schema 是用于描述 JSON 数据结构的标准格式。NBTI 使用 JSON Schema 校验配置文件的结构正确性，同时也让 AI 助手能够理解配置文件的格式要求。

### 在哪里可以找到 Schema？

所有 Schema 文件都公开在以下地址：

- 主索引：`/schemas/index.json`
- manifest：`/schemas/manifest.schema.json`
- questions：`/schemas/questions.schema.json`
- types：`/schemas/types.schema.json`
- templates：`/schemas/templates.schema.json`
- themes：`/schemas/themes.schema.json`

### 如何让 AI 校验我的配置？

最简单的做法是将你的配置文件和对应的 Schema 文件一起提供给 AI，让 AI 根据 Schema 进行校验。你也可以使用 JSON Schema 验证工具如 Ajv 进行自动化校验。

### 什么是 LocalizedString？

`LocalizedString` 是 NBTI 中的多语言字符串格式，以语言代码为键：

```json
{
  "zh": "中文文本",
  "en": "English text"
}
```

---

## 开发问题

### 本地开发环境需要什么？

- Node.js >= 18.12.0
- pnpm >= 10.19.0

### 如何启动开发服务器？

```bash
# 安装依赖
pnpm install

# 启动 Web 应用
pnpm dev

# 启动文档网站
cd docs-vitepress && pnpm install && pnpm docs:dev
```

### 如何运行测试？

```bash
pnpm test              # 运行所有测试
pnpm test-unit         # 运行单元测试
pnpm test-e2e          # 运行 E2E 测试
pnpm test-coverage     # 生成覆盖率报告
```

---

## 套餐配置问题

### 套餐 ID 有什么限制？

- 只能包含小写字母、数字和连字符（`-`）
- 不能以连字符开头或结尾
- 推荐格式：`my-test`、`mbti-2024`、`career-quiz`

### 题目 ID 格式是什么？

题目 ID 格式为 `q` 开头后跟至少 3 位数字，如 `q001`、`q002`、`question_01`。

### 选项权重如何设置？

- 权重范围：0-10
- 每个选项的 `weight` 对象键为大写字母（对应维度端点）
- 权重值越大表示越倾向该选项

### 如何添加多语言支持？

在套餐目录下创建 `i18n/` 目录，然后按语言代码创建翻译文件：

```
suites/my-suite/i18n/
├── zh.json    # 简体中文
├── en.json    # 英文
└── ja.json    # 日语
```

---

## AI 集成问题

### AI 如何读取 Schema？

AI 可以直接通过 HTTP 请求读取 Schema 文件：

```bash
curl https://nbti.app/schemas/index.json
```

返回的 JSON 包含所有 Schema 的索引、必填字段说明、快速开始指引等。

### AI 创建的配置是否准确？

AI 根据 JSON Schema 生成配置，但建议：

1. 人工检查生成的内容
2. 使用 Schema 验证工具进行校验
3. 在测试环境中验证功能

### 如何优化 AI 生成的结果？

- 提供具体的需求描述
- 结合具体的业务场景给出示例
