'use client'

import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { getBgmGenerator } from '@/lib/audio/bgm-generator'

interface AudioConfig {
  src: string
  volume: number
  loop?: boolean
}

interface AudioSettings {
  enabled: boolean
  volume: number
  musicEnabled: boolean
  effectsEnabled: boolean
}

interface AudioContextValue {
  settings: AudioSettings
  playBackgroundMusic: (config?: AudioConfig) => void
  pauseBackgroundMusic: () => void
  stopBackgroundMusic: () => void
  playEffect: (effectName: 'select' | 'complete') => void
  toggleMusic: () => void
  toggleEffects: () => void
  setVolume: (volume: number) => void
  isPlaying: boolean
}

const AudioContext = createContext<AudioContextValue | null>(null)

// localStorage key
const AUDIO_SETTINGS_KEY = 'nbti_audio_settings'

function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') {
    return {
      enabled: true,
      volume: 0.3,
      musicEnabled: true,
      effectsEnabled: true,
    }
  }

  try {
    const stored = localStorage.getItem(AUDIO_SETTINGS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore
  }

  return {
    enabled: true,
    volume: 0.3,
    musicEnabled: true,
    effectsEnabled: true,
  }
}

function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() =>
    loadAudioSettings(),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  // Refs for audio elements
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const effectsRef = useRef<Record<string, HTMLAudioElement>>({})

  // Save settings when changed
  useEffect(() => {
    saveAudioSettings(settings)
  }, [settings])

  // Initialize background music
  const playBackgroundMusic = useCallback(
    (config?: AudioConfig) => {
      if (!settings.musicEnabled || typeof window === 'undefined') return

      // Stop existing music
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current.src = ''
        bgmRef.current = null
      }

      if (!config?.src) return

      // 程序化生成 BGM
      if (config.src.startsWith('generated:')) {
        const type = config.src.replace('generated:', '') as
          | 'chill'
          | 'mysterious'
          | 'playful'
        const bgm = getBgmGenerator()
        bgm.play({
          type,
          volume: config.volume ?? 0.3,
          loop: config.loop ?? true,
        })
        setIsPlaying(true)
        return
      }

      const audio = new Audio()
      audio.src = config.src
      audio.volume = (config.volume ?? 0.3) * settings.volume
      audio.loop = config.loop ?? true
      audio.preload = 'auto'

      audio
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          // Autoplay blocked, user needs to interact first
        })

      bgmRef.current = audio
    },
    [settings.musicEnabled, settings.volume],
  )

  const pauseBackgroundMusic = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const stopBackgroundMusic = useCallback(() => {
    // 停止程序化 BGM
    try {
      const bgm = getBgmGenerator()
      bgm.stop()
    } catch {
      // ignore
    }
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current.src = ''
      bgmRef.current = null
    }
    setIsPlaying(false)
  }, [])

  // Play effect sounds
  const playEffect = useCallback(
    (effectName: 'select' | 'complete') => {
      if (!settings.effectsEnabled || typeof window === 'undefined') return

      // Check if effect already playing
      if (
        effectsRef.current[effectName] &&
        !effectsRef.current[effectName]!.paused
      ) {
        effectsRef.current[effectName]!.currentTime = 0
        effectsRef.current[effectName]!.play().catch(() => {})
      }

      // For now, effects are loaded from manifest config
      // This would need to be passed through context or props
    },
    [settings.effectsEnabled],
  )

  const toggleMusic = useCallback(() => {
    setSettings(prev => {
      const newEnabled = !prev.musicEnabled

      if (newEnabled && bgmRef.current) {
        // 重新播放文件型 BGM
        bgmRef.current.play().catch(() => {})
        setIsPlaying(true)
      } else if (!newEnabled && bgmRef.current) {
        // 停止文件型 BGM
        bgmRef.current.pause()
        setIsPlaying(false)
      }

      if (!newEnabled) {
        // 停止程序化 BGM
        try {
          const bgm = getBgmGenerator()
          bgm.stop()
        } catch {
          // ignore
        }
      }

      return { ...prev, musicEnabled: newEnabled }
    })
  }, [])

  const toggleEffects = useCallback(() => {
    setSettings(prev => ({ ...prev, effectsEnabled: !prev.effectsEnabled }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    setSettings(prev => ({ ...prev, volume: clampedVolume }))

    // Update currently playing audio
    if (bgmRef.current) {
      bgmRef.current.volume = clampedVolume
    }
    // Update programatic BGM volume
    try {
      const bgm = getBgmGenerator()
      bgm.setVolume(clampedVolume)
    } catch {
      // ignore
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current.src = ''
      }
      const effects = effectsRef.current
      Object.values(effects).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      try {
        getBgmGenerator().stop()
      } catch {
        // ignore
      }
    }
  }, [])

  const value: AudioContextValue = {
    settings,
    playBackgroundMusic,
    pauseBackgroundMusic,
    stopBackgroundMusic,
    playEffect,
    toggleMusic,
    toggleEffects,
    setVolume,
    isPlaying,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
