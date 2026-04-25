/**
 * 渲染引擎类型定义
 */

import type { ScoringResult } from '../scoring/types'
import type { LocalizedString } from '../types/core'
import type { Trait } from '../types/result'
import type { ShareCardTemplate } from '../types/template'
import type { ThemeDefinition } from '../types/theme'

/**
 * 渲染上下文
 */
export interface RenderContext {
  type: {
    code: string
    name: LocalizedString
    subtitle?: LocalizedString
    description?: LocalizedString
    traits: Trait[]
    strengths: LocalizedString[]
    weaknesses: LocalizedString[]
    careers: LocalizedString[]
  }
  dimensions: {
    id: string
    percentage: number
    dominant: string
  }[]
  scoring: ScoringResult
  config: {
    appName: string
    shareUrl: string
  }
  locale: string
  theme: ThemeDefinition
  timestamp: number
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  locale?: string
  template?: ShareCardTemplate
  theme?: ThemeDefinition
  shareUrl?: string
}

/**
 * 变量类型
 */
export type VariableType
  = | 'type'
    | 'dimension'
    | 'trait'
    | 'share'
    | 'datetime'
    | 'config'
    | 'i18n'

/**
 * 变量路径
 */
export interface VariablePath {
  type: VariableType
  path: string
}
