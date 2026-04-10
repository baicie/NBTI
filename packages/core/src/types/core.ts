/**
 * 核心类型定义
 */

import type { I18nDict } from './i18n'
import type { Manifest } from './manifest'
import type { QuestionsData } from './question'
import type { TemplatesData } from './template'
import type { ThemeData } from './theme'
import type { TypesData } from './result'

/**
 * 本地化字符串类型
 * 支持多语言，键为语言代码，值为对应语言的文本
 */
export interface LocalizedString {
  [key: string]: string
}

/**
 * 配置数据源类型
 */
export type ConfigSourceType = 'local' | 'remote' | 'npm'

/**
 * 配置源
 */
export interface ConfigSource {
  type: ConfigSourceType
  basePath: string
  manifestPath?: string
}

/**
 * 测试会话
 */
export interface TestSession {
  id: string
  packageId: string
  startTime: number
  currentIndex: number
  totalQuestions: number
  answers: Answer[]
}

/**
 * 用户答案
 */
export interface Answer {
  questionId: string
  optionId: string
  weight: Record<string, number>
  timestamp: number
}

/**
 * 用户设置
 */
export interface UserSettings {
  locale: string
  theme: 'light' | 'dark' | 'system'
  animationEnabled: boolean
  soundEnabled: boolean
}

/**
 * 加载完成的完整配置
 */
export interface LoadedConfig {
  manifest: Manifest
  questions: QuestionsData
  types: TypesData
  templates: TemplatesData
  theme: ThemeData
  i18n: Record<string, I18nDict>
}
