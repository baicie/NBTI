/**
 * Suite 类型定义
 * 用于多试题套件架构
 */

import type { LocalizedString } from '@nbti/core'

/**
 * 套件元信息
 */
export interface SuiteConfig {
  id: string
  name: LocalizedString
  description: LocalizedString
  thumbnail?: string
  enabled: boolean
  order: number
}

/**
 * 套件索引
 */
export interface SuiteIndex {
  suites: SuiteConfig[]
  updatedAt: string
}

/**
 * 主题渐变配置
 */
export interface SuiteGradient {
  enabled: boolean
  from: string
  via: string
  to: string
}

/**
 * 主题样式配置
 */
export interface SuiteStyle {
  borderRadius: {
    none: number
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
    full: number
  }
  font?: {
    heading?: string
    body?: string
  }
}

/**
 * 结果页主题配置
 */
export interface SuiteResultStyle {
  dimensionChart: 'bar' | 'radar'
  showTraits: boolean
  shareCardStyle: 'gradient' | 'solid' | 'glass'
}

/**
 * 套件主题配置
 */
export interface SuiteTheme {
  id: string
  name: LocalizedString
  colors: Record<string, string>
  gradient?: SuiteGradient
  style?: SuiteStyle
  result?: SuiteResultStyle
}

/**
 * 加载的套件数据
 */
export interface LoadedSuite {
  config: SuiteConfig
  manifest: Record<string, unknown>
  theme: SuiteTheme
}
