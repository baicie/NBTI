/**
 * 模板解析器
 * 负责解析模板变量并替换为实际值
 */

/**
 * 简化的渲染上下文（用于模板解析）
 */
export interface TemplateContext {
  type: {
    code: string
    name: Record<string, string>
    subtitle?: Record<string, string>
    description?: Record<string, string>
    traits: Array<{ id: string; name: Record<string, string> }>
    strengths: Record<string, string>[]
    weaknesses: Record<string, string>[]
    careers: Record<string, string>[]
  }
  dimensions: Array<{
    id: string
    percentage: number
    dominant: string
  }>
  scoring?: {
    typeCode: string
    dimensions: Array<{
      dimensionId: string
      percentage: number
      dominant: string
    }>
  }
  config?: {
    appName?: string
    shareUrl?: string
  }
  locale: string
  timestamp: number
}

/**
 * 模板变量模式
 * 匹配 {key} 或 {obj.nested.key} 格式
 */
const VARIABLE_PATTERN = /\{(\w+(?:\.\w+)*)\}/g

/**
 * 解析模板变量路径
 */
export function parseVariablePath(
  path: string,
): { type: string; rest: string } | null {
  const match = path.match(/^(\w+)\.(.+)$/)
  if (match) {
    return { type: match[1], rest: match[2] }
  }
  return null
}

/**
 * 获取嵌套值
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * 获取本地化文本
 */
function getLocalizedValue(
  value: Record<string, unknown> | undefined,
  locale: string,
): string {
  if (!value) return ''

  // 优先使用当前语言
  if (typeof value[locale] === 'string') {
    return value[locale] as string
  }

  // 降级到中文
  if (typeof value.zh === 'string') {
    return value.zh
  }

  // 降级到第一个值
  const firstValue = Object.values(value)[0]
  return typeof firstValue === 'string' ? firstValue : ''
}

/**
 * 解析变量引用
 */
function resolveVariable(context: TemplateContext, path: string): string {
  const parsed = parseVariablePath(path)

  if (!parsed) {
    return path
  }

  const { type, rest } = parsed

  switch (type) {
    case 'type': {
      const typeData = context.type
      const value = getNestedValue(
        typeData as unknown as Record<string, unknown>,
        rest,
      )
      if (typeof value === 'object' && value !== null) {
        return getLocalizedValue(
          value as Record<string, unknown>,
          context.locale,
        )
      }
      return String(value ?? path)
    }

    case 'dimension': {
      const [dimId, ...restPath] = rest.split('.')
      const dim = context.dimensions.find(d => d.id === dimId)
      if (!dim) return path
      if (restPath.length === 0) {
        return dim.percentage.toString()
      }
      return String(getNestedValue(dim, restPath.join('.')) ?? path)
    }

    case 'trait': {
      const [traitIndex, ...restPath] = rest.split('.')
      const index = parseInt(traitIndex, 10)
      const trait = context.type.traits[index]
      if (!trait) return path
      if (restPath.length === 0) {
        return getLocalizedValue(trait.name, context.locale)
      }
      return String(getNestedValue(trait, restPath.join('.')) ?? path)
    }

    case 'share': {
      const shareData = { url: context.config?.shareUrl || '' }
      return String(getNestedValue(shareData, rest) ?? path)
    }

    case 'datetime': {
      const format = rest || 'YYYY-MM-DD'
      const date = new Date(context.timestamp)
      return format
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', date.getDate().toString().padStart(2, '0'))
        .replace('HH', date.getHours().toString().padStart(2, '0'))
        .replace('mm', date.getMinutes().toString().padStart(2, '0'))
        .replace('ss', date.getSeconds().toString().padStart(2, '0'))
    }

    case 'config': {
      const value = getNestedValue(
        context.config as unknown as Record<string, unknown>,
        rest,
      )
      return String(value ?? path)
    }

    case 'i18n': {
      // i18n 变量需要从外部翻译字典获取，这里返回原始路径
      return `{${path}}`
    }

    default:
      return `{${path}}`
  }
}

/**
 * 模板插值
 * 将模板中的变量替换为实际值
 */
export function interpolateTemplate(
  template: string,
  context: TemplateContext,
): string {
  return template.replace(VARIABLE_PATTERN, (match, path) => {
    const value = resolveVariable(context, path)
    // 如果返回 undefined 或原始路径（未识别），保留原始变量格式
    if (value === undefined || value === path) {
      return match
    }
    return value
  })
}

/**
 * 批量插值
 */
export function interpolateTemplates(
  templates: string[],
  context: TemplateContext,
): string[] {
  return templates.map(t => interpolateTemplate(t, context))
}

/**
 * 检查字符串是否包含变量
 */
export function containsVariables(str: string): boolean {
  return VARIABLE_PATTERN.test(str)
}

/**
 * 提取所有变量名
 */
export function extractVariables(str: string): string[] {
  const matches: string[] = []
  str.replace(VARIABLE_PATTERN, (_, path) => {
    matches.push(path)
    return _
  })
  return matches
}
