import { notFound } from 'next/navigation'
import { loadSuiteTheme, suiteExists } from '@/lib/suite-loader'
import { ThemeProvider } from '@/components/theme-provider'

interface SuiteLayoutProps {
  children: React.ReactNode
  params: Promise<{ suite: string }>
}

/**
 * 套件级布局
 * 验证套件存在并提供主题上下文
 */
export default async function SuiteLayout({
  children,
  params,
}: SuiteLayoutProps) {
  const { suite } = await params

  // 验证套件是否存在
  const exists = await suiteExists(suite)
  if (!exists) {
    notFound()
  }

  // 加载主题
  const theme = await loadSuiteTheme(suite)

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
