/**
 * Canvas 工具模块
 * 提供 Canvas 相关操作
 */

/**
 * 创建离屏 Canvas
 */
export function createOffscreenCanvas(
  width: number,
  height: number,
  pixelRatio: number = 1,
): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  scaledWidth: number
  scaledHeight: number
} {
  const canvas = globalThis.document.createElement('canvas')
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 缩放以支持高清屏
  ctx.scale(pixelRatio, pixelRatio)

  return {
    canvas,
    ctx,
    scaledWidth: width * pixelRatio,
    scaledHeight: height * pixelRatio,
  }
}

/**
 * 加载图片
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 绘制背景
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  background: {
    type: 'color' | 'gradient' | 'image'
    value: string | Array<{ color: string; position: number }>
    direction?: string
    overlay?: { color: string; opacity?: number }
  },
  width: number,
  height: number,
): void {
  switch (background.type) {
    case 'color':
      ctx.fillStyle = background.value as string
      ctx.fillRect(0, 0, width, height)
      break

    case 'gradient': {
      const direction = background.direction || '135deg'
      const angle = parseFloat(direction) * (Math.PI / 180)
      const colorStops = background.value as Array<{
        color: string
        position: number
      }>

      const x1 = width / 2 - Math.cos(angle) * width
      const y1 = height / 2 - Math.sin(angle) * height
      const x2 = width / 2 + Math.cos(angle) * width
      const y2 = height / 2 + Math.sin(angle) * height

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      colorStops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      break
    }

    case 'image': {
      loadImage(background.value as string)
        .then(img => {
          // 绘制图片覆盖整个画布
          const imgRatio = img.width / img.height
          const canvasRatio = width / height

          let drawWidth = width
          let drawHeight = height
          let drawX = 0
          let drawY = 0

          if (imgRatio > canvasRatio) {
            drawHeight = height
            drawWidth = height * imgRatio
            drawX = -(drawWidth - width) / 2
          } else {
            drawWidth = width
            drawHeight = width / imgRatio
            drawY = -(drawHeight - height) / 2
          }

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        })
        .catch(() => {
          // 图片加载失败，使用默认背景色
          ctx.fillStyle = '#1a1a2e'
          ctx.fillRect(0, 0, width, height)
        })
      break
    }
  }

  // 绘制叠加层
  if (background.overlay) {
    ctx.fillStyle = background.overlay.color
    ctx.globalAlpha = background.overlay.opacity ?? 0.3
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1
  }
}

/**
 * 绘制文本
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number
    fontWeight?: number | string
    fontFamily?: string
    color?: string
    textAlign?: CanvasTextAlign
    textBaseline?: CanvasTextBaseline
    maxWidth?: number
    shadow?: string
  } = {},
): void {
  const {
    fontSize = 16,
    fontWeight = 400,
    fontFamily = 'Inter, sans-serif',
    color = '#000',
    textAlign = 'center',
    textBaseline = 'middle',
    maxWidth,
    shadow,
  } = options

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  ctx.textBaseline = textBaseline

  if (shadow) {
    ctx.shadowColor = shadow
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
  }

  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth)
  } else {
    ctx.fillText(text, x, y)
  }

  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

/**
 * 绘制圆角矩形
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 绘制圆形
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillColor?: string,
  strokeColor?: string,
  strokeWidth?: number,
): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)

  if (fillColor) {
    ctx.fillStyle = fillColor
    ctx.fill()
  }

  if (strokeColor) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth || 1
    ctx.stroke()
  }
}

/**
 * 绘制线条
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color?: string,
  width?: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)

  if (color) {
    ctx.strokeStyle = color
  }
  if (width) {
    ctx.lineWidth = width
  }

  ctx.stroke()
}

/**
 * 绘制雷达图
 */
export function drawRadarChart(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  labels: string[],
  data: number[],
  options: {
    fillColor?: string
    strokeColor?: string
    gridColor?: string
    labelColor?: string
  } = {},
): void {
  const {
    fillColor = 'rgba(102, 126, 234, 0.3)',
    strokeColor = '#667eea',
    gridColor = 'rgba(255, 255, 255, 0.2)',
    labelColor = '#ffffff',
  } = options

  const sides = labels.length
  const angleStep = (Math.PI * 2) / sides

  // 绘制网格
  for (let level = 1; level <= 5; level++) {
    const levelRadius = (radius / 5) * level
    ctx.beginPath()
    for (let i = 0; i <= sides; i++) {
      const angle = angleStep * i - Math.PI / 2
      const x = centerX + Math.cos(angle) * levelRadius
      const y = centerY + Math.sin(angle) * levelRadius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 绘制轴线
  for (let i = 0; i < sides; i++) {
    const angle = angleStep * i - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = gridColor
    ctx.stroke()
  }

  // 绘制数据区域
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = angleStep * i - Math.PI / 2
    const valueRadius = (radius * Math.min(data[i], 100)) / 100
    const x = centerX + Math.cos(angle) * valueRadius
    const y = centerY + Math.sin(angle) * valueRadius
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制数据点
  for (let i = 0; i < sides; i++) {
    const angle = angleStep * i - Math.PI / 2
    const valueRadius = (radius * Math.min(data[i], 100)) / 100
    const x = centerX + Math.cos(angle) * valueRadius
    const y = centerY + Math.sin(angle) * valueRadius
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = strokeColor
    ctx.fill()
  }

  // 绘制标签
  for (let i = 0; i < sides; i++) {
    const angle = angleStep * i - Math.PI / 2
    const labelRadius = radius + 20
    const x = centerX + Math.cos(angle) * labelRadius
    const y = centerY + Math.sin(angle) * labelRadius

    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = labelColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(labels[i], x, y)
  }
}

/**
 * 将 Canvas 转换为 Blob
 */
export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      },
      `image/${format}`,
      quality,
    )
  })
}

/**
 * 将 Canvas 转换为 Data URL
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92,
): string {
  return canvas.toDataURL(`image/${format}`, quality)
}

/**
 * 将 Canvas 转换为 Base64
 */
export function canvasToBase64(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92,
): string {
  const dataUrl = canvasToDataUrl(canvas, format, quality)
  return dataUrl.split(',')[1]
}
