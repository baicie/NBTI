/**
 * 国际化解析器
 * 负责翻译文本的解析和获取
 */

import type { I18nDict } from '../types/i18n'

/**
 * 获取翻译文本
 */
export function getTranslation(
  dict: I18nDict,
  key: string,
  _locale: string,
  _fallbackLocale: string = 'zh',
): string {
  const keys = key.split('.')
  let current: string | I18nDict | undefined = dict

  for (const k of keys) {
    if (typeof current !== 'object' || current === null) {
      return key // 未找到，返回 key
    }
    current = current[k]
  }

  if (typeof current !== 'string') {
    return key
  }

  return current
}

/**
 * 解析带参数的翻译文本
 * 支持 {param} 格式的参数替换
 */
export function parseTranslation(
  text: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return text

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * 合并翻译字典
 * 后面的字典会覆盖前面的值
 */
export function mergeDictionaries(
  ...dicts: (I18nDict | undefined)[]
): I18nDict {
  const result: I18nDict = {}

  for (const dict of dicts) {
    if (!dict) continue
    Object.entries(dict).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result[key] = value
      } else if (typeof value === 'object' && value !== null) {
        result[key] = result[key] || {}
        Object.assign(result[key] as I18nDict, value)
      }
    })
  }

  return result
}

/**
 * 获取支持的语言列表
 */
export function getAvailableLocales(dict: I18nDict): string[] {
  const locales = new Set<string>()

  function traverse(obj: string | I18nDict, path: string[] = []): void {
    if (typeof obj === 'string') {
      // 找到语言代码
      const lastKey = path[path.length - 1]
      if (lastKey && /^[a-z]{2}(-[A-Z]{2})?$/.test(lastKey)) {
        locales.add(lastKey)
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        traverse(value, [...path, key])
      })
    }
  }

  traverse(dict)
  return Array.from(locales)
}
