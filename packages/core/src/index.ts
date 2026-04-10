/**
 * @nbti/core - NBTI 测试框架核心包
 */

// Types
export * from './types'

// Config
export { ConfigLoader, ConfigCache } from './config'
export * from './config/validator'

// Scoring
export { ScoringEngine, calculateScores } from './scoring'
export type { ScoringResult, ScoringOptions } from './scoring/types'

// Rendering
export {
  renderTemplate,
  parsePosition,
  calculateElementPosition,
} from './rendering'
export type { RenderContext } from './rendering/types'

// Image
export { ImageGenerator, generateImage } from './image'
export type { GeneratedImage, ImageGeneratorOptions } from './image/types'

// i18n
export { I18n, getI18n, createI18n, t } from './i18n'
export type { Translator } from './i18n/dictionary'

// Re-export shared utilities
export * from '@nbti/shared'
