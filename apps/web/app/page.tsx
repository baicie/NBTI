import Link from 'next/link'
import { getSuites } from '@/lib/suite-loader'
import { ArrowRight, Brain, Download, Share2, Sparkles } from 'lucide-react'
import type { SuiteConfig } from '@/lib/types/suite'

/**
 * 首页 - 套件选择器
 */
export default async function HomePage() {
  const suites = await getSuites()

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh]">
          <div className="text-center space-y-4 md:space-y-6 max-w-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-4 md:mb-6">
              <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight px-2">
              NBTI 性格测试平台
            </h1>

            <p className="text-base md:text-xl text-muted-foreground px-2">
              探索你的性格特质，发现独一无二的自己
            </p>
          </div>
        </div>

        {/* Suite Selection */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center">
            选择你的测试
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {suites.map(suite => (
              <SuiteCard key={suite.id} suite={suite} />
            ))}
          </div>

          {suites.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>暂无可用测试套件</p>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-16 md:mt-24 max-w-4xl mx-auto px-2">
          <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base md:text-lg">深度分析</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              多维度分析你的性格特点，挖掘潜在优势
            </p>
          </div>

          <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
              <Share2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base md:text-lg">精美分享图</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              一键生成专属结果图，轻松分享到社交平台
            </p>
          </div>

          <div className="text-center space-y-2 md:space-y-3 p-4 md:p-6 rounded-lg bg-card border">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
              <Download className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base md:text-lg">高清下载</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              支持多种分辨率下载，保存你的测试结果
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * 套件卡片组件
 */
function SuiteCard({ suite }: { suite: SuiteConfig }) {
  return (
    <Link
      href={`/${suite.id}`}
      className="group block p-4 md:p-6 rounded-lg bg-card border hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="space-y-3 md:space-y-4">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-primary" />
        </div>

        {/* Title */}
        <div>
          <h3 className="font-semibold text-base md:text-lg group-hover:text-primary transition-colors">
            {suite.name.zh}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
            {suite.description.zh}
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center text-sm text-primary font-medium">
          <span>开始测试</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
