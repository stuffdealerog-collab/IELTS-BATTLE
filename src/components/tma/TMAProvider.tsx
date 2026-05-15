'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  init,
  isTMA,
  mountMiniApp,
  mountThemeParams,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
  expandViewport,
  retrieveRawInitData,
} from '@telegram-apps/sdk-react'
import { toast } from 'sonner'

interface AppUser {
  id: string
  telegramId: string
  username?: string | null
  firstName?: string | null
  photoUrl?: string | null
  rating: number
  wins: number
  losses: number
  role: string
}

interface TMAContextValue {
  user: AppUser | null
  isLoading: boolean
  isInTelegram: boolean
  refreshUser: () => Promise<void>
}

const TMAContext = createContext<TMAContextValue>({
  user: null,
  isLoading: true,
  isInTelegram: false,
  refreshUser: async () => {},
})

export const useTMA = () => useContext(TMAContext)

export function TMAProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInTelegram, setIsInTelegram] = useState(false)

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const { user: u } = await res.json()
      setUser(u)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let cleanup: (() => void) | undefined
    let active = true

    const setup = async () => {
      try {
        const inTMA = await isTMA()
        if (!active) return
        setIsInTelegram(inTMA)

        if (!inTMA) {
          setIsLoading(false)
          return
        }

        cleanup = init()

        try { mountMiniApp.ifAvailable() } catch {}
        try {
          mountThemeParams.ifAvailable()
          if (!bindThemeParamsCssVars.isAvailable() || true) bindThemeParamsCssVars()
        } catch {}
        try {
          await mountViewport()
          bindViewportCssVars()
          expandViewport()
        } catch {}

        const initDataRaw = retrieveRawInitData()
        if (!initDataRaw) {
          toast.error('Could not retrieve Telegram session')
          setIsLoading(false)
          return
        }

        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: initDataRaw }),
        })

        if (!res.ok) {
          toast.error('Authentication failed')
          setIsLoading(false)
          return
        }

        const { user: u } = await res.json()
        if (active) {
          setUser(u)
          setIsLoading(false)
        }
      } catch (e) {
        console.error('TMA init error', e)
        if (active) setIsLoading(false)
      }
    }

    setup()
    return () => {
      active = false
      cleanup?.()
    }
  }, [])

  return (
    <TMAContext.Provider value={{ user, isLoading, isInTelegram, refreshUser }}>
      {children}
    </TMAContext.Provider>
  )
}
