# templates.json

结果图模板配置文件，定义分享卡/结果图的布局、背景和元素。

## 文件位置

```
suites/{suite-id}/templates.json
```

## 完整示例

```json
{
  "defaultTemplate": "gradient-card",
  "templates": [
    {
      "id": "gradient-card",
      "name": { "zh": "渐变卡片", "en": "Gradient Card" },
      "thumbnail": "/templates/gradient-card.png",
      "description": {
        "zh": "紫色渐变背景的简约风格",
        "en": "Minimalist style with purple gradient background"
      },
      "dimensions": {
        "width": 1080,
        "height": 1080,
        "unit": "px"
      },
      "background": {
        "type": "gradient",
        "value": [
          { "color": "#6366f1", "position": 0 },
          { "color": "#8b5cf6", "position": 50 },
          { "color": "#a855f7", "position": 100 }
        ],
        "direction": "135deg",
        "overlay": null
      },
      "elements": [
        {
          "id": "type-code",
          "type": "text",
          "position": { "x": "50%", "y": "25%" },
          "size": { "width": 400, "height": 150 },
          "content": "{{typeId}}",
          "style": {
            "fontSize": 120,
            "fontWeight": "bold",
            "fontFamily": "Inter",
            "color": "#ffffff",
            "textAlign": "center",
            "textShadow": "0 4px 20px rgba(0,0,0,0.3)"
          },
          "animation": {
            "type": "fadeIn",
            "delay": 0,
            "duration": 500
          },
          "visible": true
        },
        {
          "id": "type-name",
          "type": "text",
          "position": { "x": "50%", "y": "45%" },
          "size": { "width": 600, "height": 80 },
          "content": "{{typeName}}",
          "style": {
            "fontSize": 48,
            "fontWeight": "normal",
            "fontFamily": "Inter",
            "color": "#ffffff",
            "textAlign": "center",
            "opacity": 0.95
          }
        },
        {
          "id": "divider",
          "type": "divider",
          "position": { "x": "50%", "y": "55%" },
          "size": { "width": 200, "height": 2 },
          "style": {
            "backgroundColor": "rgba(255,255,255,0.3)",
            "borderRadius": 1
          }
        },
        {
          "id": "brand",
          "type": "text",
          "position": { "x": "50%", "y": "90%" },
          "size": { "width": 300, "height": 40 },
          "content": "Powered by NBTI",
          "style": {
            "fontSize": 24,
            "fontFamily": "Inter",
            "color": "rgba(255,255,255,0.6)",
            "textAlign": "center"
          }
        }
      ]
    }
  ]
}
```

## 字段说明

### 顶层字段

| 字段              | 类型       | 必填 | 说明        |
| ----------------- | ---------- | ---- | ----------- |
| `defaultTemplate` | string     | 否   | 默认模板 ID |
| `templates`       | Template[] | 是   | 模板列表    |

### dimensions

模板尺寸配置。

| 字段     | 类型    | 必填 | 说明                        |
| -------- | ------- | ---- | --------------------------- |
| `width`  | integer | 是   | 宽度（像素），范围 400-3840 |
| `height` | integer | 是   | 高度（像素），范围 400-3840 |
| `unit`   | string  | 否   | 单位，默认 `px`             |

### background

背景配置。

| 字段        | 类型   | 必填 | 说明                                                   |
| ----------- | ------ | ---- | ------------------------------------------------------ |
| `type`      | string | 是   | 背景类型：`color`、`gradient`、`image`                 |
| `value`     | varies | 是   | 背景值                                                 |
| `direction` | string | 否   | 渐变方向：`0deg`、`45deg`、`90deg`、`135deg`、`180deg` |
| `overlay`   | object | 否   | 叠加层                                                 |

#### background.type 值

| 值         | `value` 类型   | 说明                 |
| ---------- | -------------- | -------------------- |
| `color`    | string         | 颜色值，如 `#6366f1` |
| `gradient` | GradientStop[] | 渐变色标列表         |
| `image`    | string (uri)   | 图片 URL             |

#### gradient value

```json
[
  { "color": "#6366f1", "position": 0 },
  { "color": "#8b5cf6", "position": 50 },
  { "color": "#a855f7", "position": 100 }
]
```

#### overlay

背景叠加层，用于添加暗色遮罩等效果。

```json
{
  "color": "#000000",
  "opacity": 0.3
}
```

### elements

模板元素列表。

| 字段         | 类型    | 必填 | 说明                  |
| ------------ | ------- | ---- | --------------------- |
| `id`         | string  | 是   | 元素唯一标识符        |
| `type`       | string  | 是   | 元素类型              |
| `position`   | object  | 是   | 位置配置              |
| `size`       | object  | 否   | 尺寸配置              |
| `content`    | varies  | 否   | 内容（text 类型时）   |
| `style`      | object  | 否   | 样式配置              |
| `animation`  | object  | 否   | 动画配置              |
| `visible`    | boolean | 否   | 是否显示，默认 `true` |
| `responsive` | object  | 否   | 响应式配置            |

### element.type 元素类型

| 值              | 说明     | 特有字段  |
| --------------- | -------- | --------- |
| `text`          | 文本     | `content` |
| `shape`         | 形状     | `shape`   |
| `image`         | 图片     | `image`   |
| `qrcode`        | 二维码   | -         |
| `radar`         | 雷达图   | -         |
| `trait-badges`  | 特质徽章 | -         |
| `dimension-bar` | 维度条   | -         |
| `divider`       | 分隔线   | -         |

### position 位置配置

支持两种方式：

**固定位置：**

```json
{
  "x": 540,
  "y": 270
}

{
  "x": "50%",
  "y": "25%"
}
```

**预设位置：**

```json
"center"
"top"
"bottom"
"left"
"right"
```

### style 样式配置

| 字段                | 类型             | 说明                                |
| ------------------- | ---------------- | ----------------------------------- |
| `fontSize`          | number           | 字号（10-200）                      |
| `fontWeight`        | number \| string | 字重                                |
| `fontFamily`        | string           | 字体                                |
| `fontStyle`         | string           | 字形：`normal`、`italic`            |
| `color`             | string           | 颜色                                |
| `textAlign`         | string           | 文本对齐：`left`、`center`、`right` |
| `textAlignVertical` | string           | 垂直对齐：`top`、`center`、`bottom` |
| `backgroundColor`   | string           | 背景色                              |
| `borderRadius`      | number \| string | 圆角                                |
| `border`            | string           | 边框样式                            |
| `padding`           | number \| object | 内边距                              |
| `margin`            | number \| object | 外边距                              |
| `opacity`           | number           | 透明度（0-1）                       |
| `textShadow`        | string           | 文字阴影                            |
| `boxShadow`         | string           | 盒阴影                              |
| `lineHeight`        | number \| string | 行高                                |
| `letterSpacing`     | number           | 字间距                              |
| `lineColor`         | string           | 线条颜色                            |
| `lineWidth`         | number           | 线条宽度                            |
| `fillColor`         | string           | 填充色                              |
| `gridColumns`       | number           | 网格列数（1-5）                     |

### animation 动画配置

| 字段       | 类型   | 默认值   | 说明                                           |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `type`     | string | `fadeIn` | 动画类型：`fadeIn`、`slideUp`、`scale`、`none` |
| `delay`    | number | 0        | 延迟时间（毫秒）                               |
| `duration` | number | 300      | 持续时间（毫秒）                               |

### 模板变量

在 `content` 字段中使用双花括号包裹变量：

| 变量                   | 说明       | 示例                 |
| ---------------------- | ---------- | -------------------- |
| `\{\{typeId\}\}`       | 类型代码   | `INTJ`、`ENFP`       |
| `\{\{typeName\}\}`     | 类型名称   | `建筑师`、`冒险家`   |
| `\{\{typeSubtitle\}\}` | 类型副标题 | `富有想象力的战略家` |
| `\{\{dimension.EI\}\}` | 维度分数   | `65`、`35`           |
| `\{\{dimension.NS\}\}` | 维度分数   | `72`、`28`           |
| `\{\{suiteName\}\}`    | 套餐名称   | `MBTI 性格测试`      |

## 验证规则

- `templates` 数组至少包含一个模板
- `templates[].dimensions` 必须包含 `width` 和 `height`
- `templates[].elements` 数组至少包含一个元素
- 每个元素必须有 `id`、`type`、`position`

## 下一步

- 查看 [themes.json](./themes)
- 查看 [完整 Schema](/schemas/templates.schema.json)
