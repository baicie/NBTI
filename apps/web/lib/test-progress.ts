import type { TestSession } from '@nbti/core'

const STORAGE_KEY_PREFIX = 'nbti_test_'

interface StoredProgress {
  session: TestSession
  answers: Record<string, string>
  result: import('@nbti/core').ScoringResult | null
  timestamp: number
}

// 使用 globalThis 检测浏览器环境
const isBrowser =
  typeof globalThis !== 'undefined' &&
  typeof globalThis.localStorage !== 'undefined'

function getStorageKey(suiteId: string): string {
  return `${STORAGE_KEY_PREFIX}${suiteId}`
}

function loadProgress(suiteId: string): StoredProgress | null {
  if (!isBrowser) return null

  try {
    const stored = globalThis.localStorage.getItem(getStorageKey(suiteId))
    if (!stored) return null

    const parsed = JSON.parse(stored) as StoredProgress

    // 检查是否过期（24小时）
    const EXPIRY_HOURS = 24
    if (Date.now() - parsed.timestamp > EXPIRY_HOURS * 60 * 60 * 1000) {
      globalThis.localStorage.removeItem(getStorageKey(suiteId))
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/**
 * 同步读取上次的答题进度（题号），供组件渲染时直接使用
 */
export function getLastAnsweredIndex(
  suiteId: string,
  questionIds: string[],
): number {
  const stored = loadProgress(suiteId)
  if (!stored) return 0
  const answeredIds = Object.keys(stored.answers)
  for (let i = questionIds.length - 1; i >= 0; i--) {
    if (answeredIds.includes(questionIds[i])) {
      return i
    }
  }
  return 0
}
