/**
 * 对象工具函数
 */

/**
 * 安全获取嵌套对象属性值
 */
export function getNestedValue<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue?: T,
): T | undefined {
  if (!obj) return defaultValue

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue
    }
    if (typeof current !== 'object') {
      return defaultValue
    }
    current = (current as Record<string, unknown>)[key]
  }

  return (current as T) ?? defaultValue
}

/**
 * 浅拷贝对象并覆盖指定属性
 */
export function extend<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Record<string, unknown>>
): T {
  const result = { ...target }
  for (const source of sources) {
    if (source) {
      Object.keys(source).forEach(key => {
        const k = key as keyof T
        if (source[key] !== undefined) {
          result[k] = source[key] as T[keyof T]
        }
      })
    }
  }
  return result
}

/**
 * 深拷贝对象（JSON 方式，简单实现）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 筛选对象中指定的键
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 排除对象中指定的键
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}
