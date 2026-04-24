'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Template, TemplateVariables } from '@/lib/types/template'
import { renderTemplate } from '@/lib/template-renderer'

interface ShareCardPreviewProps {
  template: Template
  variables: TemplateVariables
  onDownload?: () => void
}

export function ShareCardPreview({
  template,
  variables,
  onDownload,
}: ShareCardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // 渲染模板 HTML
  useEffect(() => {
    if (!containerRef.current) return

    const html = renderTemplate(template, variables)
    containerRef.current.innerHTML = html
  }, [template, variables])

  const handleDownload = useCallback(async () => {
    if (!containerRef.current || !onDownload) return

    setIsGenerating(true)
    try {
      // 使用 html2canvas 生成图片
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(containerRef.current, {
        scale: 2, // 高清输出
        useCORS: true,
        backgroundColor: null,
      })

      // 转换为 blob 并下载
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `result-${variables.typeCode}.png`
        link.click()
        URL.revokeObjectURL(url)
        onDownload()
      }, 'image/png')
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [template, variables, onDownload])

  return (
    <div className="space-y-4">
      {/* 预览容器 */}
      <div
        ref={containerRef}
        className="mx-auto overflow-hidden rounded-lg shadow-lg"
        style={{
          width: '100%',
          maxWidth: '540px', // 模板实际宽度的一半
          transform: 'scale(0.5)',
          transformOrigin: 'top center',
        }}
      />

      {/* 下载按钮 */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
          }}
        >
          {isGenerating ? '生成中...' : '保存图片'}
        </button>
      </div>
    </div>
  )
}

/**
 * 导出为图片的辅助函数
 */
export async function exportCardAsImage(
  template: Template,
  variables: TemplateVariables,
): Promise<Blob | null> {
  // 创建临时容器
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.zIndex = '-1'
  container.innerHTML = renderTemplate(template, variables)
  document.body.appendChild(container)

  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(
      container.firstElementChild as HTMLElement,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      },
    )

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png')
    })
  } finally {
    document.body.removeChild(container)
  }
}
