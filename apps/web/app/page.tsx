import type { SuiteConfig } from '@/lib/types/suite'
import {
  ArrowRight,
  Brain,
  Download,
  Share2,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { getSuites } from '@/lib/suite-loader'

/**
 * 首页 - 套件选择器
 */
export default async function HomePage() {
  const suites = await getSuites()

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh]">
          <div className="text-center space-y-4 md:space-y-6 max-w-2xl">
            {/* Animated Icon */}
            <div className="relative inline-block mb-4 md:mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10">
                <Brain
                  className="w-8 h-8 md:w-10 md:h-10 text-primary animate-bounce"
                  style={{ animationDuration: '2s' }}
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight px-2">
              NBTI 性格测试平台
            </h1>

            <p className="text-base md:text-xl text-muted-foreground px-2">
              探索你的性格特质，发现独一无二的自己
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 md:gap-8 mt-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {suites.length}+
                </div>
                <div className="text-xs text-muted-foreground">专业测试</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  16
                </div>
                <div className="text-xs text-muted-foreground">人格类型</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  100%
                </div>
                <div className="text-xs text-muted-foreground">免费使用</div>
              </div>
            </div>
          </div>
        </div>

        {/* Suite Selection */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center">
            选择你的测试
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {suites.map((suite, index) => (
              <SuiteCard key={suite.id} suite={suite} index={index} />
            ))}
          </div>

          {suites.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>暂无可用测试套件</p>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24 max-w-4xl mx-auto px-2">
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="深度分析"
            description="多维度分析你的性格特点，挖掘潜在优势"
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="精美分享图"
            description="一键生成专属结果图，轻松分享到社交平台"
          />
          <FeatureCard
            icon={<Download className="w-6 h-6" />}
            title="高清下载"
            description="支持多种分辨率下载，保存你的测试结果"
          />
        </section>

        {/* Tips Section */}
        <section className="max-w-2xl mx-auto mt-16 md:mt-24">
          <div
            className="rounded-2xl p-6 md:p-8 text-center"
            style={{
              background:
                'linear-gradient(135deg, var(--primary) 0%, var(--primary)/80 100%)',
              color: 'var(--primary-foreground)',
            }}
          >
            <Zap className="w-8 h-8 mx-auto mb-3 opacity-90" />
            <h3 className="text-lg font-semibold mb-2">小贴士</h3>
            <p className="text-sm opacity-90">
              选择最符合你真实想法的答案，而非你认为「应该」的回答。
              诚实作答才能获得最准确的结果。
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 md:mt-24 text-center text-sm text-muted-foreground">
          <p>基于科学的性格评估理论 · 仅供娱乐参考</p>
        </footer>
      </div>
    </div>
  )
}

/**
 * 套件卡片组件
 */
function SuiteCard({ suite, index }: { suite: SuiteConfig; index: number }) {
  const colors = [
    { primary: '#6c8d71', secondary: '#97b59c' },
    { primary: '#7c3aed', secondary: '#a78bfa' },
    { primary: '#f59e0b', secondary: '#fbbf24' },
  ]
  const color = colors[index % colors.length]

  return (
    <Link
      href={`/${suite.id}`}
      className="group relative overflow-hidden block p-5 md:p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Background Gradient */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${color.primary} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative space-y-3 md:space-y-4">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          }}
        >
          <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>

        {/* Title */}
        <div>
          <h3
            className="font-semibold text-base md:text-lg transition-colors duration-200"
            style={{ color: 'var(--foreground)' }}
          >
            {suite.name.zh}
          </h3>
          <p
            className="text-xs md:text-sm mt-1 line-clamp-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {suite.description.zh}
          </p>
        </div>

        {/* Action */}
        <div
          className="flex items-center text-sm font-medium transition-all duration-200"
          style={{ color: color.primary }}
        >
          <span>开始测试</span>
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

/**
 * Feature Card Component
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div
      className="text-center space-y-2 md:space-y-3 p-4 md:p-6 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl"
        style={{ background: 'var(--primary)' + '15' }}
      >
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
      </div>
      <h3
        className="font-semibold text-base md:text-lg"
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </h3>
      <p
        className="text-xs md:text-sm"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {description}
      </p>
    </div>
  )
}
