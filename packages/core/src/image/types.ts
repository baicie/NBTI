/**
 * 图片生成器类型定义
 */

import type { ShareCardTemplate } from '../types/template'

/**
 * 图片格式
 */
export type ImageFormat = 'png' | 'jpeg'

/**
 * 图片生成选项
 */
export interface ImageGeneratorOptions {
  template: ShareCardTemplate
  context: ImageRenderContext
  format?: ImageFormat
  quality?: number
  pixelRatio?: number
  backgroundColor?: string
}

/**
 * 生成结果
 */
export interface GeneratedImage {
  blob: Blob
  dataUrl: string
  base64: string
  width: number
  height: number
}

/**
 * 渲染上下文（图片生成器专用）
 */
export interface ImageRenderContext {
  type: {
    code: string
    name: Record<string, string>
    subtitle?: Record<string, string>
    description?: Record<string, string>
    traits: Array<{
      id: string
      name: Record<string, string>
      icon?: string
      level: number
    }>
    strengths: Record<string, string>[]
    weaknesses: Record<string, string>[]
    careers: Record<string, string>[]
  }
  dimensions: Array<{
    id: string
    percentage: number
    dominant: string
  }>
  scoring: {
    typeCode: string
    dimensions: Array<{
      dimensionId: string
      leftLetter: string
      rightLetter: string
      leftScore: number
      rightScore: number
      dominant: string
      percentage: number
    }>
  }
  config: {
    appName: string
    shareUrl: string
  }
  locale: string
  theme?: {
    colors: Record<string, string>
    [key: string]: unknown
  }
  timestamp: number
}
