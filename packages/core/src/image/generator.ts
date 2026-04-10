/**
 * 图片生成器
 * 负责将模板渲染为图片
 */

import type { TemplateElement } from '../types/template'
import type {
  GeneratedImage,
  ImageGeneratorOptions,
  ImageRenderContext,
} from './types'
import {
  canvasToBase64,
  canvasToBlob,
  canvasToDataUrl,
  createOffscreenCanvas,
  drawBackground,
  drawCircle,
  drawLine,
  drawRadarChart,
  drawRoundedRect,
  drawText,
} from './canvas'
import { interpolateTemplate } from '../rendering/template-parser'

/**
 * 解析位置值
 */
function parsePosition(
  value: number | string,
  containerSize: number,
  elementSize: number = 0,
): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string' && value.endsWith('%')) {
    return (parseFloat(value) / 100) * containerSize - elementSize / 2
  }
  return 0
}

/**
 * 获取本地化文本
 */
function getLocalizedText(
  value: Record<string, string> | string | undefined,
  locale: string,
): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[locale] || value.zh || Object.values(value)[0] || ''
}

/**
 * 绘制文本元素
 */
function drawTextElement(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  context: ImageRenderContext,
  width: number,
  height: number,
): void {
  const style = element.style || {}
  const pos = element.position

  let x: number, y: number
  if (typeof pos === 'string') {
    x = width / 2
    y = height / 2
  } else {
    x = parsePosition(pos.x, width)
    y = parsePosition(pos.y, height)
  }

  const content = element.content
    ? interpolateTemplate(String(element.content), context)
    : ''

  drawText(ctx, content, x, y, {
    fontSize: style.fontSize || 16,
    fontWeight: style.fontWeight || 400,
    fontFamily: style.fontFamily || 'Inter, sans-serif',
    color: style.color || '#000',
    textAlign: (style.textAlign as CanvasTextAlign) || 'center',
    textBaseline: 'middle',
    shadow: style.textShadow,
  })
}

/**
 * 绘制形状元素
 */
function drawShapeElement(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  width: number,
  height: number,
): void {
  const style = element.style || {}
  const pos = element.position
  const size = element.size || {}

  let x: number, y: number
  if (typeof pos === 'string') {
    x = width / 2
    y = height / 2
  } else {
    x = parsePosition(pos.x, width)
    y = parsePosition(pos.y, height)
  }

  const elemWidth = size.width || 100
  const elemHeight = size.height || 100

  switch (element.shape) {
    case 'circle': {
      const radius = Math.min(elemWidth, elemHeight) / 2
      drawCircle(ctx, x, y, radius, style.fillColor)
      break
    }
    case 'line': {
      const lineWidth = style.lineWidth || 2
      const halfWidth = elemWidth / 2
      drawLine(
        ctx,
        x - halfWidth,
        y,
        x + halfWidth,
        y,
        style.lineColor || '#fff',
        lineWidth,
      )
      break
    }
    case 'rectangle':
    default: {
      const radius =
        typeof style.borderRadius === 'number' ? style.borderRadius : 0
      if (radius > 0) {
        drawRoundedRect(
          ctx,
          x - elemWidth / 2,
          y - elemHeight / 2,
          elemWidth,
          elemHeight,
          radius,
        )
        if (style.fillColor) {
          ctx.fillStyle = style.fillColor
          ctx.fill()
        }
      } else {
        if (style.fillColor) {
          ctx.fillStyle = style.fillColor
          ctx.fillRect(
            x - elemWidth / 2,
            y - elemHeight / 2,
            elemWidth,
            elemHeight,
          )
        }
      }
      break
    }
  }
}

/**
 * 绘制图片元素
 */
async function drawImageElement(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  width: number,
  height: number,
): Promise<void> {
  const { loadImage } = await import('./canvas')
  const style = element.style || {}
  const pos = element.position
  const size = element.size || {}

  let x: number, y: number
  if (typeof pos === 'string') {
    x = width / 2
    y = height / 2
  } else {
    x = parsePosition(pos.x, width)
    y = parsePosition(pos.y, height)
  }

  const imgWidth = size.width || 100
  const imgHeight = size.height || 100

  if (element.image) {
    try {
      const img = await loadImage(element.image)
      ctx.save()
      ctx.beginPath()
      const radius =
        typeof style.borderRadius === 'number' ? style.borderRadius : 0
      if (radius > 0) {
        drawRoundedRect(
          ctx,
          x - imgWidth / 2,
          y - imgHeight / 2,
          imgWidth,
          imgHeight,
          radius,
        )
        ctx.clip()
      }
      ctx.drawImage(
        img,
        x - imgWidth / 2,
        y - imgHeight / 2,
        imgWidth,
        imgHeight,
      )
      ctx.restore()
    } catch {
      // 图片加载失败，忽略
    }
  }
}

/**
 * 绘制特质徽章
 */
function drawTraitBadges(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  context: ImageRenderContext,
  width: number,
  height: number,
): void {
  const style = element.style || {}
  const pos = element.position

  let x: number, y: number
  if (typeof pos === 'string') {
    x = width / 2
    y = height / 2
  } else {
    x = parsePosition(pos.x, width)
    y = parsePosition(pos.y, height)
  }

  const traits = context.type.traits.slice(0, 4)
  const fontSize = style.fontSize || 16
  const padding = 12
  const spacing = 8
  const badgeHeight = fontSize + padding * 2

  let currentX = x - (traits.length * 80 + (traits.length - 1) * spacing) / 2

  traits.forEach(trait => {
    const name = getLocalizedText(trait.name, context.locale)
    const badgeWidth = name.length * fontSize * 0.6 + padding * 2

    ctx.fillStyle = style.backgroundColor || 'rgba(255,255,255,0.2)'
    drawRoundedRect(
      ctx,
      currentX,
      y - badgeHeight / 2,
      badgeWidth,
      badgeHeight,
      badgeHeight / 2,
    )
    ctx.fill()

    drawText(ctx, name, currentX + badgeWidth / 2, y, {
      fontSize,
      fontWeight: 400,
      color: style.color || '#fff',
    })

    currentX += badgeWidth + spacing
  })
}

/**
 * 绘制维度条
 */
function drawDimensionBars(
  ctx: CanvasRenderingContext2D,
  element: TemplateElement,
  context: ImageRenderContext,
  width: number,
  height: number,
): void {
  const style = element.style || {}
  const pos = element.position

  let x: number, y: number
  if (typeof pos === 'string') {
    x = width / 2
    y = height / 2
  } else {
    x = parsePosition(pos.x, width)
    y = parsePosition(pos.y, height)
  }

  const barWidth = width * 0.8
  const barHeight = 8
  const spacing = 24

  context.dimensions.forEach((dim, index) => {
    const barY = y + index * spacing

    // 绘制标签
    drawText(ctx, `${dim.id}: ${dim.percentage}%`, x - barWidth / 2, barY - 8, {
      fontSize: 12,
      color: style.color || '#fff',
      textAlign: 'left',
    })

    // 绘制背景条
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight)

    // 绘制进度条
    const progressWidth = (barWidth * dim.percentage) / 100
    const gradient = ctx.createLinearGradient(
      x - barWidth / 2,
      0,
      x - barWidth / 2 + progressWidth,
      0,
    )
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(x - barWidth / 2, barY, progressWidth, barHeight)
  })
}

/**
 * 图片生成器类
 */
export class ImageGenerator {
  constructor(_container?: HTMLElement) {
    // container 参数保留用于未来功能扩展
  }

  /**
   * 生成图片
   */
  async generate(options: ImageGeneratorOptions): Promise<GeneratedImage> {
    const {
      template,
      context,
      format = 'png',
      quality = 0.92,
      pixelRatio = 2,
    } = options

    const { width, height } = template.dimensions
    const { canvas, ctx } = createOffscreenCanvas(width, height, pixelRatio)

    // 绘制背景
    drawBackground(ctx, template.background, width, height)

    // 绘制所有元素
    const elementPromises: Promise<void>[] = []

    for (const element of template.elements) {
      if (element.visible === false) continue

      switch (element.type) {
        case 'text':
          drawTextElement(ctx, element, context, width, height)
          break
        case 'shape':
          drawShapeElement(ctx, element, width, height)
          break
        case 'image':
          elementPromises.push(drawImageElement(ctx, element, width, height))
          break
        case 'trait-badges':
          drawTraitBadges(ctx, element, context, width, height)
          break
        case 'dimension-bar':
          drawDimensionBars(ctx, element, context, width, height)
          break
        case 'radar': {
          const pos = element.position
          const size = element.size || { width: 300, height: 300 }
          let x: number, y: number
          if (typeof pos === 'string') {
            x = width / 2
            y = height / 2
          } else {
            x = parsePosition(pos.x, width)
            y = parsePosition(pos.y, height)
          }
          const radius = Math.min(size.width || 0, size.height || 0) / 2
          const labels = context.dimensions.map(d => d.id)
          const data = context.dimensions.map(d => d.percentage)
          drawRadarChart(ctx, x, y, radius, labels, data, {
            fillColor: 'rgba(78, 205, 196, 0.3)',
            strokeColor: '#4ECDC4',
          })
          break
        }
        case 'qrcode':
        case 'divider':
        default:
          // 这些类型需要特殊处理，暂时跳过
          break
      }
    }

    // 等待图片加载完成
    await Promise.all(elementPromises)

    // 转换为所需格式
    const blob = await canvasToBlob(canvas, format, quality)
    const dataUrl = canvasToDataUrl(canvas, format, quality)
    const base64 = canvasToBase64(canvas, format, quality)

    return {
      blob,
      dataUrl,
      base64,
      width: canvas.width,
      height: canvas.height,
    }
  }

  /**
   * 下载图片
   */
  async download(
    options: ImageGeneratorOptions,
    filename: string = 'nbti-result',
  ): Promise<void> {
    const result = await this.generate(options)
    const url = URL.createObjectURL(result.blob)

    const link = globalThis.document.createElement('a')
    link.href = url
    link.download = `${filename}.${options.format || 'png'}`
    globalThis.document.body.appendChild(link)
    link.click()
    globalThis.document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * 分享图片
   */
  async share(options: ImageGeneratorOptions): Promise<void> {
    if (!navigator.share || !navigator.canShare) {
      throw new Error('Web Share API not supported')
    }

    const result = await this.generate(options)
    const file = new File([result.blob], 'nbti-result.png', {
      type: result.blob.type,
    })

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My NBTI Result',
        text: 'Check out my NBTI personality type!',
      })
    } else {
      // 降级为下载
      await this.download(options)
    }
  }

  /**
   * 预览图片（返回 Data URL）
   */
  async preview(options: ImageGeneratorOptions): Promise<string> {
    const result = await this.generate(options)
    return result.dataUrl
  }
}

/**
 * 快捷生成函数
 */
export async function generateImage(
  options: ImageGeneratorOptions,
): Promise<GeneratedImage> {
  const generator = new ImageGenerator()
  return generator.generate(options)
}
