'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTest } from '@/providers/test-provider'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Question } from '@nbti/core'

interface TestPageClientProps {
  suiteId: string
  questions: Question[]
  manifest: {
    name: Record<string, string>
    settings?: {
      layout?: 'list' | 'single'
      allowBack?: boolean
      showTimer?: boolean
      maxDuration?: number | null
      showDimensions?: boolean
    }
    background?: {
      enabled?: boolean
      image?: string
      opacity?: number
      position?: string
      size?: string
    }
  }
  locale?: string
}

type LayoutMode = 'list' | 'single'

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animateKey, setAnimateKey] = useState(0)
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const totalQuestions = questions.length
  const answeredCount = answers.size
  const allAnswered = answeredCount === totalQuestions
  const progress = (answeredCount / totalQuestions) * 100

  // 布局模式
  const layoutMode: LayoutMode =
    manifest.settings?.layout === 'single' ? 'single' : 'list'
  const showDimensions = manifest.settings?.showDimensions !== false
  const allowBack = manifest.settings?.allowBack !== false

  const getLocalizedContent = (content: Record<string, string>): string => {
    if (typeof content === 'string') {
      return content
    }
    return content[locale] || content.zh || Object.values(content)[0] || ''
  }

  useEffect(() => {
    if (!session) {
      const resumed = resumeSession(suiteId, totalQuestions)
      if (!resumed) {
        startSession(suiteId)
      }
    }
  }, [session, suiteId, totalQuestions, resumeSession, startSession])

  const handleOptionSelect = (questionId: string, optionId: string) => {
    answerQuestion(questionId, optionId)
    // 注意：不再自动跳转到下一题，由用户手动点击按钮
  }

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
      setAnimateKey(prev => prev + 1)
      scrollToTop()
    }
  }, [currentIndex, totalQuestions])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setAnimateKey(prev => prev + 1)
      scrollToTop()
    }
  }, [currentIndex])

  const scrollToTop = () => {
    /* istanbul ignore next */
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (diff > threshold && allowBack) {
      // 向左滑动 = 下一题
      goToNext()
    } else if (diff < -threshold) {
      // 向右滑动 = 上一题
      goToPrev()
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    submitTest()
    router.push(`/${suiteId}/result`)
  }

  // 跳过剩余题目，直接提交（使用已有答案计算结果）
  const handleSkipAndSubmit = () => {
    setIsSubmitting(true)
    submitTest()
    router.push(`/${suiteId}/result`)
  }

  const handleExit = () => {
    resetTest()
    router.push('/')
  }

  // 背景图样式
  const backgroundStyle =
    manifest.background?.enabled && manifest.background?.image
      ? {
          backgroundImage: `url(${manifest.background.image})`,
          backgroundPosition: manifest.background.position || 'center',
          backgroundSize: manifest.background.size || 'cover',
          backgroundAttachment: 'fixed' as const,
        }
      : {}

  const backgroundOverlayStyle = manifest.background?.enabled
    ? {
        background: `linear-gradient(to bottom, 
      color-mix(in srgb, var(--suite-background) ${(manifest.background.opacity ?? 0.5) * 100}%, transparent),
      var(--suite-background)
    )`,
      }
    : {}

  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--suite-background)' }}
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

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion?.id)
  const isCurrentAnswered = !!currentAnswer

  // 单题模式渲染
  if (layoutMode === 'single') {
    return (
      <div
        className="min-h-screen"
        style={{
          ...backgroundStyle,
          ...backgroundOverlayStyle,
          background: 'var(--suite-background)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Header */}
        <header
          className="sticky top-0 z-20 backdrop-blur-lg"
          style={{
            background:
              'color-mix(in srgb, var(--suite-background) 85%, transparent)',
            borderBottom: '1px solid var(--suite-border)',
          }}
        >
          <div className="max-w-lg mx-auto px-4 py-4">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleExit}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: 'var(--suite-muted-foreground)',
                  background: 'var(--suite-muted)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>退出</span>
              </button>

              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-medium tabular-nums"
                  style={{ color: 'var(--suite-foreground)' }}
                >
                  {currentIndex + 1}
                  <span style={{ opacity: 0.5 }}>/</span>
                  {totalQuestions}
                </span>
                {allAnswered && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: 'var(--suite-primary)',
                      color: 'var(--suite-primary-foreground)',
                    }}
                  >
                    完成
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--suite-border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background:
                    'linear-gradient(90deg, var(--suite-primary), var(--suite-secondary))',
                }}
              />
            </div>
          </div>
        </header>

        {/* Question Card */}
        <main className="max-w-lg mx-auto px-4 py-8">
          <div
            key={animateKey}
            className="question-single"
            style={{
              animation: 'slideIn 0.4s ease-out',
            }}
          >
            {/* Question Number */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                {currentIndex + 1}
              </div>
              <div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--suite-muted-foreground)' }}
                >
                  第 {currentIndex + 1} 题 / 共 {totalQuestions} 题
                </p>
              </div>
            </div>

            {/* Question Content */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{
                background: 'var(--suite-card)',
                border: '1px solid var(--suite-border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <p
                className="text-xl md:text-2xl font-medium leading-relaxed"
                style={{ color: 'var(--suite-foreground)' }}
              >
                {getLocalizedContent(currentQuestion.content)}
              </p>
              {showDimensions && currentQuestion.dimension && (
                <div className="mt-4">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--suite-muted)',
                      color: 'var(--suite-primary)',
                    }}
                  >
                    {currentQuestion.dimension}
                  </span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = currentAnswer === option.id

                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleOptionSelect(currentQuestion.id, option.id)
                    }
                    className={`
                      w-full p-4 rounded-xl border text-left
                      transition-all duration-200 ease-out
                      ${isSelected ? 'selected' : ''}
                    `}
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--suite-primary) 10%, var(--suite-card))'
                        : 'var(--suite-card)',
                      borderColor: isSelected
                        ? 'var(--suite-primary)'
                        : 'var(--suite-border)',
                      boxShadow: isSelected
                        ? '0 4px 16px color-mix(in srgb, var(--suite-primary) 20%, transparent)'
                        : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Letter */}
                      <span
                        className={`
                          flex-none w-10 h-10 rounded-xl flex items-center justify-center
                          text-sm font-bold transition-all duration-200
                          ${isSelected ? 'scale-110' : ''}
                        `}
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))'
                            : 'var(--suite-muted)',
                          color: isSelected
                            ? 'var(--suite-primary-foreground)'
                            : 'var(--suite-muted-foreground)',
                        }}
                      >
                        {letters[optionIndex]}
                      </span>

                      {/* Text */}
                      <span
                        className="text-base flex-1"
                        style={{ color: 'var(--suite-foreground)' }}
                      >
                        {getLocalizedContent(option.content)}
                      </span>

                      {/* Selected */}
                      {isSelected && (
                        <span
                          className="flex-none w-6 h-6 rounded-full flex items-center justify-center animate-check"
                          style={{ background: 'var(--suite-primary)' }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
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
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer
          className="fixed bottom-0 left-0 right-0 border-t"
          style={{
            background:
              'color-mix(in srgb, var(--suite-background) 95%, var(--suite-card))',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--suite-border)',
            padding: '12px 0',
          }}
        >
          <div className="max-w-lg mx-auto px-4 flex items-center justify-between">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
              style={{
                background: 'var(--suite-muted)',
                color: 'var(--suite-foreground)',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一题</span>
            </button>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={goToNext}
                disabled={!isCurrentAnswered}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                style={{
                  background: 'var(--suite-primary)',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                <span>下一题</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : allAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                {isSubmitting ? '提交中...' : '查看结果'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isCurrentAnswered ? (
              <button
                onClick={handleSkipAndSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--suite-muted)',
                  color: 'var(--suite-muted-foreground)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                {isSubmitting ? '提交中...' : '跳过并查看结果'}
              </button>
            ) : (
              <span
                className="text-sm"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                请选择答案
              </span>
            )}
          </div>
        </footer>

        <style jsx global>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes checkIn {
            0% {
              transform: scale(0);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
          .animate-check {
            animation: checkIn 0.3s ease-out;
          }
          body {
            padding-bottom: 80px;
          }
        `}</style>
      </div>
    )
  }

  // 列表模式渲染（原有逻辑）
  return (
    <div
      className="min-h-screen"
      style={{
        ...backgroundStyle,
        ...backgroundOverlayStyle,
        background: 'var(--suite-background)',
      }}
    >
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-lg"
        style={{
          background:
            'color-mix(in srgb, var(--suite-background) 85%, transparent)',
          borderBottom: '1px solid var(--suite-border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExit}
                className="group flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all duration-200"
                style={{
                  color: 'var(--suite-muted-foreground)',
                  background: 'var(--suite-muted)',
                }}
              >
                <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>退出</span>
              </button>
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--suite-foreground)' }}
              >
                {getLocalizedContent(manifest.name)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: 'var(--suite-foreground)' }}
              >
                {answeredCount}
                <span style={{ opacity: 0.5 }}>/</span>
                {totalQuestions}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-300 ${allAnswered ? 'scale-100' : 'scale-95'}`}
                style={{
                  background: allAnswered
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

          {/* Progress Bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--suite-border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, var(--suite-primary), var(--suite-secondary))',
              }}
            />
          </div>
        </div>
      </header>

      {/* Questions */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {questions.map((question, questionIndex) => {
            const selectedOption = answers.get(question.id)
            const isAnswered = !!selectedOption

            return (
              <div
                key={question.id}
                ref={el => {
                  if (el) questionRefs.current.set(question.id, el)
                }}
                className="question-card"
                style={{
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeSlideIn 0.4s ease-out ${questionIndex * 0.05}s forwards`,
                }}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${isAnswered ? 'scale-110' : ''}`}
                    style={{
                      background: isAnswered
                        ? 'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))'
                        : 'var(--suite-muted)',
                      color: isAnswered
                        ? 'var(--suite-primary-foreground)'
                        : 'var(--suite-muted-foreground)',
                      boxShadow: isAnswered
                        ? '0 4px 12px color-mix(in srgb, var(--suite-primary) 30%, transparent)'
                        : 'none',
                    }}
                  >
                    {questionIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-base md:text-lg font-medium leading-relaxed"
                      style={{ color: 'var(--suite-foreground)' }}
                    >
                      {getLocalizedContent(question.content)}
                    </p>
                    {showDimensions && question.dimension && (
                      <p
                        className="text-xs mt-1.5 flex items-center gap-1.5"
                        style={{ color: 'var(--suite-muted-foreground)' }}
                      >
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                          style={{
                            background: 'var(--suite-muted)',
                            color: 'var(--suite-primary)',
                          }}
                        >
                          {question.dimension}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pl-12">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedOption === option.id

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleOptionSelect(question.id, option.id)
                        }
                        className={`
                          option-btn w-full p-3.5 rounded-xl border text-left
                          transition-all duration-200 ease-out
                          hover:scale-[1.01] active:scale-[0.99]
                          ${isSelected ? 'selected' : ''}
                        `}
                        style={{
                          background: isSelected
                            ? 'color-mix(in srgb, var(--suite-primary) 8%, var(--suite-card))'
                            : 'var(--suite-card)',
                          borderColor: isSelected
                            ? 'var(--suite-primary)'
                            : 'var(--suite-border)',
                          boxShadow: isSelected
                            ? '0 2px 8px color-mix(in srgb, var(--suite-primary) 15%, transparent), inset 0 0 0 1px var(--suite-primary)'
                            : '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex-none w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
                            style={{
                              background: isSelected
                                ? 'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))'
                                : 'var(--suite-muted)',
                              color: isSelected
                                ? 'var(--suite-primary-foreground)'
                                : 'var(--suite-muted-foreground)',
                              boxShadow: isSelected
                                ? '0 2px 8px color-mix(in srgb, var(--suite-primary) 25%, transparent)'
                                : 'none',
                            }}
                          >
                            {letters[optionIndex]}
                          </span>
                          <span
                            className="text-sm md:text-base flex-1"
                            style={{ color: 'var(--suite-foreground)' }}
                          >
                            {getLocalizedContent(option.content)}
                          </span>
                          {isSelected && (
                            <span
                              className="flex-none w-5 h-5 rounded-full flex items-center justify-center animate-check"
                              style={{ background: 'var(--suite-primary)' }}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
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

                {/* Divider */}
                {questionIndex < questions.length - 1 && (
                  <div
                    className="border-t mx-12 mt-6"
                    style={{ borderColor: 'var(--suite-border)', opacity: 0.5 }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </main>

      {/* Bottom Submit Bar */}
      <footer
        className={`sticky bottom-0 border-t transition-all duration-300 ${allAnswered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}`}
        style={{
          background:
            'color-mix(in srgb, var(--suite-background) 95%, var(--suite-card))',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--suite-border)',
          padding: '16px 0',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 space-y-3">
          {allAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 hover:scale-[1.01]"
              style={{
                background:
                  'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
                color: 'var(--suite-primary-foreground)',
                boxShadow:
                  '0 8px 24px color-mix(in srgb, var(--suite-primary) 30%, transparent)',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  提交中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  查看我的结果
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </button>
          ) : answeredCount > 0 ? (
            <div className="space-y-2">
              <button
                onClick={handleSkipAndSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 hover:scale-[1.01]"
                style={{
                  background: 'var(--suite-muted)',
                  color: 'var(--suite-muted-foreground)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                {isSubmitting
                  ? '提交中...'
                  : `跳过剩余 ${totalQuestions - answeredCount} 题，直接查看结果`}
              </button>
              <p
                className="text-center text-xs"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                已回答 {answeredCount}/{totalQuestions} 题
              </p>
            </div>
          ) : (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              开始选择答案，还剩{' '}
              <span style={{ color: 'var(--suite-primary)', fontWeight: 600 }}>
                {totalQuestions - answeredCount}
              </span>{' '}
              题
            </p>
          )}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes checkIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-check {
          animation: checkIn 0.3s ease-out forwards;
        }
        .question-card {
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }
        .option-btn {
          position: relative;
          overflow: hidden;
        }
        .option-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            var(--suite-primary) 0%,
            var(--suite-secondary) 100%
          );
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .option-btn:hover::before {
          opacity: 0.03;
        }
        .option-btn.selected::before {
          opacity: 0;
        }
        .option-btn.selected {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  )
}
