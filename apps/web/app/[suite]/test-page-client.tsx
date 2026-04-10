'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTest } from '@/providers/test-provider'
import type { Question } from '@nbti/core'

interface TestPageClientProps {
  suiteId: string
  questions: Question[]
  manifest: {
    name: Record<string, string>
    settings?: {
      allowBack?: boolean
      showTimer?: boolean
      maxDuration?: number | null
    }
  }
  locale?: string
}

export function TestPageClient({
  suiteId,
  questions,
  manifest,
  locale = 'zh',
}: TestPageClientProps) {
  const router = useRouter()
  const {
    session,
    answers,
    startSession,
    answerQuestion,
    resetTest,
    submitTest,
    resumeSession,
  } = useTest()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const totalQuestions = questions.length
  const answeredCount = answers.size
  const allAnswered = answeredCount === totalQuestions
  const progress = (answeredCount / totalQuestions) * 100

  // 获取题目和选项的本地化文本
  const getLocalizedContent = (content: Record<string, string>): string => {
    if (typeof content === 'string') {
      return content
    }
    return content[locale] || content.zh || Object.values(content)[0] || ''
  }

  // 初始化启动测试
  useEffect(() => {
    if (!session) {
      // 尝试恢复之前的进度
      const resumed = resumeSession(suiteId, totalQuestions)
      if (!resumed) {
        // 没有保存的进度，创建新会话
        startSession(suiteId)
      }
    }
  }, [session, suiteId, totalQuestions, resumeSession, startSession])

  // 选择选项
  const handleOptionSelect = (questionId: string, optionId: string) => {
    answerQuestion(questionId, optionId)
  }

  // 提交测试
  const handleSubmit = () => {
    setIsSubmitting(true)
    // 计算结果并存入 context
    submitTest()
    router.push(`/${suiteId}/result`)
  }

  // 返回首页
  const handleExit = () => {
    resetTest()
    router.push('/')
  }

  // 还没开始
  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--suite-background)' }}
      >
        <div className="text-center">
          <div className="animate-pulse">
            <span
              className="text-4xl font-bold"
              style={{ color: 'var(--suite-primary)' }}
            >
              加载中...
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--suite-background)' }}
    >
      {/* 顶部进度栏 */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md border-b"
        style={{
          backgroundColor: 'var(--suite-background)',
          borderColor: 'var(--suite-border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExit}
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: 'var(--suite-muted-foreground)',
                  backgroundColor: 'var(--suite-muted)',
                }}
              >
                退出
              </button>
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--suite-foreground)' }}
              >
                {getLocalizedContent(manifest.name)}
              </span>
            </div>

            {/* 进度计数 */}
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: 'var(--suite-foreground)' }}
              >
                {answeredCount} / {totalQuestions}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  allAnswered ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: allAnswered
                    ? 'var(--suite-primary)'
                    : 'var(--suite-muted)',
                  color: allAnswered
                    ? 'var(--suite-primary-foreground)'
                    : 'var(--suite-muted-foreground)',
                }}
              >
                {allAnswered ? '完成' : '进行中'}
              </span>
            </div>
          </div>

          {/* 进度条 */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--suite-muted)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--suite-primary)',
              }}
            />
          </div>
        </div>
      </header>

      {/* 题目列表 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {questions.map((question, questionIndex) => {
            const selectedOption = answers.get(question.id)
            const letters = ['A', 'B', 'C', 'D', 'E', 'F']

            return (
              <div
                key={question.id}
                ref={el => {
                  if (el) questionRefs.current.set(question.id, el)
                }}
                className="space-y-4"
              >
                {/* 题目头部 */}
                <div className="flex items-start gap-3">
                  <span
                    className="flex-none w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: selectedOption
                        ? 'var(--suite-primary)'
                        : 'var(--suite-muted)',
                      color: selectedOption
                        ? 'var(--suite-primary-foreground)'
                        : 'var(--suite-muted-foreground)',
                    }}
                  >
                    {questionIndex + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-base md:text-lg font-medium leading-relaxed"
                      style={{ color: 'var(--suite-foreground)' }}
                    >
                      {getLocalizedContent(question.content)}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--suite-muted-foreground)' }}
                    >
                      {question.dimension}
                    </p>
                  </div>
                </div>

                {/* 选项列表 */}
                <div className="space-y-2 pl-11">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedOption === option.id

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(question.id, option.id)
                        }
                        className={`
                          w-full p-3 rounded-lg border text-left
                          transition-all duration-150 ease-out
                          hover:scale-[1.01] active:scale-[0.99]
                          ${isSelected ? 'shadow-md' : ''}
                        `}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--suite-primary)' + '15'
                            : 'var(--suite-card)',
                          borderColor: isSelected
                            ? 'var(--suite-primary)'
                            : 'var(--suite-border)',
                          color: 'var(--suite-foreground)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* 选项字母 */}
                          <span
                            className={`
                              flex-none w-6 h-6 rounded flex items-center justify-center
                              text-xs font-bold
                              ${isSelected ? 'text-white' : ''}
                            `}
                            style={{
                              backgroundColor: isSelected
                                ? 'var(--suite-primary)'
                                : 'var(--suite-muted)',
                              color: isSelected
                                ? 'var(--suite-primary-foreground)'
                                : 'var(--suite-muted-foreground)',
                            }}
                          >
                            {letters[optionIndex]}
                          </span>

                          {/* 选项文本 */}
                          <span className="text-sm md:text-base">
                            {getLocalizedContent(option.content)}
                          </span>

                          {/* 选中标记 */}
                          {isSelected && (
                            <span
                              className="ml-auto"
                              style={{ color: 'var(--suite-primary)' }}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* 分割线（最后一道题不加） */}
                {questionIndex < questions.length - 1 && (
                  <div
                    className="border-t mx-11"
                    style={{ borderColor: 'var(--suite-border)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* 底部提交栏 */}
      <footer
        className={`sticky bottom-0 border-t py-4 transition-all duration-300 ${
          allAnswered ? 'opacity-100' : 'opacity-70'
        }`}
        style={{
          backgroundColor: 'var(--suite-background)',
          borderColor: 'var(--suite-border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4">
          {allAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-lg font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: 'var(--suite-primary)',
                color: 'var(--suite-primary-foreground)',
              }}
            >
              {isSubmitting ? '提交中...' : '提交并查看结果'}
            </button>
          ) : (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              继续选择答案，还剩 {totalQuestions - answeredCount} 题未完成
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
