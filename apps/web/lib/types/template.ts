/**
 * 模板系统类型定义
 */

import type { LocalizedString } from '@nbti/core'

/**
 * 背景配置
 */
export interface TemplateBackground {
  type: 'color' | 'gradient' | 'image'
  value: string | GradientStop[] | null
  direction?: string
  overlay?: {
    color: string
    opacity: number
  }
}

/**
 * 渐变色停止点
 */
export interface GradientStop {
  color: string
  position: number
}

/**
 * 元素样式
 */
export interface TemplateElementStyle {
  fontSize?: number
  fontWeight?: number | string
  fontFamily?: string
  fontStyle?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  textAlignVertical?: 'top' | 'center' | 'bottom'
  backgroundColor?: string
  borderRadius?: number | string
  border?: string
  padding?: number | object
  margin?: number | object
  opacity?: number
  textShadow?: string
  boxShadow?: string
  lineHeight?: number | string
  letterSpacing?: number
  lineColor?: string
  lineWidth?: number
  fillColor?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

/**
 * 模板元素
 */
export interface TemplateElement {
  id: string
  type:
    | 'text'
    | 'shape'
    | 'image'
    | 'qrcode'
    | 'trait-badges'
    | 'dimension-bar'
    | 'divider'
  position: { x: number | string; y: number | string } | string
  size?: { width: number; height: number; unit?: 'px' | '%' }
  content?: string | LocalizedString | string[]
  image?: string | null
  shape?: 'circle' | 'rectangle' | 'line' | 'triangle' | 'polygon'
  layout?: 'horizontal' | 'vertical' | 'grid' | 'flow'
  spacing?: number
  style?: TemplateElementStyle
  animation?: {
    type: 'fadeIn' | 'slideUp' | 'scale' | 'none'
    delay?: number
    duration?: number
  }
  visible?: boolean
  responsive?: {
    mobile?: Partial<TemplateElement>
    tablet?: Partial<TemplateElement>
  }
}

/**
 * 模板定义
 */
export interface Template {
  id: string
  name: LocalizedString
  thumbnail?: string | null
  description?: LocalizedString
  dimensions: {
    width: number
    height: number
    unit?: 'px'
  }
  background: TemplateBackground
  elements: TemplateElement[]
}

/**
 * 模板配置
 */
export interface TemplatesConfig {
  defaultTemplate?: string
  templates: Template[]
}

/**
 * 模板变量（用于替换）
 */
export interface TemplateVariables {
  typeCode: string
  typeName: string
  typeImage?: string
  subtitle: string
  description: string
  shortDescription: string
  traits: Array<{ name: string; level: number }>
  matchScore: number
  shareUrl: string
  suiteName: string
  dominantDimensions?: Array<{
    name: string
    leftLetter: string
    rightLetter: string
    percentage: number
  }>
}
