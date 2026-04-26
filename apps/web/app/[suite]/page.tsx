import { loadFullSuite } from '@/lib/suite-loader'
import { TestPageClient } from './test-page-client'

interface TestPageProps {
  params: Promise<{ suite: string }>
}

/**
 * 测试页 - 动态套件路由
 */
export default async function TestPage({ params }: TestPageProps) {
  const { suite: suiteId } = await params

  // 加载套件数据
  const suiteData = await loadFullSuite(suiteId)

  return (
    <TestPageClient
      suiteId={suiteId}
      config={suiteData as unknown as import('@nbti/core').LoadedConfig}
    />
  )
}
