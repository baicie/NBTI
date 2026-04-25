# pr01 套件 - App 不支持的 JSON Schema 功能

本文档列出 `idea/pr01/detail.md` 中描述的功能，但当前 App 实现**不支持**的部分。

---

## 1. 题目相关 (questions.schema.json)

### ✅ 已支持

- `id` - 题目唯一标识符
- `dimension` - 所属维度
- `content` - 题目内容（本地化）
- `options` - 选项列表
- `isReverse` - **反向计分**（已实现）
- `meta.totalQuestions` - 题目总数
- `meta.timeEstimate` - 预估完成时间（仅用于展示）

### ❌ 不支持

| 功能     | Schema 字段       | 说明               |
| -------- | ----------------- | ------------------ |
| 题目分类 | `category`        | 题目分组功能未实现 |
| 题目配图 | `question.image`  | 图片题目未实现     |
| 选项配图 | `options.image`   | 图片选项未实现     |
| 选项提示 | `options.tooltip` | 选项悬停提示未实现 |
| 题目标签 | `meta.tags`       | 标签筛选未实现     |

### 🔄 部分支持

| 功能     | 说明                                                  |
| -------- | ----------------------------------------------------- |
| 维度定义 | 支持 `dimensions` 数组，但 pr01 套件使用单维度 `WORK` |

---

## 2. 结果类型相关 (types.schema.json)

### ✅ 已支持

- `id` - 类型代码
- `name` - 类型名称（本地化）
- `subtitle` - 副标题（本地化）
- `description` - 详细描述（本地化）
- `traits` - 特质列表（name, level）
- `posterImage` - 海报图片
- `posterCaption` - 海报说明
- `color` - 主题色

### ❌ 不支持

| 功能       | Schema 字段          | 说明                    |
| ---------- | -------------------- | ----------------------- |
| 类型图标   | `icon`               | lucide-react 图标未实现 |
| 兼容类型   | `compatibleTypes`    | 类型匹配推荐未实现      |
| 不兼容类型 | `incompatibleTypes`  | 不匹配提示未实现        |
| 适合职业   | `careers`            | 职业建议未实现          |
| 人际关系   | `relationships`      | 关系描述未实现          |
| 工作风格   | `workStyle`          | 工作风格描述未实现      |
| 沟通风格   | `communicationStyle` | 沟通风格描述未实现      |
| 名人榜样   | `famousPeople`       | 名人示例未实现          |
| 类型名言   | `quotes`             | 名言列表未实现          |

---

## 3. 分享卡片模板 (templates.schema.json)

### 🔄 部分支持

模板系统核心已实现，但需要安装 `html2canvas` 依赖才能导出图片。

| 功能     | 状态      | 说明                       |
| -------- | --------- | -------------------------- |
| 模板配置 | ✅ 已实现 | `templates.json` 支持      |
| 背景渐变 | ✅ 已实现 | 支持多色渐变               |
| 背景纯色 | ✅ 已实现 | 支持单色背景               |
| 文本元素 | ✅ 已实现 | 支持变量插值               |
| 形状元素 | ✅ 已实现 | 支持矩形、圆形、线条       |
| 分隔线   | ✅ 已实现 | 支持自定义样式             |
| 特质徽章 | ✅ 已实现 | 支持横向布局               |
| 二维码   | ⚠️ 占位   | 仅为占位符，需接入实际生成 |
| 导出图片 | ⚠️ 需依赖 | 需安装 `html2canvas`       |

### ❌ 不支持

| 功能       | 说明                           |
| ---------- | ------------------------------ |
| 背景图片   | `image` 类型未实现             |
| 雷达图     | `radar` 图表类型未实现         |
| 维度柱状图 | `dimension-bar` 元素类型未实现 |
| 动画配置   | `animation` 配置未实现         |
| 响应式配置 | `responsive` 移动端适配未实现  |

---

## 4. 主题配置 (themes.schema.json)

### ✅ 已支持

- `colors` - 完整色彩配置
- `gradient` - 渐变配置
- `style.borderRadius` - 圆角配置
- `style.font` - 字体配置
- `result.dimensionChart` - 图表类型
- `result.showTraits` - 显示特质
- `result.shareCardStyle` - 分享卡片样式

### ❌ 不支持

| 功能       | Schema 字段 | 说明                     |
| ---------- | ----------- | ------------------------ |
| 主题继承   | `extends`   | 主题继承机制未实现       |
| 自定义阴影 | `shadows`   | 阴影样式未实现           |
| 自定义间距 | `spacing`   | 间距配置未实现           |
| 自定义动画 | `animation` | 动画时长、缓动函数未实现 |
| 多主题切换 | -           | 仅支持单一主题           |

---

## 5. 计分配置 (manifest.schema.json)

### ✅ 已支持

- `scoring.type: dimension` - 维度计分
- `scoring.type: percentage` - 百分比计分
- `scoring.dimensions` - 维度列表
- `scoring.calculateMethod: difference` - 差值计算
- `scoring.calculateMethod: absolute` - 绝对值计算
- `scoring.normalizeOutput` - 输出归一化
- `scoring.type: multi-dimensional` - **多维度计分**（pr01 已实现）

### ❌ 不支持

| 功能     | Schema 字段                      | 说明           |
| -------- | -------------------------------- | -------------- |
| 加权求和 | `scoring.type: weighted-sum`     | 加权计分未实现 |
| 比值计算 | `scoring.calculateMethod: ratio` | 比值计算未实现 |

---

## 6. 其他配置

### ✅ 已支持

- `settings.layout` - 布局模式（list/single）
- `settings.allowBack` - 返回上一题
- `settings.showTimer` - 显示计时器
- `settings.shuffleQuestions` - 打乱题目顺序
- `settings.shuffleOptions` - 打乱选项顺序
- `settings.requiredAnswer` - 必答设置
- `settings.maxDuration` - 最大时长限制
- `settings.showDimensions` - 显示维度
- `background` - 背景配置

### ❌ 不支持

| 功能       | 说明                                       |
| ---------- | ------------------------------------------ |
| 国际化文件 | `config.i18n` 路径配置未实现               |
| 作者信息   | `author` 字段未在结果页展示                |
| 标签系统   | `tags` 标签筛选未实现                      |
| 版本控制   | `meta.version` / `meta.lastUpdated` 未展示 |

---

## 7. pr01 套件特定说明

### 当前实现

- **15 道题**，每题4选项，多维度权重设计
- **3 个评估维度**：
  - **SA (社交活跃度)**: 独处 → 社交
  - **EE (情绪表达度)**: 内敛 → 外放
  - **AM (行动模式)**: 计划 → 随性
- **21 种结果类型**，通过维度分数映射算法匹配

### 建议后续实现优先级

1. **高优先级**
   - 题目配图/选项配图
   - 模板系统（分享卡片生成）
   - 反向计分

2. **中优先级**
   - 类型兼容性推荐
   - 职业建议展示
   - 多主题切换

3. **低优先级**
   - 名人榜样/名言
   - 动画配置
   - 雷达图/特质徽章

---

_最后更新: 2026-04-24_
