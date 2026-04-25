'use client'

import type { PersonalityType, Question } from '@nbti/core'
import type { TypeMatchResult } from '@/lib/type-mapper'
import {
  Check,
  ChevronDown,
  Download,
  RefreshCw,
  Share2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AudioToggleButton } from '@/components/audio/audio-toggle-button'
import { getTypeMatchResult } from '@/lib/type-mapper'
import { useAudio } from '@/providers/audio-provider'
import { useTest } from '@/providers/test-provider'

interface ResultPageClientProps {
  suiteId: string
  types: PersonalityType[]
  questions: Question[]
  dimensions: Array<{
    id: string
    name: Record<string, string>
    leftLabel: Record<string, string>
    rightLabel: Record<string, string>
  }>
  manifest: {
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
    audio?: {
      backgroundMusic?: {
        src: string
        volume: number
        loop?: boolean
      }
    }
  }
  templates?: {
    defaultTemplate?: string
    templates: Array<{
      id: string
      name: Record<string, string>
    }>
  }
  theme?: {
    audio?: {
      showMusicButton?: boolean
      showEffectsButton?: boolean
    }
    result?: {
      showShare?: boolean
    }
  }
  locale?: string
}

interface DimensionResult {
  id: string
  name: string
  leftLetter: string
  rightLetter: string
  percentage: number
  dominant: string
}

export function ResultPageClient({
  suiteId,
  types,
  questions,
  dimensions,
  manifest,
  theme,
  locale = 'zh',
}: ResultPageClientProps) {
  const router = useRouter()
  const { result, resetTest, answers } = useTest()
  const { playBackgroundMusic, stopBackgroundMusic } = useAudio()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
  }, [])

  // 背景音乐控制
  useEffect(() => {
    if (manifest.audio?.backgroundMusic?.src) {
      playBackgroundMusic(manifest.audio.backgroundMusic)
    }

    return () => {
      stopBackgroundMusic()
    }
  }, [
    manifest.audio?.backgroundMusic,
    playBackgroundMusic,
    stopBackgroundMusic,
  ])

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

  // 直接从 answers 和 questions 计算人格分数
  const rawTypeScores = useMemo<Record<string, number>>(() => {
    const scores: Record<string, number> = {}

    // 初始化所有类型的分数为0
    types.forEach(type => {
      scores[type.id] = 0
    })

    // 遍历所有答案，累加到对应人格
    answers.forEach((optionId, questionId) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      const option = question.options.find(o => o.id === optionId)
      if (!option || !option.weight) return

      // weight 格式如 { "FISH": 1 } 或 { "GLITCH": 2 }
      Object.entries(option.weight).forEach(([typeId, weight]) => {
        if (scores[typeId] !== undefined) {
          scores[typeId] += weight
        }
      })
    })

    return scores
  }, [answers, questions, types])

  // 将已回答题目ID转换为Set
  const answeredQuestionIds = useMemo(() => {
    return new Set(answers.keys())
  }, [answers])

  // 使用 type-mapper 计算类型匹配结果
  const typeMatchResult = useMemo<TypeMatchResult | null>(() => {
    if (!types.length) return null

    // 构建维度定义
    const dimDefinitions = dimensions.map(dim => ({
      id: dim.id,
      name: dim.name,
      leftLabel: dim.leftLabel,
      rightLabel: dim.rightLabel,
    }))

    // 使用计算的人格分数（传入 engine 结果，mapper 据此判断是否触发隐藏款）
    const bestRegularTypeId = result?.typeCode
    const bestRegularScore = result?.rawScores
      ? Math.max(
          ...Object.entries(result.rawScores)
            .filter(([id]) =>
              types.find(t => t.id === id && t.rarity !== 'hidden'),
            )
            .map(([, s]) => s as number),
          0,
        )
      : 0
    return getTypeMatchResult(
      rawTypeScores,
      types,
      dimDefinitions,
      answeredQuestionIds,
      bestRegularTypeId,
      bestRegularScore,
    )
  }, [rawTypeScores, types, dimensions, answeredQuestionIds, result])

  // 维度结果
  const dimensionResults: DimensionResult[] = useMemo(() => {
    if (!result?.dimensions) {
      // 如果没有 result，使用 typeMatchResult 的维度
      return (
        typeMatchResult?.dimensionResults.map(dim => ({
          id: dim.id,
          name: dim.name,
          leftLetter: dim.leftLetter,
          rightLetter: dim.rightLetter,
          percentage: dim.percentage,
          dominant: dim.dominant,
        })) || []
      )
    }

    return result.dimensions.map(dim => {
      const dimDef = dimensions.find(d => d.id === dim.dimensionId)
      return {
        id: dim.dimensionId,
        name: dimDef ? getLocalizedContent(dimDef.name) : dim.dimensionId,
        leftLetter: dim.leftLetter,
        rightLetter: dim.rightLetter,
        percentage: dim.percentage,
        dominant: dim.dominant,
      }
    })
  }, [result, dimensions, typeMatchResult])

  // 类型结果
  const typeResult = typeMatchResult?.matchedType
    ? {
        id: typeMatchResult.matchedType.id,
        name: typeMatchResult.matchedType.name,
        posterImage: typeMatchResult.matchedType.posterImage,
        posterCaption: typeMatchResult.matchedType.posterCaption,
        subtitle: typeMatchResult.matchedType.subtitle || { zh: '', en: '' },
        description: typeMatchResult.matchedType.description || {
          zh: '',
          en: '',
        },
        traits: typeMatchResult.matchedType.traits || [],
        color: typeMatchResult.matchedType.color,
      }
    : null

  // 计算匹配度（百分比形式）
  const matchScore = useMemo(() => {
    if (typeMatchResult && typeMatchResult.matchedType) {
      // 计算该类型的最大可能分数
      const matchedTypeId = typeMatchResult.matchedType.id
      const matchedTypeScore = rawTypeScores[matchedTypeId] ?? 0

      // 计算最大可能的分数（所有问题的最大权重之和）
      let maxPossibleScore = 0
      questions.forEach(q => {
        const maxWeight = Math.max(
          ...q.options.map(o => {
            const weight = o.weight?.[matchedTypeId]
            return typeof weight === 'number' ? weight : 0
          }),
        )
        maxPossibleScore += maxWeight
      })

      // 返回百分比
      if (maxPossibleScore > 0) {
        return Math.round((matchedTypeScore / maxPossibleScore) * 100)
      }
    }
    if (!result?.dimensions || result.dimensions.length === 0) return 0
    const totalDiff = result.dimensions.reduce((sum, dim) => {
      const diff = Math.abs(dim.percentage - 50)
      return sum + diff
    }, 0)
    const avgDiff = totalDiff / result.dimensions.length
    return Math.round(100 - avgDiff * 2)
  }, [result, typeMatchResult, rawTypeScores, questions])

  // DEBUG: 打印结果数据到控制台
  useEffect(() => {
    // 构建详细答案列表（包含题目内容）
    const answeredDetails = Array.from(answers.entries()).map(
      ([questionId, optionId]) => {
        const question = questions.find(q => q.id === questionId)
        const selectedOption = question?.options.find(o => o.id === optionId)
        return {
          questionId,
          questionText: question?.text,
          selectedOptionId: optionId,
          selectedOptionText: selectedOption?.text,
          weight: selectedOption?.weight,
        }
      },
    )

    const debugData = {
      suiteId,
      // 来自 TestProvider 上下文的状态
      answers: Object.fromEntries(answers),
      result, // ScoringResult from context (persisted via localStorage)
      totalAnswered: answers.size,
      totalQuestions: questions.length,
      // 基于 answers 计算的派生数据
      answeredDetails,
      rawTypeScores,
      dimensionResults: typeMatchResult?.dimensionResults,
      matchedType: typeMatchResult?.matchedType
        ? {
            id: typeMatchResult.matchedType.id,
            name: typeMatchResult.matchedType.name,
          }
        : null,
      matchScores: typeMatchResult?.matchScores,
    }

    console.warn('[NBTI Result Debug]', debugData)
  }, [result, answers, questions, suiteId, rawTypeScores, typeMatchResult])

  const handleDownload = useCallback(() => {
    if (!typeResult) return
    const posterImageUrl = getLocalizedContent(typeResult.posterImage)
    if (!posterImageUrl) return

    // 直接下载原图
    const link = document.createElement('a')
    link.href = posterImageUrl
    link.download = `${suiteId}-${typeResult.id}-poster.png`
    link.target = '_blank'
    link.click()

    setDownloadSuccess(true)
    setTimeout(setDownloadSuccess, 3000, false)
  }, [typeResult, suiteId])

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${suiteName} 测试结果`,
          text: `我的 ${suiteName} 类型是 ${typeResult?.id || '???'}（${getLocalizedContent(typeResult?.name || { zh: '未知' })})`,
        })
        .catch(() => {})
    } else {
      setShowShareModal(true)
    }
  }

  const handleRetake = () => {
    resetTest()
    router.push(`/${suiteId}`)
  }

  const dominantDims = dimensionResults.filter(d => d.percentage !== 50)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // 获取配置
  const showDimensions = manifest.settings?.showDimensions !== false

  // 背景图样式
  const backgroundStyle =
    manifest.background?.enabled && manifest.background?.image
      ? {
          backgroundImage: `url(${manifest.background.image})`,
          backgroundPosition: manifest.background?.position || 'center',
          backgroundSize: manifest.background?.size || 'cover',
          backgroundAttachment: 'fixed' as const,
        }
      : {}

  // 无结果状态
  if (!result && !typeResult) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--suite-background)' }}
      >
        <div
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{
            background: 'var(--suite-card)',
            border: '1px solid var(--suite-border)',
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--suite-muted)' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--suite-muted-foreground)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--suite-foreground)' }}
          >
            暂无测试结果
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--suite-muted-foreground)' }}
          >
            请先完成测试
          </p>
          <button
            onClick={() => router.push(`/${suiteId}`)}
            className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
              color: 'var(--suite-primary-foreground)',
              boxShadow:
                '0 4px 16px color-mix(in srgb, var(--suite-primary) 25%, transparent)',
            }}
          >
            开始测试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-8 md:py-12"
      style={{ ...backgroundStyle, background: 'var(--suite-background)' }}
    >
      {/* Audio Toggle Button */}
      <AudioToggleButton
        showMusic={theme?.audio?.showMusicButton ?? true}
        showEffects={theme?.audio?.showEffectsButton ?? true}
      />

      <div className="max-w-3xl mx-auto px-4">
        {/* Header Badge */}
        <div
          className={`mb-6 transition-all duration-500 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0ms' }}
        >
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{
              background:
                'color-mix(in srgb, var(--suite-primary) 10%, var(--suite-muted))',
              color: 'var(--suite-primary)',
              border:
                '1px solid color-mix(in srgb, var(--suite-primary) 20%, var(--suite-border))',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: 'var(--suite-primary)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: 'var(--suite-primary)' }}
              />
            </span>
            <span>测试完成 ·{suiteName}</span>
          </div>
        </div>

        {/* Main Result Card */}
        <div
          className={`rounded-3xl overflow-hidden transition-all duration-700 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {/* Poster Section */}
          <div
            className="p-6 md:p-8"
            style={{
              background: `linear-gradient(135deg, var(--suite-card) 0%, var(--suite-muted) 100%)`,
              borderBottom: '1px solid var(--suite-border)',
            }}
          >
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Poster */}
              {typeResult?.posterImage ? (
                <div className="relative">
                  <div
                    className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
                    style={{
                      background: `radial-gradient(circle, var(--suite-primary) 0%, transparent 70%)`,
                    }}
                  />
                  <img
                    src={getLocalizedContent(typeResult.posterImage)}
                    alt={typeResult.id}
                    className="w-full h-48 md:h-56 object-contain rounded-2xl relative z-10"
                  />
                </div>
              ) : (
                <div
                  className="w-48 h-48 md:w-56 md:h-56 mx-auto rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${typeResult?.color || 'var(--suite-primary)'} 0%, var(--suite-secondary) 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)',
                    }}
                  />
                  <span
                    className="text-6xl md:text-7xl font-bold relative z-10"
                    style={{ color: '#ffffff' }}
                  >
                    {typeResult?.id || '???'}
                  </span>
                </div>
              )}

              {/* Type Info */}
              <div className="text-center md:text-left">
                <div
                  className="text-xs mb-2 tracking-widest uppercase"
                  style={{ color: 'var(--suite-primary)' }}
                >
                  {suiteName}
                </div>
                <h1
                  className="text-5xl md:text-6xl font-bold mb-2"
                  style={{
                    color: 'var(--suite-foreground)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {typeResult?.id || '???'}
                </h1>
                <div
                  className="text-xl mb-1"
                  style={{ color: 'var(--suite-foreground)', fontWeight: 500 }}
                >
                  {getLocalizedContent(typeResult?.name || { zh: '未知' })}
                </div>
                <div
                  className="text-sm mb-4"
                  style={{ color: 'var(--suite-muted-foreground)' }}
                >
                  {getLocalizedContent(typeResult?.subtitle || { zh: '' })}
                </div>

                {/* Match Badge */}
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                  style={{
                    background: 'var(--suite-card)',
                    border: '1px solid var(--suite-border)',
                  }}
                >
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: 'var(--suite-primary)' }}
                    >
                      {matchScore}%
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--suite-muted-foreground)' }}
                    >
                      匹配度
                    </div>
                  </div>
                  <div
                    className="w-px h-8 mx-1"
                    style={{ background: 'var(--suite-border)' }}
                  />
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: 'var(--suite-primary)' }}
                    >
                      {dominantDims.length}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'var(--suite-muted-foreground)' }}
                    >
                      维度
                    </div>
                  </div>
                </div>

                {typeResult?.posterCaption && (
                  <div
                    className="mt-3 text-sm"
                    style={{ color: 'var(--suite-muted-foreground)' }}
                  >
                    {getLocalizedContent(typeResult.posterCaption)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="p-4 md:p-6 space-y-3">
            {/* Analysis Section */}
            <div
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: 'var(--suite-card)',
                border: '1px solid var(--suite-border)',
              }}
            >
              <button
                onClick={() => toggleSection('analysis')}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--suite-muted)' }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: 'var(--suite-primary)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span
                    className="font-semibold"
                    style={{ color: 'var(--suite-foreground)' }}
                  >
                    类型解读
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    expandedSection === 'analysis' ? 'rotate-180' : ''
                  }`}
                  style={{ color: 'var(--suite-muted-foreground)' }}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === 'analysis' ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 pb-4">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--suite-muted-foreground)' }}
                  >
                    {getLocalizedContent(
                      typeResult?.description || { zh: '暂无描述' },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimensions Section */}
            {showDimensions && dimensionResults.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--suite-card)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                <button
                  onClick={() => toggleSection('dimensions')}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--suite-muted)' }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--suite-primary)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <span
                      className="font-semibold"
                      style={{ color: 'var(--suite-foreground)' }}
                    >
                      维度分析
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      expandedSection === 'dimensions' ? 'rotate-180' : ''
                    }`}
                    style={{ color: 'var(--suite-muted-foreground)' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedSection === 'dimensions' ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-4 pb-4 space-y-3">
                    {dimensionResults.map((dim, idx) => (
                      <div
                        key={dim.id}
                        className="rounded-xl p-3"
                        style={{
                          background: 'var(--suite-muted)',
                          animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold text-sm"
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
                              className="font-bold text-sm"
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
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${dim.percentage}%`,
                              background:
                                'linear-gradient(90deg, var(--suite-primary), var(--suite-secondary))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Traits Section */}
            {typeResult?.traits && typeResult.traits.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--suite-card)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                <button
                  onClick={() => toggleSection('traits')}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--suite-muted)' }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--suite-primary)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <span
                      className="font-semibold"
                      style={{ color: 'var(--suite-foreground)' }}
                    >
                      核心特质
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      expandedSection === 'traits' ? 'rotate-180' : ''
                    }`}
                    style={{ color: 'var(--suite-muted-foreground)' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedSection === 'traits' ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {typeResult.traits.map((trait, idx) => (
                        <div
                          key={trait.id}
                          className="flex items-center justify-between rounded-xl p-3"
                          style={{
                            background: 'var(--suite-muted)',
                            animation: `scaleIn 0.3s ease-out ${idx * 0.05}s both`,
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
                </div>
              </div>
            )}

            {/* Top Matches Section (for pr01 with many types) */}
            {typeMatchResult?.matchScores &&
              typeMatchResult.matchScores.length > 1 && (
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: 'var(--suite-card)',
                    border: '1px solid var(--suite-border)',
                  }}
                >
                  <button
                    onClick={() => toggleSection('topMatches')}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--suite-muted)' }}
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: 'var(--suite-primary)' }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 6h16M4 12h16m-7 6h7"
                          />
                        </svg>
                      </div>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--suite-foreground)' }}
                      >
                        其他可能
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        expandedSection === 'topMatches' ? 'rotate-180' : ''
                      }`}
                      style={{ color: 'var(--suite-muted-foreground)' }}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedSection === 'topMatches' ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {typeMatchResult.matchScores.slice(1).map(match => (
                        <div
                          key={match.typeId}
                          className="flex items-center justify-between rounded-xl p-3"
                          style={{ background: 'var(--suite-muted)' }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="font-bold"
                              style={{ color: 'var(--suite-foreground)' }}
                            >
                              {match.typeId}
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: 'var(--suite-muted-foreground)' }}
                            >
                              {match.typeName}
                            </span>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: 'var(--suite-primary)' }}
                          >
                            {match.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Footer Note */}
          <div
            className="px-6 pb-4 text-xs text-center"
            style={{ color: 'var(--suite-muted-foreground)' }}
          >
            本测试仅供娱乐参考，请勿作为诊断、面试或重大决策的依据
          </div>

          {/* Actions */}
          <div
            className="p-4 md:p-6 flex flex-wrap gap-3"
            style={{
              background: 'var(--suite-card)',
              borderTop: '1px solid var(--suite-border)',
            }}
          >
            <button
              onClick={handleRetake}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--suite-muted)',
                color: 'var(--suite-muted-foreground)',
                border: '1px solid var(--suite-border)',
              }}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              重新测试
            </button>
            {theme?.result?.showShare !== false && (
              <button
                onClick={handleShare}
                className="flex-1 min-w-[120px] py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'var(--suite-card)',
                  color: 'var(--suite-foreground)',
                  border: '1px solid var(--suite-border)',
                }}
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                分享结果
              </button>
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 min-w-[120px] py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
                color: 'var(--suite-primary-foreground)',
                border: 'none',
                boxShadow:
                  '0 4px 16px color-mix(in srgb, var(--suite-primary) 25%, transparent)',
              }}
            >
              <Download className="w-4 h-4 inline mr-2" />
              保存图片
            </button>
          </div>
        </div>
      </div>

      {/* Share Card Modal */}
      {showShareModal && typeResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setShowShareModal(false)
          }}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{ background: 'var(--suite-card)' }}
          >
            {/* Modal Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-4"
              style={{
                background: 'var(--suite-card)',
                borderBottom: '1px solid var(--suite-border)',
              }}
            >
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--suite-foreground)' }}
              >
                生成分享图片
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{
                  background: 'var(--suite-muted)',
                  color: 'var(--suite-muted-foreground)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poster Preview */}
            <div className="p-4">
              <div
                className="mx-auto overflow-hidden rounded-2xl shadow-xl"
                style={{
                  width: '270px',
                  height: '405px',
                }}
              >
                <img
                  src={getLocalizedContent(typeResult.posterImage)}
                  alt={typeResult.id}
                  className="w-full h-full object-cover"
                />
              </div>
              <p
                className="text-center text-xs mt-3"
                style={{ color: 'var(--suite-muted-foreground)' }}
              >
                人格海报预览（{getLocalizedContent(typeResult.name)}）
              </p>
            </div>

            {/* Download */}
            <div className="px-4 pb-4 space-y-3">
              {downloadSuccess && (
                <div
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm"
                  style={{
                    background: 'color-mix(in srgb, #10b981 10%, transparent)',
                    color: '#10b981',
                  }}
                >
                  <Check className="w-4 h-4" />
                  图片已保存
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full py-3.5 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--suite-primary), var(--suite-secondary))',
                  color: 'var(--suite-primary-foreground)',
                  boxShadow:
                    '0 4px 16px color-mix(in srgb, var(--suite-primary) 25%, transparent)',
                }}
              >
                保存海报图片
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-ping {
            animation: pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}
      </style>
    </div>
  )
}
