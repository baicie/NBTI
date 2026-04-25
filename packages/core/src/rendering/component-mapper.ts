/**
 * 渲染引擎
 * 负责将模板渲染为实际的 HTML/DOM
 */

import type { ShareCardTemplate, TemplateElement } from '../types/template'
import type { RenderContext } from './types'
import { interpolateTemplate } from './template-parser'

/**
 * 解析位置值
 */
export function parsePosition(
  value: number | string,
  containerSize: number,
): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string' && value.endsWith('%')) {
    return (Number.parseFloat(value) / 100) * containerSize
  }
  return 0
}

/**
 * 计算元素位置
 */
export function calculateElementPosition(
  element: TemplateElement,
  containerWidth: number,
  containerHeight: number,
): { x: number, y: number } {
  const position = element.position

  if (typeof position === 'string') {
    // 预设位置
    switch (position) {
      case 'center':
        return {
          x: containerWidth / 2,
          y: containerHeight / 2,
        }
      case 'top':
        return {
          x: containerWidth / 2,
          y: 50,
        }
      case 'bottom':
        return {
          x: containerWidth / 2,
          y: containerHeight - 50,
        }
      case 'left':
        return {
          x: 50,
          y: containerHeight / 2,
        }
      case 'right':
        return {
          x: containerWidth - 50,
          y: containerHeight / 2,
        }
      default:
        return { x: 0, y: 0 }
    }
  }

  // 固定位置
  return {
    x: parsePosition(position.x, containerWidth),
    y: parsePosition(position.y, containerHeight),
  }
}

/**
 * 生成 CSS 样式字符串
 */
export function generateElementStyle(
  element: TemplateElement,
  _context: RenderContext,
): string {
  const style = element.style || {}
  const pos = element.position
  const size = element.size

  const styles: string[] = []

  // 定位
  if (typeof pos === 'object') {
    if (typeof pos.x === 'number') {
      styles.push(`left: ${pos.x}px`)
    }
    else if (typeof pos.x === 'string') {
      styles.push(`left: ${pos.x}`)
    }
    if (typeof pos.y === 'number') {
      styles.push(`top: ${pos.y}px`)
    }
    else if (typeof pos.y === 'string') {
      styles.push(`top: ${pos.y}`)
    }
  }

  // 尺寸
  if (size?.width) {
    styles.push(`width: ${size.width}${size.unit || 'px'}`)
  }
  if (size?.height) {
    styles.push(`height: ${size.height}${size.unit || 'px'}`)
  }

  // 字体样式
  if (style.fontSize) {
    styles.push(`font-size: ${style.fontSize}px`)
  }
  if (style.fontWeight) {
    styles.push(`font-weight: ${style.fontWeight}`)
  }
  if (style.fontFamily) {
    styles.push(`font-family: ${style.fontFamily}`)
  }
  if (style.fontStyle) {
    styles.push(`font-style: ${style.fontStyle}`)
  }
  if (style.textAlign) {
    styles.push(`text-align: ${style.textAlign}`)
  }
  if (style.letterSpacing) {
    styles.push(`letter-spacing: ${style.letterSpacing}px`)
  }
  if (style.lineHeight) {
    styles.push(`line-height: ${style.lineHeight}`)
  }

  // 颜色
  if (style.color) {
    styles.push(`color: ${style.color}`)
  }
  if (style.backgroundColor) {
    styles.push(`background-color: ${style.backgroundColor}`)
  }

  // 边框和圆角
  if (style.borderRadius !== undefined) {
    styles.push(
      `border-radius: ${style.borderRadius}${typeof style.borderRadius === 'number' ? 'px' : ''}`,
    )
  }
  if (style.border) {
    styles.push(`border: ${style.border}`)
  }

  // 间距
  if (style.padding !== undefined) {
    if (typeof style.padding === 'number') {
      styles.push(`padding: ${style.padding}px`)
    }
    else if (typeof style.padding === 'object') {
      const { top = 0, right = 0, bottom = 0, left = 0 } = style.padding
      styles.push(`padding: ${top}px ${right}px ${bottom}px ${left}px`)
    }
  }
  if (style.margin !== undefined) {
    if (typeof style.margin === 'number') {
      styles.push(`margin: ${style.margin}px`)
    }
    else if (typeof style.margin === 'object') {
      const { top = 0, right = 0, bottom = 0, left = 0 } = style.margin
      styles.push(`margin: ${top}px ${right}px ${bottom}px ${left}px`)
    }
  }

  // 效果
  if (style.opacity !== undefined) {
    styles.push(`opacity: ${style.opacity}`)
  }
  if (style.textShadow) {
    styles.push(`text-shadow: ${style.textShadow}`)
  }
  if (style.boxShadow) {
    styles.push(`box-shadow: ${style.boxShadow}`)
  }

  // 动画
  if (element.animation && element.animation.type !== 'none') {
    const duration = element.animation.duration || 300
    const delay = element.animation.delay || 0
    styles.push(
      `animation: ${element.animation.type} ${duration}ms ease-out ${delay}ms`,
    )
  }

  return styles.join('; ')
}

/**
 * 生成背景样式
 */
export function generateBackgroundStyle(template: ShareCardTemplate): string {
  const bg = template.background
  const styles: string[] = []

  switch (bg.type) {
    case 'color':
      styles.push(`background-color: ${bg.value}`)
      break
    case 'gradient': {
      if (Array.isArray(bg.value)) {
        const direction = bg.direction || '135deg'
        const colorStops = bg.value
          .map(stop => `${stop.color} ${stop.position}%`)
          .join(', ')
        styles.push(`background: linear-gradient(${direction}, ${colorStops})`)
      }
      break
    }
    case 'image':
      styles.push(`background-image: url(${bg.value})`)
      styles.push('background-size: cover')
      styles.push('background-position: center')
      break
  }

  // 叠加层
  if (bg.overlay) {
    styles.push(`position: relative`)
  }

  return styles.join('; ')
}

/**
 * 渲染文本元素
 */
export function renderTextElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  const style = generateElementStyle(element, context)
  const content = element.content
    ? interpolateTemplate(String(element.content), context)
    : ''

  return `<span style="${style}; position: absolute; display: inline-block;">${content}</span>`
}

/**
 * 渲染形状元素
 */
export function renderShapeElement(element: TemplateElement): string {
  const style = element.style || {}
  const shape = element.shape || 'rectangle'

  let shapeStyle = ''
  switch (shape) {
    case 'circle':
      shapeStyle = `border-radius: 50%;`
      break
    case 'line':
      shapeStyle = `height: ${style.lineWidth || 2}px; width: 100%;`
      break
  }

  if (style.fillColor) {
    shapeStyle += `background-color: ${style.fillColor};`
  }
  if (style.lineColor) {
    shapeStyle += `border-color: ${style.lineColor};`
  }

  const posStyle = generateElementStyle(element, {} as RenderContext)
  return `<div style="${posStyle}; position: absolute; ${shapeStyle}"></div>`
}

/**
 * 渲染图片元素
 */
export function renderImageElement(element: TemplateElement): string {
  const style = generateElementStyle(element, {} as RenderContext)
  const src = element.image || ''

  return `<img src="${src}" style="${style}; position: absolute; object-fit: cover;" />`
}

/**
 * 渲染二维码元素
 */
export function renderQRCodeElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  const style = generateElementStyle(element, context)
  const content = interpolateTemplate('{share.url}', context)

  // 返回占位符，实际渲染需要在客户端生成
  return `<div class="qrcode-placeholder" data-content="${content}" style="${style}; position: absolute; display: flex; align-items: center; justify-content: center; background: white;"></div>`
}

/**
 * 渲染雷达图元素
 */
export function renderRadarElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  const style = generateElementStyle(element, context)

  // 返回占位符，实际渲染需要使用 Canvas 或 SVG
  return `<div class="radar-placeholder" style="${style}; position: absolute; display: flex; align-items: center; justify-content: center;"></div>`
}

/**
 * 渲染特质徽章元素
 */
export function renderTraitBadgesElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  const style = generateElementStyle(element, context)
  const traits = context.type.traits.slice(0, 4)

  const badges = traits
    .map((trait) => {
      const name = trait.name[context.locale] || trait.name.zh || ''
      const badgeStyle = `
      display: inline-block;
      padding: 8px 16px;
      margin: 4px;
      background: ${element.style?.backgroundColor || 'rgba(255,255,255,0.2)'};
      border-radius: ${element.style?.borderRadius || 20}px;
      color: ${element.style?.color || '#fff'};
      font-size: ${element.style?.fontSize || 16}px;
    `
      return `<span style="${badgeStyle}">${name}</span>`
    })
    .join('')

  return `<div style="${style}; position: absolute; display: flex; flex-wrap: wrap; justify-content: center;">${badges}</div>`
}

/**
 * 渲染维度条元素
 */
export function renderDimensionBarElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  const style = generateElementStyle(element, context)

  const bars = context.dimensions
    .map((dim) => {
      const width = `${dim.percentage}%`
      return `
      <div style="margin: 8px 0;">
        <span>${dim.id}: ${dim.percentage}%</span>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
          <div style="width: ${width}; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
        </div>
      </div>
    `
    })
    .join('')

  return `<div style="${style}; position: absolute;">${bars}</div>`
}

/**
 * 渲染单个元素
 */
export function renderElement(
  element: TemplateElement,
  context: RenderContext,
): string {
  // 检查是否可见
  if (element.visible === false) {
    return ''
  }

  switch (element.type) {
    case 'text':
      return renderTextElement(element, context)
    case 'shape':
      return renderShapeElement(element)
    case 'image':
      return renderImageElement(element)
    case 'qrcode':
      return renderQRCodeElement(element, context)
    case 'radar':
      return renderRadarElement(element, context)
    case 'trait-badges':
      return renderTraitBadgesElement(element, context)
    case 'dimension-bar':
      return renderDimensionBarElement(element, context)
    case 'divider':
      return renderShapeElement({ ...element, shape: 'line' })
    default:
      return ''
  }
}

/**
 * 渲染完整模板
 */
export function renderTemplate(
  template: ShareCardTemplate,
  context: RenderContext,
): string {
  const bgStyle = generateBackgroundStyle(template)
  const { width, height } = template.dimensions

  const elements = template.elements
    .map(el => renderElement(el, context))
    .join('\n')

  return `
    <div style="${bgStyle}; width: ${width}px; height: ${height}px; position: relative; overflow: hidden; font-family: Inter, sans-serif;">
      ${elements}
    </div>
  `.trim()
}
