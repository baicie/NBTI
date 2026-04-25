# NBTI 数据协议 JSON Schema 定义

本文档提供 NBTI 框架所有配置文件的 JSON Schema，用于校验配置文件的结构完整性和数据类型正确性。

---

## 一、Schema 文件结构

```
schemas/
├── manifest.schema.json      # 测试包元信息 Schema
├── questions.schema.json     # 题库数据 Schema
├── types.schema.json         # 结果类型定义 Schema
├── templates.schema.json     # 结果图模板 Schema
├── themes.schema.json        # 主题样式 Schema
├── i18n.schema.json          # 国际化 Schema
└── index.schema.json         # 统一入口 Schema
```

---

## 二、manifest.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/manifest.schema.json",
  "title": "NBTI Test Package Manifest",
  "description": "测试包的元信息配置文件",
  "type": "object",
  "required": ["id", "name", "version", "config"],
  "additionalProperties": true,
  "properties": {
    "id": {
      "type": "string",
      "description": "测试包唯一标识符",
      "pattern": "^[a-z0-9-]+$",
      "examples": ["nbti-mbti-2024", "my-custom-test"]
    },
    "name": {
      "$ref": "#/definitions/localizedString",
      "description": "测试包显示名称"
    },
    "version": {
      "type": "string",
      "description": "语义化版本号",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "examples": ["1.0.0", "0.1.0-beta"]
    },
    "description": {
      "$ref": "#/definitions/localizedString",
      "description": "测试包详细描述"
    },
    "author": {
      "type": "string",
      "description": "作者名称",
      "examples": ["NBTI Team", "John Doe"]
    },
    "thumbnail": {
      "type": "string",
      "format": "uri",
      "description": "封面图片 URL"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "标签列表，用于分类和搜索",
      "examples": [["personality", "mbri", "career"]]
    },
    "config": {
      "type": "object",
      "description": "配置文件路径映射",
      "required": ["questions", "types"],
      "properties": {
        "questions": {
          "type": "string",
          "description": "题库文件路径（相对于包根目录）",
          "default": "questions.json"
        },
        "types": {
          "type": "string",
          "description": "结果类型文件路径",
          "default": "types.json"
        },
        "templates": {
          "type": "string",
          "description": "结果图模板文件路径",
          "default": "templates.json"
        },
        "themes": {
          "type": "string",
          "description": "主题配置文件路径",
          "default": "themes.json"
        },
        "i18n": {
          "type": "string",
          "description": "国际化文件夹路径"
        }
      }
    },
    "settings": {
      "type": "object",
      "description": "测试行为设置",
      "properties": {
        "allowBack": {
          "type": "boolean",
          "description": "是否允许返回上一题",
          "default": true
        },
        "showTimer": {
          "type": "boolean",
          "description": "是否显示计时器",
          "default": false
        },
        "shuffleQuestions": {
          "type": "boolean",
          "description": "是否随机打乱题目顺序",
          "default": false
        },
        "shuffleOptions": {
          "type": "boolean",
          "description": "是否随机打乱选项顺序",
          "default": false
        },
        "requiredAnswer": {
          "type": "boolean",
          "description": "是否必须回答才能继续",
          "default": true
        },
        "maxDuration": {
          "type": ["integer", "null"],
          "description": "最大测试时长（秒），null 表示不限时",
          "minimum": 60,
          "examples": [null, 600, 1800]
        }
      }
    },
    "scoring": {
      "type": "object",
      "description": "计分配置",
      "required": ["type", "dimensions"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["dimension", "percentage", "weighted-sum"],
          "description": "计分类型：dimension=维度差值法，percentage=百分比法，weighted-sum=加权求和法"
        },
        "dimensions": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[A-Z]{2}$"
          },
          "description": "维度列表，每项为两个大写字母",
          "examples": [["EI", "NS", "TF", "JP"], ["OCEAN"]]
        },
        "calculateMethod": {
          "type": "string",
          "enum": ["difference", "ratio", "absolute"],
          "description": "计算方法：difference=差值，ratio=比值，absolute=绝对值",
          "default": "difference"
        },
        "normalizeOutput": {
          "type": "boolean",
          "description": "是否归一化输出到 0-100",
          "default": true
        }
      }
    }
  },
  "definitions": {
    "localizedString": {
      "type": "object",
      "description": "本地化字符串，支持多语言",
      "additionalProperties": {
        "type": "string",
        "minLength": 1
      },
      "examples": [{ "zh": "性格测试", "en": "Personality Test" }]
    }
  }
}
```

---

## 三、questions.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/questions.schema.json",
  "title": "NBTI Questions Data",
  "description": "题库数据配置文件",
  "type": "object",
  "required": ["meta", "questions"],
  "additionalProperties": true,
  "properties": {
    "meta": {
      "type": "object",
      "description": "题库元信息",
      "properties": {
        "totalQuestions": {
          "type": "integer",
          "description": "题目总数",
          "minimum": 1,
          "maximum": 500
        },
        "timeEstimate": {
          "type": "integer",
          "description": "预估完成时间（秒）",
          "minimum": 30,
          "examples": [180, 300, 600]
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" },
          "description": "题库标签"
        },
        "description": {
          "$ref": "manifest.schema.json#/definitions/localizedString"
        }
      }
    },
    "dimensions": {
      "type": "array",
      "description": "维度定义列表",
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[A-Z]{2}$",
            "description": "维度 ID，如 EI、NS"
          },
          "name": {
            "$ref": "manifest.schema.json#/definitions/localizedString"
          },
          "description": {
            "$ref": "manifest.schema.json#/definitions/localizedString"
          },
          "leftLabel": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "左侧标签（第一个字母）"
          },
          "rightLabel": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "右侧标签（第二个字母）"
          }
        }
      }
    },
    "categories": {
      "type": "array",
      "description": "题目分类（可选）",
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[a-z0-9-]+$"
          },
          "name": {
            "$ref": "manifest.schema.json#/definitions/localizedString"
          },
          "description": {
            "$ref": "manifest.schema.json#/definitions/localizedString"
          },
          "questionIds": {
            "type": "array",
            "items": { "type": "string" },
            "description": "该分类下的题目 ID 列表"
          }
        }
      }
    },
    "questions": {
      "type": "array",
      "description": "题目列表",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "dimension", "content", "options"],
        "properties": {
          "id": {
            "type": "string",
            "description": "题目唯一标识符",
            "pattern": "^q\\d{3,}$",
            "examples": ["q001", "q002", "question_01"]
          },
          "dimension": {
            "type": "string",
            "description": "所属维度 ID",
            "examples": ["EI", "NS", "TF", "JP"]
          },
          "category": {
            "type": "string",
            "description": "题目分类 ID（可选）"
          },
          "content": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "题目内容"
          },
          "image": {
            "type": ["string", "null"],
            "format": "uri",
            "description": "题目配图 URL（可选）"
          },
          "isReverse": {
            "type": "boolean",
            "description": "是否反向计分",
            "default": false
          },
          "required": {
            "type": "boolean",
            "description": "是否必答题",
            "default": true
          },
          "options": {
            "type": "array",
            "description": "选项列表",
            "minItems": 2,
            "maxItems": 6,
            "items": {
              "type": "object",
              "required": ["id", "content", "weight"],
              "properties": {
                "id": {
                  "type": "string",
                  "description": "选项唯一标识符",
                  "pattern": "^opt_[a-z0-9]+$"
                },
                "content": {
                  "$ref": "manifest.schema.json#/definitions/localizedString",
                  "description": "选项内容"
                },
                "image": {
                  "type": ["string", "null"],
                  "format": "uri",
                  "description": "选项配图（可选）"
                },
                "weight": {
                  "type": "object",
                  "description": "选项权重，键为维度字母，值为权重值",
                  "patternProperties": {
                    "^[A-Z]$": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 10
                    }
                  },
                  "examples": [
                    { "E": 3, "I": 0 },
                    { "E": 2, "I": 1 },
                    { "T": 2, "F": 1 }
                  ]
                },
                "tooltip": {
                  "$ref": "manifest.schema.json#/definitions/localizedString",
                  "description": "选项悬停提示（可选）"
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

---

## 四、types.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/types.schema.json",
  "title": "NBTI Personality Types",
  "description": "结果类型定义配置文件",
  "type": "object",
  "required": ["types"],
  "additionalProperties": true,
  "properties": {
    "meta": {
      "type": "object",
      "description": "元信息",
      "properties": {
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "lastUpdated": {
          "type": "string",
          "format": "date-time"
        }
      }
    },
    "dimensions": {
      "type": "array",
      "description": "维度定义（可选，用于补充 manifest 中的维度信息）",
      "items": {
        "type": "object",
        "required": ["id", "left", "right"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[A-Z]{2}$"
          },
          "name": {
            "$ref": "manifest.schema.json#/definitions/localizedString"
          },
          "left": {
            "type": "object",
            "required": ["letter", "name"],
            "properties": {
              "letter": {
                "type": "string",
                "pattern": "^[A-Z]$",
                "description": "左侧字母"
              },
              "name": {
                "$ref": "manifest.schema.json#/definitions/localizedString"
              },
              "description": {
                "$ref": "manifest.schema.json#/definitions/localizedString"
              }
            }
          },
          "right": {
            "type": "object",
            "required": ["letter", "name"],
            "properties": {
              "letter": {
                "type": "string",
                "pattern": "^[A-Z]$"
              },
              "name": {
                "$ref": "manifest.schema.json#/definitions/localizedString"
              },
              "description": {
                "$ref": "manifest.schema.json#/definitions/localizedString"
              }
            }
          }
        }
      }
    },
    "types": {
      "type": "array",
      "description": "人格类型列表",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": {
            "type": "string",
            "description": "类型代码",
            "pattern": "^[A-Z]{2,6}$",
            "examples": ["INTJ", "ENFP", "ISTP"]
          },
          "name": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "类型名称（如：建筑师、冒险家）"
          },
          "subtitle": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "类型副标题/描述语"
          },
          "description": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "详细描述"
          },
          "icon": {
            "type": "string",
            "description": "图标名称（lucide-react 图标名）",
            "examples": ["brain", "target", "compass"]
          },
          "color": {
            "type": "string",
            "description": "类型主题色（用于结果图）",
            "pattern": "^#[0-9A-Fa-f]{6}$",
            "examples": ["#667eea", "#764ba2"]
          },
          "traits": {
            "type": "array",
            "description": "特质列表",
            "items": {
              "type": "object",
              "required": ["id", "name", "level"],
              "properties": {
                "id": {
                  "type": "string",
                  "pattern": "^[a-z0-9-]+$"
                },
                "name": {
                  "$ref": "manifest.schema.json#/definitions/localizedString"
                },
                "icon": {
                  "type": "string",
                  "description": "特质图标"
                },
                "level": {
                  "type": "integer",
                  "description": "特质强度（1-100）",
                  "minimum": 1,
                  "maximum": 100
                },
                "description": {
                  "$ref": "manifest.schema.json#/definitions/localizedString"
                }
              }
            }
          },
          "strengths": {
            "type": "array",
            "description": "优势列表",
            "items": {
              "$ref": "manifest.schema.json#/definitions/localizedString"
            },
            "minItems": 1,
            "maxItems": 10
          },
          "weaknesses": {
            "type": "array",
            "description": "劣势/成长空间列表",
            "items": {
              "$ref": "manifest.schema.json#/definitions/localizedString"
            },
            "minItems": 1,
            "maxItems": 10
          },
          "compatibleTypes": {
            "type": "array",
            "description": "兼容类型列表",
            "items": {
              "type": "string",
              "pattern": "^[A-Z]{2,6}$"
            },
            "examples": [
              ["ENFP", "ENTP"],
              ["INFJ", "INFP"]
            ]
          },
          "incompatibleTypes": {
            "type": "array",
            "description": "不兼容类型列表（可选）",
            "items": {
              "type": "string",
              "pattern": "^[A-Z]{2,6}$"
            }
          },
          "careers": {
            "type": "array",
            "description": "适合职业",
            "items": {
              "$ref": "manifest.schema.json#/definitions/localizedString"
            },
            "maxItems": 10
          },
          "relationships": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "人际关系描述"
          },
          "workStyle": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "工作风格描述"
          },
          "communicationStyle": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "沟通风格描述"
          },
          "famousPeople": {
            "type": "array",
            "description": "名人/榜样",
            "items": {
              "type": "string"
            },
            "maxItems": 10
          },
          "quotes": {
            "type": "array",
            "description": "名言（可选）",
            "items": {
              "type": "object",
              "properties": {
                "text": { "type": "string" },
                "author": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 五、templates.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/templates.schema.json",
  "title": "NBTI Share Card Templates",
  "description": "结果图模板配置文件",
  "type": "object",
  "required": ["templates"],
  "additionalProperties": true,
  "properties": {
    "defaultTemplate": {
      "type": "string",
      "description": "默认模板 ID"
    },
    "templates": {
      "type": "array",
      "description": "模板列表",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "name", "dimensions", "elements"],
        "properties": {
          "id": {
            "type": "string",
            "description": "模板唯一标识符",
            "pattern": "^[a-z0-9-]+$"
          },
          "name": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "模板名称"
          },
          "thumbnail": {
            "type": ["string", "null"],
            "format": "uri",
            "description": "模板缩略图"
          },
          "description": {
            "$ref": "manifest.schema.json#/definitions/localizedString",
            "description": "模板描述"
          },
          "dimensions": {
            "type": "object",
            "required": ["width", "height"],
            "properties": {
              "width": {
                "type": "integer",
                "minimum": 400,
                "maximum": 3840,
                "description": "宽度（像素）",
                "examples": [1080, 1200]
              },
              "height": {
                "type": "integer",
                "minimum": 400,
                "maximum": 3840,
                "description": "高度（像素）",
                "examples": [1080, 1920]
              },
              "unit": {
                "type": "string",
                "enum": ["px"],
                "default": "px"
              }
            }
          },
          "background": {
            "type": "object",
            "required": ["type", "value"],
            "properties": {
              "type": {
                "type": "string",
                "enum": ["color", "gradient", "image"],
                "description": "背景类型"
              },
              "value": {
                "oneOf": [
                  {
                    "type": "string",
                    "description": "单色时为颜色值"
                  },
                  {
                    "type": "array",
                    "description": "渐变时为色标列表",
                    "items": {
                      "type": "object",
                      "required": ["color", "position"],
                      "properties": {
                        "color": {
                          "type": "string",
                          "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                        },
                        "position": {
                          "type": "number",
                          "minimum": 0,
                          "maximum": 100
                        }
                      }
                    }
                  },
                  {
                    "type": "string",
                    "format": "uri",
                    "description": "图片 URL"
                  }
                ]
              },
              "direction": {
                "type": "string",
                "description": "渐变方向",
                "enum": ["0deg", "45deg", "90deg", "135deg", "180deg"],
                "default": "135deg"
              },
              "overlay": {
                "type": "object",
                "description": "背景叠加层（可选）",
                "properties": {
                  "color": { "type": "string" },
                  "opacity": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1
                  }
                }
              }
            }
          },
          "elements": {
            "type": "array",
            "description": "模板元素列表",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": ["id", "type", "position"],
              "properties": {
                "id": {
                  "type": "string",
                  "description": "元素唯一标识符"
                },
                "type": {
                  "type": "string",
                  "enum": [
                    "text",
                    "shape",
                    "image",
                    "qrcode",
                    "radar",
                    "trait-badges",
                    "dimension-bar",
                    "divider"
                  ],
                  "description": "元素类型"
                },
                "position": {
                  "oneOf": [
                    {
                      "type": "object",
                      "description": "固定位置",
                      "properties": {
                        "x": {
                          "oneOf": [
                            { "type": "number" },
                            { "type": "string", "pattern": "^\\d+%$" }
                          ]
                        },
                        "y": {
                          "oneOf": [
                            { "type": "number" },
                            { "type": "string", "pattern": "^\\d+%$" }
                          ]
                        }
                      }
                    },
                    {
                      "type": "string",
                      "description": "预设位置",
                      "enum": ["center", "top", "bottom", "left", "right"]
                    }
                  ]
                },
                "size": {
                  "type": "object",
                  "description": "元素尺寸",
                  "properties": {
                    "width": { "type": "number" },
                    "height": { "type": "number" },
                    "unit": {
                      "type": "string",
                      "enum": ["px", "%"],
                      "default": "px"
                    }
                  }
                },
                "content": {
                  "oneOf": [
                    { "type": "string" },
                    {
                      "type": "object",
                      "$ref": "manifest.schema.json#/definitions/localizedString"
                    }
                  ],
                  "description": "文本内容，支持模板变量插值"
                },
                "image": {
                  "type": ["string", "null"],
                  "format": "uri",
                  "description": "图片 URL（type=image 时）"
                },
                "shape": {
                  "type": "string",
                  "enum": [
                    "circle",
                    "rectangle",
                    "line",
                    "triangle",
                    "polygon"
                  ],
                  "description": "形状类型（type=shape 时）"
                },
                "layout": {
                  "type": "string",
                  "enum": ["horizontal", "vertical", "grid", "flow"],
                  "description": "布局方式"
                },
                "spacing": {
                  "type": "number",
                  "description": "元素间距（像素）",
                  "default": 8
                },
                "style": {
                  "type": "object",
                  "description": "样式配置",
                  "properties": {
                    "fontSize": {
                      "type": "number",
                      "minimum": 10,
                      "maximum": 200,
                      "examples": [24, 48, 72, 120]
                    },
                    "fontWeight": {
                      "oneOf": [
                        { "type": "number" },
                        {
                          "type": "string",
                          "enum": ["normal", "bold", "lighter", "bolder"]
                        }
                      ],
                      "default": 400
                    },
                    "fontFamily": {
                      "type": "string",
                      "default": "Inter"
                    },
                    "fontStyle": {
                      "type": "string",
                      "enum": ["normal", "italic"]
                    },
                    "color": {
                      "type": "string",
                      "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$|^rgba?\\("
                    },
                    "textAlign": {
                      "type": "string",
                      "enum": ["left", "center", "right"]
                    },
                    "textAlignVertical": {
                      "type": "string",
                      "enum": ["top", "center", "bottom"]
                    },
                    "backgroundColor": {
                      "type": "string"
                    },
                    "borderRadius": {
                      "oneOf": [{ "type": "number" }, { "type": "string" }]
                    },
                    "border": {
                      "type": "string",
                      "description": "边框样式",
                      "examples": ["1px solid #fff", "2px dashed #000"]
                    },
                    "padding": {
                      "oneOf": [{ "type": "number" }, { "type": "object" }]
                    },
                    "margin": {
                      "oneOf": [{ "type": "number" }, { "type": "object" }]
                    },
                    "opacity": {
                      "type": "number",
                      "minimum": 0,
                      "maximum": 1
                    },
                    "textShadow": {
                      "type": "string"
                    },
                    "boxShadow": {
                      "type": "string"
                    },
                    "lineHeight": {
                      "oneOf": [{ "type": "number" }, { "type": "string" }]
                    },
                    "letterSpacing": {
                      "type": "number"
                    },
                    "lineColor": {
                      "type": "string"
                    },
                    "lineWidth": {
                      "type": "number"
                    },
                    "fillColor": {
                      "type": "string"
                    },
                    "gridColumns": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 5
                    }
                  }
                },
                "animation": {
                  "type": "object",
                  "description": "动画配置（可选）",
                  "properties": {
                    "type": {
                      "type": "string",
                      "enum": ["fadeIn", "slideUp", "scale", "none"],
                      "default": "fadeIn"
                    },
                    "delay": {
                      "type": "number",
                      "description": "延迟时间（毫秒）",
                      "minimum": 0,
                      "default": 0
                    },
                    "duration": {
                      "type": "number",
                      "description": "动画持续时间（毫秒）",
                      "minimum": 0,
                      "default": 300
                    }
                  }
                },
                "visible": {
                  "type": "boolean",
                  "description": "是否显示",
                  "default": true
                },
                "responsive": {
                  "type": "object",
                  "description": "响应式配置（可选）",
                  "properties": {
                    "mobile": {
                      "type": "object",
                      "description": "移动端配置"
                    },
                    "tablet": {
                      "type": "object",
                      "description": "平板端配置"
                    }
                  }
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

---

## 六、themes.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/themes.schema.json",
  "title": "NBTI Theme Configuration",
  "description": "主题样式配置文件",
  "type": "object",
  "required": ["themes"],
  "additionalProperties": true,
  "properties": {
    "defaultTheme": {
      "type": "string",
      "description": "默认主题 ID"
    },
    "themes": {
      "type": "object",
      "description": "主题列表",
      "patternProperties": {
        "^[a-z0-9-]+$": {
          "type": "object",
          "required": ["name", "colors"],
          "properties": {
            "name": {
              "$ref": "manifest.schema.json#/definitions/localizedString",
              "description": "主题名称"
            },
            "extends": {
              "type": "string",
              "description": "继承的主题 ID（可选）"
            },
            "colors": {
              "type": "object",
              "required": ["primary", "background", "foreground"],
              "properties": {
                "primary": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "primaryForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "secondary": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "secondaryForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "background": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "foreground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "muted": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "mutedForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "accent": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "accentForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "destructive": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "destructiveForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "success": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "successForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "warning": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "warningForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "border": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "input": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "ring": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "card": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "cardForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "popover": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                },
                "popoverForeground": {
                  "type": "string",
                  "pattern": "^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$"
                }
              }
            },
            "font": {
              "type": "object",
              "properties": {
                "heading": {
                  "type": "string",
                  "description": "标题字体"
                },
                "body": {
                  "type": "string",
                  "description": "正文字体"
                },
                "mono": {
                  "type": "string",
                  "description": "等宽字体（可选）"
                },
                "fallback": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              }
            },
            "borderRadius": {
              "type": "object",
              "properties": {
                "none": { "type": "number", "default": 0 },
                "sm": { "type": "number", "default": 4 },
                "md": { "type": "number", "default": 8 },
                "lg": { "type": "number", "default": 12 },
                "xl": { "type": "number", "default": 16 },
                "2xl": { "type": "number", "default": 24 },
                "3xl": { "type": "number", "default": 32 },
                "full": { "type": "number", "default": 9999 }
              }
            },
            "shadows": {
              "type": "object",
              "properties": {
                "none": { "type": "string" },
                "sm": { "type": "string" },
                "md": { "type": "string" },
                "lg": { "type": "string" },
                "xl": { "type": "string" }
              }
            },
            "spacing": {
              "type": "object",
              "properties": {
                "unit": { "type": "number", "default": 4 },
                "scale": {
                  "type": "array",
                  "items": { "type": "number" }
                }
              }
            },
            "animation": {
              "type": "object",
              "properties": {
                "duration": {
                  "type": "object",
                  "properties": {
                    "fast": { "type": "number", "default": 150 },
                    "normal": { "type": "number", "default": 300 },
                    "slow": { "type": "number", "default": 500 }
                  }
                },
                "easing": {
                  "type": "object",
                  "properties": {
                    "default": {
                      "type": "string",
                      "default": "cubic-bezier(0.4, 0, 0.2, 1)"
                    },
                    "in": { "type": "string" },
                    "out": { "type": "string" },
                    "bounce": { "type": "string" }
                  }
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

---

## 七、i18n 翻译文件 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/i18n.schema.json",
  "title": "NBTI Internationalization",
  "description": "国际化翻译文件",
  "type": "object",
  "additionalProperties": {
    "oneOf": [{ "type": "string" }, { "type": "object" }]
  },
  "definitions": {
    "translationNode": {
      "oneOf": [
        { "type": "string" },
        {
          "type": "object",
          "additionalProperties": { "$ref": "#/definitions/translationNode" }
        }
      ]
    }
  }
}
```

### 翻译文件结构示例

```json
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
    "retry": "重试",
    "close": "关闭",
    "confirm": "确认",
    "cancel": "取消"
  },
  "test": {
    "welcome": {
      "title": "欢迎参与测试",
      "description": "这个测试将帮助你了解自己的性格特点",
      "estimatedTime": "预计用时 {minutes} 分钟",
      "questionCount": "共 {count} 道题"
    },
    "progress": {
      "current": "第 {current} 题",
      "total": "共 {total} 题",
      "percentage": "{percent}% 完成"
    },
    "question": {
      "selectOption": "请选择最符合你的选项",
      "requiredAnswer": "请先选择一个选项",
      "imageAlt": "题目配图"
    },
    "timer": {
      "remaining": "剩余时间",
      "warning": "时间不多啦！",
      "timeUp": "时间到！"
    },
    "complete": {
      "title": "恭喜完成！",
      "message": "正在计算你的结果...",
      "redirect": "即将跳转到结果页"
    }
  },
  "result": {
    "yourType": "你的性格类型",
    "typeLabel": "类型",
    "viewDetails": "查看详细分析",
    "traitAnalysis": "特质分析",
    "strengths": "你的优势",
    "weaknesses": "成长空间",
    "compatibleTypes": "最佳匹配",
    "careerSuggestions": "适合的职业",
    "share": {
      "title": "我的 NBTI 测试结果是 {type}",
      "text": "我是 {type}（{name}），{subtitle}",
      "button": "分享结果"
    },
    "export": {
      "button": "保存图片",
      "selectTemplate": "选择模板",
      "generating": "正在生成图片...",
      "success": "图片已保存",
      "error": "生成失败，请重试"
    },
    "dimension": {
      "EI": "外向 — 内向",
      "NS": "直觉 — 实感",
      "TF": "思考 — 情感",
      "JP": "判断 — 知觉"
    }
  },
  "errors": {
    "loadConfigFailed": "加载配置失败，请检查网络后重试",
    "loadQuestionsFailed": "加载题目失败",
    "submitFailed": "提交失败，请重试",
    "imageGenerateFailed": "图片生成失败，请重试",
    "invalidConfig": "配置文件格式错误",
    "networkError": "网络连接失败"
  },
  "footer": {
    "poweredBy": "由 NBTI 提供支持",
    "privacyPolicy": "隐私政策",
    "termsOfService": "服务条款"
  }
}
```

---

## 八、统一入口 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nbti.app/schemas/index.schema.json",
  "title": "NBTI Schema Index",
  "description": "NBTI 框架所有 Schema 的统一入口",
  "definitions": {
    "manifest": { "$ref": "manifest.schema.json" },
    "questions": { "$ref": "questions.schema.json" },
    "types": { "$ref": "types.schema.json" },
    "templates": { "$ref": "templates.schema.json" },
    "themes": { "$ref": "themes.schema.json" },
    "i18n": { "$ref": "i18n.schema.json" }
  }
}
```

---

## 九、校验工具使用示例

### 安装依赖

```bash
npm install zod ajv
```

### 代码示例

```typescript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { z } from 'zod'

// 加载 Schema
import manifestSchema from './schemas/manifest.schema.json'
import questionsSchema from './schemas/questions.schema.json'
import templatesSchema from './schemas/templates.schema.json'
import themesSchema from './schemas/themes.schema.json'
import typesSchema from './schemas/types.schema.json'

// 创建 Ajv 实例
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// 编译验证函数
const validateManifest = ajv.compile(manifestSchema)
const validateQuestions = ajv.compile(questionsSchema)
const validateTypes = ajv.compile(typesSchema)
const validateTemplates = ajv.compile(templatesSchema)
const validateThemes = ajv.compile(themesSchema)

// 使用示例
function validateConfig(config: unknown) {
  const errors: string[] = []

  if (!validateManifest(config.manifest)) {
    errors.push(`Manifest: ${JSON.stringify(validateManifest.errors)}`)
  }

  if (!validateQuestions(config.questions)) {
    errors.push(`Questions: ${JSON.stringify(validateQuestions.errors)}`)
  }

  if (!validateTypes(config.types)) {
    errors.push(`Types: ${JSON.stringify(validateTypes.errors)}`)
  }

  if (!validateTemplates(config.templates)) {
    errors.push(`Templates: ${JSON.stringify(validateTemplates.errors)}`)
  }

  if (!validateThemes(config.themes)) {
    errors.push(`Themes: ${JSON.stringify(validateThemes.errors)}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### CLI 验证

```bash
# 使用 ajv-cli
npx ajv validate -s ./schemas/manifest.schema.json -d ./data/manifest.json --spec=draft7
npx ajv validate -s ./schemas/questions.schema.json -d ./data/questions.json --spec=draft7
```

---

## 十、VS Code JSON Schema 配置

```jsonc
// .vscode/settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["manifest.json"],
      "url": "./schemas/manifest.schema.json",
    },
    {
      "fileMatch": ["questions.json"],
      "url": "./schemas/questions.schema.json",
    },
    {
      "fileMatch": ["types.json"],
      "url": "./schemas/types.schema.json",
    },
    {
      "fileMatch": ["templates.json"],
      "url": "./schemas/templates.schema.json",
    },
    {
      "fileMatch": ["themes.json"],
      "url": "./schemas/themes.schema.json",
    },
  ],
}
```

---

## 附录 A：必填字段速查

| Schema           | 必填字段                          |
| ---------------- | --------------------------------- |
| `manifest.json`  | `id`, `name`, `version`, `config` |
| `questions.json` | `meta`, `questions`               |
| `types.json`     | `types`                           |
| `templates.json` | `templates`                       |
| `themes.json`    | `themes`                          |
| `i18n/*.json`    | 无（层级结构自由定义）            |

## 附录 B：类型速查

| Schema           | 核心类型                                       |
| ---------------- | ---------------------------------------------- |
| `manifest.json`  | `LocalizedString`, `ScoringConfig`, `Settings` |
| `questions.json` | `Question`, `Option`, `Dimension`, `Weight`    |
| `types.json`     | `PersonalityType`, `Trait`, `LocalizedString`  |
| `templates.json` | `Template`, `Element`, `Position`, `Style`     |
| `themes.json`    | `Theme`, `Colors`, `Font`, `BorderRadius`      |

---

_Schema 版本：1.0_
_最后更新：2026-04-10_
