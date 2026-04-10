/**
 * Themes 类型定义
 * themes.json 是主题样式配置文件
 */

import type { LocalizedString } from './core'

/**
 * 颜色配置
 */
export interface ThemeColors {
  primary: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  background: string
  foreground: string
  muted?: string
  mutedForeground?: string
  accent?: string
  accentForeground?: string
  destructive?: string
  destructiveForeground?: string
  success?: string
  successForeground?: string
  warning?: string
  warningForeground?: string
  border?: string
  input?: string
  ring?: string
  card?: string
  cardForeground?: string
  popover?: string
  popoverForeground?: string
}

/**
 * 字体配置
 */
export interface ThemeFont {
  heading?: string
  body?: string
  mono?: string
  fallback?: string[]
}

/**
 * 圆角配置
 */
export interface ThemeBorderRadius {
  none?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  '2xl'?: number
  '3xl'?: number
  full?: number
}

/**
 * 阴影配置
 */
export interface ThemeShadows {
  none?: string
  sm?: string
  md?: string
  lg?: string
  xl?: string
}

/**
 * 间距配置
 */
export interface ThemeSpacing {
  unit?: number
  scale?: number[]
}

/**
 * 动画时长配置
 */
export interface ThemeAnimationDuration {
  fast?: number
  normal?: number
  slow?: number
}

/**
 * 动画缓动配置
 */
export interface ThemeAnimationEasing {
  default?: string
  in?: string
  out?: string
  bounce?: string
}

/**
 * 动画配置
 */
export interface ThemeAnimation {
  duration?: ThemeAnimationDuration
  easing?: ThemeAnimationEasing
}

/**
 * 主题定义
 */
export interface ThemeDefinition {
  name: LocalizedString
  extends?: string
  colors: ThemeColors
  font?: ThemeFont
  borderRadius?: ThemeBorderRadius
  shadows?: ThemeShadows
  spacing?: ThemeSpacing
  animation?: ThemeAnimation
}

/**
 * 主题数据
 */
export interface ThemeData {
  defaultTheme?: string
  themes: Record<string, ThemeDefinition>
}
