/**
 * i18n 类型定义
 * 国际化翻译文件类型
 */

/**
 * 翻译字典
 */
export interface I18nDict {
  [key: string]: string | I18nDict
}

/**
 * 翻译函数参数
 */
export interface TranslateOptions {
  locale: string
  namespace?: string
}
