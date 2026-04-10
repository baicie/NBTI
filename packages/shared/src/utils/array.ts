/**
 * 数组工具函数
 */

/**
 * 从数组中随机选择一个元素
 */
export function randomPick<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 打乱数组顺序（Fisher-Yates 算法）
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 将数组分组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * 数组交集
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter(item => setB.has(item))
}

/**
 * 数组差集
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter(item => !setB.has(item))
}

/**
 * 按键分组
 */
export function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>,
  )
}
