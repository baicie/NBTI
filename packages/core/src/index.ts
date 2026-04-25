/**
 * @nbti/core - NBTI 测试框架核心包
 */

// Config
export { ConfigCache, ConfigLoader } from './config'

export * from './config/validator'
// i18n
export { createI18n, getI18n, I18n, t } from './i18n'

export type { Translator } from './i18n/dictionary'
// Image
export { generateImage, ImageGenerator } from './image'

export type { GeneratedImage, ImageGeneratorOptions } from './image/types'
// Rendering
export {
  calculateElementPosition,
  parsePosition,
  renderTemplate,
} from './rendering'

export type { RenderContext } from './rendering/types'
// Scoring
export { calculateScores, ScoringEngine } from './scoring'

export type { ScoringOptions, ScoringResult } from './scoring/types'
// Types
export * from './types'

// Re-export shared utilities
export * from '@nbti/shared'
