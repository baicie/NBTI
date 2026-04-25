# NBTI 多试题套件架构设计文档

## 一、概述

本文档描述 NBTI 测试平台如何支持配置多个独立的试题套件，通过子路由进行区分，共享同一套前端渲染逻辑。

### 1.1 核心目标

- 支持配置 **N 个**试题套件
- 通过子路由（如 `/mbti`、`/bigfive`）区分不同套件
- 复用同一套渲染页面，读取不同配置
- 不同套件支持独立的主题样式

### 1.2 设计原则

- **配置驱动**：页面渲染逻辑由配置文件决定
- **主题隔离**：每个套件拥有独立的视觉风格
- **接口统一**：核心引擎不感知套件差异
- **平滑迁移**：预留 API + 后台管理的升级路径

---

## 二、路由设计

### 2.1 路由结构

```
/                           → 套件选择首页
/[suite]/                    → 测试页（动态套件）
/[suite]/result/             → 结果页
```

### 2.2 路由说明

| 路径            | 说明             | 示例                            |
| --------------- | ---------------- | ------------------------------- |
| `/`             | 展示所有可用套件 | -                               |
| `/mbti`         | MBTI 测试入口    | `/mbti` → 重定向到 `/mbti/test` |
| `/mbti/test`    | MBTI 测试页      | -                               |
| `/mbti/result`  | MBTI 结果页      | -                               |
| `/bigfive`      | 大五人格入口     | -                               |
| `/bigfive/test` | 大五人格测试页   | -                               |

### 2.3 向后兼容

现有 `/test` 路由保留，通过 `next.config.js` 重定向到默认套件：

```javascript
// next.config.js
redirects: async () => [
  {
    source: '/test',
    destination: '/mbti/test',
    permanent: false,
  },
]
```

---

## 三、目录结构

```
apps/web/
├── app/
│   ├── page.tsx                          # 套件选择首页
│   ├── layout.tsx                        # 全局布局
│   ├── globals.css                       # 全局样式
│   ├── [suite]/
│   │   ├── layout.tsx                    # 套件级布局（加载配置 + 主题）
│   │   ├── page.tsx                      # 测试页
│   │   └── result/
│   │       └── page.tsx                  # 结果页
│   └── not-found.tsx                     # 404 页面
│
├── configs/                              # 套件配置目录
│   └── suites/
│       ├── index.json                     # 套件索引
│       ├── mbti/
│       │   ├── manifest.json             # 元信息
│       │   ├── questions.json            # 题目数据
│       │   ├── types.json                # 类型定义（结果类型）
│       │   ├── theme.json                # 主题配置
│       │   └── i18n/                     # 国际化文案
│       │       ├── zh.json
│       │       └── en.json
│       ├── bigfive/
│       │   └── ...
│       └── love-quiz/
│           └── ...
│
├── components/
│   ├── ui/                               # 通用 UI 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── suite-selector.tsx                # 首页套件选择器
│   ├── question-card.tsx                # 答题卡片
│   ├── result-display.tsx               # 结果展示
│   └── theme-provider.tsx               # 主题提供者
│
├── lib/
│   ├── suite-loader.ts                   # 套件加载器
│   ├── suite-validator.ts               # 配置校验
│   └── types/
│       └── suite.ts                      # 类型定义
│
└── providers/
    ├── suite-provider.tsx                # 套件上下文
    └── test-provider.tsx                # 测试状态管理
```

---

## 四、数据模型

### 4.1 套件索引

```typescript
// configs/suites/index.json
{
  "suites": [
    {
      "id": "mbti",
      "name": { "zh": "MBTI 性格测试", "en": "MBTI Personality" },
      "description": {
        "zh": "国际通用的性格评估工具，帮助你了解自己的性格特点",
        "en": "A comprehensive personality assessment tool"
      },
      "thumbnail": "/thumbnails/mbti.png",
      "enabled": true,
      "order": 1
    }
  ]
}
```

### 4.2 套件元信息

```typescript
// configs/suites/{suite}/manifest.json
{
  "id": "mbti",
  "version": "1.0.0",
  "dimensions": ["EI", "NS", "TF", "JP"],

  "settings": {
    "showProgress": true,
    "allowPrev": true,
    "showDimension": true,
    "shuffleQuestions": false,
    "timeLimit": null
  },

  "scoring": {
    "method": "weighted",
    "normalize": true
  }
}
```

### 4.3 题目配置

```typescript
// configs/suites/{suite}/questions.json
{
  "questions": [
    {
      "id": "q001",
      "dimension": "EI",
      "content": {
        "zh": "在社交聚会中，你通常会：",
        "en": "At a social gathering, you tend to:"
      },
      "options": [
        {
          "id": "opt_1a",
          "content": {
            "zh": "主动和很多人交流",
            "en": "Initiate conversations with many people"
          },
          "weight": { "E": 3, "I": 0 }
        }
      ]
    }
  ]
}
```

### 4.4 结果类型定义

```typescript
// configs/suites/{suite}/types.json
{
  "types": [
    {
      "id": "INTJ",
      "name": { "zh": "建筑师", "en": "Architect" },
      "subtitle": {
        "zh": "富有想象力和战略性的思想家",
        "en": "Imaginative and strategic thinkers"
      },
      "description": {
        "zh": "INTJ 是十六种 MBTI 人格类型中最罕见的类型之一...",
        "en": "INTJ is one of the rarest MBTI types..."
      },
      "traits": ["战略思维", "独立自主", "善于分析"]
    }
  ],

  "dimensions": [
    {
      "id": "EI",
      "left": { "letter": "E", "name": { "zh": "外向", "en": "Extraversion" } },
      "right": { "letter": "I", "name": { "zh": "内向", "en": "Introversion" } }
    }
  ]
}
```

### 4.5 主题配置

```typescript
// configs/suites/{suite}/theme.json
{
  "id": "mbti",

  "colors": {
    "primary": "#6366f1",
    "primaryForeground": "#ffffff",
    "secondary": "#8b5cf6",
    "secondaryForeground": "#ffffff",
    "background": "#ffffff",
    "foreground": "#1e293b",
    "muted": "#f1f5f9",
    "mutedForeground": "#64748b",
    "accent": "#f1f5f9",
    "accentForeground": "#1e293b",
    "destructive": "#ef4444",
    "border": "#e2e8f0",
    "ring": "#6366f1"
  },

  "gradient": {
    "enabled": true,
    "from": "#6366f1",
    "via": "#8b5cf6",
    "to": "#a855f7"
  },

  "style": {
    "borderRadius": "0.75rem",
    "fontFamily": "Inter",
    "cardStyle": "shadow-sm",
    "resultIconShape": "rounded-lg"
  },

  "result": {
    "dimensionChart": "bar",
    "showTraits": true,
    "shareCardStyle": "gradient"
  }
}
```

---

## 五、核心组件

### 5.1 套件加载器

```typescript
// lib/suite-loader.ts

class SuiteLoader {
  async getSuites(): Promise<SuiteIndex> {
    const res = await fetch('/configs/suites/index.json')
    return res.json()
  }

  async getSuiteConfig(suiteId: string): Promise<SuiteConfig> {
    const res = await fetch(`/configs/suites/${suiteId}/manifest.json`)
    return res.json()
  }

  async getQuestions(suiteId: string): Promise<QuestionsData> {
    const res = await fetch(`/configs/suites/${suiteId}/questions.json`)
    return res.json()
  }

  async getTypes(suiteId: string): Promise<TypesData> {
    const res = await fetch(`/configs/suites/${suiteId}/types.json`)
    return res.json()
  }

  async getTheme(suiteId: string): Promise<SuiteTheme> {
    const res = await fetch(`/configs/suites/${suiteId}/theme.json`)
    return res.json()
  }
}
```

### 5.2 主题提供者

```typescript
// components/theme-provider.tsx

interface ThemeProviderProps {
  theme: SuiteTheme
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style = useMemo(() => ({
    '--suite-primary': theme.colors.primary,
    '--suite-gradient-from': theme.gradient?.from,
    '--suite-gradient-via': theme.gradient?.via,
    '--suite-gradient-to': theme.gradient?.to,
    '--suite-radius': theme.style.borderRadius,
    // ... 其他变量
  }), [theme])

  return (
    <div style={style} className="suite-theme">
      {children}
    </div>
  )
}
```

### 5.3 套件布局

```typescript
// app/[suite]/layout.tsx

export default async function SuiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { suite: string }
}) {
  // 校验套件是否存在
  const suiteExists = await validateSuite(params.suite)
  if (!suiteExists) {
    notFound()
  }

  // 并行加载配置
  const [manifest, theme] = await Promise.all([
    getSuiteConfig(params.suite),
    getTheme(params.suite),
  ])

  return (
    <ThemeProvider theme={theme}>
      <SuiteProvider manifest={manifest}>
        {children}
      </SuiteProvider>
    </ThemeProvider>
  )
}
```

---

## 六、页面渲染

### 6.1 测试页

```tsx
// app/[suite]/page.tsx

export default async function TestPage({
  params,
}: {
  params: { suite: string }
}) {
  const [manifest, questions, theme] = await Promise.all([
    getSuiteConfig(params.suite),
    getQuestions(params.suite),
    getTheme(params.suite),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* 使用主题变量 */}
      <header
        className="sticky top-0 bg-background/95 backdrop-blur border-b"
        style={{ borderColor: theme.colors.border }}
      >
        {/* ... */}
      </header>

      {/* 答题区域 */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          {/* 题目渲染 */}
          {questions.questions.map(q => (
            <QuestionCard key={q.id} question={q} theme={theme} />
          ))}
        </Card>
      </main>

      {/* 底部导航 */}
      <footer
        className="fixed bottom-0 left-0 right-0 bg-background border-t"
        style={{ borderColor: theme.colors.border }}
      >
        {/* ... */}
      </footer>
    </div>
  )
}
```

### 6.2 结果页

```tsx
// app/[suite]/result/page.tsx

export default async function ResultPage({
  params,
}: {
  params: { suite: string }
}) {
  const [types, theme, answers] = await Promise.all([
    getTypes(params.suite),
    getTheme(params.suite),
    getAnswers(params.suite),
  ])

  // 计算结果
  const result = calculateResult(answers, types)

  return (
    <div className="min-h-screen bg-background">
      {/* 渐变头部 - 使用主题色 */}
      <header
        className="bg-gradient-to-br py-16"
        style={{
          background: theme.gradient?.enabled
            ? `linear-gradient(to right, ${theme.gradient.from}, ${theme.gradient.via}, ${theme.gradient.to})`
            : theme.colors.primary,
        }}
      >
        {/* ... */}
      </header>

      {/* 结果卡片 */}
      <main className="container mx-auto px-4 -mt-8">
        <Card>
          {/* 使用主题圆角 */}
          <div className="rounded-[var(--suite-radius)]">
            <ResultDisplay result={result} theme={theme} />
          </div>
        </Card>
      </main>
    </div>
  )
}
```

---

## 七、主题应用方式

### 7.1 CSS 变量注入

主题配置通过 CSS 变量注入到组件中：

```css
/* 全局样式 */
.suite-theme {
  --theme-primary: var(--suite-primary, #6366f1);
  --theme-radius: var(--suite-radius, 0.5rem);
}

/* 组件中使用 */
.button {
  background-color: var(--theme-primary);
  border-radius: var(--theme-radius);
}

.gradient-bg {
  background: linear-gradient(
    135deg,
    var(--suite-gradient-from) 0%,
    var(--suite-gradient-via) 50%,
    var(--suite-gradient-to) 100%
  );
}
```

### 7.2 Tailwind 主题集成

```typescript
// tailwind.config.ts (可选)
const config = {
  theme: {
    extend: {
      colors: {
        suite: {
          DEFAULT: 'var(--suite-primary)',
          foreground: 'var(--suite-primary-foreground)',
        },
      },
      borderRadius: {
        suite: 'var(--suite-radius)',
      },
    },
  },
}
```

---

## 八、套件管理

### 8.1 添加新套件流程

1. 在 `configs/suites/` 下创建套件目录
2. 编写 `manifest.json`、`questions.json`、`types.json`、`theme.json`
3. 在 `index.json` 中注册套件
4. 完成，无需修改任何代码

### 8.2 配置校验

```typescript
// lib/suite-validator.ts

interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validateSuite(suiteId: string): ValidationResult {
  // 检查必要文件是否存在
  // 校验 JSON Schema
  // 校验题目配置的完整性
  // 校验类型定义的合法性
}
```

---

## 九、升级路径

### 9.1 当前阶段（本地配置）

- 配置文件存储在 `configs/suites/` 目录
- 构建时打包到应用中
- 适合：固定试题集、不需要频繁更新

### 9.2 未来阶段（API + 后台管理）

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ──── │     API     │ ──── │   Database  │
│   (Next.js) │      │   Service   │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                     ┌──────┴──────┐
                     │   Admin    │
                     │   Panel    │
                     └────────────┘
```

### 9.3 接口抽象

```typescript
// lib/suite-repository.ts

interface ISuiteRepository {
  list(): Promise<SuiteIndex>
  get(id: string): Promise<SuiteDetail>
  getQuestions(id: string): Promise<QuestionsData>
  getTypes(id: string): Promise<TypesData>
  getTheme(id: string): Promise<SuiteTheme>
}

// 本地实现
class LocalSuiteRepository implements ISuiteRepository {}

// API 实现
class ApiSuiteRepository implements ISuiteRepository {
  constructor(private baseUrl: string) {}
}
```

---

## 十、文件清单

### 10.1 新增文件

| 文件路径                             | 说明        |
| ------------------------------------ | ----------- |
| `configs/suites/index.json`          | 套件索引    |
| `configs/suites/mbti/manifest.json`  | MBTI 元信息 |
| `configs/suites/mbti/questions.json` | MBTI 题目   |
| `configs/suites/mbti/types.json`     | MBTI 类型   |
| `configs/suites/mbti/theme.json`     | MBTI 主题   |
| `lib/suite-loader.ts`                | 套件加载器  |
| `lib/suite-validator.ts`             | 配置校验    |
| `lib/types/suite.ts`                 | 类型定义    |
| `components/theme-provider.tsx`      | 主题提供者  |
| `components/suite-selector.tsx`      | 套件选择器  |
| `components/question-card.tsx`       | 答题卡片    |

### 10.2 改造文件

| 文件路径                      | 改动说明         |
| ----------------------------- | ---------------- |
| `app/page.tsx`                | 改为套件选择首页 |
| `app/[suite]/layout.tsx`      | 新增，套件级布局 |
| `app/[suite]/page.tsx`        | 新增，动态测试页 |
| `app/[suite]/result/page.tsx` | 新增，动态结果页 |
| `app/globals.css`             | 添加主题变量支持 |

### 10.3 删除文件

| 文件路径              | 说明                             |
| --------------------- | -------------------------------- |
| `app/test/page.tsx`   | 迁移到 `[suite]/page.tsx`        |
| `app/result/page.tsx` | 迁移到 `[suite]/result/page.tsx` |

---

## 十一、总结

本方案实现了：

1. **N 套试题支持**：通过子路由 `[suite]` 动态加载配置
2. **配置驱动渲染**：同一套页面组件，读取不同 JSON 配置
3. **主题系统**：每个套件独立的主题配置（颜色、渐变、圆角等）
4. **平滑迁移**：预留 Repository 接口，未来可切换到 API 模式
5. **零代码扩展**：新增套件只需添加配置文件，无需修改代码

---

_文档版本：1.0.0_
_最后更新：2026-04-10_
