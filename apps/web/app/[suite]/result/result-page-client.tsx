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
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Share2 } from 'lucide-react'
import type { DimensionDefinition, PersonalityType } from '@nbti/core'

interface ResultPageClientProps {
  suiteId: string
  types: PersonalityType[]
  dimensions: DimensionDefinition[]
  manifest: {
    name: Record<string, string>
  }
  locale?: string
}

interface DimensionResult {
  id: string
  leftLetter: string
  rightLetter: string
  percentage: number
}

interface TypeResult {
  id: string
  name: Record<string, string>
  subtitle: Record<string, string>
  description: Record<string, string>
  traits: Array<{
    id: string
    name: Record<string, string>
    level: number
  }>
}

export function ResultPageClient({
  suiteId,
  types,
  dimensions,
  manifest,
  locale = 'zh',
}: ResultPageClientProps) {
  const router = useRouter()
  const { result, resetTest } = useTest()
  const [isGenerating, setIsGenerating] = useState(false)

  // 获取本地化文本
  const getLocalizedContent = (
    content: Record<string, string> | string | undefined,
  ): string => {
    if (!content) return ''
    if (typeof content === 'string') {
      return content
    }
    return content[locale as keyof typeof content] || content.zh
  }

  const suiteName = getLocalizedContent(manifest.name)

  // 计算维度百分比
  const dimensionResults: DimensionResult[] = dimensions.map(dim => {
    // 从 result.dimensions 中找到对应维度的分数
    const dimResult = result?.dimensions.find(d => d.dimensionId === dim.id)
    const percentage = dimResult?.percentage ?? 50
    return {
      id: dim.id,
      leftLetter: dim.left.letter,
      rightLetter: dim.right.letter,
      percentage,
    }
  })

  // 根据维度得分确定人格类型
  const getTypeResult = (): TypeResult | null => {
    if (!result || !result.typeCode) return null

    const typeInfo = types.find(t => t.id === result.typeCode)
    if (!typeInfo) return null

    return {
      id: typeInfo.id,
      name: typeInfo.name,
      subtitle: typeInfo.subtitle || { zh: '', en: '' },
      description: typeInfo.description || { zh: '', en: '' },
      traits: typeInfo.traits || [],
    }
  }

  const typeResult = getTypeResult()

  // 如果没有结果，显示未完成提示
  if (!result || !typeResult) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--suite-background)' }}
      >
        <Card
          className="w-full max-w-md text-center"
          style={{
            backgroundColor: 'var(--suite-card)',
            borderColor: 'var(--suite-border)',
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'var(--suite-card-foreground)' }}>
              暂无测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              请先完成测试
            </p>
            <Button
              onClick={() => router.push(`/${suiteId}`)}
              style={{
                backgroundColor: 'var(--suite-primary)',
                color: 'var(--suite-primary-foreground)',
              }}
            >
              返回测试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDownload = () => {
    setIsGenerating(true)
    new Promise<void>(resolve => setTimeout(resolve, 2000)).finally(() => {
      setIsGenerating(false)
    })
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${suiteName} 测试结果`,
          text: `我的 ${suiteName} 类型是 ${typeResult.id}（${getLocalizedContent(typeResult.name)}）`,
        })
        .catch(() => {
          // 用户取消分享
        })
    }
  }

  const handleRetake = () => {
    resetTest()
    router.push(`/${suiteId}`)
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--suite-background)' }}
    >
      {/* Header with gradient */}
      <header
        className="py-10 md:py-16"
        style={{
          background: `linear-gradient(135deg, var(--suite-primary) 0%, var(--suite-secondary) 100%)`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <Badge
            variant="secondary"
            className="mb-3 md:mb-4 text-xs md:text-sm"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
            }}
          >
            测试完成
          </Badge>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: '#ffffff' }}
          >
            你的性格类型
          </h1>
        </div>
      </header>

      {/* Result Card */}
      <main className="container mx-auto px-3 md:px-4 -mt-6 md:-mt-8 pb-12 md:pb-16">
        <Card
          className="w-full max-w-2xl mx-auto"
          style={{
            backgroundColor: 'var(--suite-card)',
            borderColor: 'var(--suite-border)',
          }}
        >
          <CardHeader className="text-center pb-2">
            {/* Type Badge */}
            <div
              className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 md:mb-6"
              style={{
                background: `linear-gradient(135deg, var(--suite-primary) 0%, var(--suite-secondary) 100%)`,
              }}
            >
              <span
                className="text-4xl md:text-5xl font-bold"
                style={{ color: '#ffffff' }}
              >
                {typeResult.id}
              </span>
            </div>
            <CardTitle
              className="text-2xl md:text-3xl"
              style={{ color: 'var(--suite-card-foreground)' }}
            >
              {getLocalizedContent(typeResult.name)}
            </CardTitle>
            <CardDescription
              className="text-base md:text-lg"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              {getLocalizedContent(typeResult.subtitle)}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 md:space-y-8">
            {/* Description */}
            <div>
              <h3
                className="font-semibold mb-2 md:mb-3 text-sm md:text-base"
                style={{ color: 'var(--suite-foreground)' }}
              >
                类型描述
              </h3>
              <p
                className="text-sm md:text-base"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                {getLocalizedContent(typeResult.description)}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <h3
                className="font-semibold mb-3 md:mb-4 text-sm md:text-base"
                style={{ color: 'var(--suite-foreground)' }}
              >
                维度分析
              </h3>
              <div className="space-y-3 md:space-y-4">
                {dimensionResults.map(dim => (
                  <div key={dim.id} className="space-y-1.5 md:space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="flex items-center gap-1 md:gap-2">
                        <span
                          style={{
                            color:
                              dim.percentage > 50
                                ? 'var(--suite-primary)'
                                : 'var(--suite-muted-foreground)',
                            fontWeight: dim.percentage > 50 ? 600 : 400,
                          }}
                        >
                          {dim.leftLetter}
                        </span>
                        <span
                          style={{ color: 'var(--suite-muted-foreground)' }}
                        >
                          {dim.id}
                        </span>
                        <span
                          style={{
                            color:
                              dim.percentage <= 50
                                ? 'var(--suite-primary)'
                                : 'var(--suite-muted-foreground)',
                            fontWeight: dim.percentage <= 50 ? 600 : 400,
                          }}
                        >
                          {dim.rightLetter}
                        </span>
                      </span>
                      <span style={{ color: 'var(--suite-muted-foreground)' }}>
                        {dim.percentage}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 md:h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--suite-muted)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${dim.percentage}%`,
                          background: `linear-gradient(90deg, var(--suite-primary) 0%, var(--suite-secondary) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits */}
            {typeResult.traits && typeResult.traits.length > 0 && (
              <div>
                <h3
                  className="font-semibold mb-3 md:mb-4 text-sm md:text-base"
                  style={{ color: 'var(--suite-foreground)' }}
                >
                  核心特质
                </h3>
                <div className="flex flex-wrap gap-2">
                  {typeResult.traits.map(trait => (
                    <Badge
                      key={trait.id}
                      variant="secondary"
                      className="px-2 py-1 text-xs md:text-sm"
                      style={{
                        backgroundColor: 'var(--suite-muted)',
                        color: 'var(--suite-muted-foreground)',
                      }}
                    >
                      {getLocalizedContent(trait.name)} ({trait.level}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
              <Button
                className="flex-1"
                size="sm"
                onClick={handleDownload}
                disabled={isGenerating}
                style={{
                  backgroundColor: 'var(--suite-primary)',
                  color: 'var(--suite-primary-foreground)',
                }}
              >
                <Download className="w-4 h-4 mr-1.5 md:mr-2" />
                {isGenerating ? '生成中...' : '保存图片'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                size="sm"
                onClick={handleShare}
                style={{
                  borderColor: 'var(--suite-border)',
                  color: 'var(--suite-foreground)',
                }}
              >
                <Share2 className="w-4 h-4 mr-1.5 md:mr-2" />
                分享结果
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetake}
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                <RefreshCw className="w-4 h-4 mr-1.5 md:mr-2" />
                重新测试
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
