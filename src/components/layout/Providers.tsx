'use client'

import { Toaster } from '@/components/ui/sonner'
import { TMAProvider } from '@/components/tma/TMAProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TMAProvider>
      {children}
      <Toaster richColors position="top-center" />
    </TMAProvider>
  )
}
