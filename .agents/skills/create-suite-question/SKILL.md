---
name: create-suite-question
description: 根据 JSON Schema 为 NBTI 测试平台编写试题套件配置。触发场景：编写新套件题目、创建 questions.json/types.json/manifest.json 等配置文件。
---

# Suite 题目编写 Skill

本 Skill 指导你如何为 NBTI 测试平台编写试题套件的 JSON 配置文件。

## 一、套件目录结构

每个试题套件包含以下配置文件，放在 `apps/web/configs/suites/{suite-id}/` 目录下：

```
configs/suites/
├── index.json              # 套件索引（注册所有可用套件）
├── {suite-id}/
│   ├── manifest.json        # 套件元信息（设置、计分规则等）
│   ├── questions.json       # 题目数据
│   ├── types.json           # 结果类型定义（16型人格等）
│   └── theme.json           # 主题样式配置
```

## 二、文件详细规范

### 2.1 questions.json - 题目配置

#### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["questions", "meta"],
  "properties": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "dimension", "content", "options"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^q\\d{3,}$",
            "description": "题目唯一ID，格式：q001, q002, ..."
          },
          "dimension": {
            "type": "string",
            "description": "所属维度ID，必须在manifest.json的dimensions中定义"
          },
          "content": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string", "minLength": 1 },
              "en": { "type": "string", "minLength": 1 }
            }
          },
          "options": {
            "type": "array",
            "minItems": 2,
            "items": {
              "type": "object",
              "required": ["id", "content", "weight"],
              "properties": {
                "id": {
                  "type": "string",
                  "description": "选项唯一ID，格式：opt_{题号}{字母}"
                },
                "content": {
                  "type": "object",
                  "required": ["zh", "en"],
                  "properties": {
                    "zh": { "type": "string", "minLength": 1 },
                    "en": { "type": "string", "minLength": 1 }
                  }
                },
                "weight": {
                  "type": "object",
                  "description": "计分权重，key为维度字母，value为分值（0-3）"
                }
              }
            }
          }
        }
      }
    },
    "meta": {
      "type": "object",
      "required": ["totalQuestions", "timeEstimate"],
      "properties": {
        "totalQuestions": { "type": "integer" },
        "timeEstimate": { "type": "integer", "description": "预估时间（秒）" }
      }
    }
  }
}
```

#### weight 计分规则

```json
// 单维度计分（MBTI风格）
"weight": { "E": 3, "I": 0 }

// 多维度计分
"weight": { "T": 2, "F": 1 }

// 无权重（中立选项）
"weight": { "E": 1, "I": 1 }

// 权重分值建议
// 3 = 强烈倾向该维度
// 2 = 中度倾向
// 1 = 轻微倾向
// 0 = 完全不倾向该维度
```

#### 编写示例

```json
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
        },
        {
          "id": "opt_1b",
          "content": {
            "zh": "和熟悉的朋友聊天",
            "en": "Chat with friends you know well"
          },
          "weight": { "E": 1, "I": 1 }
        },
        {
          "id": "opt_1c",
          "content": {
            "zh": "在一旁观察，偶尔参与",
            "en": "Observe from the side and occasionally participate"
          },
          "weight": { "E": 0, "I": 2 }
        },
        {
          "id": "opt_1d",
          "content": {
            "zh": "找个安静的角落休息",
            "en": "Find a quiet corner to rest"
          },
          "weight": { "E": 0, "I": 3 }
        }
      ]
    }
  ],
  "meta": {
    "totalQuestions": 4,
    "timeEstimate": 300
  }
}
```

---

### 2.2 types.json - 结果类型定义

#### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["types", "dimensions"],
  "properties": {
    "types": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "subtitle", "description", "traits"],
        "properties": {
          "id": {
            "type": "string",
            "description": "类型唯一标识，如 INTJ, ENFP"
          },
          "name": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string" },
              "en": { "type": "string" }
            }
          },
          "subtitle": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string" },
              "en": { "type": "string" }
            }
          },
          "description": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string" },
              "en": { "type": "string" }
            }
          },
          "traits": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["id", "name", "level"],
              "properties": {
                "id": { "type": "string" },
                "name": {
                  "type": "object",
                  "required": ["zh", "en"],
                  "properties": {
                    "zh": { "type": "string" },
                    "en": { "type": "string" }
                  }
                },
                "level": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 100,
                  "description": "特质强度 0-100"
                }
              }
            }
          }
        }
      }
    },
    "dimensions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "left", "right"],
        "properties": {
          "id": { "type": "string" },
          "left": {
            "type": "object",
            "required": ["letter", "name"],
            "properties": {
              "letter": { "type": "string" },
              "name": {
                "type": "object",
                "properties": {
                  "zh": { "type": "string" },
                  "en": { "type": "string" }
                }
              }
            }
          },
          "right": {
            "type": "object",
            "required": ["letter", "name"],
            "properties": {
              "letter": { "type": "string" },
              "name": {
                "type": "object",
                "properties": {
                  "zh": { "type": "string" },
                  "en": { "type": "string" }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### 编写示例

```json
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
        "zh": "INTJ 是十六种 MBTI 人格类型中最罕见的类型之一。",
        "en": "INTJ is one of the rarest MBTI types."
      },
      "traits": [
        {
          "id": "strategic",
          "name": { "zh": "战略思维", "en": "Strategic" },
          "level": 95
        },
        {
          "id": "independent",
          "name": { "zh": "独立自主", "en": "Independent" },
          "level": 90
        }
      ]
    }
  ],
  "dimensions": [
    {
      "id": "EI",
      "left": { "letter": "E", "name": { "zh": "外向", "en": "Extraversion" } },
      "right": { "letter": "I", "name": { "zh": "内向", "en": "Introversion" } }
    },
    {
      "id": "NS",
      "left": { "letter": "N", "name": { "zh": "直觉", "en": "Intuition" } },
      "right": { "letter": "S", "name": { "zh": "感觉", "en": "Sensing" } }
    }
  ]
}
```

---

### 2.3 manifest.json - 套件元信息

#### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "dimensions", "settings", "scoring"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "套件ID，小写字母、数字、连字符"
    },
    "name": {
      "type": "object",
      "required": ["zh", "en"],
      "properties": {
        "zh": { "type": "string" },
        "en": { "type": "string" }
      }
    },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "description": {
      "type": "object",
      "properties": {
        "zh": { "type": "string" },
        "en": { "type": "string" }
      }
    },
    "thumbnail": { "type": "string" },
    "dimensions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "维度ID列表，如 ['EI', 'NS', 'TF', 'JP']"
    },
    "config": {
      "type": "object",
      "description": "配置文件映射（可选）",
      "properties": {
        "questions": { "type": "string" },
        "types": { "type": "string" },
        "themes": { "type": "string" }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "allowBack": { "type": "boolean" },
        "showTimer": { "type": "boolean" },
        "shuffleQuestions": { "type": "boolean" },
        "shuffleOptions": { "type": "boolean" },
        "requiredAnswer": { "type": "boolean" },
        "maxDuration": { "type": ["integer", "null"] }
      }
    },
    "scoring": {
      "type": "object",
      "required": ["type", "dimensions", "calculateMethod"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["dimension", "category", "hybrid"],
          "description": "计分类型"
        },
        "dimensions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "calculateMethod": {
          "type": "string",
          "enum": ["difference", "sum", "percentage"],
          "description": "计算方法"
        },
        "normalizeOutput": { "type": "boolean" }
      }
    }
  }
}
```

#### 编写示例

```json
{
  "id": "mbti",
  "name": { "zh": "MBTI 性格测试", "en": "MBTI Personality" },
  "version": "1.0.0",
  "description": {
    "zh": "MBTI（迈尔斯-布里格斯类型指标）是一种自我报告式的人格类型问卷",
    "en": "The Myers-Briggs Type Indicator is a self-report inventory"
  },
  "thumbnail": "/thumbnails/mbti.png",
  "dimensions": ["EI", "NS", "TF", "JP"],
  "config": {
    "questions": "questions.json",
    "types": "types.json",
    "themes": "theme.json"
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

---

### 2.4 theme.json - 主题配置

#### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "colors"],
  "properties": {
    "id": { "type": "string" },
    "name": {
      "type": "object",
      "properties": {
        "zh": { "type": "string" },
        "en": { "type": "string" }
      }
    },
    "colors": {
      "type": "object",
      "properties": {
        "primary": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "primaryForeground": { "type": "string" },
        "secondary": { "type": "string" },
        "secondaryForeground": { "type": "string" },
        "background": { "type": "string" },
        "foreground": { "type": "string" },
        "muted": { "type": "string" },
        "mutedForeground": { "type": "string" },
        "accent": { "type": "string" },
        "accentForeground": { "type": "string" },
        "destructive": { "type": "string" },
        "destructiveForeground": { "type": "string" },
        "border": { "type": "string" },
        "input": { "type": "string" },
        "ring": { "type": "string" },
        "card": { "type": "string" },
        "cardForeground": { "type": "string" },
        "popover": { "type": "string" },
        "popoverForeground": { "type": "string" }
      }
    },
    "gradient": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "from": { "type": "string" },
        "via": { "type": "string" },
        "to": { "type": "string" }
      }
    },
    "style": {
      "type": "object",
      "properties": {
        "borderRadius": {
          "type": "object",
          "properties": {
            "none": { "type": "number" },
            "sm": { "type": "number" },
            "md": { "type": "number" },
            "lg": { "type": "number" },
            "xl": { "type": "number" },
            "2xl": { "type": "number" },
            "full": { "type": "number" }
          }
        },
        "font": {
          "type": "object",
          "properties": {
            "heading": { "type": "string" },
            "body": { "type": "string" }
          }
        }
      }
    },
    "result": {
      "type": "object",
      "properties": {
        "dimensionChart": {
          "type": "string",
          "enum": ["bar", "radar"]
        },
        "showTraits": { "type": "boolean" },
        "shareCardStyle": {
          "type": "string",
          "enum": ["gradient", "solid", "glass"]
        }
      }
    }
  }
}
```

#### 编写示例

```json
{
  "id": "mbti",
  "name": { "zh": "MBTI 主题", "en": "MBTI Theme" },
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
    "destructiveForeground": "#ffffff",
    "border": "#e2e8f0",
    "input": "#e2e8f0",
    "ring": "#6366f1",
    "card": "#ffffff",
    "cardForeground": "#1e293b",
    "popover": "#ffffff",
    "popoverForeground": "#1e293b"
  },
  "gradient": {
    "enabled": true,
    "from": "#6366f1",
    "via": "#8b5cf6",
    "to": "#a855f7"
  },
  "style": {
    "borderRadius": {
      "none": 0,
      "sm": 0.25,
      "md": 0.5,
      "lg": 0.75,
      "xl": 1,
      "2xl": 1.5,
      "full": 9999
    },
    "font": {
      "heading": "Inter, system-ui, sans-serif",
      "body": "Inter, system-ui, sans-serif"
    }
  },
  "result": {
    "dimensionChart": "bar",
    "showTraits": true,
    "shareCardStyle": "gradient"
  }
}
```

---

### 2.5 index.json - 套件索引

#### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["suites", "updatedAt"],
  "properties": {
    "suites": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "description", "enabled", "order"],
        "properties": {
          "id": { "type": "string" },
          "name": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string" },
              "en": { "type": "string" }
            }
          },
          "description": {
            "type": "object",
            "required": ["zh", "en"],
            "properties": {
              "zh": { "type": "string" },
              "en": { "type": "string" }
            }
          },
          "thumbnail": { "type": "string" },
          "enabled": { "type": "boolean" },
          "order": { "type": "integer" }
        }
      }
    },
    "updatedAt": { "type": "string", "format": "date" }
  }
}
```

#### 编写示例

```json
{
  "suites": [
    {
      "id": "mbti",
      "name": { "zh": "MBTI 性格测试", "en": "MBTI Personality" },
      "description": {
        "zh": "国际通用的性格评估工具",
        "en": "A comprehensive personality assessment tool"
      },
      "thumbnail": "/thumbnails/mbti.png",
      "enabled": true,
      "order": 1
    },
    {
      "id": "bigfive",
      "name": { "zh": "大五人格测试", "en": "Big Five Personality" },
      "description": {
        "zh": "测量五大人格维度的标准测试",
        "en": "Measure the five major personality dimensions"
      },
      "thumbnail": "/thumbnails/bigfive.png",
      "enabled": false,
      "order": 2
    }
  ],
  "updatedAt": "2026-04-10"
}
```

---

## 三、编写规范与注意事项

### 3.1 ID 命名规则

| 类型 | 格式 | 示例 |
|------|------|------|
| 套件ID | 小写字母 + 数字 + 连字符 | `mbti`, `bigfive`, `love-quiz-2024` |
| 题目ID | `q` + 3位数字 | `q001`, `q002`, `q010` |
| 选项ID | `opt_` + 题号 + 字母 | `opt_1a`, `opt_1b`, `opt_2a` |
| 特质ID | 小写字母 + 连字符 | `strategic`, `curious`, `creative` |

### 3.2 国际化 (i18n)

- **所有用户可见文本必须同时提供中英文**
- 中文内容在前，英文在后
- 中文字符串不使用英文引号
- 英文字符串首字母大写（标题除外）

### 3.3 计分权重设计原则

1. **极端选项分值高**：强烈倾向给 3 分，完全不倾向给 0 分
2. **中立选项各给 1 分**：表示两边都认可
3. **每个维度总分一致**：确保各维度可比
4. **维度数量与题目数量匹配**：
   - MBTI: 4 维度，每维度约 20 题
   - 大五: 5 维度，每维度约 10 题

### 3.4 题目编写最佳实践

```typescript
// ✅ 好的题目
{
  "id": "q001",
  "dimension": "EI",
  "content": {
    "zh": "在社交聚会中，你通常会：",
    "en": "At a social gathering, you tend to:"
  },
  "options": [
    { "id": "opt_1a", "content": { "zh": "主动和很多人交流", "en": "..." }, "weight": { "E": 3, "I": 0 } },
    { "id": "opt_1b", "content": { "zh": "和熟悉的朋友聊天", "en": "..." }, "weight": { "E": 1, "I": 1 } },
    { "id": "opt_1c", "content": { "zh": "在一旁观察，偶尔参与", "en": "..." }, "weight": { "E": 0, "I": 2 } },
    { "id": "opt_1d", "content": { "zh": "找个安静的角落休息", "en": "..." }, "weight": { "E": 0, "I": 3 } }
  ]
}

// ❌ 避免的题目
{
  "id": "q001",
  "dimension": "EI",
  "content": {
    "zh": "你更喜欢什么？",
    "en": "What do you prefer?"
  },
  "options": [
    { "content": { "zh": "外向", "en": "Extraversion" }, "weight": { "E": 3 } },
    { "content": { "zh": "内向", "en": "Introversion" }, "weight": { "I": 3 } }
  ]
}
```

### 3.5 常见错误检查清单

- [ ] 所有题目都有 `id`, `dimension`, `content`, `options`
- [ ] 所有选项都有 `id`, `content`, `weight`
- [ ] `content` 同时包含 `zh` 和 `en`
- [ ] `weight` 的 key 与 `manifest.json` 中的 `dimensions` 匹配
- [ ] 题目 ID 唯一，不重复
- [ ] 选项 ID 唯一，不重复
- [ ] `meta.totalQuestions` 等于 `questions` 数组长度
- [ ] `types.json` 中的类型 ID 唯一
- [ ] 颜色使用 6 位十六进制格式 `#RRGGBB`

---

## 四、快速开始模板

### 创建新套件的最小文件

```
configs/suites/new-quiz/
├── manifest.json     # 必须：至少包含 id, name, dimensions, settings, scoring
├── questions.json    # 必须：至少包含 questions 和 meta
├── types.json        # 可选：如果是分类型测试
└── theme.json        # 可选：使用默认主题
```

### 最简 manifest.json

```json
{
  "id": "new-quiz",
  "name": { "zh": "新测试", "en": "New Quiz" },
  "dimensions": ["D1", "D2"],
  "settings": {
    "allowBack": true,
    "showTimer": false,
    "requiredAnswer": true
  },
  "scoring": {
    "type": "dimension",
    "dimensions": ["D1", "D2"],
    "calculateMethod": "difference",
    "normalizeOutput": true
  }
}
```

### 最简 questions.json

```json
{
  "questions": [
    {
      "id": "q001",
      "dimension": "D1",
      "content": {
        "zh": "问题内容",
        "en": "Question content"
      },
      "options": [
        {
          "id": "opt_1a",
          "content": { "zh": "选项A", "en": "Option A" },
          "weight": { "D1": 3 }
        },
        {
          "id": "opt_1b",
          "content": { "zh": "选项B", "en": "Option B" },
          "weight": { "D1": 0 }
        }
      ]
    }
  ],
  "meta": {
    "totalQuestions": 1,
    "timeEstimate": 60
  }
}
```

---

## 五、相关资源

- [套件架构设计文档](docs/design/suite-architecture.md)
- [类型定义文件](apps/web/lib/types/suite.ts)
