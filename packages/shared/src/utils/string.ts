/**
 * 字符串工具函数
 */

/**
 * 模板字符串插值
 * 支持 {key} 和 {obj.nested.key} 格式
 */
export function interpolate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
    const keys = path.split('.')
    let value: unknown = context
    for (const key of keys) {
      if (value === null || value === undefined) {
        return match
      }
      value = (value as Record<string, unknown>)[key]
    }
    return value === undefined || value === null ? match : String(value)
  })
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  if (!str)
    return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 将字符串转换为驼峰命名
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, char => char.toLowerCase())
}

/**
 * 将字符串转换为短横线命名
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 生成随机 ID
 */
export function generateId(prefix?: string): string {
  const id = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${id}` : id
}
