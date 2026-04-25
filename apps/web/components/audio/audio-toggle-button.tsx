'use client'

import { Music, Music2, Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/providers/audio-provider'

interface AudioToggleButtonProps {
  /** 是否显示音乐控制按钮，默认 true */
  showMusic?: boolean
  /** 是否显示音效控制按钮，默认 true */
  showEffects?: boolean
}

export function AudioToggleButton({
  showMusic = true,
  showEffects = true,
}: AudioToggleButtonProps) {
  const { settings, toggleMusic, toggleEffects, isPlaying } = useAudio()

  // 两侧都不显示则不渲染
  if (!showMusic && !showEffects) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Effects Toggle */}
      {showEffects && (
        <button
          onClick={toggleEffects}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: settings.effectsEnabled
              ? 'color-mix(in srgb, var(--suite-primary) 15%, var(--suite-card))'
              : 'color-mix(in srgb, var(--suite-muted) 50%, var(--suite-card))',
            color: settings.effectsEnabled
              ? 'var(--suite-primary)'
              : 'var(--suite-muted-foreground)',
            border: '1px solid var(--suite-border)',
          }}
          title={settings.effectsEnabled ? '音效已开启' : '音效已关闭'}
        >
          {settings.effectsEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Music Toggle */}
      {showMusic && (
        <button
          onClick={toggleMusic}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: settings.musicEnabled
              ? 'color-mix(in srgb, var(--suite-primary) 15%, var(--suite-card))'
              : 'color-mix(in srgb, var(--suite-muted) 50%, var(--suite-card))',
            color: settings.musicEnabled
              ? 'var(--suite-primary)'
              : 'var(--suite-muted-foreground)',
            border: '1px solid var(--suite-border)',
            animation:
              settings.musicEnabled && isPlaying ? 'pulse 2s infinite' : 'none',
          }}
          title={
            settings.musicEnabled
              ? isPlaying
                ? '音乐播放中，点击暂停'
                : '音乐已开启'
              : '音乐已关闭'
          }
        >
          {settings.musicEnabled && isPlaying ? (
            <Music2 className="w-5 h-5" />
          ) : (
            <Music className="w-5 h-5" />
          )}
        </button>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
