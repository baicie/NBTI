'use client'

import { type ReactNode, useMemo } from 'react'
import type { SuiteTheme } from '@/lib/types/suite'

interface ThemeProviderProps {
  theme: SuiteTheme
  children: ReactNode
}

/**
 * 主题提供者组件
 * 将套件主题配置注入到 CSS 变量中
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style = useMemo(() => {
    const cssVars: Record<string, string> = {
      '--suite-primary': theme.colors.primary || '#6366f1',
      '--suite-primary-foreground': theme.colors.primaryForeground || '#ffffff',
      '--suite-secondary': theme.colors.secondary || '#8b5cf6',
      '--suite-secondary-foreground':
        theme.colors.secondaryForeground || '#ffffff',
      '--suite-background': theme.colors.background || '#ffffff',
      '--suite-foreground': theme.colors.foreground || '#1e293b',
      '--suite-muted': theme.colors.muted || '#f1f5f9',
      '--suite-muted-foreground': theme.colors.mutedForeground || '#64748b',
      '--suite-accent': theme.colors.accent || '#f1f5f9',
      '--suite-accent-foreground': theme.colors.accentForeground || '#1e293b',
      '--suite-destructive': theme.colors.destructive || '#ef4444',
      '--suite-destructive-foreground':
        theme.colors.destructiveForeground || '#ffffff',
      '--suite-border': theme.colors.border || '#e2e8f0',
      '--suite-input': theme.colors.input || '#e2e8f0',
      '--suite-ring': theme.colors.ring || theme.colors.primary || '#6366f1',
      '--suite-card': theme.colors.card || '#ffffff',
      '--suite-card-foreground': theme.colors.cardForeground || '#1e293b',
    }

    // 添加渐变色变量
    if (theme.gradient?.enabled) {
      cssVars['--suite-gradient-from'] = theme.gradient.from
      cssVars['--suite-gradient-via'] = theme.gradient.via
      cssVars['--suite-gradient-to'] = theme.gradient.to
    }

    // 添加圆角变量
    if (theme.style?.borderRadius) {
      const radius = theme.style.borderRadius
      cssVars['--suite-radius-sm'] = `${radius.sm || 0.25}rem`
      cssVars['--suite-radius-md'] = `${radius.md || 0.5}rem`
      cssVars['--suite-radius-lg'] = `${radius.lg || 0.75}rem`
      cssVars['--suite-radius-xl'] = `${radius.xl || 1}rem`
      cssVars['--suite-radius-2xl'] = `${radius['2xl'] || 1.5}rem`
    }

    return cssVars
  }, [theme])

  return (
    <div className="suite-theme" style={style} data-suite-id={theme.id}>
      {children}
    </div>
  )
}

/**
 * 生成渐变背景样式
 */
export function getGradientStyle(theme: SuiteTheme): React.CSSProperties {
  if (!theme.gradient?.enabled) {
    return { backgroundColor: theme.colors.primary || '#6366f1' }
  }

  return {
    background: `linear-gradient(135deg, ${theme.gradient.from} 0%, ${theme.gradient.via} 50%, ${theme.gradient.to} 100%)`,
  }
}
