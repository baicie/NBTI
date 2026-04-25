# themes.json

主题样式配置文件，定义颜色、字体、圆角、阴影等视觉样式。

## 文件位置

```
suites/{suite-id}/themes.json
```

## 完整示例

```json
{
  "defaultTheme": "default",
  "themes": {
    "default": {
      "name": { "zh": "默认主题", "en": "Default Theme" },
      "extends": null,
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
        "success": "#22c55e",
        "successForeground": "#ffffff",
        "warning": "#f59e0b",
        "warningForeground": "#ffffff",
        "border": "#e2e8f0",
        "input": "#e2e8f0",
        "ring": "#6366f1",
        "card": "#ffffff",
        "cardForeground": "#1e293b",
        "popover": "#ffffff",
        "popoverForeground": "#1e293b"
      },
      "font": {
        "heading": "Inter",
        "body": "Inter",
        "mono": "JetBrains Mono",
        "fallback": ["system-ui", "-apple-system", "sans-serif"]
      },
      "borderRadius": {
        "none": 0,
        "sm": 4,
        "md": 8,
        "lg": 12,
        "xl": 16,
        "2xl": 24,
        "3xl": 32,
        "full": 9999
      },
      "shadows": {
        "none": "none",
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
      },
      "spacing": {
        "unit": 4,
        "scale": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
      "animation": {
        "duration": {
          "fast": 150,
          "normal": 300,
          "slow": 500
        },
        "easing": {
          "default": "cubic-bezier(0.4, 0, 0.2, 1)",
          "in": "cubic-bezier(0.4, 0, 1, 1)",
          "out": "cubic-bezier(0, 0, 0.2, 1)",
          "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
        }
      }
    },
    "dark": {
      "name": { "zh": "深色主题", "en": "Dark Theme" },
      "extends": "default",
      "colors": {
        "primary": "#818cf8",
        "primaryForeground": "#1e1b4b",
        "secondary": "#a78bfa",
        "secondaryForeground": "#1e1b4b",
        "background": "#0f172a",
        "foreground": "#f1f5f9",
        "muted": "#1e293b",
        "mutedForeground": "#94a3b8",
        "accent": "#1e293b",
        "accentForeground": "#f1f5f9",
        "destructive": "#dc2626",
        "destructiveForeground": "#ffffff",
        "success": "#16a34a",
        "successForeground": "#ffffff",
        "warning": "#d97706",
        "warningForeground": "#ffffff",
        "border": "#334155",
        "input": "#334155",
        "ring": "#818cf8",
        "card": "#1e293b",
        "cardForeground": "#f1f5f9",
        "popover": "#1e293b",
        "popoverForeground": "#f1f5f9"
      }
    }
  }
}
```

## 字段说明

### 顶层字段

| 字段           | 类型   | 必填 | 说明                  |
| -------------- | ------ | ---- | --------------------- |
| `defaultTheme` | string | 否   | 默认主题 ID           |
| `themes`       | object | 是   | 主题字典，键为主题 ID |

### themes.{id}

每个主题的配置。

| 字段           | 类型            | 必填 | 说明                              |
| -------------- | --------------- | ---- | --------------------------------- |
| `name`         | LocalizedString | 是   | 主题名称                          |
| `extends`      | string \| null  | 否   | 继承的主题 ID，继承的属性可被覆盖 |
| `colors`       | object          | 是   | 颜色配置                          |
| `font`         | object          | 否   | 字体配置                          |
| `borderRadius` | object          | 否   | 圆角配置                          |
| `shadows`      | object          | 否   | 阴影配置                          |
| `spacing`      | object          | 否   | 间距配置                          |
| `animation`    | object          | 否   | 动画配置                          |

### colors

颜色配置，使用 Tailwind CSS 的颜色命名规范。

| 字段                    | 类型   | 必填 | 说明                   |
| ----------------------- | ------ | ---- | ---------------------- |
| `primary`               | string | 是   | 主色                   |
| `primaryForeground`     | string | 是   | 主色前景色（文字颜色） |
| `secondary`             | string | 否   | 次要色                 |
| `secondaryForeground`   | string | 否   | 次要色前景色           |
| `background`            | string | 是   | 背景色                 |
| `foreground`            | string | 是   | 前景色（文字颜色）     |
| `muted`                 | string | 否   | 静音色                 |
| `mutedForeground`       | string | 否   | 静音色前景色           |
| `accent`                | string | 否   | 强调色                 |
| `accentForeground`      | string | 否   | 强调色前景色           |
| `destructive`           | string | 否   | 危险/错误色            |
| `destructiveForeground` | string | 否   | 危险色前景色           |
| `success`               | string | 否   | 成功色                 |
| `successForeground`     | string | 否   | 成功色前景色           |
| `warning`               | string | 否   | 警告色                 |
| `warningForeground`     | string | 否   | 警告色前景色           |
| `border`                | string | 否   | 边框色                 |
| `input`                 | string | 否   | 输入框色               |
| `ring`                  | string | 否   | 聚焦环色               |
| `card`                  | string | 否   | 卡片色                 |
| `cardForeground`        | string | 否   | 卡片前景色             |
| `popover`               | string | 否   | 弹出层色               |
| `popoverForeground`     | string | 否   | 弹出层前景色           |

### font

字体配置。

| 字段       | 类型     | 说明         |
| ---------- | -------- | ------------ |
| `heading`  | string   | 标题字体     |
| `body`     | string   | 正文字体     |
| `mono`     | string   | 等宽字体     |
| `fallback` | string[] | 字体回退列表 |

### borderRadius

圆角配置（以像素为单位）。

| 字段   | 默认值 | 说明           |
| ------ | ------ | -------------- |
| `none` | 0      | 无圆角         |
| `sm`   | 4      | 小圆角         |
| `md`   | 8      | 中等圆角       |
| `lg`   | 12     | 大圆角         |
| `xl`   | 16     | 特大圆角       |
| `2xl`  | 24     | 2 倍大圆角     |
| `3xl`  | 32     | 3 倍大圆角     |
| `full` | 9999   | 全圆角（圆形） |

### shadows

阴影配置（CSS box-shadow 值）。

| 字段   | 说明     |
| ------ | -------- |
| `none` | 无阴影   |
| `sm`   | 小阴影   |
| `md`   | 中等阴影 |
| `lg`   | 大阴影   |
| `xl`   | 特大阴影 |

### animation

动画配置。

| 字段              | 类型   | 说明                         |
| ----------------- | ------ | ---------------------------- |
| `duration`        | object | 动画持续时间（毫秒）         |
| `duration.fast`   | number | 快，默认为 150               |
| `duration.normal` | number | 正常，默认为 300             |
| `duration.slow`   | number | 慢，默认为 500               |
| `easing`          | object | 缓动函数（CSS cubic-bezier） |
| `easing.default`  | string | 默认缓动                     |
| `easing.in`       | string | 进入缓动                     |
| `easing.out`      | string | 退出缓动                     |
| `easing.bounce`   | string | 弹跳缓动                     |

## 验证规则

- `themes` 是一个对象，键必须符合格式：`^[a-z0-9-]+$`
- `themes.{id}.colors` 必须包含 `primary`、`background`、`foreground`
- 所有颜色值必须符合格式：`^#[0-9A-Fa-f]{6}$` 或 `^#[0-9A-Fa-f]{8}$`

## 主题继承

使用 `extends` 可以继承其他主题的配置，只覆盖需要修改的属性：

```json
{
  "themes": {
    "my-custom": {
      "name": { "zh": "我的自定义主题", "en": "My Custom Theme" },
      "extends": "default",
      "colors": {
        "primary": "#ec4899",
        "primaryForeground": "#ffffff"
      }
    }
  }
}
```

## 下一步

- 查看 [templates.json](./templates)
- 查看 [完整 Schema](/schemas/themes.schema.json)
