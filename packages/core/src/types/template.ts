/**
 * Templates 类型定义
 * templates.json 是结果图模板配置文件
 */

import type { LocalizedString } from './core'

/**
 * 模板尺寸
 */
export interface TemplateDimensions {
  width: number
  height: number
  unit?: 'px'
}

/**
 * 渐变色标
 */
export interface ColorStop {
  color: string
  position: number
}

/**
 * 背景配置
 */
export interface TemplateBackground {
  type: 'color' | 'gradient' | 'image'
  value: string | ColorStop[]
  direction?: string
  overlay?: {
    color: string
    opacity?: number
  }
}

/**
 * 位置坐标
 */
export interface Position {
  x: number | string
  y: number | string
  width?: number | string
  height?: number | string
}

/**
 * 尺寸配置
 */
export interface ElementSize {
  width?: number
  height?: number
  unit?: 'px' | '%'
}

/**
 * 样式配置
 */
export interface ElementStyle {
  fontSize?: number
  fontWeight?: number | string
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  textAlignVertical?: 'top' | 'center' | 'bottom'
  backgroundColor?: string
  borderRadius?: number | string
  border?: string
  padding?: number | Record<string, number>
  margin?: number | Record<string, number>
  opacity?: number
  textShadow?: string
  boxShadow?: string
  lineHeight?: number | string
  letterSpacing?: number
  lineColor?: string
  lineWidth?: number
  fillColor?: string
  gridColumns?: number
}

/**
 * 动画配置
 */
export interface ElementAnimation {
  type?: 'fadeIn' | 'slideUp' | 'scale' | 'none'
  delay?: number
  duration?: number
}

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  mobile?: Partial<ElementStyle>
  tablet?: Partial<ElementStyle>
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
    | 'radar'
    | 'trait-badges'
    | 'dimension-bar'
    | 'divider'
  position: Position | string
  size?: ElementSize
  content?: string | LocalizedString
  image?: string | null
  shape?: 'circle' | 'rectangle' | 'line' | 'triangle' | 'polygon'
  layout?: 'horizontal' | 'vertical' | 'grid' | 'flow'
  spacing?: number
  style?: ElementStyle
  animation?: ElementAnimation
  visible?: boolean
  responsive?: ResponsiveConfig
}

/**
 * 结果图模板
 */
export interface ShareCardTemplate {
  id: string
  name: LocalizedString
  thumbnail?: string | null
  description?: LocalizedString
  dimensions: TemplateDimensions
  background: TemplateBackground
  elements: TemplateElement[]
}

/**
 * 模板数据
 */
export interface TemplatesData {
  defaultTemplate?: string
  templates: ShareCardTemplate[]
}
