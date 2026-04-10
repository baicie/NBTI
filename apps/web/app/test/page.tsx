'use client'

import { useState } from 'react'
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

// 内联模拟数据
const mockQuestions = [
  {
    id: 'q001',
    dimension: 'EI',
    content: {
      zh: '在社交聚会中，你通常会：',
      en: 'At a social gathering, you tend to:',
    },
    options: [
      {
        id: 'opt_1a',
        content: {
          zh: '主动和很多人交流',
          en: 'Initiate conversations with many people',
        },
        weight: { E: 3, I: 0 },
      },
      {
        id: 'opt_1b',
        content: {
          zh: '和熟悉的朋友聊天',
          en: 'Chat with friends you know well',
        },
        weight: { E: 1, I: 1 },
      },
      {
        id: 'opt_1c',
        content: {
          zh: '在一旁观察，偶尔参与',
          en: 'Observe from the side and occasionally participate',
        },
        weight: { E: 0, I: 2 },
      },
      {
        id: 'opt_1d',
        content: {
          zh: '找个安静的角落休息',
          en: 'Find a quiet corner to rest',
        },
        weight: { E: 0, I: 3 },
      },
    ],
  },
  {
    id: 'q002',
    dimension: 'NS',
    content: {
      zh: '当你学习新事物时，你更倾向于：',
      en: 'When learning something new, you prefer to:',
    },
    options: [
      {
        id: 'opt_2a',
        content: {
          zh: '关注具体的事实和细节',
          en: 'Focus on concrete facts and details',
        },
        weight: { S: 3, N: 0 },
      },
      {
        id: 'opt_2b',
        content: {
          zh: '思考背后的原理和可能性',
          en: 'Think about underlying principles and possibilities',
        },
        weight: { S: 1, N: 2 },
      },
      {
        id: 'opt_2c',
        content: { zh: '两者结合', en: 'Combine both approaches' },
        weight: { S: 1, N: 1 },
      },
    ],
  },
  {
    id: 'q003',
    dimension: 'TF',
    content: {
      zh: '在做决定时，你更看重：',
      en: 'When making decisions, you value more:',
    },
    options: [
      {
        id: 'opt_3a',
        content: { zh: '逻辑和客观分析', en: 'Logic and objective analysis' },
        weight: { T: 3, F: 0 },
      },
      {
        id: 'opt_3b',
        content: {
          zh: '对他人的影响和感受',
          en: 'Impact on others and feelings',
        },
        weight: { T: 0, F: 3 },
      },
      {
        id: 'opt_3c',
        content: { zh: '两者平衡', en: 'A balance of both' },
        weight: { T: 1, F: 1 },
      },
    ],
  },
  {
    id: 'q004',
    dimension: 'JP',
    content: {
      zh: '你更喜欢哪种工作方式？',
      en: 'Which work style do you prefer?',
    },
    options: [
      {
        id: 'opt_4a',
        content: {
          zh: '按计划行事，有条理',
          en: 'Following a plan and being organized',
        },
        weight: { J: 3, P: 0 },
      },
      {
        id: 'opt_4b',
        content: {
          zh: '灵活应变，随机应变',
          en: 'Being flexible and adapting as you go',
        },
        weight: { J: 0, P: 3 },
      },
      {
        id: 'opt_4c',
        content: { zh: '两者结合', en: 'A mix of both' },
        weight: { J: 1, P: 1 },
      },
    ],
  },
]

export default function TestPage() {
  const {
    session,
    answers,
    settings,
    startSession,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    resetTest,
  } = useTest()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = session ? mockQuestions[session.currentIndex] : null
  const selectedOption = currentQuestion
    ? answers.get(currentQuestion.id)
    : null
  const progress = session
    ? ((session.currentIndex + 1) / session.totalQuestions) * 100
    : 0

  // 还没有开始测试
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">NBTI 性格测试</CardTitle>
            <CardDescription>
              完成 {mockQuestions.length} 道题目，发现你的性格特质
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>预估时长</span>
                <span>约 5 分钟</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>题目数量</span>
                <span>{mockQuestions.length} 题</span>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={startSession}>
              开始测试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // 模拟提交
    globalThis.setTimeout(() => {
      globalThis.location.href = '/result'
    }, 500)
  }

  const isLastQuestion = session.currentIndex === mockQuestions.length - 1

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-background)]/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-muted-foreground)]">
                第 {session.currentIndex + 1} 题 / 共 {session.totalQuestions}{' '}
                题
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetTest}>
              退出测试
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardDescription>
              维度：{currentQuestion ? currentQuestion.dimension : ''}
            </CardDescription>
            <CardTitle className="text-xl">
              {currentQuestion
                ? currentQuestion.content[
                    settings.locale as keyof typeof currentQuestion.content
                  ] || currentQuestion.content.zh
                : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion
              ? currentQuestion.options.map(option => (
                  <button
                    key={option.id}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedOption === option.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]'
                        : 'border-[var(--color-input)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-accent)]'
                    }`}
                    onClick={() =>
                      answerQuestion(currentQuestion.id, option.id)
                    }
                  >
                    <span className="font-medium">
                      {option.content[
                        settings.locale as keyof typeof option.content
                      ] || option.content.zh}
                    </span>
                  </button>
                ))
              : null}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[var(--color-background)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={session.currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一题
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
              >
                {isSubmitting ? '提交中...' : '查看结果'}
              </Button>
            ) : (
              <Button onClick={nextQuestion} disabled={!selectedOption}>
                下一题
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
