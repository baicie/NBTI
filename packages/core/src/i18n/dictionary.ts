/**
 * 国际化字典管理器
 */

import type { I18nDict } from '../types/i18n'
import { getTranslation, parseTranslation } from './resolver'

/**
 * 翻译函数类型
 */
export type Translator = (
  key: string,
  params?: Record<string, string | number>,
) => string

/**
 * 翻译器类
 */
export class I18n {
  private dictionaries: Map<string, I18nDict> = new Map()
  private currentLocale: string = 'zh'
  private fallbackLocale: string = 'zh'

  constructor() {
    // 默认注册空字典
    this.dictionaries.set('zh', {})
    this.dictionaries.set('en', {})
  }

  /**
   * 注册字典
   */
  registerDictionary(locale: string, dict: I18nDict): void {
    this.dictionaries.set(locale, dict)
  }

  /**
   * 获取当前语言
   */
  getLocale(): string {
    return this.currentLocale
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: string): void {
    if (this.dictionaries.has(locale)) {
      this.currentLocale = locale
    }
    else {
      console.warn(`Locale "${locale}" not registered, using fallback`)
      this.currentLocale = this.fallbackLocale
    }
  }

  /**
   * 获取回退语言
   */
  getFallbackLocale(): string {
    return this.fallbackLocale
  }

  /**
   * 设置回退语言
   */
  setFallbackLocale(locale: string): void {
    this.fallbackLocale = locale
  }

  /**
   * 获取翻译
   */
  t(key: string, params?: Record<string, string | number>): string {
    // 优先使用当前语言
    let dict = this.dictionaries.get(this.currentLocale)
    let text = getTranslation(
      dict || {},
      key,
      this.currentLocale,
      this.fallbackLocale,
    )

    // 如果未找到，使用回退语言
    if (text === key && this.currentLocale !== this.fallbackLocale) {
      dict = this.dictionaries.get(this.fallbackLocale)
      text = getTranslation(dict || {}, key, this.fallbackLocale)
    }

    // 解析参数
    return parseTranslation(text, params)
  }

  /**
   * 创建翻译函数
   */
  createTranslator(): Translator {
    return (key: string, params?: Record<string, string | number>) =>
      this.t(key, params)
  }

  /**
   * 获取所有已注册的语言
   */
  getRegisteredLocales(): string[] {
    return Array.from(this.dictionaries.keys())
  }

  /**
   * 检查语言是否已注册
   */
  hasLocale(locale: string): boolean {
    return this.dictionaries.has(locale)
  }

  /**
   * 清除所有字典
   */
  clear(): void {
    this.dictionaries.clear()
  }
}

// 全局实例
let globalI18n: I18n | null = null

/**
 * 获取全局 I18n 实例
 */
export function getI18n(): I18n {
  if (!globalI18n) {
    globalI18n = new I18n()
  }
  return globalI18n
}

/**
 * 创建新的 I18n 实例
 */
export function createI18n(): I18n {
  return new I18n()
}

/**
 * 快捷翻译函数
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  return getI18n().t(key, params)
}
