/**
 * 模板渲染器
 * 根据模板配置和变量生成分享卡片 HTML
 */

import type {
  GradientStop,
  Template,
  TemplateBackground,
  TemplateElement,
  TemplateVariables,
} from '@/lib/types/template'

/**
 * 解析位置值
 */
function parsePosition(
  value: number | string | undefined,
  containerSize: number,
): string {
  if (value === undefined)
    return '0'
  if (typeof value === 'number')
    return `${value}px`
  if (typeof value === 'string' && value.endsWith('%')) {
    return `${(Number.parseFloat(value) / 100) * containerSize}px`
  }
  return `${value}px`
}

/**
 * 生成渐变 CSS
 */
function generateGradient(background: TemplateBackground): string {
  if (background.type !== 'gradient' || !Array.isArray(background.value)) {
    return background.type === 'color'
      ? (background.value as string)
      : '#ffffff'
  }

  const stops = background.value as GradientStop[]
  const direction = background.direction || '135deg'
  const colorStops = stops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  let gradient: string
  if (direction.endsWith('deg')) {
    gradient = `linear-gradient(${direction}, ${colorStops})`
  }
  else {
    gradient = `linear-gradient(${direction}, ${colorStops})`
  }

  if (background.overlay) {
    gradient += `, ${background.overlay.color}`
    gradient += ` ${background.overlay.opacity! * 100}%`
  }

  return gradient
}

/**
 * 生成元素样式
 */
function generateElementStyle(element: TemplateElement): string {
  const style = element.style || {}
  const parts: string[] = []

  if (element.type === 'shape') {
    if (element.shape === 'rectangle' || element.shape === 'line') {
      if (style.backgroundColor) {
        parts.push(`background-color: ${style.backgroundColor}`)
      }
    }
  }

  // Handle object-fit for images
  if (element.type === 'image' && style.objectFit) {
    parts.push(`object-fit: ${style.objectFit}`)
  }

  if (
    element.type === 'text'
    || element.type === 'qrcode'
    || element.type === 'trait-badges'
  ) {
    if (style.color)
      parts.push(`color: ${style.color}`)
    if (style.fontSize)
      parts.push(`font-size: ${style.fontSize}px`)
    if (style.fontWeight) {
      parts.push(`font-weight: ${style.fontWeight}`)
    }
    if (style.fontFamily)
      parts.push(`font-family: ${style.fontFamily}`)
    if (style.textAlign)
      parts.push(`text-align: ${style.textAlign}`)
    if (style.letterSpacing)
      parts.push(`letter-spacing: ${style.letterSpacing}px`)
    if (style.lineHeight) {
      parts.push(
        `line-height: ${typeof style.lineHeight === 'number' ? style.lineHeight : style.lineHeight}`,
      )
    }
  }

  if (style.borderRadius !== undefined) {
    const radius
      = typeof style.borderRadius === 'number'
        ? `${style.borderRadius}px`
        : style.borderRadius
    parts.push(`border-radius: ${radius}`)
  }

  if (style.opacity !== undefined)
    parts.push(`opacity: ${style.opacity}`)

  if (style.padding) {
    const p
      = typeof style.padding === 'number' ? `${style.padding}px` : style.padding
    parts.push(`padding: ${p}`)
  }

  return parts.join('; ')
}

/**
 * 渲染文本元素
 */
function renderTextElement(
  element: TemplateElement,
  variables: TemplateVariables,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const size = element.size || {
    width: width - Number.parseFloat(x) * 2,
    height: 'auto',
  }
  const style = generateElementStyle(element)

  // 处理模板变量
  let content = (element.content as string) || ''
  content = content.replace(/\{\{typeCode\}\}/g, variables.typeCode)
  content = content.replace(/\{\{typeName\}\}/g, variables.typeName)
  content = content.replace(/\{\{subtitle\}\}/g, variables.subtitle)
  content = content.replace(/\{\{description\}\}/g, variables.description)
  content = content.replace(
    /\{\{shortDescription\}\}/g,
    variables.shortDescription,
  )
  content = content.replace(/\{\{shareUrl\}\}/g, variables.shareUrl)
  content = content.replace(/\{\{suiteName\}\}/g, variables.suiteName)

  // 处理换行
  content = content.replace(/\\n/g, '<br>')

  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      width: ${typeof size.width === 'number' ? `${size.width}px` : size.width};
      height: ${size.height === 'auto' ? 'auto' : `${size.height}px`};
      ${style};
      box-sizing: border-box;
    ">${content}</div>
  `
}

/**
 * 渲染形状元素
 */
function renderShapeElement(
  element: TemplateElement,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const size = element.size || { width: 100, height: 100 }
  const style = generateElementStyle(element)

  if (element.shape === 'circle') {
    return `
      <div style="
        position: absolute;
        left: ${x};
        top: ${y};
        width: ${size.width}px;
        height: ${size.height}px;
        border-radius: 50%;
        ${style};
        box-sizing: border-box;
      "></div>
    `
  }

  if (element.shape === 'line') {
    return `
      <div style="
        position: absolute;
        left: ${x};
        top: ${y};
        width: ${size.width}px;
        height: ${size.height}px;
        ${style};
        box-sizing: border-box;
      "></div>
    `
  }

  // 默认矩形
  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      width: ${size.width}px;
      height: ${size.height}px;
      ${style};
      box-sizing: border-box;
    "></div>
  `
}

/**
 * 渲染图片元素
 */
function renderImageElement(
  element: TemplateElement,
  variables: TemplateVariables,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const size = element.size || { width: 400, height: 400 }
  const style = generateElementStyle(element)

  // 支持从变量中获取图片 URL（如 {{typeImage}}）
  let imageUrl = (element.image as string) || ''
  if (imageUrl.startsWith('{{') && imageUrl.endsWith('}}')) {
    const varName = imageUrl.slice(2, -2)
    imageUrl = (variables as unknown as Record<string, string>)[varName] || ''
  }

  return `
    <img src="${imageUrl}" style="
      position: absolute;
      left: ${x};
      top: ${y};
      width: ${typeof size.width === 'number' ? `${size.width}px` : size.width};
      height: ${typeof size.height === 'number' ? `${size.height}px` : size.height};
      object-fit: cover;
      ${style};
      box-sizing: border-box;
    " />`
}

/**
 * 渲染分隔线元素
 */
function renderDividerElement(
  element: TemplateElement,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const size = element.size || { width: 200, height: 2 }
  const style = generateElementStyle(element)

  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      width: ${size.width}px;
      height: ${size.height}px;
      ${style};
      box-sizing: border-box;
    "></div>
  `
}

/**
 * 渲染特质徽章元素
 */
function renderTraitBadgesElement(
  element: TemplateElement,
  variables: TemplateVariables,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const style = element.style || {}
  const spacing = element.spacing || 8

  const traitsHtml = variables.traits
    .slice(0, 3)
    .map((trait) => {
      const bgColor = style.backgroundColor || 'rgba(255,255,255,0.2)'
      const textColor = style.color || '#ffffff'
      const borderRadius
        = typeof style.borderRadius === 'number' ? style.borderRadius : 20

      return `
        <div style="
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: ${bgColor};
          color: ${textColor};
          border-radius: ${borderRadius}px;
          font-size: 24px;
          font-weight: 500;
          margin: ${spacing / 2}px;
        ">${trait.name}</div>
      `
    })
    .join('')

  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      transform: translateX(-50%);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 90%;
    ">${traitsHtml}</div>
  `
}

/**
 * 渲染二维码占位元素
 */
function renderQrcodeElement(
  element: TemplateElement,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const size = element.size || { width: 150, height: 150 }

  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      width: ${size.width}px;
      height: ${size.height}px;
      background: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #999;
      box-sizing: border-box;
    ">二维码</div>
  `
}

/**
 * 渲染维度条元素
 */
function renderDimensionBarElement(
  element: TemplateElement,
  variables: TemplateVariables,
  width: number,
  height: number,
): string {
  const pos = element.position as { x: number | string, y: number | string }
  const x = parsePosition(pos.x, width)
  const y = parsePosition(pos.y, height)
  const style = element.style || {}
  const barWidth = (element.size?.width || 400) * 0.6
  const barHeight = element.size?.height || 20

  if (!variables.dominantDimensions?.length)
    return ''

  const barsHtml = variables.dominantDimensions
    .slice(0, 3)
    .map((dim) => {
      const leftColor = style.color || 'rgba(255,255,255,0.7)'
      const rightColor = '#ffffff'
      const fillColor = '#ffffff'
      const percentage = dim.percentage / 100

      return `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        ">
          <span style="color: ${leftColor}; font-size: 18px; font-weight: 500; width: 40px; text-align: right;">${dim.leftLetter}</span>
          <div style="
            position: relative;
            width: ${barWidth}px;
            height: ${barHeight}px;
            background: rgba(255,255,255,0.2);
            border-radius: ${barHeight / 2}px;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              left: 0;
              top: 0;
              width: ${barWidth * percentage}px;
              height: ${barHeight}px;
              background: ${fillColor};
              border-radius: ${barHeight / 2}px;
            "></div>
          </div>
          <span style="color: ${rightColor}; font-size: 18px; font-weight: 500; width: 40px;">${dim.rightLetter}</span>
        </div>
      `
    })
    .join('')

  return `
    <div style="
      position: absolute;
      left: ${x};
      top: ${y};
      display: flex;
      flex-direction: column;
    ">${barsHtml}</div>
  `
}

/**
 * 渲染单个元素
 */
function renderElement(
  element: TemplateElement,
  variables: TemplateVariables,
  width: number,
  height: number,
): string {
  if (element.visible === false)
    return ''

  switch (element.type) {
    case 'text':
      return renderTextElement(element, variables, width, height)
    case 'shape':
      return renderShapeElement(element, width, height)
    case 'divider':
      return renderDividerElement(element, width, height)
    case 'trait-badges':
      return renderTraitBadgesElement(element, variables, width, height)
    case 'qrcode':
      return renderQrcodeElement(element, width, height)
    case 'image':
      return renderImageElement(element, variables, width, height)
    case 'dimension-bar':
      return renderDimensionBarElement(element, variables, width, height)
    default:
      return ''
  }
}

/**
 * 渲染完整模板
 */
export function renderTemplate(
  template: Template,
  variables: TemplateVariables,
): string {
  const { width, height } = template.dimensions
  const background = generateGradient(template.background)

  const elementsHtml = template.elements
    .map(element => renderElement(element, variables, width, height))
    .join('')

  return `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      background: ${background};
      overflow: hidden;
      box-sizing: border-box;
    ">
      ${elementsHtml}
    </div>
  `
}

/**
 * 生成模板预览 HTML
 */
export function generatePreviewHtml(
  template: Template,
  variables: TemplateVariables,
): string {
  const { width, height } = template.dimensions

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模板预览 - ${template.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      padding: 40px;
    }
    .container {
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      transform: scale(0.5);
      transform-origin: top center;
    }
    .info {
      margin-top: 40px;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    ${renderTemplate(template, variables)}
  </div>
  <div class="info">
    <p>尺寸: ${width} × ${height}px</p>
    <p>模板: ${template.id}</p>
  </div>
</body>
</html>
  `
}
