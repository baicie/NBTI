'use client'

import { AudioProvider } from '@/providers/audio-provider'
import { TestProvider } from '@/providers/test-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <TestProvider>{children}</TestProvider>
    </AudioProvider>
  )
}
