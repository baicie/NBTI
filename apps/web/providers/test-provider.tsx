'use client'

import type {
  Answer,
  LoadedConfig,
  ScoringResult,
  TestSession,
  UserSettings,
} from '@nbti/core'
import type { ReactNode } from 'react'
import { calculateScores } from '@nbti/core'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { getLastAnsweredIndex } from '@/lib/test-progress'
import { uuidV4 } from '@/lib/uuid'
export { getLastAnsweredIndex }

interface TestContextValue {
  config: LoadedConfig | null
  configStatus: 'idle' | 'loading' | 'loaded' | 'error'
  configError: Error | null
  session: TestSession | null
  answers: Map<string, string>
  result: ScoringResult | null
  settings: UserSettings
  loadConfig: (config: LoadedConfig) => void
  startSession: (suiteId: string) => void
  answerQuestion: (questionId: string, optionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submitTest: () => ScoringResult
  resetTest: () => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setLocale: (locale: string) => void
  resumeSession: (
    suiteId: string,
    totalQuestions: number,
    questionIds?: string[],
  ) => { resumed: boolean; lastAnsweredIndex?: number }
}

// 默认配置（用于测试模式）
const defaultConfig: LoadedConfig = {
  manifest: {
    id: 'nbti-test',
    name: { zh: 'NBTI 测试', en: 'NBTI Test' },
    version: '1.0.0',
    config: {
      questions: '',
      types: '',
    },
    scoring: {
      type: 'dimension',
      dimensions: ['EI', 'NS', 'TF', 'JP'],
      calculateMethod: 'difference',
    },
  },
  questions: {
    meta: { totalQuestions: 4, timeEstimate: 300 },
    dimensions: [],
    questions: [],
  },
  types: { types: [] },
  templates: { templates: [] },
  theme: { themes: {} },
  i18n: {},
}

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

function saveProgress(
  suiteId: string,
  session: TestSession,
  answers: Map<string, string>,
  result?: import('@nbti/core').ScoringResult | null,
): void {
  if (!isBrowser) return

  try {
    const stored: StoredProgress = {
      session,
      answers: Object.fromEntries(answers),
      result: result ?? null,
      timestamp: Date.now(),
    }
    globalThis.localStorage.setItem(
      getStorageKey(suiteId),
      JSON.stringify(stored),
    )
  } catch {
    // 忽略存储错误
  }
}

function clearProgress(suiteId: string): void {
  if (!isBrowser) return
  globalThis.localStorage.removeItem(getStorageKey(suiteId))
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
 * 仅保存结果，清除答题进度（用于提交后）
 * 保留 result 便于结果页恢复，但清除 session 和 answers
 */
function saveResultOnly(
  suiteId: string,
  result: import('@nbti/core').ScoringResult,
): void {
  if (!isBrowser) return

  try {
    const stored: StoredProgress = {
      session: {
        id: '',
        packageId: suiteId,
        startTime: 0,
        currentIndex: 0,
        totalQuestions: 0,
        answers: [],
      },
      answers: {},
      result,
      timestamp: Date.now(),
    }
    globalThis.localStorage.setItem(
      getStorageKey(suiteId),
      JSON.stringify(stored),
    )
  } catch {
    // 忽略存储错误
  }
}

const TestContext = createContext<TestContextValue | null>(null)

export function TestProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LoadedConfig | null>(defaultConfig)
  const [configStatus, setConfigStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle')
  const [configError, setConfigError] = useState<Error | null>(null)
  const [session, setSession] = useState<TestSession | null>(null)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [settings, setSettings] = useState<UserSettings>({
    locale: 'zh',
    theme: 'light',
    animationEnabled: true,
    soundEnabled: false,
  })

  // 存储当前套件ID用于持久化
  const [currentSuiteId, setCurrentSuiteId] = useState<string | null>(null)

  // 使用 refs 避免 closure 导致的 stale 值问题（Bug 1 fix）
  const sessionRef = useRef<TestSession | null>(null)
  const currentSuiteIdRef = useRef<string | null>(null)

  const loadConfig = useCallback((newConfig: LoadedConfig) => {
    setConfig(newConfig)
    setConfigStatus('loaded')
    setConfigError(null)
  }, [])

  const startSession = useCallback(
    (suiteId: string) => {
      if (!config) return

      // 先尝试恢复之前的进度
      const stored = loadProgress(suiteId)
      if (stored) {
        setSession(stored.session)
        setAnswers(new Map(Object.entries(stored.answers)))
        setCurrentSuiteId(suiteId)
        setResult(null)
        // 同步更新 refs（Bug 1 fix）
        sessionRef.current = stored.session
        currentSuiteIdRef.current = suiteId
        return
      }

      // 没有保存的进度，创建新会话
      const questions = config.questions.questions
      const newSession: TestSession = {
        id: uuidV4(),
        packageId: config.manifest.id,
        startTime: Date.now(),
        currentIndex: 0,
        totalQuestions: questions.length || 4,
        answers: [],
      }
      setSession(newSession)
      setAnswers(new Map())
      setCurrentSuiteId(suiteId)
      setResult(null)
      // 同步更新 refs 以避免 closure staleness（Bug 1 fix）
      sessionRef.current = newSession
      currentSuiteIdRef.current = suiteId

      // 保存初始进度
      saveProgress(suiteId, newSession, new Map())
    },
    [config],
  )

  // 恢复会话（不自动启动）
  const resumeSession = useCallback(
    (
      suiteId: string,
      totalQuestions: number,
      questionIds?: string[],
    ): { resumed: boolean; lastAnsweredIndex?: number } => {
      const stored = loadProgress(suiteId)
      if (stored && stored.session.totalQuestions === totalQuestions) {
        setSession(stored.session)
        setAnswers(new Map(Object.entries(stored.answers)))
        setCurrentSuiteId(suiteId)
        setResult(stored.result)
        sessionRef.current = stored.session
        currentSuiteIdRef.current = suiteId

        // 计算已答的最后一题索引
        let lastAnsweredIndex: number | undefined
        if (questionIds && questionIds.length > 0) {
          const answeredIds = Object.keys(stored.answers)
          for (let i = questionIds.length - 1; i >= 0; i--) {
            if (answeredIds.includes(questionIds[i])) {
              lastAnsweredIndex = i
              break
            }
          }
        }

        return { resumed: true, lastAnsweredIndex }
      }
      return { resumed: false }
    },
    [],
  )

  const answerQuestion = useCallback((questionId: string, optionId: string) => {
    setAnswers(prev => {
      const next = new Map(prev)
      next.set(questionId, optionId)

      // 使用 ref 读取最新的值，避免 closure staleness（Bug 1 fix）
      const suiteId = currentSuiteIdRef.current
      const activeSession = sessionRef.current
      if (activeSession && suiteId) {
        saveProgress(suiteId, activeSession, next)
      }

      return next
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev
      const totalQuestions = prev.totalQuestions
      const nextIndex = Math.min(prev.currentIndex + 1, totalQuestions - 1)
      const newSession = { ...prev, currentIndex: nextIndex }

      // 持久化
      if (currentSuiteId) {
        saveProgress(currentSuiteId, newSession, answers)
      }

      return newSession
    })
  }, [currentSuiteId, answers])

  const prevQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev
      const nextIndex = Math.max(prev.currentIndex - 1, 0)
      const newSession = { ...prev, currentIndex: nextIndex }

      // 持久化
      if (currentSuiteId) {
        saveProgress(currentSuiteId, newSession, answers)
      }

      return newSession
    })
  }, [currentSuiteId, answers])

  const submitTest = useCallback((): ScoringResult => {
    if (!config || !sessionRef.current) {
      throw new Error('No config or session available')
    }

    const answerList: Answer[] = []

    answers.forEach((optionId, questionId) => {
      const question = config.questions.questions.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.id === optionId)
        if (option) {
          answerList.push({
            questionId,
            optionId,
            weight: option.weight,
            timestamp: Date.now(),
          })
        }
      }
    })

    const scoringResult = calculateScores(
      answerList,
      config.manifest.scoring,
      config.questions.questions,
    )

    setResult(scoringResult)

    // 提交后清除答题进度，仅保留结果（便于结果页恢复）
    const suiteId = currentSuiteIdRef.current
    if (suiteId) {
      saveResultOnly(suiteId, scoringResult)
    }

    return scoringResult
  }, [config, answers])

  const resetTest = useCallback(() => {
    setSession(null)
    setAnswers(new Map())
    setResult(null)
    // 清除保存的进度（使用 ref）
    const suiteId = currentSuiteIdRef.current
    if (suiteId) {
      clearProgress(suiteId)
    }
    setCurrentSuiteId(null)
    // 清除 refs
    sessionRef.current = null
    currentSuiteIdRef.current = null
  }, [])

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const setLocale = useCallback((locale: string) => {
    setSettings(prev => ({ ...prev, locale }))
  }, [])

  const value: TestContextValue = {
    config,
    configStatus,
    configError,
    session,
    answers,
    result,
    settings,
    loadConfig,
    startSession,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitTest,
    resetTest,
    updateSettings,
    setLocale,
    resumeSession,
  }

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTest() {
  const context = useContext(TestContext)
  if (!context) {
    throw new Error('useTest must be used within a TestProvider')
  }
  return context
}

// Export the context for advanced use cases
export { TestContext }
