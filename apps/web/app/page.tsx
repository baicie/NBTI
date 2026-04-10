'use client'

import Link from 'next/link'
import { Brain, Download, Share2, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary)]/10 mb-6">
              <Brain className="w-10 h-10 text-[var(--color-primary)]" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              NBTI 性格测试
            </h1>

            <p className="text-xl text-[var(--color-muted-foreground)]">
              基于数据驱动架构的通用在线测试框架，发现你的性格特质
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium hover:opacity-90 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                开始测试
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] font-medium hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] transition-colors"
              >
                <Share2 className="w-5 h-5" />
                分享
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl">
            <div className="text-center space-y-3 p-6 rounded-lg bg-[var(--color-card)]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)]/10">
                <Brain className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold">深度分析</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                多维度分析你的性格特点，挖掘潜在优势
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-[var(--color-card)]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)]/10">
                <Share2 className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold">精美分享图</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                一键生成专属结果图，轻松分享到社交平台
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-lg bg-[var(--color-card)]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)]/10">
                <Download className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold">高清下载</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                支持多种分辨率下载，保存你的测试结果
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
