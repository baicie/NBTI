'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type {
  Answer,
  LoadedConfig,
  ScoringResult,
  TestSession,
  UserSettings,
} from '@nbti/core'
import { calculateScores } from '@nbti/core'

interface TestContextValue {
  config: LoadedConfig | null
  configStatus: 'idle' | 'loading' | 'loaded' | 'error'
  configError: Error | null
  session: TestSession | null
  answers: Map<string, string>
  result: ScoringResult | null
  settings: UserSettings
  loadConfig: (config: LoadedConfig) => void
  startSession: () => void
  answerQuestion: (questionId: string, optionId: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  submitTest: () => ScoringResult
  resetTest: () => void
  updateSettings: (settings: Partial<UserSettings>) => void
  setLocale: (locale: string) => void
}

const TestContext = createContext<TestContextValue | null>(null)

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
    questions: [],
  },
  types: { types: [] },
  templates: { templates: [] },
  theme: { themes: {} },
  i18n: {},
}

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

  const loadConfig = useCallback((newConfig: LoadedConfig) => {
    setConfig(newConfig)
    setConfigStatus('loaded')
    setConfigError(null)
  }, [])

  const startSession = useCallback(() => {
    if (!config) return

    const questions = config.questions.questions
    setSession({
      id: crypto.randomUUID(),
      packageId: config.manifest.id,
      startTime: Date.now(),
      currentIndex: 0,
      totalQuestions: questions.length || 4, // 默认4题
      answers: [],
    })
    setAnswers(new Map())
    setResult(null)
  }, [config])

  const answerQuestion = useCallback((questionId: string, optionId: string) => {
    setAnswers(prev => {
      const next = new Map(prev)
      next.set(questionId, optionId)
      return next
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev
      const totalQuestions = prev.totalQuestions
      const nextIndex = Math.min(prev.currentIndex + 1, totalQuestions - 1)
      return { ...prev, currentIndex: nextIndex }
    })
  }, [])

  const prevQuestion = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev
      const nextIndex = Math.max(prev.currentIndex - 1, 0)
      return { ...prev, currentIndex: nextIndex }
    })
  }, [])

  const submitTest = useCallback((): ScoringResult => {
    if (!config || !session) {
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
      config.questions.dimensions,
      config.questions.questions,
    )

    setResult(scoringResult)
    return scoringResult
  }, [config, session, answers])

  const resetTest = useCallback(() => {
    setSession(null)
    setAnswers(new Map())
    setResult(null)
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
  }

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>
}

export function useTest() {
  const context = useContext(TestContext)
  if (!context) {
    throw new Error('useTest must be used within a TestProvider')
  }
  return context
}

// Export the context for advanced use cases
export { TestContext }
