'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTest } from '@/providers/test-provider'
import { Button } from '@/components/ui/button'
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
  name: string
  leftLetter: string
  rightLetter: string
  percentage: number
}

interface TypeResult {
  id: string
  name: Record<string, string>
  posterImage?: Record<string, string>
  posterCaption?: Record<string, string>
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
    const dimResult = result?.dimensions.find(d => d.dimensionId === dim.id)
    const percentage = dimResult?.percentage ?? 50
    return {
      id: dim.id,
      name: dim.name ? getLocalizedContent(dim.name) : dim.id,
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
      posterImage: typeInfo.posterImage,
      posterCaption: typeInfo.posterCaption,
      subtitle: typeInfo.subtitle || { zh: '', en: '' },
      description: typeInfo.description || { zh: '', en: '' },
      traits: typeInfo.traits || [],
    }
  }

  const typeResult = getTypeResult()

  // 计算匹配度（基于各维度偏离50%的程度）
  const getMatchScore = (): number => {
    if (!result?.dimensions || result.dimensions.length === 0) return 0
    const totalDiff = result.dimensions.reduce((sum, dim) => {
      const diff = Math.abs(dim.percentage - 50)
      return sum + diff
    }, 0)
    const avgDiff = totalDiff / result.dimensions.length
    return Math.round(100 - avgDiff * 2)
  }

  if (!result || !typeResult) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--suite-background)' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background: 'var(--suite-card)',
            border: '1px solid var(--suite-border)',
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--suite-foreground)' }}
          >
            暂无测试结果
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: 'var(--suite-muted-foreground)' }}
          >
            请先完成测试
          </p>
          <Button
            onClick={() => router.push(`/${suiteId}`)}
            style={{
              background: 'var(--suite-primary)',
              color: 'var(--suite-primary-foreground)',
              borderRadius: '14px',
              padding: '14px 20px',
              fontWeight: 700,
              border: 'none',
            }}
          >
            返回测试
          </Button>
        </div>
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
        .catch(() => {})
    }
  }

  const handleRetake = () => {
    resetTest()
    router.push(`/${suiteId}`)
  }

  const matchScore = getMatchScore()
  const dominantDims = dimensionResults
    .filter(d => d.percentage !== 50)
    .slice(0, 3)

  return (
    <div
      className="min-h-screen py-6 md:py-10"
      style={{ background: 'var(--suite-background)' }}
    >
      <div className="max-w-3xl mx-auto px-4">
        {/* Result Header */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-3"
            style={{
              background: 'var(--suite-muted)',
              color: 'var(--suite-primary)',
              border: '1px solid var(--suite-border)',
            }}
          >
            <span>✓</span>
            <span>测试完成</span>
          </div>
        </div>

        {/* Result Layout */}
        <div
          className="rounded-2xl p-5 md:p-6"
          style={{
            background: 'var(--suite-card)',
            border: '1px solid var(--suite-border)',
          }}
        >
          {/* Top Section: Poster + Type Info */}
          <div
            className="grid gap-4 mb-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {/* Poster Box */}
            {typeResult.posterImage ? (
              <div
                className="rounded-xl p-4 min-h-64"
                style={{
                  background:
                    'linear-gradient(135deg, var(--suite-muted) 0%, var(--suite-card) 100%)',
                  border: '1px solid var(--suite-border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, var(--suite-primary) 0%, transparent 70%)`,
                  }}
                />
                <img
                  src={getLocalizedContent(typeResult.posterImage)}
                  alt={typeResult.id}
                  className="w-full h-48 md:h-56 object-contain rounded-lg relative z-10"
                />
                {typeResult.posterCaption && (
                  <p
                    className="mt-3 text-sm text-center relative z-10"
                    style={{ color: 'var(--suite-muted-foreground)' }}
                  >
                    {getLocalizedContent(typeResult.posterCaption)}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="rounded-xl p-6 min-h-64 flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--suite-primary) 0%, var(--suite-secondary) 100%)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                <span
                  className="text-6xl md:text-7xl font-bold"
                  style={{ color: '#ffffff' }}
                >
                  {typeResult.id}
                </span>
              </div>
            )}

            {/* Type Info Box */}
            <div
              className="rounded-xl p-5"
              style={{
                background:
                  'linear-gradient(180deg, var(--suite-card) 0%, var(--suite-muted) 100%)',
                border: '1px solid var(--suite-border)',
              }}
            >
              <div
                className="text-xs mb-2 tracking-wider"
                style={{ color: 'var(--suite-primary)' }}
              >
                你的主类型
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{
                  color: 'var(--suite-foreground)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {typeResult.id}
              </h1>
              <div
                className="text-lg mb-3"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                {getLocalizedContent(typeResult.name)}
              </div>
              <div
                className="text-sm mb-4"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                {getLocalizedContent(typeResult.subtitle)}
              </div>

              {/* Match Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                style={{
                  background: 'var(--suite-muted)',
                  color: 'var(--suite-primary)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                <span>匹配度 {matchScore}%</span>
                {dominantDims.length > 0 && (
                  <>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span>
                      命中 {dominantDims.length}/{dimensionResults.length} 维
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div
            className="rounded-xl p-5 mb-4"
            style={{
              background: 'var(--suite-card)',
              border: '1px solid var(--suite-border)',
            }}
          >
            <h3
              className="text-base font-bold mb-3"
              style={{ color: 'var(--suite-foreground)' }}
            >
              类型解读
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--suite-muted-foreground)' }}
            >
              {getLocalizedContent(typeResult.description)}
            </p>
          </div>

          {/* Dimensions Section */}
          <div
            className="rounded-xl p-5 mb-4"
            style={{
              background: 'var(--suite-card)',
              border: '1px solid var(--suite-border)',
            }}
          >
            <h3
              className="text-base font-bold mb-4"
              style={{ color: 'var(--suite-foreground)' }}
            >
              维度分析
            </h3>
            <div className="space-y-3">
              {dimensionResults.map(dim => (
                <div
                  key={dim.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--suite-muted)',
                    border: '1px solid var(--suite-border)',
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold"
                        style={{
                          color:
                            dim.percentage > 50
                              ? 'var(--suite-primary)'
                              : 'var(--suite-muted-foreground)',
                        }}
                      >
                        {dim.leftLetter}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--suite-card)',
                          color: 'var(--suite-muted-foreground)',
                        }}
                      >
                        {dim.name}
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          color:
                            dim.percentage <= 50
                              ? 'var(--suite-primary)'
                              : 'var(--suite-muted-foreground)',
                        }}
                      >
                        {dim.rightLetter}
                      </span>
                    </div>
                    <span
                      className="font-bold"
                      style={{ color: 'var(--suite-primary)' }}
                    >
                      {dim.percentage}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--suite-border)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${dim.percentage}%`,
                        background: 'var(--suite-primary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traits Section */}
          {typeResult.traits && typeResult.traits.length > 0 && (
            <div
              className="rounded-xl p-5 mb-4"
              style={{
                background: 'var(--suite-card)',
                border: '1px solid var(--suite-border)',
              }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ color: 'var(--suite-foreground)' }}
              >
                核心特质
              </h3>
              <div className="grid gap-3">
                {typeResult.traits.map(trait => (
                  <div
                    key={trait.id}
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{
                      background: 'var(--suite-muted)',
                      border: '1px solid var(--suite-border)',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--suite-foreground)' }}
                    >
                      {getLocalizedContent(trait.name)}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--suite-primary)' }}
                    >
                      {trait.level}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div
            className="text-xs text-center mb-6 px-4"
            style={{ color: 'var(--suite-muted-foreground)' }}
          >
            本测试仅供娱乐参考，请勿作为诊断、面试或重大决策的依据
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              onClick={handleRetake}
              style={{
                background: 'var(--suite-card)',
                color: 'var(--suite-muted-foreground)',
                border: '1px solid var(--suite-border)',
                borderRadius: '14px',
                padding: '12px 18px',
                fontWeight: 600,
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新测试
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              style={{
                borderColor: 'var(--suite-border)',
                color: 'var(--suite-foreground)',
                borderRadius: '14px',
                padding: '12px 18px',
                fontWeight: 600,
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享结果
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              style={{
                background: 'var(--suite-primary)',
                color: 'var(--suite-primary-foreground)',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 18px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? '生成中...' : '保存图片'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
