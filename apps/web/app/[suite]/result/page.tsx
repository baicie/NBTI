import type { PersonalityType, Question } from '@nbti/core'
import type { TemplatesConfig } from '@/lib/types/template'
import { loadFullSuite } from '@/lib/suite-loader'
import { ResultPageClient } from './result-page-client'

interface ResultPageProps {
  params: Promise<{ suite: string }>
}

interface QuestionsData {
  dimensions?: Array<{
    id: string
    name: Record<string, string>
    leftLabel: Record<string, string>
    rightLabel: Record<string, string>
  }>
  questions: Question[]
  meta: { totalQuestions: number; timeEstimate: number }
}

/**
 * 结果页 - 动态套件路由
 */
export default async function ResultPage({ params }: ResultPageProps) {
  const { suite: suiteId } = await params

  // 加载套件数据
  const { manifest, types, questions, templates, theme } =
    await loadFullSuite(suiteId)

  // 类型断言
  const typedManifest = manifest as {
    name: Record<string, string>
    settings?: {
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

  const typedTypes = types as {
    types: PersonalityType[]
  }

  const typedQuestions = questions as unknown as QuestionsData

  // 获取维度定义（优先从 questions.json 的 dimensions 字段）
  const dimensions = typedQuestions.dimensions || [
    {
      id: 'WORK',
      name: { zh: '通用', en: 'General' },
      leftLabel: { zh: 'A', en: 'A' },
      rightLabel: { zh: 'B', en: 'B' },
    },
  ]

  return (
    <ResultPageClient
      suiteId={suiteId}
      types={typedTypes.types || []}
      questions={typedQuestions.questions || []}
      dimensions={dimensions}
      manifest={typedManifest}
      templates={templates as TemplatesConfig | undefined}
      theme={
        theme as
          | {
              audio?: { showMusicButton?: boolean; showEffectsButton?: boolean }
              result?: { showShare?: boolean }
            }
          | undefined
      }
    />
  )
}
