/**
 * 通用常量定义
 */

/**
 * 支持的国际化语言列表
 */
export const SUPPORTED_LOCALES = ['zh', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/**
 * 默认语言
 */
export const DEFAULT_LOCALE: SupportedLocale = 'zh'

/**
 * 测试状态
 */
export const TEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const
export type TestStatus = (typeof TEST_STATUS)[keyof typeof TEST_STATUS]

/**
 * 计分类型
 */
export const SCORING_TYPES = {
  DIMENSION: 'dimension',
  PERCENTAGE: 'percentage',
  WEIGHTED_SUM: 'weighted-sum',
} as const
export type ScoringType = (typeof SCORING_TYPES)[keyof typeof SCORING_TYPES]

/**
 * 计算方法
 */
export const CALCULATE_METHODS = {
  DIFFERENCE: 'difference',
  RATIO: 'ratio',
  ABSOLUTE: 'absolute',
} as const
export type CalculateMethod =
  (typeof CALCULATE_METHODS)[keyof typeof CALCULATE_METHODS]

/**
 * 元素类型
 */
export const ELEMENT_TYPES = {
  TEXT: 'text',
  SHAPE: 'shape',
  IMAGE: 'image',
  QRCODE: 'qrcode',
  RADAR: 'radar',
  TRAIT_BADGES: 'trait-badges',
  DIMENSION_BAR: 'dimension-bar',
  DIVIDER: 'divider',
} as const
export type ElementType = (typeof ELEMENT_TYPES)[keyof typeof ELEMENT_TYPES]

/**
 * 背景类型
 */
export const BACKGROUND_TYPES = {
  COLOR: 'color',
  GRADIENT: 'gradient',
  IMAGE: 'image',
} as const
export type BackgroundType =
  (typeof BACKGROUND_TYPES)[keyof typeof BACKGROUND_TYPES]

/**
 * 动画类型
 */
export const ANIMATION_TYPES = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SCALE: 'scale',
  NONE: 'none',
} as const
export type AnimationType =
  (typeof ANIMATION_TYPES)[keyof typeof ANIMATION_TYPES]

/**
 * 预设位置
 */
export const PRESET_POSITIONS = [
  'center',
  'top',
  'bottom',
  'left',
  'right',
] as const
export type PresetPosition = (typeof PRESET_POSITIONS)[number]

/**
 * 布局类型
 */
export const LAYOUT_TYPES = ['horizontal', 'vertical', 'grid', 'flow'] as const
export type LayoutType = (typeof LAYOUT_TYPES)[number]

/**
 * 形状类型
 */
export const SHAPE_TYPES = [
  'circle',
  'rectangle',
  'line',
  'triangle',
  'polygon',
] as const
export type ShapeType = (typeof SHAPE_TYPES)[keyof typeof SHAPE_TYPES]
