'use client'

/**
 * 程序化 BGM 生成器
 * 使用 Web Audio API 合成背景音乐，无需外部音频文件
 */

// 音阶频率映射 (A minor scale, 从 A4 = 440Hz)
const NOTE_FREQS: Record<string, number> = {
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
}

type BgmType = 'chill' | 'mysterious' | 'playful'

interface BgmConfig {
  type: BgmType
  volume: number
  loop?: boolean
}

class BgmGenerator {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isPlaying = false
  private oscillators: OscillatorNode[] = []
  private animationFrame: number | null = null
  private noteStartTime = 0
  private noteLength = 0

  private init(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  private createPadNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    gain: number,
    detune = 0,
  ) {
    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq + detune, startTime)
    noteGain.gain.setValueAtTime(0, startTime)
    noteGain.gain.linearRampToValueAtTime(gain * 0.3, startTime + 0.3)
    noteGain.gain.setValueAtTime(gain * 0.3, startTime + duration - 0.3)
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, startTime)
    filter.Q.setValueAtTime(1, startTime)

    osc.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(this.masterGain!)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.1)
    this.oscillators.push(osc)
  }

  private createArpNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    gain: number,
    type: OscillatorType = 'triangle',
  ) {
    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    noteGain.gain.setValueAtTime(0, startTime)
    noteGain.gain.linearRampToValueAtTime(gain * 0.15, startTime + 0.02)
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, startTime)
    filter.Q.setValueAtTime(0.5, startTime)

    osc.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(this.masterGain!)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.1)
    this.oscillators.push(osc)
  }

  private createKick(ctx: AudioContext, startTime: number) {
    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()

    osc.frequency.setValueAtTime(150, startTime)
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1)
    noteGain.gain.setValueAtTime(0.4, startTime)
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)

    osc.connect(noteGain)
    noteGain.connect(this.masterGain!)

    osc.start(startTime)
    osc.stop(startTime + 0.2)
    this.oscillators.push(osc)
  }

  private createHiHat(ctx: AudioContext, startTime: number, open = false) {
    const bufferSize = ctx.sampleRate * (open ? 0.15 : 0.05)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(8000, startTime)

    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0.08, startTime)
    noteGain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + (open ? 0.15 : 0.05),
    )

    source.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(this.masterGain!)

    source.start(startTime)
  }

  private createBellNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    gain: number,
  ) {
    const osc = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const osc3 = ctx.createOscillator()
    const noteGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(freq * 2.76, startTime)
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(freq * 5.4, startTime)

    noteGain.gain.setValueAtTime(0, startTime)
    noteGain.gain.linearRampToValueAtTime(gain * 0.25, startTime + 0.01)
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3000, startTime)

    osc.connect(filter)
    osc2.connect(filter)
    osc3.connect(filter)
    filter.connect(noteGain)
    noteGain.connect(this.masterGain!)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.1)
    osc2.start(startTime)
    osc2.stop(startTime + duration + 0.1)
    osc3.start(startTime)
    osc3.stop(startTime + duration + 0.1)
    this.oscillators.push(osc, osc2, osc3)
  }

  private schedulePattern(
    ctx: AudioContext,
    startTime: number,
    bpm: number,
    type: BgmType,
  ): number {
    switch (type) {
      case 'chill':
        return this.scheduleChillPattern(ctx, startTime, bpm)
      case 'mysterious':
        return this.scheduleMysteriousPattern(ctx, startTime, bpm)
      case 'playful':
        return this.schedulePlayfulPattern(ctx, startTime, bpm)
    }
  }

  private scheduleChillPattern(
    ctx: AudioContext,
    startTime: number,
    bpm: number,
  ): number {
    const beatDuration = 60 / bpm
    const barDuration = beatDuration * 8

    // Chill: Am - F - C - G 循环
    const chords = [
      ['A3', 'E4', 'A4', 'C5'],
      ['F4', 'A4', 'C5'],
      ['C4', 'G4', 'E5'],
      ['G3', 'D4', 'G4'],
    ]

    chords.forEach((chord, barIdx) => {
      const barStart = startTime + barIdx * barDuration
      chord.forEach(note => {
        const freq = NOTE_FREQS[note]
        if (freq) {
          this.createPadNote(ctx, freq, barStart, barDuration * 0.95, 0.15)
          this.createPadNote(
            ctx,
            freq * 1.003,
            barStart,
            barDuration * 0.95,
            0.08,
            5,
          )
        }
      })
    })

    const arpPattern = [
      ['A3', 'E4', 'A4'],
      ['F4', 'A4', 'C5'],
      ['C4', 'E4', 'G4'],
      ['G3', 'D4', 'G4'],
    ]

    arpPattern.forEach((chord, barIdx) => {
      const barStart = startTime + barIdx * barDuration
      chord.forEach((note, noteIdx) => {
        const freq = NOTE_FREQS[note]
        if (freq) {
          this.createArpNote(
            ctx,
            freq,
            barStart + noteIdx * beatDuration * 0.5,
            beatDuration * 0.4,
            0.5,
            'triangle',
          )
        }
      })
    })

    return barDuration * 4
  }

  private scheduleMysteriousPattern(
    ctx: AudioContext,
    startTime: number,
    bpm: number,
  ): number {
    const beatDuration = 60 / bpm
    const barDuration = beatDuration * 8

    const chords = [
      ['A3', 'E4', 'A4', 'C5'],
      ['E3', 'B3', 'E4', 'G4'],
      ['A3', 'E4', 'G4', 'C5'],
      ['E3', 'B3', 'E4', 'A4'],
    ]

    chords.forEach((chord, barIdx) => {
      const barStart = startTime + barIdx * barDuration
      chord.forEach(note => {
        const freq = NOTE_FREQS[note]
        if (freq) {
          this.createPadNote(ctx, freq, barStart, barDuration * 0.9, 0.12)
          this.createPadNote(ctx, freq * 0.5, barStart, barDuration * 0.9, 0.08)
        }
      })
    })

    const bellNotes = ['E5', 'G5', 'A5', 'B4', 'E5', 'G5', 'A4', 'E5']
    bellNotes.forEach((note, i) => {
      const freq = NOTE_FREQS[note]
      if (freq) {
        this.createBellNote(
          ctx,
          freq,
          startTime + i * beatDuration,
          beatDuration * 3,
          0.3,
        )
      }
    })

    for (let i = 0; i < 4; i++) {
      this.createKick(ctx, startTime + i * barDuration)
    }

    return barDuration * 4
  }

  private schedulePlayfulPattern(
    ctx: AudioContext,
    startTime: number,
    bpm: number,
  ): number {
    const beatDuration = 60 / bpm
    const barDuration = beatDuration * 4

    const chords = [
      ['C4', 'E4', 'G4'],
      ['A3', 'E4', 'A4'],
      ['F4', 'A4', 'C5'],
      ['G3', 'D4', 'G4'],
    ]

    chords.forEach((chord, barIdx) => {
      const barStart = startTime + barIdx * barDuration
      chord.forEach(note => {
        const freq = NOTE_FREQS[note]
        if (freq) {
          this.createPadNote(ctx, freq, barStart, barDuration * 0.8, 0.1)
        }
      })
    })

    const arpNotes = ['C4', 'E4', 'G4', 'E4', 'C4', 'G4', 'E4', 'G4']
    arpNotes.forEach((note, i) => {
      const freq = NOTE_FREQS[note]
      if (freq) {
        this.createArpNote(
          ctx,
          freq,
          startTime + i * beatDuration * 0.5,
          beatDuration * 0.3,
          0.4,
          'square',
        )
      }
    })

    const hatPattern = [0, 2, 4, 6]
    for (let bar = 0; bar < 4; bar++) {
      for (let i = 0; i < 8; i++) {
        const isOpen = hatPattern.includes(i)
        this.createHiHat(
          ctx,
          startTime + bar * barDuration + i * beatDuration,
          isOpen,
        )
      }
    }

    return barDuration * 4
  }

  play(config: BgmConfig): Promise<void> {
    return new Promise(resolve => {
      this.stop()
      const ctx = this.init()
      const bpm = config.type === 'playful' ? 120 : 90
      const loopDuration = config.type === 'playful' ? 16 : 32

      this.masterGain!.gain.setValueAtTime(config.volume, ctx.currentTime)

      this.masterGain!.gain.setValueAtTime(0, ctx.currentTime)
      this.masterGain!.gain.linearRampToValueAtTime(
        config.volume,
        ctx.currentTime + 2,
      )

      this.schedulePattern(ctx, ctx.currentTime, bpm, config.type)

      if (config.loop !== false) {
        this.noteStartTime = ctx.currentTime
        this.noteLength = loopDuration
        const bgmType = config.type

        const scheduleLoop = () => {
          if (!this.isPlaying) return
          const now = ctx.currentTime
          const elapsed = now - this.noteStartTime

          if (elapsed >= this.noteLength - 2) {
            this.schedulePattern(
              ctx,
              this.noteStartTime + this.noteLength,
              bpm,
              bgmType,
            )
            this.noteStartTime += this.noteLength
          }

          this.animationFrame = requestAnimationFrame(scheduleLoop)
        }

        this.animationFrame = requestAnimationFrame(scheduleLoop)
      }

      this.isPlaying = true
      resolve()
    })
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }

    this.oscillators.forEach(osc => {
      try {
        osc.stop()
        osc.disconnect()
      } catch {
        // ignore
      }
    })
    this.oscillators = []

    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(
        this.masterGain.gain.value,
        this.audioContext.currentTime,
      )
      this.masterGain.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.5,
      )
    }

    this.isPlaying = false
  }

  setVolume(volume: number): void {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime)
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }
}

// 单例
let bgmInstance: BgmGenerator | null = null

export function getBgmGenerator(): BgmGenerator {
  if (!bgmInstance) {
    bgmInstance = new BgmGenerator()
  }
  return bgmInstance
}

export type { BgmConfig, BgmType }
