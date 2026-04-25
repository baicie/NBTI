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
  type: 'dimension' | 'percentage' | 'weighted-sum' | 'type'
  dimensions: string[]
  calculateMethod?: 'difference' | 'ratio' | 'absolute'
  normalizeOutput?: boolean
  /** 隐藏款触发规则（用于 type-scoring） */
  hiddenTrigger?: {
    minScore: number
    triggerQuestions?: string[]
    priority?: string[]
  }
  /** 维度到类型的映射（用于 type-scoring，计算维度百分比） */
  dimensionMapping?: Record<string, string>
}

/**
 * Manifest 元信息
 */
export interface ManifestAudio {
  backgroundMusic?: {
    /** 文件路径（相对 public）或 'generated:{type}' 表示程序化生成 */
    src: string
    volume: number
    loop?: boolean
  }
  /** 音效配置（预留） */
  effects?: {
    select?: string
    complete?: string
  }
}

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
  audio?: ManifestAudio
}
