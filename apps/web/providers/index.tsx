'use client'

import { TestProvider } from '@/providers/test-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <TestProvider>{children}</TestProvider>
}
