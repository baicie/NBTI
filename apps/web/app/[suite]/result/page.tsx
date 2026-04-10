import { loadFullSuite } from '@/lib/suite-loader'
import { ResultPageClient } from './result-page-client'
import type { DimensionDefinition, PersonalityType } from '@nbti/core'

interface ResultPageProps {
  params: Promise<{ suite: string }>
}

/**
 * 结果页 - 动态套件路由
 */
export default async function ResultPage({ params }: ResultPageProps) {
  const { suite: suiteId } = await params

  // 加载套件数据
  const { manifest, types } = await loadFullSuite(suiteId)

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
    dimensions: DimensionDefinition[]
  }

  return (
    <ResultPageClient
      suiteId={suiteId}
      types={typedTypes.types || []}
      dimensions={typedTypes.dimensions || []}
      manifest={typedManifest}
    />
  )
}
