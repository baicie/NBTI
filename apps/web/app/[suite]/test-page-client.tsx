'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTest } from '@/providers/test-provider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    nextQuestion,
    prevQuestion,
    resetTest,
  } = useTest()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = session ? questions[session.currentIndex] : null
  const selectedOption = currentQuestion
    ? answers.get(currentQuestion.id)
    : null
  const progress = session
    ? ((session.currentIndex + 1) / session.totalQuestions) * 100
    : 0

  // 获取题目和选项的本地化文本
  const getLocalizedContent = (content: Record<string, string>): string => {
    if (typeof content === 'string') {
      return content
    }
    return content[locale] || content.zh || Object.values(content)[0] || ''
  }

  const suiteName = getLocalizedContent(manifest.name)

  // 还没有开始测试 - 显示开始页面
  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--suite-background)' }}
      >
        <Card
          className="w-full max-w-md"
          style={{
            backgroundColor: 'var(--suite-card)',
            borderColor: 'var(--suite-border)',
          }}
        >
          <CardHeader className="text-center pb-2 md:pb-4">
            <CardTitle
              className="text-xl md:text-2xl"
              style={{ color: 'var(--suite-card-foreground)' }}
            >
              {suiteName}
            </CardTitle>
            <CardDescription
              className="text-sm md:text-base"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              完成 {questions.length} 道题目，发现你的性格特质
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div
                className="flex justify-between text-sm"
                style={{ color: 'var(--suite-foreground)' }}
              >
                <span>预估时长</span>
                <span>约 5 分钟</span>
              </div>
              <div
                className="flex justify-between text-sm"
                style={{ color: 'var(--suite-foreground)' }}
              >
                <span>题目数量</span>
                <span>{questions.length} 题</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={startSession}
              style={{
                backgroundColor: 'var(--suite-primary)',
                color: 'var(--suite-primary-foreground)',
              }}
            >
              开始测试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // 跳转到结果页
    router.push(`/${suiteId}/result`)
  }

  const isLastQuestion = session.currentIndex === questions.length - 1
  const canGoBack = manifest.settings?.allowBack !== false

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--suite-background)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur border-b"
        style={{
          backgroundColor: 'var(--suite-background)',
          borderColor: 'var(--suite-border)',
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className="text-sm"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                第 {session.currentIndex + 1} 题 / 共 {session.totalQuestions}{' '}
                题
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTest}
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              退出测试
            </Button>
          </div>
          <Progress
            value={progress}
            className="mt-4"
            style={{ backgroundColor: 'var(--suite-muted)' }}
          />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 container mx-auto px-3 md:px-4 py-6 md:py-8">
        <Card
          className="w-full max-w-2xl mx-auto"
          style={{
            backgroundColor: 'var(--suite-card)',
            borderColor: 'var(--suite-border)',
          }}
        >
          <CardHeader className="pb-2 md:pb-4">
            <CardDescription
              className="text-xs md:text-sm"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              维度：{currentQuestion ? currentQuestion.dimension : ''}
            </CardDescription>
            <CardTitle
              className="text-lg md:text-xl"
              style={{ color: 'var(--suite-card-foreground)' }}
            >
              {currentQuestion
                ? getLocalizedContent(currentQuestion.content)
                : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3">
            {currentQuestion
              ? currentQuestion.options.map(option => (
                  <button
                    key={option.id}
                    className={`w-full p-3 md:p-4 rounded-lg border text-left transition-all active:scale-[0.98] ${
                      selectedOption === option.id ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedOption === option.id
                          ? 'var(--suite-primary)' + '15'
                          : 'transparent',
                      borderColor:
                        selectedOption === option.id
                          ? 'var(--suite-primary)'
                          : 'var(--suite-input)',
                      color: 'var(--suite-foreground)',
                    }}
                    onClick={() =>
                      answerQuestion(currentQuestion.id, option.id)
                    }
                  >
                    <span className="font-medium text-sm md:text-base">
                      {getLocalizedContent(option.content)}
                    </span>
                  </button>
                ))
              : null}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer
        className="border-t"
        style={{
          backgroundColor: 'var(--suite-background)',
          borderColor: 'var(--suite-border)',
        }}
      >
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevQuestion}
              disabled={!canGoBack || session.currentIndex === 0}
              className="flex-1 md:flex-none"
              style={{
                borderColor: 'var(--suite-border)',
                color: 'var(--suite-foreground)',
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">上一题</span>
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                size="sm"
                className="flex-1 md:flex-none"
                style={{
                  backgroundColor: 'var(--suite-primary)',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                {isSubmitting ? '提交中...' : '查看结果'}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!selectedOption}
                size="sm"
                className="flex-1 md:flex-none"
                style={{
                  backgroundColor: 'var(--suite-primary)',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                <span className="hidden sm:inline">下一题</span>
                <ChevronRight className="w-4 h-4 ml-1 md:mr-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
