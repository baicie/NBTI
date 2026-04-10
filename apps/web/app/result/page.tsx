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
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Share2 } from 'lucide-react'

// 模拟结果数据
const mockType = {
  id: 'INTJ',
  name: { zh: '建筑师', en: 'Architect' },
  subtitle: {
    zh: '富有想象力和战略性的思想家',
    en: 'Imaginative and strategic thinkers',
  },
  description: {
    zh: 'INTJ 是十六种 MBTI 人格类型中最罕见的类型之一。他们以其深刻的分析能力、独立的思维和追求完美的特质而闻名。',
    en: 'INTJ is one of the rarest MBTI types, known for deep analytical abilities, independent thinking, and pursuit of perfection.',
  },
  traits: [
    { id: 'strategic', name: { zh: '战略思维', en: 'Strategic' }, level: 95 },
    {
      id: 'independent',
      name: { zh: '独立自主', en: 'Independent' },
      level: 90,
    },
    { id: 'analytical', name: { zh: '善于分析', en: 'Analytical' }, level: 88 },
  ],
}

const mockDimensions = [
  { id: 'EI', leftLetter: 'E', rightLetter: 'I', percentage: 70 },
  { id: 'NS', leftLetter: 'N', rightLetter: 'S', percentage: 65 },
  { id: 'TF', leftLetter: 'T', rightLetter: 'F', percentage: 75 },
  { id: 'JP', leftLetter: 'J', rightLetter: 'P', percentage: 60 },
]

export default function ResultPage() {
  const { resetTest } = useTest()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = () => {
    setIsGenerating(true)
    new Promise<void>(resolve => setTimeout(resolve, 2000))
      .then(() => {
        // TODO: 实现图片生成
      })
      .finally(() => {
        setIsGenerating(false)
      })
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: '我的 NBTI 测试结果',
          text: `我的 NBTI 人格类型是 ${mockType.id}（${mockType.name.zh}）`,
        })
        .catch(() => {
          // 用户取消分享
        })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-primary)]/10 to-transparent py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            测试完成
          </Badge>
          <h1 className="text-3xl font-bold mb-2">你的性格类型</h1>
        </div>
      </header>

      {/* Result Card */}
      <main className="container mx-auto px-4 -mt-8 pb-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] mx-auto mb-6">
              <span className="text-5xl font-bold text-white">
                {mockType.id}
              </span>
            </div>
            <CardTitle className="text-3xl">{mockType.name.zh}</CardTitle>
            <CardDescription className="text-lg">
              {mockType.subtitle.zh}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">类型描述</h3>
              <p className="text-[var(--color-muted-foreground)]">
                {mockType.description.zh}
              </p>
            </div>

            {/* Dimensions */}
            <div>
              <h3 className="font-semibold mb-4">维度分析</h3>
              <div className="space-y-4">
                {mockDimensions.map(dim => (
                  <div key={dim.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            dim.percentage > 50
                              ? 'font-semibold text-[var(--color-primary)]'
                              : 'text-[var(--color-muted-foreground)]'
                          }
                        >
                          {dim.leftLetter}
                        </span>
                        <span className="text-[var(--color-muted-foreground)]">
                          {dim.id}
                        </span>
                        <span
                          className={
                            dim.percentage <= 50
                              ? 'font-semibold text-[var(--color-primary)]'
                              : 'text-[var(--color-muted-foreground)]'
                          }
                        >
                          {dim.rightLetter}
                        </span>
                      </span>
                      <span className="text-[var(--color-muted-foreground)]">
                        {dim.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all"
                        style={{ width: `${dim.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits */}
            <div>
              <h3 className="font-semibold mb-4">核心特质</h3>
              <div className="flex flex-wrap gap-2">
                {mockType.traits.map(trait => (
                  <Badge
                    key={trait.id}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {trait.name.zh} ({trait.level}%)
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={handleDownload}
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? '生成中...' : '保存图片'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享结果
              </Button>
              <Button variant="ghost" onClick={resetTest}>
                <RefreshCw className="w-4 h-4 mr-2" />
                重新测试
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
