# NBTI 测试框架架构设计文档

## 一、项目愿景与核心理念

### 1.1 核心定位

NBTI 不再是一个针对单一测试题目的应用，而是一个**通用的在线测试框架**。任何符合协议的数据都可以驱动 App 展示不同的测试内容——无论是 MBTI、荣格职业测试、大五人格测试，还是用户自定义的性格分析。

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                    │
│     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│     │   MBTI 题库  │     │ 大五人格题库 │     │  职业测试   │       │
│     │  (mbti.json)│     │ (big5.json) │     │ (career.json)      │
│     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘       │
│            │                   │                   │              │
│            └───────────────────┼───────────────────┘              │
│                                │                                  │
│                                ▼                                  │
│                   ┌─────────────────────┐                         │
│                   │                     │                         │
│                   │     NBTI App        │                         │
│                   │     (Framework)     │                         │
│                   │                     │                         │
│                   └─────────────────────┘                         │
│                                │                                  │
│                                ▼                                  │
│                   ┌─────────────────────┐                         │
│                   │   统一的用户体验     │                         │
│                   │   测试流程 + 结果    │                         │
│                   └─────────────────────┘                         │
│                                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 设计原则

1. **内容与逻辑分离**：App 是"渲染引擎"，数据是"内容包"
2. **零代码配置**：更换测试只需更换 JSON，无需修改代码
3. **完整的数据协议**：定义清晰的数据格式规范，任何人都能创建自己的测试包
4. **可扩展的图片模板系统**：结果图模板也由数据定义

---

## 二、数据协议设计

### 2.1 协议文件结构

```
# 测试包（可部署为独立文件夹或发布为 npm 包）
my-test-package/
├── manifest.json          # 测试包元信息
├── questions.json         # 题库数据
├── types.json             # 结果类型定义
├── templates.json         # 结果图模板
├── themes.json            # 主题样式配置
└── i18n/                   # 国际化文案
    ├── zh.json
    └── en.json
```

### 2.2 manifest.json — 测试包元信息

```json
{
  "id": "nbti-mbti-2024",
  "name": {
    "zh": "NBTI 性格测试",
    "en": "NBTI Personality Test"
  },
  "version": "1.0.0",
  "description": {
    "zh": "基于 MBTI 模型的性格测试，帮助你了解自己的性格特质",
    "en": "A personality test based on MBTI model"
  },
  "author": "NBTI Team",
  "thumbnail": "https://example.com/cover.png",
  "config": {
    "questions": "questions.json",
    "types": "types.json",
    "templates": "templates.json",
    "themes": "themes.json",
    "i18n": "i18n/"
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
    "calculateMethod": "difference"
  }
}
```

### 2.3 questions.json — 题库数据结构

```json
{
  "meta": {
    "totalQuestions": 28,
    "timeEstimate": 300,
    "tags": ["personality", "mbri"]
  },
  "dimensions": [
    {
      "id": "EI",
      "name": { "zh": "外向 — 内向", "en": "Extraversion — Introversion" },
      "description": {
        "zh": "你从哪里获得能量？",
        "en": "Where do you get your energy?"
      }
    },
    {
      "id": "NS",
      "name": { "zh": "直觉 — 实感", "en": "Intuition — Sensing" },
      "description": {
        "zh": "你如何获取信息？",
        "en": "How do you take in information?"
      }
    },
    {
      "id": "TF",
      "name": { "zh": "思考 — 情感", "en": "Thinking — Feeling" },
      "description": {
        "zh": "你如何做决定？",
        "en": "How do you make decisions?"
      }
    },
    {
      "id": "JP",
      "name": { "zh": "判断 — 知觉", "en": "Judging — Perceiving" },
      "description": {
        "zh": "你如何与外界互动？",
        "en": "How do you deal with the outside world?"
      }
    }
  ],
  "questions": [
    {
      "id": "q001",
      "dimension": "EI",
      "category": "energy",
      "content": {
        "zh": "在社交聚会中，你通常会：",
        "en": "At a social gathering, you tend to:"
      },
      "image": "https://example.com/q001.png",
      "options": [
        {
          "id": "q001_a",
          "content": {
            "zh": "主动和很多人交流，包括陌生人",
            "en": "Initiate conversations with many people, including strangers"
          },
          "weight": {
            "E": 3,
            "I": 0
          },
          "image": null
        },
        {
          "id": "q001_b",
          "content": {
            "zh": "和熟悉的朋友聊天",
            "en": "Chat with friends you know well"
          },
          "weight": {
            "E": 1,
            "I": 1
          },
          "image": null
        },
        {
          "id": "q001_c",
          "content": {
            "zh": "在一旁观察，偶尔参与",
            "en": "Observe from the side and occasionally participate"
          },
          "weight": {
            "E": 0,
            "I": 2
          },
          "image": null
        },
        {
          "id": "q001_d",
          "content": {
            "zh": "找个安静的角落休息",
            "en": "Find a quiet corner to rest"
          },
          "weight": {
            "E": 0,
            "I": 3
          },
          "image": null
        }
      ]
    }
  ]
}
```

### 2.4 types.json — 结果类型定义

```json
{
  "dimensions": [
    {
      "id": "EI",
      "left": {
        "letter": "E",
        "name": { "zh": "外向", "en": "Extravert" },
        "description": {
          "zh": "你从外部世界获得能量，喜欢社交互动",
          "en": "You gain energy from the outside world and enjoy social interactions"
        }
      },
      "right": {
        "letter": "I",
        "name": { "zh": "内向", "en": "Introvert" },
        "description": {
          "zh": "你从内心世界获得能量，需要独处时间来恢复精力",
          "en": "You gain energy from your inner world and need alone time to recharge"
        }
      }
    }
  ],
  "types": [
    {
      "id": "INTJ",
      "name": {
        "zh": "建筑师",
        "en": "Architect"
      },
      "subtitle": {
        "zh": "富有想象力和战略性的思想家",
        "en": "Imaginative and strategic thinkers"
      },
      "description": {
        "zh": "INTJ 是十六种 MBTI 人格类型中最罕见的类型之一，约占人口的 2%。他们以其深刻的分析能力、独立的思维和追求完美的特质而闻名。",
        "en": "INTJ is one of the rarest of the 16 MBTI types, comprising about 2% of the population. They are known for their deep analytical abilities, independent thinking, and pursuit of perfection."
      },
      "traits": [
        {
          "id": "strategic",
          "name": { "zh": "战略思维", "en": "Strategic" },
          "icon": "brain",
          "level": 95
        },
        {
          "id": "independent",
          "name": { "zh": "独立自主", "en": "Independent" },
          "icon": "user",
          "level": 90
        }
      ],
      "strengths": [
        {
          "zh": "逻辑清晰，分析能力强",
          "en": "Clear logic and strong analytical ability"
        },
        { "zh": "目标导向，意志坚定", "en": "Goal-oriented and determined" }
      ],
      "weaknesses": [
        {
          "zh": "可能显得冷漠或挑剔",
          "en": "May seem cold or overly critical"
        },
        { "zh": "不擅长表达情感", "en": "Not good at expressing emotions" }
      ],
      "compatibleTypes": ["ENFP", "ENTP"],
      "careers": [
        { "zh": "科学家", "en": "Scientist" },
        { "zh": "工程师", "en": "Engineer" },
        { "zh": "法官", "en": "Judge" }
      ],
      "relationships": {
        "zh": "在亲密关系中，INTJ 需要能够进行深入对话的伴侣。他们重视智识上的契合，但也需要学会表达情感和欣赏伴侣的优点。",
        "en": "In intimate relationships, INTJs need partners who can engage in deep conversations. They value intellectual compatibility but also need to learn to express emotions and appreciate their partner's strengths."
      },
      "famousPeople": ["Elon Musk", "Stephen Hawking", "Mark Zuckerberg"]
    }
  ]
}
```

### 2.5 templates.json — 结果图模板系统

```json
{
  "templates": [
    {
      "id": "classic",
      "name": { "zh": "经典款", "en": "Classic" },
      "thumbnail": "https://example.com/templates/classic-thumb.png",
      "dimensions": {
        "width": 1080,
        "height": 1080
      },
      "background": {
        "type": "gradient",
        "value": [
          { "color": "#667eea", "position": 0 },
          { "color": "#764ba2", "position": 100 }
        ],
        "direction": "135deg"
      },
      "elements": [
        {
          "id": "decorative-circle-1",
          "type": "shape",
          "shape": "circle",
          "position": { "x": 0, "y": 0 },
          "size": { "width": 300, "height": 300 },
          "style": {
            "backgroundColor": "rgba(255,255,255,0.1)",
            "borderRadius": "50%"
          }
        },
        {
          "id": "type-badge",
          "type": "text",
          "content": "{type.code}",
          "position": { "x": "center", "y": "25%" },
          "style": {
            "fontSize": 140,
            "fontWeight": 800,
            "fontFamily": "Inter",
            "color": "#FFFFFF",
            "textShadow": "0 4px 20px rgba(0,0,0,0.3)"
          }
        },
        {
          "id": "type-name",
          "type": "text",
          "content": "{type.name}",
          "position": { "x": "center", "y": "42%" },
          "style": {
            "fontSize": 48,
            "fontWeight": 600,
            "fontFamily": "Inter",
            "color": "rgba(255,255,255,0.95)"
          }
        },
        {
          "id": "subtitle",
          "type": "text",
          "content": "{type.subtitle}",
          "position": { "x": "center", "y": "52%" },
          "style": {
            "fontSize": 28,
            "fontWeight": 400,
            "fontFamily": "Inter",
            "color": "rgba(255,255,255,0.8)"
          }
        },
        {
          "id": "trait-badges",
          "type": "trait-badges",
          "position": { "x": "center", "y": "65%" },
          "layout": "horizontal",
          "spacing": 16,
          "badgeStyle": {
            "backgroundColor": "rgba(255,255,255,0.2)",
            "borderRadius": 20,
            "padding": { "x": 20, "y": 10 },
            "fontSize": 24,
            "fontColor": "#FFFFFF"
          }
        },
        {
          "id": "qrcode",
          "type": "qrcode",
          "content": "{share.url}",
          "position": { "x": "center", "y": "85%" },
          "size": 100,
          "style": {
            "backgroundColor": "#FFFFFF",
            "borderRadius": 8
          }
        },
        {
          "id": "brand",
          "type": "text",
          "content": "Powered by NBTI",
          "position": { "x": "center", "y": "95%" },
          "style": {
            "fontSize": 18,
            "fontColor": "rgba(255,255,255,0.5)"
          }
        }
      ]
    },
    {
      "id": "minimal",
      "name": { "zh": "简约款", "en": "Minimal" },
      "thumbnail": "https://example.com/templates/minimal-thumb.png",
      "dimensions": { "width": 1080, "height": 1920 },
      "background": {
        "type": "color",
        "value": "#1A1A2E"
      },
      "elements": [
        {
          "id": "type-badge",
          "type": "text",
          "content": "{type.code}",
          "position": { "x": "center", "y": "15%" },
          "style": {
            "fontSize": 200,
            "fontWeight": 900,
            "color": "#FFFFFF"
          }
        },
        {
          "id": "divider",
          "type": "shape",
          "shape": "line",
          "position": { "x": "40%", "y": "28%", "width": "20%", "height": 2 },
          "style": { "backgroundColor": "#4ECDC4" }
        },
        {
          "id": "radar-chart",
          "type": "radar",
          "position": { "x": "center", "y": "45%" },
          "size": { "width": 600, "height": 600 },
          "style": {
            "backgroundColor": "rgba(255,255,255,0.05)",
            "lineColor": "#4ECDC4",
            "fillColor": "rgba(78,205,196,0.3)"
          }
        }
      ]
    }
  ]
}
```

### 2.6 themes.json — 主题样式配置

```json
{
  "defaultTheme": "default",
  "themes": {
    "default": {
      "name": { "zh": "默认主题", "en": "Default" },
      "colors": {
        "primary": "#667eea",
        "primaryForeground": "#FFFFFF",
        "secondary": "#764ba2",
        "secondaryForeground": "#FFFFFF",
        "background": "#F8FAFC",
        "foreground": "#0F172A",
        "muted": "#F1F5F9",
        "mutedForeground": "#64748B",
        "accent": "#F59E0B",
        "accentForeground": "#FFFFFF",
        "destructive": "#EF4444",
        "border": "#E2E8F0",
        "card": "#FFFFFF",
        "cardForeground": "#0F172A"
      },
      "font": {
        "heading": "Inter",
        "body": "Inter",
        "fallback": ["system-ui", "sans-serif"]
      },
      "borderRadius": {
        "sm": "6px",
        "md": "12px",
        "lg": "16px",
        "xl": "24px",
        "full": "9999px"
      },
      "shadows": {
        "sm": "0 1px 2px rgba(0,0,0,0.05)",
        "md": "0 4px 6px rgba(0,0,0,0.07)",
        "lg": "0 10px 15px rgba(0,0,0,0.1)"
      }
    },
    "dark": {
      "name": { "zh": "暗色主题", "en": "Dark Theme" },
      "colors": {
        "primary": "#818CF8",
        "primaryForeground": "#0F172A",
        "background": "#0F172A",
        "foreground": "#F8FAFC",
        "card": "#1E293B",
        "cardForeground": "#F8FAFC"
      }
    }
  }
}
```

---

## 三、项目结构设计

### 3.1 核心项目结构

```
nbti/
├── apps/
│   └── web/                      # Next.js 主应用
│       ├── app/
│       │   ├── (main)/
│       │   │   ├── page.tsx      # 首页
│       │   │   ├── test/
│       │   │   │   └── page.tsx  # 测试页
│       │   │   └── result/
│       │   │       └── page.tsx  # 结果页
│       │   ├── api/
│       │   │   └── config/
│       │   │       └── route.ts  # 获取配置接口
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/               # shadcn/ui 组件
│       │   ├── test/             # 测试相关组件
│       │   ├── result/           # 结果相关组件
│       │   └── shared/           # 通用组件
│       └── package.json
│
├── packages/
│   ├── core/                     # 核心框架包
│   │   ├── src/
│   │   │   ├── config/            # 配置加载器
│   │   │   │   ├── loader.ts     # 配置文件加载
│   │   │   │   ├── validator.ts  # 数据校验
│   │   │   │   └── cache.ts      # 配置缓存
│   │   │   ├── scoring/          # 计分引擎
│   │   │   │   ├── engine.ts      # 计分核心
│   │   │   │   └── dimensions.ts  # 维度计算
│   │   │   ├── rendering/        # 渲染引擎
│   │   │   │   ├── types.ts       # 渲染类型定义
│   │   │   │   ├── template-parser.ts
│   │   │   │   └── component-mapper.ts
│   │   │   ├── image/             # 图片生成
│   │   │   │   ├── generator.ts   # 图片生成器
│   │   │   │   ├── canvas.ts      # Canvas 工具
│   │   │   │   └── exporter.ts    # 导出工具
│   │   │   ├── i18n/              # 国际化
│   │   │   │   ├── index.ts
│   │   │   │   ├── resolver.ts
│   │   │   │   └── dictionary.ts
│   │   │   ├── types/             # 核心类型定义
│   │   │   │   ├── manifest.ts
│   │   │   │   ├── question.ts
│   │   │   │   ├── result.ts
│   │   │   │   ├── template.ts
│   │   │   │   └── theme.ts
│   │   │   └── index.ts          # 导出入口
│   │   └── package.json
│   │
│   ├── shared/                   # 共享工具包
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts         # className 合并
│   │   │   │   ├── object.ts      # 对象工具
│   │   │   │   └── array.ts       # 数组工具
│   │   │   ├── hooks/
│   │   │   │   ├── use-local-storage.ts
│   │   │   │   ├── use-media-query.ts
│   │   │   │   └── use-click-outside.ts
│   │   │   ├── constants/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── test-data/                # 默认测试数据包
│       ├── src/
│       │   ├── mbti/
│       │   │   ├── manifest.json
│       │   │   ├── questions.json
│       │   │   ├── types.json
│       │   │   ├── templates.json
│       │   │   ├── themes.json
│       │   │   └── i18n/
│       │   │       ├── zh.json
│       │   │       └── en.json
│       │   ├── big5/             # 大五人格测试
│       │   └── career/           # 职业兴趣测试
│       └── package.json
│
├── packages/test-data/           # 测试数据包（npm 包）
│
├── docs/
│   └── 数据协议文档.md
│
├── package.json                   # workspace 根配置
└── pnpm-workspace.yaml
```

### 3.2 Monorepo 工作空间

```
nbti (workspace root)
├── apps/web          — Next.js 主应用（面向用户）
├── packages/core     — 核心框架（协议解析、渲染、计分）
├── packages/shared   — 共享工具
└── packages/test-data/* — 测试数据包（可发布为独立 npm 包）
```

---

## 四、核心模块设计

### 4.1 配置加载器 (Config Loader)

#### 职责

统一管理配置的加载、验证、缓存和更新。

#### 加载策略

```
┌─────────────────────────────────────────────────────────────────┐
│                    Config Loader 流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   App 启动                                                        │
│      │                                                           │
│      ▼                                                           │
│   ┌─────────────────┐                                            │
│   │  加载 Manifest   │ ◄── 从指定路径/API 获取 manifest.json    │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │   验证配置结构   │ ◄── 检查必填字段、类型、数据完整性         │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │  加载子配置     │ ◄── 并行加载 questions/types/templates...  │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │   合并与缓存    │ ◄── 合并默认配置 + 用户配置 + 主题配置      │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │   存储到 Store  │ ◄── 注入到全局状态管理器                    │
│   └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### API 设计

```typescript
// packages/core/src/config/loader.ts
export interface ConfigSource {
  type: 'local' | 'remote' | 'npm'
  basePath: string
  manifestPath?: string
}

export interface LoadedConfig {
  manifest: Manifest
  questions: QuestionsData
  types: TypesData
  templates: TemplatesData
  theme: ThemeData
  i18n: Record<string, I18nDict>
}

export class ConfigLoader {
  constructor(source: ConfigSource)

  // 加载完整配置
  async load(): Promise<LoadedConfig>

  // 加载单个配置文件
  async loadManifest(): Promise<Manifest>
  async loadQuestions(): Promise<QuestionsData>
  async loadTypes(): Promise<TypesData>
  async loadTemplates(): Promise<TemplatesData>
  async loadTheme(): Promise<ThemeData>
  async loadI18n(locale: string): Promise<I18nDict>

  // 验证配置
  validate(config: Partial<LoadedConfig>): ValidationResult

  // 缓存管理
  getCache(): LoadedConfig | null
  clearCache(): void
  refresh(): Promise<LoadedConfig>
}
```

#### 使用示例

```typescript
// 方式 1: 从本地文件夹加载
const loader = new ConfigLoader({
  type: 'local',
  basePath: '/data/nbti-mbti',
})
const config = await loader.load()

// 方式 2: 从远程 API 加载
const loader = new ConfigLoader({
  type: 'remote',
  basePath: 'https://api.example.com/configs/nbti-mbti',
})
const config = await loader.load()

// 方式 3: 从 npm 包加载
const loader = new ConfigLoader({
  type: 'npm',
  basePath: 'nbti-test-mbti', // npm 包名
})
const config = await loader.load()
```

### 4.2 计分引擎 (Scoring Engine)

#### 计分策略

```typescript
// packages/core/src/scoring/engine.ts

// 支持的计分类型
export type ScoringType =
  | 'dimension' // 维度差值法（MBTI）
  | 'percentage' // 百分比法（大五人格）
  | 'weighted-sum' // 加权求和法

// 计分配置
export interface ScoringConfig {
  type: ScoringType
  dimensions: string[]
  calculateMethod: 'difference' | 'ratio' | 'absolute'
  normalizeOutput?: boolean
}

// 维度分数
export interface DimensionScore {
  dimensionId: string
  leftScore: number
  rightScore: number
  dominant: string // 占主导的维度字母
  percentage: number // 百分比 (0-100)
}

// 计算结果
export interface ScoringResult {
  dimensions: DimensionScore[]
  typeCode: string // e.g., "INTJ"
  rawScores: Record<string, number>
  normalizedScores: Record<string, number>
}
```

#### 计分算法实现

```typescript
// 维度差值法（MBTI）
function calculateDimensionScoring(
  answers: Answer[],
  dimensions: string[],
): ScoringResult {
  const scores: Record<string, { left: number; right: number }> = {}

  // 初始化维度分数
  dimensions.forEach(dim => {
    const [left, right] = dim.split('')
    scores[dim] = { left: 0, right: 0 }
  })

  // 汇总答案权重
  answers.forEach(answer => {
    const weight = answer.selectedOption.weight
    Object.entries(weight).forEach(([key, value]) => {
      // 匹配到维度（如 E、I 匹配到 EI 维度）
      dimensions.forEach(dim => {
        const [left, right] = dim.split('')
        if (key === left) scores[dim].left += value
        if (key === right) scores[dim].right += value
      })
    })
  })

  // 计算主导类型
  const dimensionScores = dimensions.map(dim => {
    const { left, right } = scores[dim]
    const total = left + right
    const dominant = left >= right ? dim[0] : dim[1]
    const percentage = total > 0 ? (Math.max(left, right) / total) * 100 : 50

    return {
      dimensionId: dim,
      leftScore: left,
      rightScore: right,
      dominant,
      percentage: Math.round(percentage),
    }
  })

  // 生成类型代码
  const typeCode = dimensionScores.map(d => d.dominant).join('')

  return {
    dimensions: dimensionScores,
    typeCode,
    rawScores: scores,
    normalizedScores: {},
  }
}
```

### 4.3 渲染引擎 (Rendering Engine)

#### 模板变量系统

```typescript
// packages/core/src/rendering/template-parser.ts

// 支持的变量类型
export type TemplateVariable =
  | { type: 'type'; path: 'code' | 'name' | 'subtitle' | 'description' }
  | {
      type: 'dimension'
      dimensionId: string
      path: 'left' | 'right' | 'percentage'
    }
  | { type: 'trait'; traitId: string; path: 'name' | 'level' }
  | { type: 'share'; path: 'url' | 'title' | 'text' }
  | { type: 'datetime'; format: string }
  | { type: 'config'; path: string }

// 变量插值
export function interpolateTemplate(
  template: string,
  context: RenderContext,
): string {
  return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
    const value = getNestedValue(context, path)
    return value ?? match
  })
}

// 获取嵌套值
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
```

#### 渲染上下文

```typescript
// packages/core/src/rendering/types.ts

export interface RenderContext {
  type: {
    code: string
    name: LocalizedString
    subtitle: LocalizedString
    description: LocalizedString
    traits: Trait[]
    strengths: LocalizedString[]
    weaknesses: LocalizedString[]
    careers: LocalizedString[]
  }
  dimensions: DimensionScore[]
  scoring: ScoringResult
  config: {
    appName: string
    shareUrl: string
  }
  locale: string
  theme: ThemeConfig
  timestamp: number
}
```

### 4.4 图片生成器 (Image Generator)

#### 生成流程

```
┌─────────────────────────────────────────────────────────────────┐
│                   Image Generator 流程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. 解析模板配置                                                │
│      ├── 读取 template.json 中的模板定义                         │
│      └── 解析所有元素的样式和位置                                 │
│                                                                  │
│   2. 创建渲染上下文                                              │
│      ├── 获取测试结果数据                                        │
│      ├── 获取当前语言设置                                        │
│      └── 获取主题配置                                            │
│                                                                  │
│   3. 渲染 DOM 结构                                              │
│      ├── 创建隐藏的容器 div                                      │
│      ├── 应用模板样式（background、fonts）                       │
│      └── 渲染各元素（text、shape、qrcode、radar）                │
│                                                                  │
│   4. 生成图片                                                    │
│      ├── 使用 html-to-image 转换为 Canvas                       │
│      ├── 支持 PNG / JPEG 格式                                    │
│      └── 支持 1x / 2x / 3x 清晰度                                │
│                                                                  │
│   5. 输出结果                                                    │
│      ├── 返回 Base64 字符串                                      │
│      ├── 或返回 Blob 用于文件下载                                │
│      └── 或返回 File 用于 Web Share API                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### API 设计

```typescript
// packages/core/src/image/generator.ts

export interface ImageGeneratorOptions {
  templateId: string
  template: ShareCardTemplate
  context: RenderContext
  format: 'png' | 'jpeg'
  quality: number
  pixelRatio: number
  backgroundColor?: string
}

export interface GeneratedImage {
  blob: Blob
  dataUrl: string
  base64: string
  width: number
  height: number
}

export class ImageGenerator {
  constructor(container: HTMLElement)

  // 生成图片
  async generate(options: ImageGeneratorOptions): Promise<GeneratedImage>

  // 下载图片
  async download(
    options: ImageGeneratorOptions,
    filename: string,
  ): Promise<void>

  // 分享图片（使用 Web Share API）
  async share(options: ImageGeneratorOptions): Promise<void>

  // 预览图片（返回 data URL）
  async preview(options: ImageGeneratorOptions): Promise<string>
}
```

---

## 五、组件架构

### 5.1 组件层级

```
┌─────────────────────────────────────────────────────────────────┐
│                      组件层级架构                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Framework Layer                       │   │
│   │                                                           │   │
│   │   <ConfigProvider>        — 配置注入、主题提供             │   │
│   │   <I18nProvider>          — 国际化上下文                   │   │
│   │   <TestProvider>         — 测试状态管理                  │   │
│   │   <ThemeProvider>         — 主题切换                     │   │
│   │                                                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Feature Layer                          │   │
│   │                                                           │   │
│   │   测试模块:                                                │   │
│   │   ├── <TestContainer>      — 测试容器，管理进度           │   │
│   │   ├── <QuestionCard>       — 问题卡片（数据驱动）         │   │
│   │   ├── <OptionList>        — 选项列表（数据驱动）         │   │
│   │   ├── <OptionItem>        — 选项项（支持自定义渲染）      │   │
│   │   └── <ProgressBar>       — 进度条                        │   │
│   │                                                           │   │
│   │   结果模块:                                                │   │
│   │   ├── <ResultDisplay>      — 结果展示容器                 │   │
│   │   ├── <TypeBadge>         — 类型徽章                     │   │
│   │   ├── <TraitList>         — 特质列表（数据驱动）         │   │
│   │   ├── <DimensionChart>    — 维度图表（数据驱动）         │   │
│   │   ├── <DescriptionCard>   — 描述卡片（数据驱动）         │   │
│   │   ├── <ShareSection>      — 分享区域                     │   │
│   │   └── <ImageExport>       — 图片导出（模板驱动）         │   │
│   │                                                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    UI Layer                              │   │
│   │                                                           │   │
│   │   shadcn/ui 基础组件库                                    │   │
│   │   ├── Button, Card, Progress, Badge, Dialog...           │   │
│   │                                                           │   │
│   │   动画组件                                                │   │
│   │   ├── <FadeIn>        — 淡入动画                         │   │
│   │   ├── <SlideIn>       — 滑入动画                         │   │
│   │   ├── <ScaleIn>       — 缩放动画                         │   │
│   │   └── <AnimateList>  — 列表动画                         │   │
│   │                                                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 数据驱动组件示例

#### QuestionCard 组件

```typescript
// apps/web/components/test/question-card.tsx
interface QuestionCardProps {
  question: Question;  // 来自 questions.json
  locale: string;
  onSelect: (optionId: string) => void;
  animationConfig?: {
    enter: AnimationType;
    exit: AnimationType;
    duration: number;
  };
}

// 使用数据驱动渲染
export function QuestionCard({ question, locale, onSelect }: QuestionCardProps) {
  return (
    <Card>
      {/* 题目图片（可选） */}
      {question.image && (
        <CardImage src={question.image} alt="" />
      )}

      {/* 题目内容 */}
      <CardContent>
        <h2>{question.content[locale]}</h2>
      </CardContent>

      {/* 选项列表 */}
      <OptionList>
        {question.options.map(option => (
          <OptionItem
            key={option.id}
            option={option}
            locale={locale}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </OptionList>
    </Card>
  );
}
```

#### ResultDisplay 组件

```typescript
// apps/web/components/result/result-display.tsx
interface ResultDisplayProps {
  result: ResultAnalysis;  // 计算得出的结果
  typeDefinition: PersonalityType;  // 来自 types.json
  locale: string;
  template: ShareCardTemplate;  // 来自 templates.json
}

// 数据驱动展示
export function ResultDisplay({
  result,
  typeDefinition,
  locale,
  template
}: ResultDisplayProps) {
  return (
    <div className="result-container">
      {/* 类型代码 */}
      <TypeBadge type={typeDefinition} />

      {/* 类型名称 */}
      <h1>{typeDefinition.name[locale]}</h1>

      {/* 特质列表（数据驱动） */}
      <TraitList traits={typeDefinition.traits} locale={locale} />

      {/* 维度图表（数据驱动） */}
      <DimensionChart dimensions={result.dimensions} />

      {/* 详细描述（数据驱动） */}
      <DescriptionCard description={typeDefinition.description[locale]} />

      {/* 长处列表（数据驱动） */}
      <StrengthList items={typeDefinition.strengths} locale={locale} />

      {/* 弱项列表（数据驱动） */}
      <WeaknessList items={typeDefinition.weaknesses} locale={locale} />

      {/* 分享区域 */}
      <ShareSection
        template={template}
        result={result}
        typeDefinition={typeDefinition}
      />
    </div>
  );
}
```

---

## 六、状态管理

### 6.1 全局状态设计

```typescript
// apps/web/stores/test-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TestState {
  // 配置状态（来自 JSON）
  config: LoadedConfig | null
  configStatus: 'idle' | 'loading' | 'loaded' | 'error'
  configError: Error | null

  // 测试会话状态
  session: TestSession | null

  // 用户答案
  answers: Map<string, string> // questionId -> optionId

  // 结果数据
  result: ResultAnalysis | null

  // 用户设置
  settings: UserSettings

  // Actions
  loadConfig: (source: ConfigSource) => Promise<void>
  startSession: () => void
  answerQuestion: (questionId: string, optionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submitTest: () => ResultAnalysis
  resetTest: () => void
  updateSettings: (settings: Partial<UserSettings>) => void
}

interface UserSettings {
  locale: string
  theme: 'light' | 'dark' | 'system'
  animationEnabled: boolean
  soundEnabled: boolean
}
```

### 6.2 状态流程

```
┌─────────────────────────────────────────────────────────────────┐
│                       状态流转图                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     loadConfig()      ┌────────────────┐          │
│   │  IDLE    │ ───────────────────► │    LOADING     │          │
│   └──────────┘                      └───────┬────────┘          │
│                                               │                   │
│                                    ┌──────────┴──────────┐       │
│                                    │                     │       │
│                               success               error        │
│                                    │                     │       │
│                                    ▼                     ▼       │
│                            ┌────────────┐         ┌──────────┐   │
│                            │   LOADED   │         │  ERROR   │   │
│                            └─────┬──────┘         └──────────┘   │
│                                  │                                 │
│                                  ▼                                 │
│                            startSession()                         │
│                                  │                                 │
│                                  ▼                                 │
│   ┌──────────────────────────────────────────────────────┐       │
│   │                   TEST_IN_PROGRESS                    │       │
│   │                                                       │       │
│   │   answerQuestion() ◄─────────────────────► nextQuestion()     │
│   │        │                              │                      │
│   │        └────────── prevQuestion() ◄────┘                      │
│   │                                                       │       │
│   └───────────────────────────────────────────────────────┼───┐   │
│                                                             │   │
│                                                   submitTest()  │
│                                                             │   │
│                                                             ▼   │
│                                                      ┌────────────┐
│   resetTest()                                        │  COMPLETED  │
│      │                                               └────────────┘
│      └──────────────────────────────────────────────────────────►│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 七、国际化方案

### 7.1 翻译文件结构

```json
// packages/test-data/mbti/i18n/zh.json
{
  "common": {
    "appName": "NBTI 测试",
    "startTest": "开始测试",
    "continueTest": "继续测试",
    "retake": "重新测试",
    "share": "分享",
    "download": "下载图片",
    "next": "下一题",
    "prev": "上一题",
    "submit": "提交测试",
    "loading": "加载中...",
    "error": "出错了",
    "retry": "重试"
  },
  "test": {
    "progress": "第 {current} 题，共 {total} 题",
    "questionPrefix": "问题",
    "selectOption": "请选择最符合你的选项",
    "requiredAnswer": "请先选择一个选项",
    "completeMessage": "恭喜你完成了测试！",
    "timeWarning": "剩余时间：{time}",
    "timeUp": "时间到！正在提交..."
  },
  "result": {
    "yourType": "你的性格类型",
    "viewDetails": "查看详细分析",
    "traitAnalysis": "特质分析",
    "strengths": "优势",
    "weaknesses": "成长空间",
    "compatibleTypes": "匹配类型",
    "careerSuggestions": "适合职业",
    "shareTitle": "我的 NBTI 测试结果是 {type}",
    "shareText": "我是 {type}（{name}），快来测试你的性格吧！",
    "poweredBy": "由 NBTI 提供支持"
  },
  "errors": {
    "loadConfigFailed": "加载配置失败，请检查网络后重试",
    "submitFailed": "提交失败，请重试",
    "imageGenerateFailed": "图片生成失败，请重试"
  }
}
```

### 7.2 翻译使用

```typescript
// 使用 useTranslation hook
import { useTranslation } from '@nbti/core';

function TestPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t('result.yourType')}</h1>
      <p>{t('test.progress', { current: 1, total: 28 })}</p>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  );
}

// 在模板中使用翻译变量
// templates.json
{
  "elements": [
    {
      "id": "powered-by",
      "type": "text",
      "content": "{i18n.result.poweredBy}",
      "style": { "fontSize": 18 }
    }
  ]
}
```

---

## 八、部署方案

### 8.1 部署模式

```
┌─────────────────────────────────────────────────────────────────┐
│                      部署模式                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  模式 1: 单测试部署                                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Web App + 单一测试数据包（内嵌）                         │     │
│  │                                                          │     │
│  │  ├── 适用场景: 固定测试、无需频繁更新                      │     │
│  │  ├── 部署简单: 纯静态部署到 Vercel/Netlify                │     │
│  │  └── 配置: manifest.json 在 public/data/                 │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  模式 2: 多测试部署（推荐）                                       │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Web App + 远程测试数据包                                  │     │
│  │                                                          │     │
│  │  ├── 适用场景: 需要支持多测试、需要频繁更新内容            │     │
│  │  ├── 配置: manifest.json 在远程服务器                     │     │
│  │  └── API: /api/config?package=xxx                         │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  模式 3: 白标部署                                                │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Web App + 自定义域名 + 自定义数据包                      │     │
│  │                                                          │     │
│  │  ├── 适用场景: 品牌定制、独立运营                         │     │
│  │  ├── 配置: 数据包作为独立 npm 包发布                      │     │
│  │  └── 主题: 支持完全自定义样式                             │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 部署配置示例

#### Vercel 部署

```javascript
// apps/web/vercel.json
{
  "rewrites": [
    {
      "source": "/api/config/:package*",
      "destination": "https://cdn.example.com/:package*/manifest.json"
    }
  ]
}
```

#### 环境变量

```bash
# .env.local
NEXT_PUBLIC_CONFIG_BASE_URL=https://cdn.example.com/packages
NEXT_PUBLIC_DEFAULT_PACKAGE=nbti-mbti
NEXT_PUBLIC_SHARE_BASE_URL=https://nbti.app/result
```

### 8.3 初始化流程

```typescript
// apps/web/app/providers.tsx
'use client';

import { ConfigLoader, type ConfigSource } from '@nbti/core';

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<LoadedConfig | null>(null);

  useEffect(() => {
    const loadInitialConfig = async () => {
      // 从环境变量获取配置源
      const baseUrl = process.env.NEXT_PUBLIC_CONFIG_BASE_URL;
      const packageName = process.env.NEXT_PUBLIC_DEFAULT_PACKAGE;

      const loader = new ConfigLoader({
        type: baseUrl ? 'remote' : 'local',
        basePath: baseUrl ? `${baseUrl}/${packageName}` : `/data/${packageName}`
      });

      const loadedConfig = await loader.load();
      setConfig(loadedConfig);
    };

    loadInitialConfig();
  }, []);

  return (
    <TestConfigContext.Provider value={config}>
      {children}
    </TestConfigContext.Provider>
  );
}
```

---

## 九、数据校验与类型安全

### 9.1 Schema 校验

```typescript
// packages/core/src/config/validator.ts
import { z } from 'zod'

// Manifest Schema
export const ManifestSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  version: z.string(),
  config: z.object({
    questions: z.string(),
    types: z.string(),
    templates: z.string(),
    themes: z.string().optional(),
    i18n: z.string().optional(),
  }),
  settings: z
    .object({
      allowBack: z.boolean(),
      showTimer: z.boolean(),
      shuffleQuestions: z.boolean(),
      shuffleOptions: z.boolean(),
      requiredAnswer: z.boolean(),
      maxDuration: z.number().nullable(),
    })
    .optional(),
  scoring: z.object({
    type: z.enum(['dimension', 'percentage', 'weighted-sum']),
    dimensions: z.array(z.string()),
    calculateMethod: z.enum(['difference', 'ratio', 'absolute']),
  }),
})

// Question Schema
export const QuestionSchema = z.object({
  id: z.string(),
  dimension: z.string(),
  category: z.string().optional(),
  content: LocalizedStringSchema,
  image: z.string().nullable().optional(),
  options: z.array(OptionSchema).min(2),
})

// 使用 Zod 进行运行时校验
export function validateManifest(data: unknown): Manifest {
  return ManifestSchema.parse(data)
}
```

---

## 十、性能优化

### 10.1 优化策略

| 优化项     | 方案                                   | 效果                |
| ---------- | -------------------------------------- | ------------------- |
| 配置预加载 | App 启动时预加载 manifest 和 questions | 减少测试开始延迟    |
| 图片懒加载 | 模板图片和题库图片使用懒加载           | 减少首屏加载时间    |
| 结果图缓存 | 相同结果的图片生成后缓存               | 减少重复生成        |
| 代码分割   | 动态导入图片生成器                     | 减少主包体积        |
| 字体优化   | 使用 next/font 优化字体加载            | 减少 FCP 时间       |
| 预渲染     | 静态页面预渲染                         | 提升 SEO 和加载速度 |

### 10.2 预加载实现

```typescript
// packages/core/src/config/preloader.ts
export class ConfigPreloader {
  private preloaded = false

  async preload(source: ConfigSource): Promise<void> {
    if (this.preloaded) return

    const loader = new ConfigLoader(source)

    // 预加载关键配置
    await Promise.all([
      loader.loadManifest(),
      loader.loadQuestions(),
      loader.loadI18n('zh'),
    ])

    this.preloaded = true
  }

  isPreloaded(): boolean {
    return this.preloaded
  }
}
```

---

## 十一、扩展性设计

### 11.1 测试数据包示例

任何人都可以创建自己的测试数据包：

```
my-custom-test/
├── manifest.json          # 必须：包元信息
├── questions.json         # 必须：题库
├── types.json             # 必须：结果类型
├── templates.json         # 可选：自定义模板
├── themes.json            # 可选：自定义主题
└── i18n/
    ├── zh.json            # 可选：中文翻译
    └── en.json            # 可选：英文翻译
```

### 11.2 自定义模板示例

```json
// templates.json
{
  "templates": [
    {
      "id": "my-brand",
      "name": { "zh": "我的品牌", "en": "My Brand" },
      "dimensions": { "width": 1080, "height": 1080 },
      "background": {
        "type": "image",
        "value": "https://my-brand.com/bg-template.png"
      },
      "elements": [
        {
          "id": "type",
          "type": "text",
          "content": "{type.code}",
          "position": { "x": "center", "y": "30%" },
          "style": { "fontSize": 160, "color": "#FFFFFF" }
        }
      ]
    }
  ]
}
```

---

## 十二、技术依赖

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0",
    "html-to-image": "^1.11.0",
    "qrcode": "^1.5.0",
    "recharts": "^2.12.0",
    "zod": "^3.23.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-icons": "^1.3.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "latest",
    "vitest": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

---

## 附录

### A. 数据协议速查

| 文件             | 必填 | 说明                         |
| ---------------- | ---- | ---------------------------- |
| `manifest.json`  | ✅   | 包元信息、配置路径、计分方式 |
| `questions.json` | ✅   | 题目列表、选项、维度权重     |
| `types.json`     | ✅   | 结果类型定义、描述、特质     |
| `templates.json` | ❌   | 结果图模板配置               |
| `themes.json`    | ❌   | 颜色、字体等主题配置         |
| `i18n/*.json`    | ❌   | 翻译文案                     |

### B. 变量引用速查

| 变量                        | 来源         | 说明           |
| --------------------------- | ------------ | -------------- |
| `{type.code}`               | types.json   | 人格类型代码   |
| `{type.name}`               | types.json   | 类型名称       |
| `{type.traits[0].name}`     | types.json   | 第一个特质名称 |
| `{dimension.EI.percentage}` | 计算结果     | EI 维度百分比  |
| `{share.url}`               | 系统生成     | 分享链接       |
| `{i18n.xxx}`                | i18n/\*.json | 翻译文本       |

### C. 部署清单

```
□ 准备 manifest.json
□ 准备 questions.json（至少 10 题）
□ 准备 types.json（根据维度计算定义）
□ 可选：准备 templates.json
□ 可选：准备 themes.json
□ 可选：准备 i18n/*.json
□ 测试配置加载
□ 验证计分结果
□ 测试图片生成
□ 配置 CDN（如果使用远程加载）
□ 部署 App
```

---

_文档版本：2.0_
_核心变化：数据驱动架构，App 作为框架，内容由 JSON 协议定义_
_最后更新：2026-04-10_
