/**
 * Manifest 类型定义
 * manifest.json 是测试包的元信息配置文件
 */

import type { LocalizedString } from './core'

/**
 * 配置文件路径映射
 */
export interface ManifestConfig {
  questions: string
  types: string
  templates?: string
  themes?: string
  i18n?: string
}

/**
 * 测试行为设置
 */
export interface ManifestSettings {
  allowBack?: boolean
  showTimer?: boolean
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  requiredAnswer?: boolean
  maxDuration?: number | null
}

/**
 * 计分配置
 */
export interface ManifestScoring {
  type: 'dimension' | 'percentage' | 'weighted-sum'
  dimensions: string[]
  calculateMethod?: 'difference' | 'ratio' | 'absolute'
  normalizeOutput?: boolean
}

/**
 * Manifest 元信息
 */
export interface Manifest {
  id: string
  name: LocalizedString
  version: string
  description?: LocalizedString
  author?: string
  thumbnail?: string
  tags?: string[]
  config: ManifestConfig
  settings?: ManifestSettings
  scoring: ManifestScoring
}
