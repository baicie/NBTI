import { loadFullSuite } from '@/lib/suite-loader'
import { TestPageClient } from './test-page-client'
import type { Question } from '@nbti/core'

interface TestPageProps {
  params: Promise<{ suite: string }>
}

/**
 * 测试页 - 动态套件路由
 */
export default async function TestPage({ params }: TestPageProps) {
  const { suite: suiteId } = await params

  // 加载套件数据
  const { manifest, questions } = await loadFullSuite(suiteId)

  // 类型断言
  const typedManifest = manifest as {
    name: { zh: string; en: string }
    settings?: {
      allowBack?: boolean
      showTimer?: boolean
      maxDuration?: number | null
    }
  }

  const typedQuestions = questions as {
    questions: Question[]
  }

  return (
    <TestPageClient
      suiteId={suiteId}
      questions={typedQuestions.questions}
      manifest={typedManifest}
    />
  )
}
